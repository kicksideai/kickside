-- The funcs module as the round write library sees it, except that the
-- authority write of an item whose input directive is lost_answer completes
-- its send and then answers a transport error, as a call does whose answer is
-- lost after the destination received the request.
local funcs = require("funcs")

local M = {}

function M.call(id: string, args: any): (any?, error?)
    local value, err = funcs.call(id, args)
    local body = type(args) == "table" and args.body or nil
    local input = type(body) == "table" and body.input or nil
    if err == nil and id == "kickside.automation:round_authority_write" and type(input) == "table"
        and input.directive == "lost_answer" then
        return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true,
            message = "the authority write lost its answer after the send" })
    end
    return value, err
end

return M
