local ctx = require("ctx")
local M = { list_called = false }
local function failure(): any
    local kind = ctx.get("listing_kind")
    local message = ctx.get("listing_failure")
    if kind then return errors.new({ kind = kind, message = message }) end
    return message
end
function M.count_for_actor(_actor: string, _opts: any): (integer?, any?)
    if ctx.get("listing_stage") == "count" then return nil, failure() end
    return 0, nil
end
function M.list_for_actor(_actor: string, _limit: any, _offset: any, _opts: any): (any?, any?)
    M.list_called = true
    if ctx.get("listing_stage") == "list" then return nil, failure() end
    return {}, nil
end
return M
