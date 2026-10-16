-- Inbox action callback for the canonical Block Signal resume function.

local funcs = require("funcs")
local security = require("security")
local review_signal = require("review_signal")

local M = {}
type Map = { [string]: any }

local RESUME_TARGET = "kickside.blocks:resume"

local function str(value: any): string
    return type(value) == "string" and value or ""
end

local function dependency(name: string): any
    local override = (M :: any)["_" .. name]
    if override ~= nil then return override end
    if name == "funcs" then return funcs end
    if name == "security" then return security end
    if name == "review_signal" then return review_signal end
    return nil
end

function M.resume(args: any): (Map?, any?)
    local a = type(args) == "table" and (args :: Map) or {}
    local item = type(a.item) == "table" and (a.item :: Map) or {}
    local metadata = type(item.metadata) == "table" and (item.metadata :: Map) or {}
    local dataflow_id = str(metadata.dataflow_id)
    local signal_id = str(metadata.signal_id)
    local action = str(a.action)
    if dataflow_id == "" then return nil, "workflow item has no dataflow_id" end
    if signal_id == "" then return nil, "workflow item has no signal_id" end
    if action ~= "approve" and action ~= "reject" then return nil, "action must be approve or reject" end

    local security_mod = dependency("security")
    local actor, scope = security_mod.actor(), security_mod.scope()
    if not actor or not scope then return nil, "Block Signal resume requires an authenticated actor and scope" end

    local authorized, review_err = dependency("review_signal").authorize(dataflow_id, signal_id, tostring(actor:id()))
    if not authorized then return nil, review_err end

    local funcs_mod = dependency("funcs")
    local executor, executor_err = funcs_mod.new()
    if not executor then return nil, executor_err or "workflow resume executor unavailable" end
    local result, resume_err = executor:with_actor(actor):with_scope(scope):call(RESUME_TARGET, {
        dataflow_id = dataflow_id,
        signal_id = signal_id,
        payload = {
            outcome = action,
            form = type(a.form) == "table" and a.form or {},
        },
    })
    if resume_err then return nil, resume_err end

    local out: Map = { ok = true, dataflow_id = dataflow_id, signal_id = signal_id }
    if type(result) == "table" then
        for key, value in pairs(result :: Map) do out[key] = value end
        out.ok = true
    end
    return out, nil
end

return M
