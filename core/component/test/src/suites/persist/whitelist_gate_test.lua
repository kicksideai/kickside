-- Injected access-narrowing gate: an acting identity that carries meta.access_filter
-- is confined to its whitelisted subtrees on both the read path (component_reader) and
-- the point/write gate (ops.check_user_access). The filter is AND-ed onto the real
-- access grants, so it can only reject. Pure path-matching is covered first, then the
-- SQL wiring is exercised against a real tree in the harness db.

local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local time = require("time")
local placement = require("placement")
local access_subjects = require("access_subjects")
local component_reader = require("component_reader") :: any
local ops = require("ops")
local read_port = require("read_port") :: any

-- Swap the security module access_subjects reads the actor from, so the test can set
-- the acting identity's meta.access_filter without a real login.
local function with_actor(user_id, access_filter, body)
    local original = rawget(access_subjects, "_security")
    rawset(access_subjects, "_security", {
        actor = function()
            return {
                id = function() return user_id end,
                meta = function() return { access_filter = access_filter } end,
            }
        end,
    })
    local ok, err = pcall(body)
    rawset(access_subjects, "_security", original)
    if not ok then error(err) end
end

local function define_tests()
    test.describe("placement.path_under_prefix", function()
        test.it("pg ltree: self and descendants match, near-miss labels do not", function()
            test.is_true(placement.path_under_prefix("a.b", "a.b"))         -- self
            test.is_true(placement.path_under_prefix("a.b.c.d", "a.b"))     -- deep descendant
            test.is_false(placement.path_under_prefix("a.bc", "a.b"))       -- label boundary
            test.is_false(placement.path_under_prefix("a", "a.b"))          -- ancestor is not under
            test.is_false(placement.path_under_prefix("x.y", "a.b"))
        end)

        test.it("sqlite materialized path: self and descendants match by string prefix", function()
            test.is_true(placement.path_under_prefix("/a/b/", "/a/b/"))     -- self
            test.is_true(placement.path_under_prefix("/a/b/c/", "/a/b/"))   -- descendant
            test.is_false(placement.path_under_prefix("/a/bb/", "/a/b/"))   -- boundary (trailing / guards)
            test.is_false(placement.path_under_prefix("/c/", "/a/b/"))
        end)

        test.it("path_under_any is false for nil/empty inputs", function()
            test.is_false(placement.path_under_any("a.b", nil))
            test.is_false(placement.path_under_any("a.b", {}))
            test.is_false(placement.path_under_any(nil, { "a" }))
            test.is_true(placement.path_under_any("a.b.c", { "x", "a.b" }))
        end)
    end)

    test.describe("access gate over a real tree", function()
        -- A unique subject so only this test's components carry grants for it.
        local user_id = "wl-" .. uuid.v4():sub(1, 8)
        local A = uuid.v7()  -- folder A
        local B = uuid.v7()  -- child of A
        local C = uuid.v7()  -- sibling folder C

        local function db() local d, e = sql.get("app:db"); if e then error(e) end; return d end

        -- Stored paths follow the engine's representation (ltree labels on
        -- postgres, "/id/" LIKE paths on sqlite), so build them like production.
        local A_path, B_path, C_path

        local function seed()
            local d = db()
            A_path = placement.build_path(d, A, nil)
            B_path = placement.build_path(d, B, A_path)
            C_path = placement.build_path(d, C, nil)
            local ts = time.now():format(time.RFC3339)
            for _, row in ipairs({
                { id = A, path = A_path, parent = nil },
                { id = B, path = B_path, parent = A },
                { id = C, path = C_path, parent = nil },
            }) do
                sql.builder.insert("kickside_components"):set_map({
                    component_id = row.id, impl_id = "kickside.test:wl", private_context = "{}",
                    created_at = ts, updated_at = ts, parent_id = row.parent, path = row.path,
                }):run_with(d):exec()
                sql.builder.insert("kickside_component_access"):set_map({
                    access_id = uuid.v7(), component_id = row.id, source_component_id = row.id,
                    subject_id = user_id, subject_type = "user", access_mask = 15, created_at = ts,
                }):run_with(d):exec()
            end
            d:release()
        end

        local function cleanup()
            local d = db()
            for _, id in ipairs({ A, B, C }) do
                sql.builder.delete("kickside_component_access"):where("component_id = ?", id):run_with(d):exec()
                sql.builder.delete("kickside_components"):where("component_id = ?", id):run_with(d):exec()
            end
            d:release()
        end

        local function ids_seen()
            local rows = component_reader.new():with_user(user_id):all()
            local seen = {}
            for _, r in ipairs(rows or {}) do seen[r.component_id] = true end
            return seen
        end

        test.before_each(function() cleanup(); seed() end)
        test.after_each(cleanup)

        test.it("no filter: all three accessible components are visible", function()
            with_actor(user_id, nil, function()
                local seen = ids_seen()
                test.is_true(seen[A]); test.is_true(seen[B]); test.is_true(seen[C])
            end)
        end)

        test.it("whitelisting folder A confines reads to A and its descendant B, not sibling C", function()
            with_actor(user_id, { prefixes = { A_path } }, function()
                local seen = ids_seen()
                test.is_true(seen[A]); test.is_true(seen[B]); test.is_nil(seen[C])
            end)
        end)

        test.it("empty prefixes is deny-all on the read path", function()
            with_actor(user_id, { prefixes = {} }, function()
                local seen = ids_seen()
                test.is_nil(seen[A]); test.is_nil(seen[B]); test.is_nil(seen[C])
            end)
        end)

        test.it("check_user_access honors the filter: descendant passes, sibling rejected", function()
            with_actor(user_id, { prefixes = { A_path } }, function()
                local d = db()
                local inside, inside_err = ops.check_user_access(d, user_id, B, 1)
                test.is_nil(inside_err, tostring(inside_err))
                test.is_true(inside)
                local outside, outside_err = ops.check_user_access(d, user_id, C, 1)
                test.is_nil(outside_err, tostring(outside_err))
                test.is_false(outside)
                d:release()
            end)
        end)

        test.it("check_user_access without a filter passes for a held grant", function()
            with_actor(user_id, nil, function()
                local d = db()
                local allowed, err = ops.check_user_access(d, user_id, C, 1)
                test.is_nil(err, tostring(err))
                test.is_true(allowed)
                d:release()
            end)
        end)
    end)

    -- The core invariant: a confined identity can never WIDEN a component read, even if
    -- its scope grants list-all. read_port hard-denies scope=all / actor_id before the
    -- capability check, so a mis-scoped MCP credential can't escape via the read port.
    test.describe("read_port confined-identity widening guard", function()
        -- A fake security source that always grants list-all (the worst case: a broad
        -- scope), optionally carrying an access_filter (a confined identity).
        local function with_security(user_id: string, access_filter: any?, body: any)
            local fake = {
                actor = function()
                    return { id = function() return user_id end, meta = function() return { access_filter = access_filter } end }
                end,
                can = function() return true end,
            }
            local rp_orig = rawget(read_port, "_security")
            local as_orig = rawget(access_subjects, "_security")
            rawset(read_port, "_security", fake)
            rawset(access_subjects, "_security", fake)
            local ok, err = pcall(body)
            rawset(read_port, "_security", rp_orig)
            rawset(access_subjects, "_security", as_orig)
            if not ok then error(err) end
        end

        test.it("confined identity is denied scope=all even with list-all", function()
            with_security("conf-user", { prefixes = { "/a/" } }, function()
                local reader, err = read_port.build({ scope = "all" })
                test.is_nil(reader)
                test.not_nil(err)
            end)
        end)

        test.it("confined identity is denied read-as-another-user", function()
            with_security("conf-user", { prefixes = { "/a/" } }, function()
                local reader, err = read_port.build({ actor_id = "someone-else" })
                test.is_nil(reader)
                test.not_nil(err)
            end)
        end)

        test.it("an UNconfined identity with list-all may still widen", function()
            with_security("admin-user", nil, function()
                local reader, err = read_port.build({ scope = "all" })
                test.is_nil(err)
                test.not_nil(reader)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
