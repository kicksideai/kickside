-- A fresh process reads an owner's durable receipts and prepared output.
local sql = require("sql")
local M = {}

function M.run(args: any): (any?, error?)
    local owner = type(args) == "table" and args.owner_id or nil
    if type(owner) ~= "string" or owner == "" then
        return nil, (errors.new({ message = "owner_id required", kind = errors.INVALID }) :: error)
    end
    local db, open_err = sql.get("app:db")
    if open_err or not db then return nil, open_err end
    local receipts, receipt_err = db:query("SELECT COUNT(*) AS n FROM kickside_automation_receipt WHERE owner_id=$1", { owner })
    if receipt_err then db:release(); return nil, receipt_err end
    local prepared, prepared_err = db:query("SELECT COUNT(*) AS n FROM kickside_automation_prepared WHERE automation_id=$1", { owner })
    db:release()
    if prepared_err then return nil, prepared_err end
    return { receipts = tonumber(receipts[1] and receipts[1].n),
        prepared = tonumber(prepared[1] and prepared[1].n) }, nil
end

return M
