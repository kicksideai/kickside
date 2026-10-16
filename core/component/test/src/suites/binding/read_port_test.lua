-- read_port tests: the query_components / count_components binding funcs. Covers
-- filter combinations (impl_ids / meta / parent / limit / order), access scoping
-- (results filtered to the actor), default-to-current-actor, and the gated
-- widening rule (actor_id / scope="all": denied for a non-privileged actor,
-- allowed under the list-all capability). Runs the full binding -> read_port ->
-- reader path so it is backend-agnostic (SQLite + PostgreSQL).

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local contract = require("contract")
local security = require("security")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"
local QUERY = "query"
local COUNT = "count"

local ACCESS = { READ = 1, WRITE = 2, DELETE = 4, ADMIN = 8, FULL = 15 }

local function define_tests()
    test.describe("Component read-port", function()
        local suffix = uuid.v4():sub(1, 8)
        local impl = "kickside.test:read-port-" .. suffix
        local impl_other = "kickside.test:read-port-other-" .. suffix
        local class_val = "rp-" .. suffix

        local alice = "u-alice-" .. suffix
        local bob = "u-bob-" .. suffix

        -- alice owns three components; bob owns one.
        local c_parent = uuid.v7()  -- alice, FULL, root, meta class
        local c_child = uuid.v7()   -- alice, FULL, child of c_parent
        local c_other = uuid.v7()   -- alice, READ only, impl_other
        local c_bob = uuid.v7()     -- bob, FULL

        local function db()
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            return d
        end

        local function insert_component(cid: string, impl_id: string, parent_id: string?)
            local d = db()
            local ts = time.now():format(time.RFC3339)
            local _, err = sql.builder.insert("kickside_components")
                :set_map({
                    component_id = cid,
                    impl_id = impl_id,
                    private_context = '{"secret":"' .. cid .. '"}',
                    parent_id = parent_id,
                    created_at = ts,
                    updated_at = ts,
                })
                :run_with(d):exec()
            d:release()
            if err then error("insert_component failed: " .. tostring(err)) end
        end

        local function insert_meta(cid, key, value)
            local d = db()
            local ts = time.now():format(time.RFC3339)
            local _, err = sql.builder.insert("kickside_component_meta")
                :set_map({
                    meta_id = uuid.v7(),
                    component_id = cid,
                    key = key,
                    value = value,
                    created_at = ts,
                    updated_at = ts,
                })
                :run_with(d):exec()
            d:release()
            if err then error("insert_meta failed: " .. tostring(err)) end
        end

        local function grant(cid, subject, mask)
            local d = db()
            local _, err = sql.builder.insert("kickside_component_access")
                :set_map({
                    access_id = uuid.v7(),
                    component_id = cid,
                    source_component_id = cid,
                    subject_id = subject,
                    subject_type = "user",
                    access_mask = mask,
                    created_at = time.now():format(time.RFC3339),
                })
                :run_with(d):exec()
            d:release()
            if err then error("grant failed: " .. tostring(err)) end
        end

        local function cleanup()
            local d = db()
            for _, cid in ipairs({ c_child, c_parent, c_other, c_bob }) do
                sql.builder.delete("kickside_component_meta"):where("component_id = ?", cid):run_with(d):exec()
                sql.builder.delete("kickside_component_access"):where("component_id = ?", cid):run_with(d):exec()
                sql.builder.delete("kickside_components"):where("component_id = ?", cid):run_with(d):exec()
            end
            d:release()
        end

        -- Permissive scope: the list-all capability resolves true.
        local function admin_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        -- Non-privileged scope: a broad base allow grants db/runtime access, while
        -- an explicit deny on list-all/components rejects widening (deny wins).
        local function restricted_scope()
            local base, berr = security.policy("app:restricted_base_policy")
            if not base then error("restricted base policy missing: " .. tostring(berr)) end
            local deny, derr = security.policy("app:restricted_scope_policy")
            if not deny then error("restricted deny policy missing: " .. tostring(derr)) end
            return security.new_scope({ base, deny })
        end

        local function run_as(user_id, scope, target, args)
            local actor = security.new_actor(user_id, {})
            local svc, cerr = contract.get(COMPONENT_SERVICE)
            if cerr or not svc then error("component_service unavailable: " .. tostring(cerr)) end
            local inst, oerr = svc:with_actor(actor):with_scope(scope):open()
            if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
            return inst[target](inst, args)
        end

        local function ids_of(components)
            local set = {}
            for _, c in ipairs(components or {}) do set[c.component_id] = true end
            return set
        end

        test.before_all(function()
            cleanup()
            insert_component(c_parent, impl, nil)
            insert_meta(c_parent, "class", class_val)
            grant(c_parent, alice, ACCESS.FULL)

            insert_component(c_child, impl, c_parent)
            grant(c_child, alice, ACCESS.FULL)

            insert_component(c_other, impl_other, nil)
            grant(c_other, alice, ACCESS.READ)

            insert_component(c_bob, impl, nil)
            grant(c_bob, bob, ACCESS.FULL)
        end)

        test.after_all(function() cleanup() end)

        test.it("pages equal-timestamp rows once in component id order in both directions", function()
            local d = db()
            local saved = {}
            for _, id in ipairs({ c_parent, c_child, c_other, c_bob }) do
                local rows = assert(d:query("SELECT created_at FROM kickside_components WHERE component_id=$1", { id }))
                saved[id] = rows[1].created_at
                local _, seed_err = d:execute("UPDATE kickside_components SET created_at=$1 WHERE component_id=$2",
                    { "2000-01-01T00:00:00Z", id })
                test.is_nil(seed_err)
            end
            d:release()
            local pages = {}
            for _, direction in ipairs({ "ASC", "DESC" }) do
                pages[direction] = {}
                for offset = 0, 3 do
                    local result, read_err = run_as(alice, restricted_scope(), QUERY, {
                        impl_ids = { impl, impl_other }, limit = 1, offset = offset,
                        order_by = { field = "created_at", direction = direction },
                    })
                    test.is_nil(read_err)
                    test.is_true(result.success)
                    for _, row in ipairs(result.components) do
                        pages[direction][#pages[direction] + 1] = row.component_id
                    end
                end
            end
            d = db()
            for id, timestamp in pairs(saved) do
                local _, restore_err = d:execute("UPDATE kickside_components SET created_at=$1 WHERE component_id=$2", { timestamp, id })
                test.is_nil(restore_err)
            end
            d:release()
            local expected = { c_parent, c_child, c_other }
            table.sort(expected)
            test.eq(#pages.ASC, #expected)
            test.eq(#pages.DESC, #expected)
            for i, id in ipairs(expected) do
                test.eq(pages.ASC[i], id)
                test.eq(pages.DESC[#expected + 1 - i], id)
            end
        end)

        test.it("default scope returns only the current actor's components", function()
            local res, err = run_as(alice, restricted_scope(), QUERY, { impl_ids = { impl, impl_other } })
            test.is_nil(err)
            test.is_true(res.success)
            local set = ids_of(res.components)
            test.is_true(set[c_parent] == true)
            test.is_true(set[c_child] == true)
            test.is_true(set[c_other] == true)
            -- bob's component is never visible to alice.
            test.is_true(set[c_bob] == nil)
        end)

        test.it("unions explicit identities and implementations without widening actor access", function()
            local filter = { component_ids = { c_other, c_bob }, impl_ids = { impl }, match_ids = "any" }
            local res, err = run_as(alice, restricted_scope(), QUERY, filter)
            test.is_nil(err)
            test.is_true(res.success)
            test.eq(#res.components, 3)
            local seen = ids_of(res.components)
            test.is_true(seen[c_parent] and seen[c_child] and seen[c_other])
            test.is_nil(seen[c_bob])
            local counted, count_err = run_as(alice, restricted_scope(), COUNT, filter)
            test.is_nil(count_err)
            test.eq(counted.count, 3)
            filter.limit, filter.offset = 1, 1
            local page, page_err = run_as(alice, restricted_scope(), QUERY, filter)
            test.is_nil(page_err)
            test.eq(#page.components, 1)
            local intersection, intersect_err = run_as(alice, restricted_scope(), QUERY, {
                component_ids = { c_other, c_bob }, impl_ids = { impl },
            })
            test.is_nil(intersect_err)
            test.eq(#intersection.components, 0)
        end)

        test.it("rejects an unknown identifier matching mode", function()
            local res = run_as(alice, restricted_scope(), QUERY, { impl_ids = { impl }, match_ids = "unknown" })
            test.is_false(res.success == true)
            test.contains(res.error, "match_ids")
        end)

        test.it("keeps implementation matches when union identities normalize to no match", function()
            local filter = { component_ids = { "invalid-component-id" }, impl_ids = { impl }, match_ids = "any" }
            local res, err = run_as(alice, restricted_scope(), QUERY, filter)
            test.is_nil(err)
            test.eq(#res.components, 2)
            local seen = ids_of(res.components)
            test.is_true(seen[c_parent] and seen[c_child])
            test.is_nil(seen[c_bob])
            local counted, count_err = run_as(alice, restricted_scope(), COUNT, filter)
            test.is_nil(count_err)
            test.eq(counted.count, 2)
            filter.match_ids = nil
            local intersection, intersect_err = run_as(alice, restricted_scope(), QUERY, filter)
            test.is_nil(intersect_err)
            test.eq(#intersection.components, 0)
        end)

        test.it("impl_ids + meta filter narrows the result", function()
            local res, err = run_as(alice, restricted_scope(), QUERY, {
                impl_ids = { impl },
                meta = { class = class_val },
            })
            test.is_nil(err)
            test.is_true(res.success)
            test.eq(#res.components, 1)
            test.eq(res.components[1].component_id, c_parent)
        end)

        test.it("parent filter returns children of a parent", function()
            local res, err = run_as(alice, restricted_scope(), QUERY, { parent_id = c_parent })
            test.is_nil(err)
            test.is_true(res.success)
            test.eq(#res.components, 1)
            test.eq(res.components[1].component_id, c_child)
        end)

        test.it("access_mask excludes components below the required mask", function()
            -- c_other is READ-only for alice; a WRITE-mask query drops it.
            local res, err = run_as(alice, restricted_scope(), QUERY, {
                impl_ids = { impl_other },
                access_mask = ACCESS.WRITE,
            })
            test.is_nil(err)
            test.is_true(res.success)
            test.eq(#res.components, 0)
        end)

        test.it("rejects malformed access_mask instead of defaulting to READ", function()
            local string_mask = run_as(alice, restricted_scope(), QUERY, {
                impl_ids = { impl_other },
                access_mask = tostring(ACCESS.WRITE),
            })
            test.not_nil(string_mask)
            test.is_false(string_mask.success == true)
            test.contains(string_mask.error, "access_mask must be an integer")

            local zero_mask = run_as(alice, restricted_scope(), COUNT, {
                impl_ids = { impl_other },
                access_mask = 0,
            })
            test.not_nil(zero_mask)
            test.is_false(zero_mask.success == true)
            test.contains(zero_mask.error, "access_mask must be an integer")

            local over_full = run_as(alice, restricted_scope(), QUERY, {
                impl_ids = { impl_other },
                access_mask = ACCESS.FULL + 1,
            })
            test.not_nil(over_full)
            test.is_false(over_full.success == true)
            test.contains(over_full.error, "access_mask must be an integer")
        end)

        test.it("limit caps the row count", function()
            local res, err = run_as(alice, restricted_scope(), QUERY, {
                impl_ids = { impl },
                limit = 1,
                order_by = { field = "created_at", direction = "ASC" },
            })
            test.is_nil(err)
            test.is_true(res.success)
            test.eq(#res.components, 1)
            test.eq(res.components[1].component_id, c_parent)
        end)

        test.it("include.access projects the actor's access level", function()
            local res, err = run_as(alice, restricted_scope(), QUERY, {
                component_ids = { c_other },
                include = { access = true },
            })
            test.is_nil(err)
            test.is_true(res.success)
            test.eq(#res.components, 1)
            test.eq(res.components[1].access_level, ACCESS.READ)
        end)

        test.it("non-privileged reads cannot project private_context", function()
            local res = run_as(alice, restricted_scope(), QUERY, {
                component_ids = { c_parent },
                include = { private_context = true },
            })
            test.not_nil(res)
            test.is_false(res.success == true)
            test.contains(res.error, "private_context requires")
        end)

        test.it("privileged reads may explicitly project private_context", function()
            local res, err = run_as(alice, admin_scope(), QUERY, {
                component_ids = { c_parent },
                include = { private_context = true },
            })
            test.is_nil(err)
            test.is_true(res.success)
            test.eq(#res.components, 1)
            test.eq(res.components[1].private_context.secret, c_parent)
        end)

        test.it("count_components matches the scoped row count", function()
            local res, err = run_as(alice, restricted_scope(), COUNT, { impl_ids = { impl } })
            test.is_nil(err)
            test.is_true(res.success)
            -- alice owns c_parent and c_child on `impl`; c_bob (bob's) is excluded.
            test.eq(res.count, 2)
        end)

        test.it("non-privileged actor_id widening is denied", function()
            local res = run_as(alice, restricted_scope(), QUERY, { actor_id = bob })
            test.not_nil(res)
            test.is_false(res.success == true)
            test.contains(res.error, "list-all capability")
        end)

        test.it("non-privileged scope=all widening is denied", function()
            local res = run_as(alice, restricted_scope(), QUERY, { scope = "all" })
            test.not_nil(res)
            test.is_false(res.success == true)
            test.contains(res.error, "list-all capability")
        end)

        test.it("privileged actor_id reads as the named user", function()
            local res, err = run_as(alice, admin_scope(), QUERY, { actor_id = bob })
            test.is_nil(err)
            test.is_true(res.success)
            local set = ids_of(res.components)
            -- reading AS bob surfaces bob's component, not alice's.
            test.is_true(set[c_bob] == true)
            test.is_true(set[c_parent] == nil)
        end)

        test.it("privileged scope=all reads unscoped across users", function()
            local res, err = run_as(alice, admin_scope(), QUERY, { impl_ids = { impl } })
            -- Sanity: scoped read first sees only alice's two `impl` rows.
            test.is_nil(err)
            test.eq(#res.components, 2)

            local all, all_err = run_as(alice, admin_scope(), QUERY, { scope = "all", impl_ids = { impl } })
            test.is_nil(all_err)
            test.is_true(all.success)
            local set = ids_of(all.components)
            -- unscoped surfaces every owner's `impl` rows, including bob's.
            test.is_true(set[c_parent] == true)
            test.is_true(set[c_child] == true)
            test.is_true(set[c_bob] == true)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
