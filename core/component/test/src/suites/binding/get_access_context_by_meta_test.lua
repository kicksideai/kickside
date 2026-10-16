-- get_access_context_by_meta tests: a component is resolved by metadata filters
-- and its access context returned. Exercises the full binding -> reader path
-- (meta join + access aggregation) so it is backend-agnostic and runs on both
-- SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local contract = require("contract")
local security = require("security")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"
local BY_META = "get_access_context_by_meta"

local ACCESS = { READ = 1, WRITE = 2, DELETE = 4, ADMIN = 8, FULL = 15 }

local function define_tests()
    test.describe("Component access context by meta", function()
        local suffix = uuid.v4():sub(1, 8)
        local class_val = "by-meta-" .. suffix -- shared filter key/value across fixtures
        local user = "u-meta-" .. suffix

        local c_single = uuid.v7() -- unique provider, FULL access
        local c_dup_a = uuid.v7()  -- shares (class, provider) with c_dup_b
        local c_dup_b = uuid.v7()
        local c_nomask = uuid.v7() -- exists but actor only has READ on it

        local function db()
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            return d
        end

        local function insert_component(cid, ctx)
            local d = db()
            local ts = time.now():format(time.RFC3339)
            local _, err = sql.builder.insert("kickside_components")
                :set_map({
                    component_id = cid,
                    impl_id = "kickside.test:by-meta",
                    private_context = ctx or "{}",
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
            for _, cid in ipairs({ c_single, c_dup_a, c_dup_b, c_nomask }) do
                sql.builder.delete("kickside_component_meta"):where("component_id = ?", cid):run_with(d):exec()
                sql.builder.delete("kickside_component_access"):where("component_id = ?", cid):run_with(d):exec()
                sql.builder.delete("kickside_components"):where("component_id = ?", cid):run_with(d):exec()
            end
            d:release()
        end

        local function test_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function run_as(user_id: string, target: string, args: any)
            local actor = security.new_actor(user_id, {})
            local svc, cerr = contract.get(COMPONENT_SERVICE)
            if cerr or not svc then error("component_service unavailable: " .. tostring(cerr)) end
            local inst, oerr = (svc :: any):with_actor(actor):with_scope(test_scope()):open()
            if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
            return inst[target](inst, args)
        end

        test.before_all(function()
            cleanup()

            -- (a) single match: unique provider, actor has FULL.
            insert_component(c_single, '{"region": "eu"}')
            insert_meta(c_single, "class", class_val)
            insert_meta(c_single, "provider", "unique-" .. suffix)
            grant(c_single, user, ACCESS.FULL)

            -- (c) two components sharing the (class, provider) filter, both readable.
            insert_component(c_dup_a)
            insert_meta(c_dup_a, "class", class_val)
            insert_meta(c_dup_a, "provider", "dup-" .. suffix)
            grant(c_dup_a, user, ACCESS.FULL)

            insert_component(c_dup_b)
            insert_meta(c_dup_b, "class", class_val)
            insert_meta(c_dup_b, "provider", "dup-" .. suffix)
            grant(c_dup_b, user, ACCESS.FULL)

            -- (d) actor holds only READ; a WRITE-mask query must exclude it.
            insert_component(c_nomask)
            insert_meta(c_nomask, "class", class_val)
            insert_meta(c_nomask, "provider", "nomask-" .. suffix)
            grant(c_nomask, user, ACCESS.READ)
        end)

        test.after_all(function() cleanup() end)

        test.it("single meta match returns the component access context", function()
            local res, err = run_as(user, BY_META, {
                meta = { class = class_val, provider = "unique-" .. suffix },
                include_context = true,
            })
            test.is_nil(err)
            test.not_nil(res)
            test.is_true(res.success)
            test.eq(res.id, c_single)
            test.eq(res.access_level, ACCESS.FULL)
            test.is_true(res.context_included)
            test.eq(res.context.region, "eu")
        end)

        test.it("does not return private context unless explicitly requested", function()
            local res, err = run_as(user, BY_META, {
                meta = { class = class_val, provider = "unique-" .. suffix },
            })
            test.is_nil(err)
            test.not_nil(res)
            test.is_true(res.success)
            test.is_false(res.context_included == true)
            test.eq(res.context.region, nil)
        end)

        test.it("zero matches returns the not-found error", function()
            local res = run_as(user, BY_META, {
                meta = { class = class_val, provider = "absent-" .. suffix },
            })
            test.not_nil(res)
            test.is_false(res.success == true)
            test.contains(res.error, "No component found")
        end)

        test.it("multiple matches returns the multiple-found error", function()
            local res = run_as(user, BY_META, {
                meta = { class = class_val, provider = "dup-" .. suffix },
            })
            test.not_nil(res)
            test.is_false(res.success == true)
            test.contains(res.error, "Multiple components found")
        end)

        test.it("component the actor lacks the required mask on is excluded", function()
            -- READ-only grant is excluded under a WRITE-mask query -> not found.
            local denied = run_as(user, BY_META, {
                meta = { class = class_val, provider = "nomask-" .. suffix },
                access_mask = ACCESS.WRITE,
            })
            test.not_nil(denied)
            test.is_false(denied.success == true)
            test.contains(denied.error, "No component found")

            -- Same component is resolvable under the default READ mask.
            local allowed = run_as(user, BY_META, {
                meta = { class = class_val, provider = "nomask-" .. suffix },
            })
            test.not_nil(allowed)
            test.is_true(allowed.success)
            test.eq(allowed.id, c_nomask)
            test.eq(allowed.access_level, ACCESS.READ)
        end)

        test.it("rejects malformed access_mask", function()
            local base = { class = class_val, provider = "unique-" .. suffix }

            local string_mask = run_as(user, BY_META, {
                meta = base,
                access_mask = tostring(ACCESS.WRITE),
            })
            test.not_nil(string_mask)
            test.is_false(string_mask.success == true)
            test.contains(string_mask.error, "access_mask must be an integer")

            local zero_mask = run_as(user, BY_META, {
                meta = base,
                access_mask = 0,
            })
            test.not_nil(zero_mask)
            test.is_false(zero_mask.success == true)
            test.contains(zero_mask.error, "access_mask must be an integer")

            local over_full = run_as(user, BY_META, {
                meta = base,
                access_mask = ACCESS.FULL + 1,
            })
            test.not_nil(over_full)
            test.is_false(over_full.success == true)
            test.contains(over_full.error, "access_mask must be an integer")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
