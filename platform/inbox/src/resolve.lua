-- Synchronous Inbox resolution orchestration. The canonical inbox.item_type
-- declaration owns the allowed actions and optional callbacks; item metadata is
-- data only and is never trusted as an executable binding. Validation and the
-- idempotent resolution callback run under the resolver's actor/scope before the
-- one terminal item.resolved event is appended.

local funcs = require("funcs")
local security = require("security")

local item_types = require("inbox_item_types")
local reader = require("inbox_reader")
local event_store = require("inbox_events")
local inbox_types = require("inbox_types")
local object_fields = require("object_fields")

local M = {}
type Map = { [string]: any }

local ACTION_STATUS: { [string]: string } = {
    approve = inbox_types.STATUS.APPROVED,
    reject = inbox_types.STATUS.REJECTED,
    dismiss = inbox_types.STATUS.DISMISSED,
}
local DEFAULT_ACTIONS = { "approve", "reject", "dismiss" }

local function optional_string(value: any): string?
    if type(value) == "string" and value ~= "" then return value end
    return nil
end

local function current_identity(): (any?, any?, string?)
    local security_mod = M._security or security
    local actor = security_mod.actor()
    local scope = security_mod.scope()
    local actor_id = actor and actor:id() or nil
    if type(actor_id) ~= "string" or actor_id == "" then return nil, scope, nil end
    return actor, scope, actor_id
end

local function action_allowed(item_type: Map, action: string): boolean
    local declared = type(item_type.actions) == "table" and item_type.actions or DEFAULT_ACTIONS
    for _, value in ipairs(declared) do
        if value == action then return true end
    end
    return false
end

local function refusal(result: any): Map?
    local value = type(result) == "table" and (result :: Map).refusal or nil
    if type(value) ~= "table" then return nil end
    return value :: Map
end

local function invoke(target: string, actor: any, scope: any, args: Map, label: string): (any?, any?)
    if not actor then return nil, "authenticated actor is required for " .. label end
    if not scope then return nil, "authenticated scope is required for " .. label end
    local funcs_mod = M._funcs or funcs
    local executor, new_err = funcs_mod.new()
    if not executor then return nil, new_err or (label .. " executor unavailable") end
    return executor:with_actor(actor):with_scope(scope):call(target, args)
end

local function run_callback(target: string?, actor: any, scope: any, args: Map, label: string): any?
    if type(target) ~= "string" or target == "" then return nil end
    local result, call_err = invoke(target, actor, scope, args, label)
    if call_err then
        return errors.wrap(call_err, label .. " failed") :: error
    end
    local denied = refusal(result)
    if denied then
        if type(denied.code) ~= "string" or denied.code == ""
            or type(denied.message) ~= "string" or denied.message == "" then
            return errors.new({ kind = errors.INTERNAL, message = label .. " returned an invalid refusal" }) :: error
        end
        return ({ callback_refusal = true, code = denied.code, message = denied.message } :: any)
    end
    if type(result) ~= "table" or (result :: Map).ok ~= true then
        return errors.new({
            kind = errors.INTERNAL,
            message = label .. " must return { ok = true } or a structured refusal",
        }) :: error
    end
    return nil
end

local function merge(item: Map, patch: Map): Map
    local out: Map = {}
    for key, value in pairs(item) do out[key] = value end
    for key, value in pairs(patch) do out[key] = value end
    return out
end

function M.apply(id: string, action: string, form: Map?): (inbox_types.InboxItem?, any?)
    if type(id) ~= "string" or id == "" then
        return nil, (errors.new({ kind = errors.INVALID, message = "item id is required" }) :: error)
    end
    if type(action) ~= "string" or action == "" then
        return nil, (errors.new({ kind = errors.INVALID, message = "resolution action is required" }) :: error)
    end

    local actor, scope, actor_id = current_identity()
    if not actor_id then
        return nil, (errors.new({ kind = errors.INVALID, message = "authenticated actor is required" }) :: error)
    end

    local reader_mod = M._reader or reader
    local item, get_err = reader_mod.get(id)
    if get_err then return nil, get_err end
    if not item or item.actor_id ~= actor_id then
        return nil, (errors.new({ kind = errors.NOT_FOUND, message = inbox_types.ERROR.NOT_FOUND }) :: error)
    end
    if item.status ~= inbox_types.STATUS.PENDING then
        return nil, (errors.new({ kind = errors.CONFLICT, message = inbox_types.ERROR.ALREADY_RESOLVED }) :: error)
    end

    local events_mod = M._events or event_store
    local resolution_id = inbox_types.resolution_id(item)
    local prior, lookup_err = events_mod.resolution_event(id, nil, resolution_id)
    if lookup_err then return nil, lookup_err end
    if prior then
        return nil, (errors.new({ kind = errors.CONFLICT, message = inbox_types.ERROR.ALREADY_RESOLVED }) :: error)
    end

    local item_types_mod = M._item_types or item_types
    local item_type_value = optional_string(item.item_type)
    if not item_type_value then
        return nil, (errors.new({ kind = errors.INVALID, message = "item has no item type" }) :: error)
    end
    local item_type, type_err = item_types_mod.get(item_type_value)
    if not item_type then
        if action == "dismiss" and errors.is(type_err, errors.NOT_FOUND) then
            item_type = { actions = { "dismiss" } }
        else
            return nil, type_err or errors.new({ kind = errors.INVALID, message = "item type lookup returns no declaration" })
        end
    elseif type_err then
        return nil, type_err
    end
    if not action_allowed(item_type :: Map, action) then
        return nil, (errors.new({
            kind = errors.INVALID,
            message = inbox_types.ERROR.ACTION_NOT_ALLOWED .. ": " .. action,
        }) :: error)
    end

    local normalized_form = object_fields.object(form)
    -- One resolution identity per work version lets callbacks deduplicate retries.
    local callback_args: Map = {
        item_id = id,
        item = item,
        action = action,
        form = normalized_form,
        resolution_id = resolution_id,
    }

    local callback_err = run_callback(optional_string((item_type :: Map).on_validate), actor, scope, callback_args, "resolution validation")
    if callback_err then return nil, callback_err end
    callback_err = run_callback(optional_string((item_type :: Map).on_resolve), actor, scope, callback_args, "resolution callback")
    if callback_err then return nil, callback_err end

    local status = ACTION_STATUS[action] or inbox_types.STATUS.RESOLVED
    local committed_ok, write_err, committed = events_mod._commit_resolution(id, status, {
        action = action,
        resolved_by = actor_id,
        form = normalized_form,
        resolution_id = resolution_id,
    })
    if not committed_ok then return nil, write_err end
    return object_fields.item(merge(item :: Map, type(committed) == "table" and committed or {})) :: inbox_types.InboxItem
end

return M
