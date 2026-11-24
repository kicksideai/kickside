-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The kickside.models.profiles:profiles contract opened in the caller's context,
-- and its replies mapped onto agent tool results.
local contract = require("contract")
local security = require("security")
local tool_result = require("tool_result")

local PROFILES_CONTRACT = "kickside.models.profiles:profiles"

local M = {}

-- call(method, args) opens the contract in the caller's security context and
-- invokes method. A contract refusal answers a domain error carrying its message.
function M.call(method: string, args: any): (any?, error?)
    if not security.actor() or not security.scope() then
        return tool_result.fail(errors.PERMISSION_DENIED, "an authenticated actor and scope are required")
    end
    local def, def_err = contract.get(PROFILES_CONTRACT)
    if def_err then return nil, errors.wrap(def_err, "provider profiles contract unavailable") end
    local profiles, open_err = def:open()
    if open_err then return nil, errors.wrap(open_err, "provider profiles contract open failed") end
    local reply, call_err = (profiles :: any)[method](profiles, args)
    if call_err then return nil, errors.wrap(call_err, "provider profiles " .. method) end
    if type(reply) ~= "table" or reply.success ~= true then
        return tool_result.domain_error(type(reply) == "table" and reply.error or "provider profiles contract refused " .. method)
    end
    return reply, nil
end

return M
