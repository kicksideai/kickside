-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local security = require("security")
local uuid = require("uuid")
local funcs = require("funcs")
local json = require("json")
local hash = require("hash")
local component = require("component")
local access_subjects = require("access_subjects")
local item_types = require("inbox_item_types")
local inbox_types = require("inbox_types")
local files = require("inbox_files")

local M = {}
type Recipient = inbox_types.Recipient
local STORE_ACTOR = "system:kickside.inbox.addressed"

local function failure(message: string, kind: string): error
    return errors.new({ message = message, kind = kind }) :: error
end

function M.component_id(recipient: Recipient): string
    return component.singleton_component_id(STORE_ACTOR .. ":" .. recipient.kind .. ":" .. recipient.id, "kickside.inbox") :: string
end

local function directory(): (any?, any?)
    local actor = security.actor()
    if not actor then return nil, failure("authenticated actor required", errors.PERMISSION_DENIED) end
    local definition, err = contract.get("kickside.contract:directory")
    if err then return nil, err end
    return definition:with_actor(actor):with_scope(security.scope()):open()
end

function M.group_inboxes(): ({ string }?, any?)
    local run, err = directory()
    if err then return nil, err end
    local membership, groups_err = run:groups({ id = security.actor():id() })
    if groups_err then return nil, groups_err end
    local ids: { string } = {}
    if membership.active == true then
        for _, group in ipairs(membership.groups :: { string }) do
            ids[#ids + 1] = M.component_id({ kind = "group", id = group })
        end
    end
    return ids, nil
end

-- Only Inbox's entry-owned capability can construct the storage frame. The
-- viewer remains ambient for authorization, directory queries and callbacks.
function M.store(name: string): (any?, any?)
    local actor, actor_err = security.new_actor(STORE_ACTOR, {})
    if actor_err then return nil, actor_err end
    local policy, policy_err = security.policy("kickside.inbox.security:addressed_storage")
    if policy_err then return nil, policy_err end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err then return nil, scope_err end
    local definition, err = contract.get(name)
    if err then return nil, err end
    return definition:with_actor(actor):with_scope(scope):open()
end

function M.item_id(item_type: string, id: string, recipient: Recipient): string
    return "addressed-item:" .. tostring(#item_type) .. ":" .. item_type
        .. ":" .. tostring(#recipient.kind) .. ":" .. recipient.kind
        .. ":" .. tostring(#recipient.id) .. ":" .. recipient.id .. ":" .. id
end

local function authorize(params: any): (Recipient?, string?, any?)
    local recipient = params.recipient
    if type(recipient) ~= "table" or (recipient.kind ~= "user" and recipient.kind ~= "group")
        or type(recipient.id) ~= "string" or recipient.id == "" then
        return nil, nil, failure("recipient must be {kind: user|group, id}", errors.INVALID)
    end
    if type(params.item_type) ~= "string" or params.item_type == "" then
        return nil, nil, failure("item type is required", errors.INVALID)
    end
    local declared, type_err = item_types.get(params.item_type)
    if not declared then return nil, nil, type_err end
    local permission = declared.send_permission
    if type(permission) ~= "string" or permission == "" or permission:find("*", 1, true)
        or security.can(permission, declared.declaration_id) ~= true then
        return nil, nil, failure("Inbox sender access denied", errors.PERMISSION_DENIED)
    end
    if not security.actor() or not security.scope() then
        return nil, nil, failure("authenticated actor and scope required", errors.PERMISSION_DENIED)
    end
    local run, open_err = directory()
    if open_err then return nil, nil, open_err end
    local answer, exists_err = run:exists({ type = recipient.kind, id = recipient.id })
    if exists_err then return nil, nil, exists_err end
    if not answer or answer.exists ~= true then
        return nil, nil, failure("recipient does not exist", errors.NOT_FOUND)
    end
    -- Scope producer-supplied identities by the authorized canonical type.
    if params.aggregate_key == nil then
        if type(params.id) ~= "string" or params.id == "" then
            return nil, nil, failure("id is required for an addressed item", errors.INVALID)
        end
        return recipient :: Recipient, M.item_id(params.item_type, params.id, recipient :: Recipient), nil
    end
    if type(params.source_id) ~= "string" or params.source_id == ""
        or type(params.aggregate_key) ~= "string" or params.aggregate_key == "" then
        return nil, nil, failure("aggregate_key and source_id component are required", errors.INVALID)
    end
    local parts = { params.item_type, params.source_id, params.aggregate_key, recipient.kind, recipient.id }
    local id = "addressed"
    for _, part in ipairs(parts) do id = id .. ":" .. tostring(#part) .. ":" .. part end
    return recipient :: Recipient, id, nil
end

local function same(a: any, b: any): boolean
    if type(a) ~= type(b) then return false end
    if type(a) ~= "table" then return a == b end
    for k, v in pairs(a) do if not same(v, b[k]) then return false end end
    for k in pairs(b) do if a[k] == nil then return false end end
    return true
end

local function payload(body: any): any
    local out = {}
    for field, value in pairs(body) do
        if field ~= "created_at" and field ~= "resolved_at" and field ~= "store_version" then out[field] = value end
    end
    return out
end

local function compare_delivery(event: any, body: any): any?
    if not event then return failure("delivery append has no durable event", errors.INTERNAL) end
    local prior = event.body
    if type(prior) == "string" then
        local decode_err
        prior, decode_err = json.decode(prior)
        if decode_err then return decode_err end
    end
    if not same(payload(prior), payload(body)) then
        return failure("idempotency key already used for a different write", errors.CONFLICT)
    end
    return nil
end

function M.subject(id: string): string
    return assert(hash.sha256(id)) :: string
end

-- Upgrade lookup returns only a matching recipient-owned identity; it never
-- exposes the recipient's item content to the sender.
local function legacy_item(params: any, recipient: Recipient): (boolean?, any?)
    if params.aggregate_key ~= nil or recipient.kind ~= "user" then return false, nil end
    local actor, actor_err = security.new_actor(recipient.id, {})
    if actor_err then return nil, actor_err end
    local policy, policy_err = security.policy("kickside.inbox.security:legacy_read")
    if policy_err then return nil, policy_err end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err then return nil, scope_err end
    local definition, get_err = contract.get("kickside.core:threads")
    if get_err then return nil, get_err end
    local run, open_err = definition:with_actor(actor):with_scope(scope):open()
    if open_err then return nil, open_err end
    local thread_id = component.singleton_component_id(recipient.id, "kickside.inbox")
    local thread, find_err = run:find({ thread_id = thread_id })
    if find_err then return nil, find_err end
    if not thread then return false, nil end
    local models_definition, models_err = contract.get("kickside.core:read_models")
    if models_err then return nil, models_err end
    local models, models_open_err = models_definition:with_actor(actor):with_scope(scope):open()
    if models_open_err then return nil, models_open_err end
    local result, read_err = models:get({ owner_id = thread_id, kind = "kickside.inbox:items", projection_key = "default" })
    if read_err then return nil, read_err end
    local item = ((result.body or {}).items or {})[params.id]
    if item then return item.item_type == params.item_type, nil end
    -- A retained creation receipt also acknowledges deleted, no-longer-materialized history.
    local found, lookup_err = run:find_event_by_external({ thread_id = thread_id,
        event_type = inbox_types.EVENT.CREATED, external_source = "kickside.inbox",
        external_id = "item:" .. params.id, external_version = "1" })
    if lookup_err then return nil, lookup_err end
    if not found.event then return false, nil end
    local body = found.event.body
    if type(body) == "string" then
        local decode_err
        body, decode_err = json.decode(body)
        if decode_err then return nil, decode_err end
    end
    return body.item_type == params.item_type, nil
end

function M.identity(params: any): (any?, any?)
    local result, err = funcs.new():call("kickside.inbox.persist:addressed_write", { params = params, identity_only = true })
    if err then return nil, err end
    return result.identity, nil
end

function M.delete_identity(identity: any, key: string?): (boolean?, any?)
    local result, err = funcs.new():call("kickside.inbox.persist:addressed_write", { params = identity.params, deleting = identity, key = key })
    return result :: boolean?, err
end

-- Function entry: all caller checks precede the private storage frame.
function M.deliver(input: any): (any?, any?)
    local params, closing = input.params, input.closing == true
    local recipient, id, auth_err = authorize(params)
    if auth_err or not recipient or not id then return nil, auth_err end
    if params.aggregate_key ~= nil and not closing and not input.deleting and input.identity_only ~= true then
        local _, access_err = component.validate_access(params.source_id :: string, 1)
        if access_err then return nil, access_err end
    end
    local legacy, legacy_err = legacy_item(params, recipient)
    if legacy_err then return nil, legacy_err end
    local identity = legacy and { id = params.id, owner_id = recipient.id, params = params }
        or { id = id, recipient = recipient, params = params }
    if input.deleting then
        if not same(input.deleting, identity) then
            return nil, failure("Inbox identity does not match its authorized store", errors.INVALID)
        end
        if identity.owner_id then
            local actor, actor_err = security.new_actor(identity.owner_id, {})
            if actor_err then return nil, actor_err end
            return funcs.new():with_actor(actor):with_scope(security.scope())
                :call("kickside.inbox.persist:personal_delete", { id = identity.id, key = input.key })
        end
        local removed, delete_err = M.remove({ id = identity.id, key = input.key }, identity.recipient)
        if delete_err then return nil, delete_err end
        if not removed then return nil, failure(inbox_types.ERROR.NOT_FOUND, errors.NOT_FOUND) end
        return true, nil
    end
    if legacy or input.identity_only == true then
        return { id = identity.id, identity = identity, outcome = "updated" }, nil
    end
    local sender = assert(security.actor()):id()
    local key = type(params.idempotency_key) == "string" and params.idempotency_key ~= "" and params.idempotency_key
        or (params.aggregate_key == nil and id or uuid.v4())
    local body = { id = id, item_type = params.item_type, source_id = params.source_id,
        aggregate_key = params.aggregate_key, recipient = recipient, sender_id = sender,
        actor_id = recipient.kind == "user" and recipient.id or nil,
        status = closing and "resolved" or "pending", delivery_key = key }
    if not closing then
        if type(params.title) ~= "string" or params.title == "" then return nil, inbox_types.ERROR.TITLE_REQUIRED end
        local refs, files_err = files.normalize(params.files)
        if files_err then return nil, files_err end
        body.title, body.content, body.files = params.title, params.content, refs
        body.metadata = type(params.metadata) == "table" and params.metadata or {}
        body.priority = type(params.priority) == "string" and params.priority or inbox_types.PRIORITY.NORMAL
    end
    local run, err = M.store("kickside.core:threads")
    if err then return nil, err end
    local thread_id = M.component_id(recipient)
    if closing then
        local thread, find_err = run:find({ thread_id = thread_id })
        if find_err then return nil, find_err end
        if not thread then return nil, failure(inbox_types.ERROR.NOT_FOUND, errors.NOT_FOUND) end
    else
        local _, upsert_err = run:upsert({ thread_id = thread_id, impl_id = "kickside.inbox:inbox_binding", thread_class = "kickside.inbox" })
        if upsert_err then return nil, upsert_err end
    end
    local external_id = "addressed:" .. tostring(#sender) .. ":" .. sender .. ":" .. key
    local found, find_err = run:find_event_by_external({ thread_id = thread_id, event_type = inbox_types.EVENT.VERSION,
        external_source = "kickside.inbox", external_id = external_id, external_version = "1" })
    if find_err then return nil, find_err end
    if found and found.event then
        local compare_err = compare_delivery(found.event, body)
        if compare_err then return nil, compare_err end
        return { id = identity.id, identity = identity, outcome = "updated" }, nil
    end
    local subject = M.subject(id)
    local observed, observed_err = run:find({ thread_id = thread_id, subject = subject })
    if observed_err then return nil, observed_err end
    if closing and observed.subject_version == 0 then
        return nil, failure(inbox_types.ERROR.NOT_FOUND, errors.NOT_FOUND)
    end
    if params.aggregate_key == nil and observed.subject_version > 0 then
        return nil, failure("item identity already bound to another delivery", errors.CONFLICT)
    end
    body.store_version = observed.subject_version + 1
    body.created_at = os.time()
    if closing then body.resolved_at = os.time() end
    local appended, append_err = run:append_event({ thread_id = thread_id,
        expect = { subject = subject, version = observed.subject_version },
        event = { type = inbox_types.EVENT.VERSION, body = body, subject = subject,
            trace_context = params.trace_context,
            external = { external_source = "kickside.inbox", external_id = external_id, external_version = "1" } } })
    if append_err then return nil, append_err end
    if appended.inserted == 0 then
        local bound, bound_err = run:find_event_by_external({ thread_id = thread_id, event_type = inbox_types.EVENT.VERSION,
            external_source = "kickside.inbox", external_id = external_id, external_version = "1" })
        if bound_err then return nil, bound_err end
        local compare_err = compare_delivery(bound.event, body)
        if compare_err then return nil, compare_err end
        return { id = identity.id, identity = identity, outcome = "updated" }, nil
    end
    return { id = identity.id, identity = identity, outcome = observed.subject_version == 0 and "created" or "updated" }, nil
end

function M.write(params: any, closing: boolean): (string?, any?, string?)
    local result, err = funcs.new():call("kickside.inbox.persist:addressed_write", { params = params, closing = closing })
    if err then return nil, err end
    return result.identity.id :: string, nil, result.outcome :: string
end

-- Reads are separately authorized per recipient. Failure of group resolution or
-- one group's store cannot suppress the viewer's personal work.
function M.read(input: any?): (any?, any?, any?)
    local actor = security.actor()
    if not actor then return nil, failure("authenticated actor required", errors.PERMISSION_DENIED) end
    if access_subjects.access_filter(actor:id()) ~= nil then
        return nil, failure("a confined identity cannot widen a component read", errors.PERMISSION_DENIED)
    end
    local own = M.component_id({ kind = "user", id = actor:id() })
    local ids = { own }
    local groups = M.group_inboxes()
    for _, id in ipairs(groups or {}) do ids[#ids + 1] = id end
    local run, open_err = M.store("kickside.core:threads")
    if open_err then return nil, open_err end
    if type(input) == "table" and type(input.id) == "string" then
        local thread, find_err = run:find({ thread_id = own, subject = M.subject(input.id) })
        if find_err then return nil, find_err end
        return thread ~= nil and thread.subject_version > 0, nil
    end
    local models, models_err = M.store("kickside.core:read_models")
    if models_err then return nil, models_err end
    local items = {}
    for _, id in ipairs(ids) do
        local thread, find_err = run:find({ thread_id = id })
        if find_err and id == own then return nil, find_err end
        if thread and not find_err then
            local result, read_err = models:get({ owner_id = id, kind = "kickside.inbox:items", projection_key = "default" })
            if read_err and id == own then return nil, read_err end
            if result and not read_err then
                for key, item in pairs((result.body or {}).items or {}) do
                    if item.recipient and M.component_id(item.recipient) == id then items[key] = item end
                end
            end
        end
    end
    return items, nil, ids
end

-- Internal read lookup over source IDs from persisted viewer items.
local function sources(ids: { string }): ({ [string]: boolean }?, any?)
    local rows, err = component.list_system({ component_ids = ids, limit = #ids,
        include = { meta = false, private_context = false } })
    if err then return nil, err end
    local live: { [string]: boolean } = {}
    for _, row in ipairs(rows) do live[row.component_id] = true end
    return live, nil
end

function M.live_sources(items: { [string]: any }): ({ [string]: boolean }?, any?)
    local ids: { string } = {}
    local seen: { [string]: boolean } = {}
    for _, item in pairs(items) do
        if item.recipient and item.aggregate_key ~= nil and type(item.source_id) == "string"
            and item.source_id ~= "" and not seen[item.source_id] then
            ids[#ids + 1] = item.source_id
            seen[item.source_id] = true
        end
    end
    local live: { [string]: boolean } = {}
    for first = 1, #ids, 128 do
        local page: { string } = {}
        for i = first, math.min(first + 127, #ids) do page[#page + 1] = ids[i] end
        local found, err = sources(page)
        if err then return nil, err end
        for id in pairs(found) do live[id] = true end
    end
    return live, nil
end

function M.items(): (any?, any?)
    return funcs.new():call("kickside.inbox.persist:addressed_read", {})
end

-- Durable creation identity in the current viewer's private store, including
-- deleted cards. Used by self-arming to preserve history across storage paths.
function M.has_item(id: string): (boolean?, any?)
    local result, err = funcs.new():call("kickside.inbox.persist:addressed_read", { id = id })
    return result :: boolean?, err
end

function M.delete(id: string, key: string?): (boolean?, any?)
    local result, err = funcs.new():call("kickside.inbox.persist:addressed_delete", { id = id, key = key })
    return result :: boolean?, err
end

function M.remove(input: any, recipient: Recipient?): (boolean?, any?)
    local items, read_err, ids
    if recipient then
        local thread_id = M.component_id(recipient)
        ids, items = { thread_id }, {}
        local run, open_err = M.store("kickside.core:threads")
        if open_err then return nil, open_err end
        local thread, find_err = run:find({ thread_id = thread_id })
        if find_err then return nil, find_err end
        if thread then
            local models, models_err = M.store("kickside.core:read_models")
            if models_err then return nil, models_err end
            local result, model_err = models:get({ owner_id = thread_id, kind = "kickside.inbox:items", projection_key = "default" })
            if model_err then return nil, model_err end
            items = (result.body or {}).items or {}
        end
    else
        items, read_err, ids = M.read()
        if read_err then return nil, read_err end
    end
    local id, key = input.id, input.key
    local item = items[id]
    local external_id = type(key) == "string" and key ~= "" and ("delete-delivery:" .. key)
        or (item and ("delete:" .. id .. ":" .. tostring(item.store_version)))
    local run, open_err = M.store("kickside.core:threads")
    if open_err then return nil, open_err end
    -- Durable retries remain visible after the projection has removed the card.
    -- The stores were selected from the viewer's current live eligibility.
    for _, thread_id in ipairs(ids) do
        local thread, find_err = run:find({ thread_id = thread_id, subject = M.subject(id) })
        if find_err then return nil, find_err end
        if thread then
            local found, lookup_err = run:find_event_by_external({ thread_id = thread_id,
                event_type = inbox_types.EVENT.DELETED, external_source = "kickside.inbox",
                external_id = external_id or ("delete:" .. id .. ":" .. tostring(thread.subject_version - 1)), external_version = "1" })
            if lookup_err then return nil, lookup_err end
            if found.event then
                local body = found.event.body
                if type(body) == "string" then
                    local decode_err
                    body, decode_err = json.decode(body)
                    if decode_err then return nil, decode_err end
                end
                if body.id ~= id then return nil, failure("delete key already used for another item", errors.CONFLICT) end
                return true, nil
            end
        end
    end
    if not item then return false, nil end
    local _, append_err = M.emit(item.recipient :: Recipient, inbox_types.EVENT.DELETED,
        { id = id, recipient = item.recipient, store_version = item.store_version }, external_id :: string, item.trace_context)
    if append_err then return nil, append_err end
    return true, nil
end

-- Called only after a live eligible read, by resolution or deletion.
function M.emit(recipient: Recipient, event_type: string, body: any, external_id: string, trace_context: any?): (any?, any?)
    local run, err = M.store("kickside.core:threads")
    if err then return nil, err end
    local subject, expect
    if event_type ~= inbox_types.EVENT.RESOLVED then
        subject = M.subject(body.id :: string)
        expect = { subject = subject, version = body.store_version }
        body.store_version = body.store_version + 1
    end
    -- The unique resolution external ID admits one human outcome per visit;
    -- sender snapshots and closure use the independent item subject.
    return run:append_event({ thread_id = M.component_id(recipient),
        expect = expect,
        event = { type = event_type, body = body, subject = subject, trace_context = trace_context,
            external = { external_source = "kickside.inbox", external_id = external_id, external_version = "1" } } })
end

return M
