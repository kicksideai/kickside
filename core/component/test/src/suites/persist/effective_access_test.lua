-- Effective access is the bitwise union of every direct grant held by any of the
-- actor's subjects (the user id plus their groups), on the component and on each
-- of its ancestors.
-- The read path (component_reader), the reported access_level and the point gate
-- (ops.check_user_access) all answer from that one union, on SQLite and PostgreSQL.

local sql = require("sql")
local test = require("test")
local uuid = require("uuid")
local time = require("time")
local access_subjects = require("access_subjects")
local component_reader = require("component_reader") :: any
local ops = require("ops")
local component = require("component")

local ACCESS = { READ = 1, WRITE = 2, DELETE = 4, ADMIN = 8, READ_WRITE = 3, READ_DELETE = 5 }

-- Swap the security module access_subjects reads the actor from, so the acting
-- identity carries the given security_groups without a real login.
local function with_actor(user_id: string, groups: { string }, body)
    local original = rawget(access_subjects, "_security")
    rawset(access_subjects, "_security", {
        actor = function()
            return {
                id = function() return user_id end,
                meta = function() return { security_groups = groups } end,
            }
        end,
    })
    local ok, err = pcall(body)
    rawset(access_subjects, "_security", original)
    if not ok then error(err) end
end

local function define_tests()
    test.describe("effective access is the union of all grants", function()
        local suffix = uuid.v4():sub(1, 8)
        local user_id = "ea-user-" .. suffix
        local group_id = "ea-group-" .. suffix
        local mixed = uuid.v7()      -- group READ + direct WRITE
        local sourced = uuid.v7()    -- direct READ from one source + direct WRITE from another
        local ancestor = uuid.v7()   -- parent of `sourced`, holding the direct READ it inherits
        local workflow_component = uuid.v7()

        local function db() local d, e = sql.get("app:db"); if e then error(e) end; return d end

        local function insert_component(d, cid, impl_id: string?)
            local ts = time.now():format(time.RFC3339)
            local _, err = sql.builder.insert("kickside_components"):set_map({
                component_id = cid, impl_id = impl_id or "kickside.test:ea", private_context = "{}",
                created_at = ts, updated_at = ts,
            }):run_with(d):exec()
            if err then error("insert_component failed: " .. tostring(err)) end
        end

        local function grant(d, cid, source, subject, subject_type, mask, inherited)
            local _, err = sql.builder.insert("kickside_component_access"):set_map({
                access_id = uuid.v7(), component_id = cid, source_component_id = source,
                subject_id = subject, subject_type = subject_type, access_mask = mask,
                inherited = inherited, created_at = time.now():format(time.RFC3339),
            }):run_with(d):exec()
            if err then error("grant failed: " .. tostring(err)) end
        end

        local function edge(d, cid, ancestor_id, depth)
            local _, err = sql.builder.insert("kickside_component_ancestor"):set_map({
                component_id = cid, ancestor_id = ancestor_id, depth = depth,
            }):run_with(d):exec()
            if err then error("ancestry failed: " .. tostring(err)) end
        end

        local function cleanup()
            local d = db()
            for _, id in ipairs({ mixed, sourced, ancestor, workflow_component }) do
                sql.builder.delete("kickside_component_ancestor"):where("component_id = ?", id):run_with(d):exec()
                sql.builder.delete("kickside_component_access"):where("component_id = ?", id):run_with(d):exec()
                sql.builder.delete("kickside_components"):where("component_id = ?", id):run_with(d):exec()
            end
            d:release()
        end

        local function seed()
            local d = db()
            insert_component(d, ancestor)
            insert_component(d, mixed)
            insert_component(d, sourced)
            insert_component(d, workflow_component, "kickside.workflows:workflow_kind")
            edge(d, ancestor, ancestor, 0)
            edge(d, mixed, mixed, 0)
            edge(d, sourced, sourced, 0)
            edge(d, sourced, ancestor, 1)
            grant(d, mixed, mixed, group_id, "group", ACCESS.READ, 0)
            grant(d, mixed, mixed, user_id, "user", ACCESS.WRITE, 0)
            grant(d, ancestor, ancestor, user_id, "user", ACCESS.READ, 0)
            grant(d, sourced, sourced, user_id, "user", ACCESS.WRITE, 0)
            d:release()
        end

        local function read_one(cid: string, mask: integer): any
            local row, err = component_reader.new()
                :with_user(user_id)
                :with_components(cid)
                :with_access_mask(mask)
                :include_options({ meta = false, access_level = true })
                :one()
            if err then error(tostring(err)) end
            return row
        end

        test.before_all(function() cleanup(); seed() end)
        test.after_all(cleanup)

        test.it("read path lists group READ + direct WRITE under READ and READ_WRITE", function()
            with_actor(user_id, { group_id }, function()
                test.not_nil(read_one(mixed, ACCESS.READ))
                test.not_nil(read_one(mixed, ACCESS.WRITE))
                test.not_nil(read_one(mixed, ACCESS.READ_WRITE))
            end)
        end)

        test.it("reported access_level is the union of group and direct grants", function()
            with_actor(user_id, { group_id }, function()
                local row = read_one(mixed, ACCESS.READ)
                test.not_nil(row)
                test.eq(row.access_level, ACCESS.READ_WRITE)
            end)
        end)

        -- A failed access query is a storage failure, reported as an error and
        -- never as a refusal.
        test.it("point check reports a failed access query as an error", function()
            with_actor(user_id, { group_id }, function()
                local d = db()
                local tx, tx_err = d:begin()
                if tx_err or not tx then error("begin failed: " .. tostring(tx_err)) end
                tx:commit()
                local statement, args = access_subjects.effective_mask_query({
                    {subject_type = "user", subject_id = user_id},
                    {subject_type = "group", subject_id = group_id},
                }, mixed)
                local rows, source = tx:query(statement, args)
                test.is_nil(rows)
                if not source then error(errors.new({kind = errors.INTERNAL, retryable = false,
                    message = "committed transaction guard requires a native SQL failure"})) end
                local allowed, err = ops.check_user_access(tx, user_id, mixed, ACCESS.READ)
                d:release()
                test.eq(allowed, false)
                if not err then error(errors.new({kind = errors.INTERNAL, retryable = false,
                    message = "access query guard requires a native failure"})) end
                test.is_true(errors.is(err, source:kind()))
                test.eq(err:retryable(), source:retryable())
                test.eq(type(err:details()), type(source:details()))
                if source:details() then
                    test.eq(err:details().code, source:details().code)
                end
            end)
        end)

        test.it("does not grant component access from a framework actor name", function()
            local d = db()
            local actor = "system:kickside.workflows.maintenance"
            local readable, read_err = ops.check_user_access(d, actor, workflow_component, ACCESS.READ)
            local writable, write_err = ops.check_user_access(d, actor, workflow_component, ACCESS.WRITE)
            local admin, admin_err = ops.check_user_access(d, actor, workflow_component, ACCESS.ADMIN)
            local foreign, foreign_err = ops.check_user_access(d, actor, mixed, ACCESS.WRITE)
            d:release()
            test.is_nil(read_err)
            test.is_nil(write_err)
            test.is_nil(admin_err)
            test.is_nil(foreign_err)
            test.is_false(readable)
            test.is_false(writable)
            test.is_false(admin)
            test.is_false(foreign)
        end)

        test.it("point check refuses a missing grant without an error", function()
            with_actor(user_id, { group_id }, function()
                local d = db()
                local allowed, err = ops.check_user_access(d, user_id, mixed, ACCESS.ADMIN)
                d:release()
                test.eq(allowed, false)
                test.is_nil(err)
            end)
        end)

        test.it("point check passes READ_WRITE for group READ + direct WRITE", function()
            with_actor(user_id, { group_id }, function()
                local d = db()
                local rw = ops.check_user_access(d, user_id, mixed, ACCESS.READ_WRITE)
                local r = ops.check_user_access(d, user_id, mixed, ACCESS.READ)
                local w = ops.check_user_access(d, user_id, mixed, ACCESS.WRITE)
                d:release()
                test.is_true(rw)
                test.is_true(r)
                test.is_true(w)
            end)
        end)

        test.it("one subject's grants from several sources combine", function()
            with_actor(user_id, {}, function()
                local row = read_one(sourced, ACCESS.READ_WRITE)
                test.not_nil(row)
                test.eq(row.access_level, ACCESS.READ_WRITE)
                local d = db()
                local rw = ops.check_user_access(d, user_id, sourced, ACCESS.READ_WRITE)
                d:release()
                test.is_true(rw)
            end)
        end)

        test.it("bits held by no subject still deny on every path", function()
            with_actor(user_id, { group_id }, function()
                test.is_nil(read_one(mixed, ACCESS.DELETE))
                test.is_nil(read_one(mixed, ACCESS.READ_DELETE))
                test.is_nil(read_one(mixed, ACCESS.ADMIN))
                local d = db()
                local del = ops.check_user_access(d, user_id, mixed, ACCESS.DELETE)
                local rd = ops.check_user_access(d, user_id, mixed, ACCESS.READ_DELETE)
                local adm = ops.check_user_access(d, user_id, mixed, ACCESS.ADMIN)
                d:release()
                test.is_false(del)
                test.is_false(rd)
                test.is_false(adm)
            end)
        end)

        test.it("a group the actor does not belong to contributes nothing", function()
            with_actor(user_id, {}, function()
                test.is_nil(read_one(mixed, ACCESS.READ))
                local row = read_one(mixed, ACCESS.WRITE)
                test.not_nil(row)
                test.eq(row.access_level, ACCESS.WRITE)
                local d = db()
                local rw = ops.check_user_access(d, user_id, mixed, ACCESS.READ_WRITE)
                d:release()
                test.is_false(rw)
            end)
        end)

        test.it("checks a recorded authorizer's live typed ADMIN subjects instead of the worker actor", function()
            local d = db()
            local _, update_err = sql.builder.update("kickside_component_access")
                :set("access_mask", ACCESS.READ + ACCESS.ADMIN)
                :where("component_id = ?", mixed)
                :where("subject_type = ?", "group")
                :where("subject_id = ?", group_id)
                :run_with(d):exec()
            test.is_nil(update_err)
            d:release()
            local principal = { kind = "user", id = user_id }
            local allowed, err = component.validate_identity_authorizer_admin(mixed, principal, { group_id })
            test.is_nil(err)
            test.is_true(allowed)
            local revoked, revoked_err = component.validate_identity_authorizer_admin(mixed, principal, {})
            test.is_nil(revoked_err)
            test.is_false(revoked)
            local missing, missing_err = component.validate_identity_authorizer_admin(uuid.v7(), principal, { group_id })
            test.is_nil(missing_err)
            test.is_false(missing)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
