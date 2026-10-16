local sql = require("sql")
local context_ops = require("context_ops")
local ops = require("ops")

return {run = function(args)
    local token, prepare_err = context_ops.prepare_identity(args.input, {
        automation_id = args.owner.automation_id,
        verify = function() return args.owner, nil end,
    })
    if prepare_err then return nil, prepare_err end
    local db, db_err = sql.get("app:db")
    if db_err then return nil, db_err end
    local tx, begin_err = db:begin()
    if begin_err then db:release(); return nil, begin_err end
    local result, write_err = ops.set_execution_identity_tx(tx, token)
    if write_err then
        local _, rollback_err = tx:rollback()
        db:release()
        if rollback_err then return nil, errors.wrap(write_err, "rollback failed: " .. tostring(rollback_err)) end
        return nil, write_err
    end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then return nil, commit_err end
    return result, nil
end}
