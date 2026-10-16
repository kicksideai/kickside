-- The negotiator's answer to the callback request that delivered the OAuth
-- code. Delivery runs in the callback_reply_deliver function under the OAuth
-- identity, so the negotiating principal needs no process messaging authority;
-- the function sends only the callback response topic.

local process = require("process")
local funcs = require("funcs")

local M = {}

local DELIVER = "kickside.oauth.service:callback_reply_deliver"
local REPLY_TOPIC = "oauth_callback_response"

function M.send(reply_to: string, response: any): (boolean, error?)
    local sent, call_err = funcs.call(DELIVER, reply_to, response)
    if call_err then return false, call_err end
    return sent == true, nil
end

function M.deliver(reply_to: string, response: any): (boolean, error?)
    local sent, send_err = process.send(reply_to, REPLY_TOPIC, response)
    if send_err then return false, send_err end
    return sent == true, nil
end

return M
