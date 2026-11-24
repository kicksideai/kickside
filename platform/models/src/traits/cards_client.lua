-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The kickside.models.cards:cards contract opened in the caller's context, and its
-- replies mapped onto agent tool results.
local contract = require("contract")
local security = require("security")
local tool_result = require("tool_result")

local CARDS_CONTRACT = "kickside.models.cards:cards"

local M = {}

-- call(method, args) opens the contract in the caller's security context and
-- invokes method. A contract refusal answers a domain error carrying its message,
-- its code and the holders it names.
function M.call(method: string, args: any): (any?, error?)
    if not security.actor() or not security.scope() then
        return tool_result.fail(errors.PERMISSION_DENIED, "an authenticated actor and scope are required")
    end
    local def, def_err = contract.get(CARDS_CONTRACT)
    if def_err then return nil, errors.wrap(def_err, "model cards contract unavailable") end
    local cards, open_err = def:open()
    if open_err then return nil, errors.wrap(open_err, "model cards contract open failed") end
    local reply, call_err = (cards :: any)[method](cards, args)
    if call_err then return nil, errors.wrap(call_err, "model cards " .. method) end
    if type(reply) ~= "table" or reply.success ~= true then
        if type(reply) ~= "table" then return tool_result.domain_error("model cards contract refused " .. method) end
        return tool_result.domain_error(reply.error or "model cards contract refused " .. method, { code = reply.code, holders = reply.holders })
    end
    return reply, nil
end

return M
