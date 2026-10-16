local sql = require("sql")
local time = require("time")
local security = require("security")
local contract = require("contract")
local registry = require("registry")
local autoinit = require("autoinit")
local ops = require("component_ops")
local component_types = require("component_types")
local access_policy = require("access_policy")
local component_lifecycle = require("component_lifecycle")
local component_command = require("component_command")
local committed_error = require("committed_error")
local envelope = require("envelope")
local funcs = require("funcs")

local function construct(dependencies: any?): any
local deps = dependencies or {}
local contract = deps.contract or contract
local ops = deps.ops or ops
local M = {}

local REALTIME_CONTRACT = "kickside.contract:realtime_batch"
local GROUP_MEMBERS_CONTRACT = "kickside.contract:group_members"
local NOTIFY_ACCESS = "kickside.component:notify_access"

local function normalize_required_access(value: any, default_value: integer?): (integer?, error?)
    local normalized, access_err = access_policy.normalize_access_mask(value, default_value)
    if access_err then return nil, errors.wrap(access_err, "Failed to normalize notification access") end
    if not normalized or normalized <= component_types.ACCESS.NONE then
        return nil, (errors.new({
            message = "access level must be an integer between "
                .. tostring(component_types.ACCESS.READ)
                .. " and "
                .. tostring(component_types.ACCESS.FULL),
            kind = errors.INVALID,
        }) :: error)
    end
    return normalized, nil
end

local function unavailable(code: string, message: string): error
    return (errors.new({ kind = errors.UNAVAILABLE, retryable = true, message = message,
        details = { code = code } }) :: error)
end

local function open_owner(contract_id: string, code: string, optional: boolean?): (any?, error?)
    local def, def_err = contract.get(contract_id)
    if def_err and not errors.is(def_err, errors.NOT_FOUND) then return nil, def_err end
    if not def then
        if optional then return nil, nil end
        return nil, unavailable(code, "notification owner is unavailable: " .. contract_id)
    end
    local inst, open_err = def:open()
    if open_err and not errors.is(open_err, errors.NOT_FOUND) then return nil, open_err end
    if not inst then
        if optional then return nil, nil end
        return nil, unavailable(code, "notification owner is unbound: " .. contract_id)
    end
    return inst, nil
end

local function group_member_ids(group_id: string): ({ string }?, error?)
    local inst, owner_err = open_owner(GROUP_MEMBERS_CONTRACT, "component_group_members_unavailable")
    if owner_err then return nil, owner_err end
    local result, call_err = inst:members({ group_id = group_id })
    if call_err then return nil, call_err end
    if type(result) ~= "table" or type(result.user_ids) ~= "table" then
        return nil, unavailable("component_group_members_invalid_result", "group membership owner returns no member list")
    end
    return result.user_ids :: { string }, nil
end

-- The user ids that should receive a notification for this component at the
-- required access level, resolved live from every direct grant that reaches it
-- (on the component and on each ancestor). A user is a recipient when the union
-- of its own grants and its groups' grants carries the required bits. Each group
-- is expanded once per notification; service subjects never
-- receive realtime. Nothing is cached: a revoked grant or membership stops
-- notifications on the next event.
local function resolve_recipients(component_id: string, required_access: integer): ({ string }?, error?)
    local grants, grants_err = ops.reaching_grants(component_id)
    if grants_err then return nil, grants_err end

    local candidates: { string } = {}
    local effective: { [string]: integer } = {}
    local function accumulate(user_id: any, access_mask: integer)
        if type(user_id) ~= "string" or user_id == "" then return end
        if effective[user_id] == nil then
            table.insert(candidates, user_id)
        end
        effective[user_id] = access_policy.combine(effective[user_id], access_mask)
    end

    local group_masks: { [string]: integer } = {}
    local groups: { string } = {}
    for _, row in ipairs(grants or {}) do
        local subject_id = type(row.subject_id) == "string" and row.subject_id or ""
        local access_mask = (tonumber(row.access_mask) or 0) :: integer
        if subject_id ~= "" then
            if row.subject_type == component_types.SUBJECT_TYPES.USER then
                accumulate(subject_id, access_mask)
            elseif row.subject_type == component_types.SUBJECT_TYPES.GROUP then
                if group_masks[subject_id] == nil then table.insert(groups, subject_id) end
                group_masks[subject_id] = access_policy.combine(group_masks[subject_id], access_mask)
            end
        end
    end
    for _, group_id in ipairs(groups) do
        local group_mask = group_masks[group_id]
        if group_mask ~= nil then
            local members, members_err = group_member_ids(group_id)
            if members_err then return nil, members_err end
            for _, uid in ipairs(members) do accumulate(uid, group_mask) end
        end
    end

    local users: { string } = {}
    for _, user_id in ipairs(candidates) do
        if access_policy.has_all(effective[user_id], required_access) then
            table.insert(users, user_id)
        end
    end
    return users, nil
end

-- Component-scoped realtime fanout. Only public meta/state goes out, to every
-- user whose effective access (direct and inherited, user and group grants)
-- carries the required access bits. The audience comes from the stored grants;
-- the caller names only the component. The fanout runs in the notify_access
-- function, which holds the component's realtime notify authority, so callers
-- (a group principal, a framework worker) need none. A refused delivery is
-- returned.
function M.notify_access(component_id: string, topic: string?, data: component_types.JsonMap?, opts: component_types.JsonMap?): (component_types.JsonMap?, error?)
    local result, call_err = funcs.call(NOTIFY_ACCESS, component_id, topic, data, opts)
    if call_err then return nil, call_err end
    return result :: component_types.JsonMap, nil
end

function M.fanout(component_id: string, topic: string?, data: component_types.JsonMap?, opts: component_types.JsonMap?): (component_types.JsonMap?, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return nil, (errors.new({ message = "component ID is required", kind = errors.INVALID }) :: error)
    end

    local resolved_topic = topic
    if type(resolved_topic) ~= "string" or resolved_topic == "" then
        resolved_topic = "component." .. component_id
    end

    local required_access = component_types.ACCESS.READ
    if type(opts) == "table" and opts.access_mask ~= nil then
        local normalized, access_err = normalize_required_access(opts.access_mask, component_types.ACCESS.READ)
        if access_err or not normalized then return nil, access_err end
        required_access = normalized
    end

    local recipients, recip_err = resolve_recipients(component_id, required_access)
    if recip_err then return nil, recip_err end
    if #recipients == 0 then return { success = true, notified = 0, topic = resolved_topic }, nil end

    local realtime, realtime_err = open_owner(REALTIME_CONTRACT, "component_realtime_unavailable", true)
    if realtime_err then return nil, realtime_err end
    if not realtime then
        return {success = true, status = "not_supported", notified = 0, topic = resolved_topic}, nil
    end

    local notified = 0
    for first = 1, #recipients, 128 do
        local batch: { string } = {}
        for index = first, math.min(first + 127, #recipients) do batch[#batch + 1] = recipients[index] end
        local delivered, notify_err = realtime:notify({
            user_ids = batch,
            topic = resolved_topic,
            data = data or {},
        })
        if notify_err then return nil, notify_err end
        if type(delivered) ~= "table" or delivered.success ~= true then
            return nil, (errors.new({ message = "component notification batch is refused",
                kind = errors.PERMISSION_DENIED, retryable = false,
                details = { code = "component_notification_refused" } }) :: error)
        end
        if delivered.status == "not_supported" then
            return {success = true, status = "not_supported", notified = notified, topic = resolved_topic}, nil
        end
        notified = notified + #batch
    end

    return { success = true, notified = notified, topic = resolved_topic }, nil
end

return M
end

local M = construct()
M.new = construct

function M.set_meta(request_dto: { [string]: any }?)
    if not request_dto or type(request_dto) ~= "table" then
        return envelope.fail("Invalid request: must be a table", errors.INVALID)
    end

    local component_id = request_dto.component_id
    if type(component_id) ~= "string" or component_id == "" then
        return envelope.fail("component_id is required and must be a non-empty string", errors.INVALID)
    end

    local fields = request_dto.fields
    if type(fields) ~= "table" then
        return envelope.fail("fields table is required", errors.INVALID)
    end

    local actor, actor_err = security.actor()
    if actor_err then return envelope.from_error(actor_err, "Failed to resolve metadata actor") end
    if not actor then
        return envelope.fail("No authenticated actor found", errors.PERMISSION_DENIED)
    end
    local user_id, actor_id_err = actor:id()
    if actor_id_err then return envelope.from_error(actor_id_err, "Failed to resolve metadata actor ID") end
    if (not user_id or user_id == "") and request_dto.trusted_runtime ~= true then
        return envelope.fail("Invalid actor ID", errors.PERMISSION_DENIED)
    end

    local results: any = nil
    local changed: any = false
    local public_meta_snapshot: component_types.JsonMap? = nil
    local _, transaction_err = component_command.with_component_tx(function(tx: sql.Transaction, db: sql.DB): (any?, error?)
        local trusted_runtime = false
        local summary: any = nil
        if request_dto.trusted_runtime == true then
            local lock_err = ops.lock_component_tx(tx, component_id)
            if lock_err then return nil, errors.wrap(lock_err, "Failed to lock component metadata") end
            local summary_err
            summary, summary_err = ops.component_summary_tx(tx, component_id)
            if summary_err then return nil, errors.wrap(summary_err, "Failed to read component summary") end
            if not summary then return nil, component_command.response_error("summary") end
            local impl_id = tostring(summary.impl_id)
            local implementation, lookup_err = registry.get(impl_id)
            if lookup_err and not errors.is(lookup_err, errors.NOT_FOUND) then
                return nil, errors.wrap(lookup_err, "Failed to resolve component implementation")
            end
            local identity: { [string]: any } = {}
            for key, value in pairs(implementation and implementation.meta or {}) do identity[key] = value end
            identity.class = autoinit.first_class(identity.class)
            identity.impl_id = impl_id
            local allowed, permission_err = security.can("component.runtime_meta.write", component_id, identity)
            if permission_err then return nil, errors.wrap(permission_err, "Failed to authorize runtime metadata") end
            trusted_runtime = allowed == true
        end
        if not trusted_runtime then
            if not user_id or user_id == "" then
                return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Invalid actor ID"})
            end
            local has_access, access_err = ops.check_user_access(tx, user_id, component_id, ops.ACCESS.WRITE)
            if access_err then return nil, errors.wrap(access_err, "Failed to check component access") end
            if not has_access then
                return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Insufficient access to update component metadata"})
            end
        end
        local meta_err
        results, changed, meta_err = ops.set_public_meta(tx, component_id, fields, request_dto.delete_keys)
        if meta_err then return nil, errors.wrap(meta_err, "Failed to update component metadata") end
        if changed then
            local dbtype_raw, dbtype_err = db:type()
            if dbtype_err then return nil, errors.wrap(dbtype_err, "Failed to resolve database type") end
            if dbtype_raw == nil then return nil, component_command.response_error("dbtype") end
            local summary_err
            if not summary then summary, summary_err = ops.component_summary_tx(tx, component_id) end
            if summary_err then return nil, errors.wrap(summary_err, "Failed to read component summary") end
            if not summary then return nil, component_command.response_error("summary") end
            local lifecycle_err = component_lifecycle.updated({
                tx = tx,
                dbtype = tostring(dbtype_raw),
                component_id = component_id,
                impl_id = tostring(summary.impl_id),
                parent_id = summary.parent_id,
                command_types = { "SET_META" },
            })
            if lifecycle_err then return nil, errors.wrap(lifecycle_err, "Failed to record component lifecycle") end
            local snapshot, snapshot_err = ops.public_meta_tx(tx, component_id)
            if snapshot_err then return nil, errors.wrap(snapshot_err, "Failed to read component metadata snapshot") end
            if not snapshot then return nil, component_command.response_error("snapshot") end
            public_meta_snapshot = snapshot :: component_types.JsonMap
        end
        return true, nil
    end)
    if transaction_err then return envelope.from_error(transaction_err) end

    if changed then
        local committed_err = component_lifecycle.committed()
        if committed_err then
            return envelope.from_error(committed_error.new(committed_err), "Failed to notify committed component lifecycle")
        end
        local _, notify_err = M.notify_access(component_id, nil, {
            event = "component.meta.changed",
            component_id = component_id,
            meta = public_meta_snapshot or {},
            deleted = request_dto.delete_keys,
        })
        if notify_err then
            return envelope.from_error(committed_error.new(notify_err), "Failed to notify the component audience")
        end
    end

    return {
        component_id = component_id,
        changes_made = changed,
        results = results or {},
        success = true,
        updated_at = time.now():utc():format_rfc3339(),
    }
end

return M
