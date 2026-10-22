local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local context_ops = require("context_ops")
local access_ops = require("access_ops")
local declaration_fence = require("declaration_fence")

local function define_tests()
    test.describe("component identity lock order", function()
        for _, mode in ipairs({"unowned", "owned", "revoked"}) do
            local owned = mode ~= "unowned"
            test.it(mode == "revoked" and "rolls back the owner fence when ADMIN is revoked after preparation"
                or (owned and "takes the declaration fence before access rows for an owned identity"
                    or "reads the declaration fence before access rows for an unowned identity"), function()
                local db = assert(sql.get("app:db"))
                local id = uuid.v7()
                local now = time.now():utc():format(time.RFC3339)
                local _, seed_err = sql.builder.insert("kickside_components"):set_map({component_id = id,
                    impl_id = "kickside.test:security", private_context = "{}", position = "n",
                    created_at = now, updated_at = now}):run_with(db):exec()
                test.is_nil(seed_err, tostring(seed_err))
                local _, grant_err = sql.builder.insert("kickside_component_access"):set_map({access_id = uuid.v7(),
                    component_id = id, source_component_id = id, subject_type = "user", subject_id = "lock-order-operator",
                    access_mask = 8, inherited = 0}):run_with(db):exec()
                test.is_nil(grant_err, tostring(grant_err))
                if owned then
                    local _, fence_err = sql.builder.insert(declaration_fence.TABLE):set_map({component_id = id,
                        automation_id = id, applied_command_generation = 1, command_id = "prior", declaration_hash = "declaration",
                        updated_at = now}):run_with(db):exec()
                    test.is_nil(fence_err, tostring(fence_err))
                end
                local request = {component_id = id, principal = {kind = "user", id = "lock-order-operator"},
                    request_id = "selection", expected_identity_generation = 0}
                local owner = owned and {automation_id = id, verify = function()
                    return {valid = true, automation_id = id, command_generation = 2,
                        command_id = request.request_id, declaration_hash = "declaration"}, nil
                end} or nil
                local token, prepare_err = context_ops.prepare_identity(request, owner)
                test.is_nil(prepare_err, tostring(prepare_err))
                test.not_nil(token)
                if mode == "revoked" then
                    local _, revoke_err = db:execute("DELETE FROM kickside_component_access WHERE component_id=$1", {id})
                    test.is_nil(revoke_err, tostring(revoke_err))
                end
                local stages = {}
                local methods = {owner = declaration_fence.owner, read = declaration_fence.read, save_tx = declaration_fence.save_tx}
                local original_access = access_ops.check_user_access
                for name, method in pairs(methods) do
                    declaration_fence[name] = function(...)
                        stages[#stages + 1] = "fence"
                        return method(...)
                    end
                end
                access_ops.check_user_access = function(...)
                    stages[#stages + 1] = "access"
                    return original_access(...)
                end
                local tx = assert(db:begin())
                local ok, result, err = pcall(context_ops.set_execution_identity_tx, tx, token)
                for name, method in pairs(methods) do declaration_fence[name] = method end
                access_ops.check_user_access = original_access
                if not ok or err then tx:rollback() else
                    local _, commit_err = tx:commit()
                    err = commit_err
                end
                local rows, read_err = db:query("SELECT identity_generation FROM kickside_components WHERE component_id=$1", {id})
                local fence, fence_err = declaration_fence.read(db, id, id)
                local audits, audit_err = db:query("SELECT COUNT(*) AS n FROM kickside_execution_identity_audit WHERE component_id=$1", {id})
                db:release()
                test.is_true(ok, tostring(result))
                if mode == "revoked" then
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
                else
                    test.is_nil(err, tostring(err))
                    test.not_nil(result)
                end
                test.is_nil(read_err, tostring(read_err))
                test.is_nil(fence_err, tostring(fence_err))
                test.is_nil(audit_err, tostring(audit_err))
                test.eq(tonumber(rows[1].identity_generation), mode == "revoked" and 0 or 1)
                test.eq(tonumber(audits[1].n), mode == "revoked" and 0 or 1)
                if owned then test.eq(fence.applied_command_generation, mode == "revoked" and 1 or 2) end
                local access_seen, fence_seen = false, false
                for _, stage in ipairs(stages) do
                    if stage == "fence" then
                        test.is_false(access_seen, "declaration fence follows access-row locking")
                        fence_seen = true
                    else
                        test.is_true(fence_seen, "access evaluation precedes the declaration fence")
                        access_seen = true
                    end
                end
                test.is_true(access_seen)
                test.is_true(fence_seen)
            end)
        end
    end)
end

return {run = test.run_cases(define_tests)}
