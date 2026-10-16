-- The automation database helpers every automation-DB reader and writer uses:
-- one connection for a read, one transaction for a write. A failure to reach
-- the database or to begin or commit is a retriable typed error; the work's
-- own error rolls the transaction back and is answered unchanged.
--
--   with_db(work(db) -> (value, err)) -> (value, err)
--   in_tx(work(tx) -> (value, err))   -> (value, err)

local sql = require("sql")
local types = require("types")

local M = {}

local function unavailable(message: string, err: any): error
    return (errors.new({ message = message .. ": " .. tostring(err), kind = errors.UNAVAILABLE, retryable = true }) :: error)
end

function M.with_db(work: (any) -> (any?, any)): (any?, any)
    local db, db_err = sql.get(types.db_id())
    if db_err or not db then return nil, unavailable("automation database unavailable", db_err) end
    local result, err = work(db)
    db:release()
    return result, err
end

function M.in_tx(work: (any) -> (any?, any)): (any?, any)
    local db, db_err = sql.get(types.db_id())
    if db_err or not db then return nil, unavailable("automation database unavailable", db_err) end
    local tx, begin_err = db:begin()
    if begin_err or not tx then
        db:release()
        return nil, unavailable("automation transaction failed", begin_err)
    end
    local result, err = work(tx)
    if err then
        tx:rollback()
        db:release()
        return nil, err
    end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then return nil, unavailable("automation commit failed", commit_err) end
    return result, nil
end

return M
