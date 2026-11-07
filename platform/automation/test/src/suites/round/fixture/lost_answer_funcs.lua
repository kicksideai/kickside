-- The funcs module as the round write library sees it, except for the sink
-- effect of an item whose input directive is lost_answer or absent_target. A
-- lost_answer send completes and then answers a transport error, as a call does
-- whose answer is lost after the destination received the request. An
-- absent_target send calls a target the function registry does not hold, as a
-- call does while a registry changeset replaces the sink effect entry.
local funcs = require("funcs")

local M = {}

local ABSENT_TARGET = "kickside.automation.round.fixture:absent_sink_effect"

function M.call(id: string, args: any): (any?, error?)
    local body = type(args) == "table" and args.body or nil
    local input = type(body) == "table" and body.input or nil
    local directive = type(input) == "table" and input.directive or nil
    if id == "kickside.automation:round_sink_effect" and directive == "absent_target" then
        return funcs.call(ABSENT_TARGET, args)
    end
    local value, err = funcs.call(id, args)
    if err == nil and id == "kickside.automation:round_sink_effect" and directive == "lost_answer" then
        return nil, errors.new({ kind = errors.UNAVAILABLE, retryable = true,
            message = "the sink effect lost its answer after the send" })
    end
    return value, err
end

return M
