-- Group access tests: a grant whose subject is a GROUP id resolves exactly like
-- a direct user grant. Exercises the full path (binding -> reader/ops ->
-- access_subjects.resolve reading actor:meta().security_groups -> the aggregating
-- access SQL) so it is backend-agnostic and runs on both SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local contract = require("contract")
local security = require("security")
local component = require("component")
local execution_identity = require("execution_identity")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"
local GET_ACCESS = "get_access_context"
local LIST = "list"
local GRANT_SUBTREE = "grant_subtree"

local ACCESS = { READ = 1, WRITE = 2, DELETE = 4, ADMIN = 8, READ_WRITE = 3, FULL = 15 }

local function define_tests()
    test.describe("Component group access", function()
        local suffix = uuid.v4():sub(1, 8)
        local grpA = "grp-A-" .. suffix  -- FULL on c_grp
        local grpR = "grp-R-" .. suffix  -- READ only on c_read
        local c_grp = uuid.v7()
        local c_read = uuid.v7()
        local c_usr = uuid.v7()
        local u_direct = "u-direct-" .. suffix
        local grpM = "grp-M-" .. suffix  -- READ on c_mix
        local c_mix = uuid.v7()
        local u_mix = "u-mix-" .. suffix -- direct WRITE on c_mix

        local function db()
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            return d
        end

        -- sql.builder keeps the data setup dialect-correct (raw "?" is sqlite-only).
        local function insert_component(cid)
            local d = db()
            local ts = time.now():format(time.RFC3339)
            local _, err = sql.builder.insert("kickside_components")
                :set_map({
                    component_id = cid,
                    impl_id = "kickside.test:grp",
                    private_context = "{}",
                    created_at = ts,
                    updated_at = ts,
                })
                :run_with(d):exec()
            d:release()
            if err then error("insert_component failed: " .. tostring(err)) end
        end

        -- Grant subjects are typed: group ids are stored as group grants.
        local function grant(cid, subject, mask, subject_type)
            local d = db()
            local _, err = sql.builder.insert("kickside_component_access")
                :set_map({
                    access_id = uuid.v7(),
                    component_id = cid,
                    source_component_id = cid,
                    subject_id = subject,
                    subject_type = subject_type or "user",
                    access_mask = mask,
                    created_at = time.now():format(time.RFC3339),
                })
                :run_with(d):exec()
            d:release()
            if err then error("grant failed: " .. tostring(err)) end
        end

        local function cleanup()
            local d = db()
            for _, cid in ipairs({ c_grp, c_read, c_usr, c_mix }) do
                sql.builder.delete("kickside_component_access"):where("component_id = ?", cid):run_with(d):exec()
                sql.builder.delete("kickside_components"):where("component_id = ?", cid):run_with(d):exec()
            end
            d:release()
        end

        -- Swap only the ACTOR identity (id + groups) that access_subjects reads,
        -- inheriting the runner's scope so the call keeps db permission. Component
        -- access is grant-based, independent of the security scope, so this does
        -- not widen what the actor can see.
        local function test_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function run_as(user_id: string, groups: {string}, target: string, args: any)
            local actor = security.new_actor(user_id, { security_groups = groups or {} })
            local svc, cerr = contract.get(COMPONENT_SERVICE)
            if cerr or not svc then error("component_service unavailable: " .. tostring(cerr)) end
            local inst, oerr = (svc :: any):with_actor(actor):with_scope(test_scope()):open()
            if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
            return inst[target](inst, args)
        end

        local function row_for(res, cid)
            if not res or type(res.components) ~= "table" then return nil end
            for _, c in ipairs(res.components) do
                if c.component_id == cid then return c end
            end
            return nil
        end

        local function listed(res, cid)
            return row_for(res, cid) ~= nil
        end

        test.before_all(function()
            cleanup()
            insert_component(c_grp);  grant(c_grp, grpA, ACCESS.FULL, "group")
            insert_component(c_read); grant(c_read, grpR, ACCESS.READ, "group")
            insert_component(c_usr);  grant(c_usr, u_direct, ACCESS.FULL)
            insert_component(c_mix);  grant(c_mix, grpM, ACCESS.READ, "group"); grant(c_mix, u_mix, ACCESS.WRITE)
        end)

        test.after_all(function() cleanup() end)

        test.it("group member gains access via a group grant", function()
            local res, err = run_as("u-member", { grpA }, GET_ACCESS, { component_id = c_grp })
            test.is_nil(err)
            test.not_nil(res)
            test.is_true(res.success)
            test.eq(res.access_level, ACCESS.FULL)
            test.is_false(res.context_included == true)
        end)

        test.it("selected group principal uses its own grant without a user membership", function()
            local allowed, err = component.validate_principal_access(c_grp, ACCESS.WRITE,
                { kind = "group", id = grpA }, nil, nil)
            test.is_nil(err)
            test.is_true(allowed)
            local denied = component.validate_principal_access(c_usr, ACCESS.WRITE,
                { kind = "group", id = grpA }, nil, nil)
            test.is_false(denied)
        end)

        test.it("EE2-2562 checks a user principal with Users groups independently of transport metadata", function()
            for _, actor_groups in ipairs({ {}, { grpR } }) do
                local caller = { id = function() return "u-member" end,
                    meta = function() return { via = "mcp", security_groups = #actor_groups > 0 and actor_groups or nil } end }
                local resolver = { resolve = function(_self, args)
                    return { principal = args.principal, actor_id = args.principal.id,
                        scope_name = "members", groups = { grpA } }, nil
                end }
                local builder = {}
                builder.with_actor = function() return builder end
                builder.with_scope = function() return builder end
                builder.open = function() return resolver, nil end
                local live = execution_identity.new({
                    security = { actor = function() return caller end, scope = function() return {} end,
                        can = function() return true end, named_scope = function() return {} end,
                        new_actor = function(id, meta) return { id = function() return id end, meta = function() return meta end } end },
                    contract = { get = function() return builder, nil end },
                })
                local identity, capture_err = live.capture()
                test.is_nil(capture_err)
                local frame, resolve_err = live.resolve(identity)
                test.is_nil(resolve_err)
                local allowed, err = component.validate_principal_access(c_grp, ACCESS.WRITE,
                    frame.principal, frame.meta.security_groups, frame.meta.access_filter)
                test.is_nil(err)
                test.is_true(allowed)
                local denied, deny_err = component.validate_principal_access(c_read, ACCESS.READ,
                    frame.principal, frame.meta.security_groups, frame.meta.access_filter)
                test.is_nil(deny_err)
                test.is_false(denied)
            end
            local allowed, err = component.validate_principal_access(c_grp, ACCESS.READ,
                { kind = "user", id = "u-member" }, nil, nil)
            test.is_false(allowed)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
        end)

        test.it("non-member is denied", function()
            local res = run_as("u-stranger", {}, GET_ACCESS, { component_id = c_grp })
            test.not_nil(res)
            test.is_false(res.success == true)
        end)

        test.it("direct user grant still works with no groups (fast path unchanged)", function()
            local res, err = run_as(u_direct, {}, GET_ACCESS, { component_id = c_usr })
            test.is_nil(err)
            test.is_true(res.success)
            test.eq(res.access_level, ACCESS.FULL)
        end)

        test.it("direct access lookup rejects malformed access_mask", function()
            local res = run_as(u_direct, {}, GET_ACCESS, {
                component_id = c_usr,
                access_mask = tostring(ACCESS.WRITE),
            })
            test.not_nil(res)
            test.is_false(res.success == true)
            test.contains(res.error, "access_mask must be an integer")
        end)

        test.it("group access_mask is honored: READ group is excluded under a DELETE filter, included under READ", function()
            local del = run_as("u-r", { grpR }, LIST, { filters = { access_mask = ACCESS.DELETE } })
            test.is_true(del.success)
            test.is_false(listed(del, c_read))

            local rd = run_as("u-r", { grpR }, LIST, { filters = { access_mask = ACCESS.READ } })
            test.is_true(rd.success)
            test.is_true(listed(rd, c_read))
        end)

        test.it("group READ + direct WRITE resolve to their union READ_WRITE", function()
            local res, err = run_as(u_mix, { grpM }, GET_ACCESS, { component_id = c_mix })
            test.is_nil(err)
            test.is_true(res.success == true)
            test.eq(res.access_level, ACCESS.READ_WRITE)

            local rw = run_as(u_mix, { grpM }, GET_ACCESS, { component_id = c_mix, access_mask = ACCESS.READ_WRITE })
            test.is_true(rw.success == true)
            test.eq(rw.access_level, ACCESS.READ_WRITE)
        end)

        test.it("union grants list under READ and READ_WRITE filters with access_level READ_WRITE", function()
            for _, mask in ipairs({ ACCESS.READ, ACCESS.READ_WRITE }) do
                local res = run_as(u_mix, { grpM }, LIST, {
                    filters = { access_mask = mask, impl_ids = { "kickside.test:grp" } },
                })
                test.is_true(res.success == true, tostring(res.error))
                local row = row_for(res, c_mix)
                test.not_nil(row)
                test.eq((row :: any).access_level, ACCESS.READ_WRITE)
            end
        end)

        test.it("bits no subject holds still deny under the union", function()
            local del = run_as(u_mix, { grpM }, GET_ACCESS, { component_id = c_mix, access_mask = ACCESS.DELETE })
            test.is_false(del.success == true)

            local listed_del = run_as(u_mix, { grpM }, LIST, { filters = { access_mask = ACCESS.DELETE } })
            test.is_true(listed_del.success == true)
            test.is_false(listed(listed_del, c_mix))
        end)

        test.it("admin gate is group-aware and bitwise-correct", function()
            -- ADMIN (via FULL group grant) may grant on the subtree.
            local allowed = run_as("u-admin", { grpA }, GRANT_SUBTREE, {
                root_component_id = c_grp,
                subject = { subject_id = "newbie-" .. suffix, subject_type = "user" },
                access_mask = ACCESS.READ,
            })
            test.not_nil(allowed)
            test.is_true(allowed.success == true)

            -- READ-only (via group) may NOT grant (needs ADMIN). Guards the bitwise
            -- gate: a READ holder must not satisfy an ADMIN check.
            local denied = run_as("u-readonly", { grpR }, GRANT_SUBTREE, {
                root_component_id = c_read,
                subject = { subject_id = "x-" .. suffix, subject_type = "user" },
                access_mask = ACCESS.READ,
            })
            test.not_nil(denied)
            test.is_false(denied.success == true)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
