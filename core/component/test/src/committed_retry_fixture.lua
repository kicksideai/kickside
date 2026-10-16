local sql = require("sql")
local M: any = {}
function M.reset(stage: string)
    M.stage = stage
    M.source = errors.new({kind = errors.UNAVAILABLE, retryable = true,
        message = "committed component dependency refused", details = {code = "component_committed_dependency", nested = {marker = "kept"}}})
end
function M.db_id() return "app:db" end
function M.get(id)
    local db, err = sql.get(id)
    if err or not db then return nil, err end
    local wrapper: any = {}
    function wrapper:begin()
        local tx, begin_err = db:begin()
        if begin_err or not tx then return nil, begin_err end
        local transaction: any = {}
        function transaction:execute(statement, parameters) return tx:execute(statement, parameters) end
        function transaction:rollback() return tx:rollback() end
        function transaction:commit()
            local result, commit_err = tx:commit()
            if commit_err then return nil, commit_err end
            if M.stage == "commit" then return nil, M.source end
            return result, nil
        end
        return transaction, nil
    end
    function wrapper:type() return db:type() end
    function wrapper:release()
        local result, release_err = db:release()
        if release_err then return nil, release_err end
        if M.stage == "release" then return nil, M.source end
        return result, nil
    end
    return wrapper, nil
end
function M.dispatch(tx, db, command)
    local result, err = tx:execute("UPDATE native_component_effect SET n=n+1 WHERE id=$1", {"effect"})
    if err then return nil, err end
    return {component_id = command.payload.component_id, changes_made = true}, nil
end
function M.actor() return {id = function() return "11111111-1111-4111-8111-111111111111" end} end
function M.created() return nil end
function M.committed() return M.stage == "notify" and M.source or nil end
function M.check_user_access(...) return true, nil end
function M.set_public_meta(tx, ...)
    local _, err = tx:execute("UPDATE native_component_effect SET n=n+1 WHERE id=$1", {"effect"})
    if err then return nil, nil, err end
    return {label = "kept"}, true, nil
end
function M.component_summary_tx(...) return {impl_id = "implementation"}, nil end
function M.public_meta_tx(...) return {label = "kept"}, nil end
function M.updated(...) return nil end
function M.call(...) return {success = true}, M.stage == "audience" and M.source or nil end
M.ACCESS = {WRITE = 2}
function M.check_context_revision(...) return nil end
function M.context_revision_tx(...) return 9, nil end
M.COMMAND_TYPES = {CREATE_COMPONENT = "create", SET_CONTEXT = "set_context", PATCH_CONTEXT = "patch_context", SET_META = "set_meta", SET_PLACEMENT = "set_placement"}
return M
