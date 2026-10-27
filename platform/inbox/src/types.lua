-- Public type surface and runtime vocabulary for kickside.inbox. Keep metadata
-- extension-owned while inbox items and fixed status/event identifiers use stable
-- shapes.
--
-- The inbox is event-sourced on the kickside.core thread engine; it has no DB of
-- its own, so there is no db_id resolution here.

local M = {}

-- The registry meta.type a module uses to declare an inbox item type. Each entry
-- carries { value, name, icon, category, component_tag, component_base_path,
-- action_owner } so the UI can render the item type's web component and assign
-- pending actions declaratively.
M.ITEM_TYPE_DEF = "inbox.item_type"

M.STATUS = {
    PENDING = "pending",
    RESOLVED = "resolved",
    APPROVED = "approved",
    REJECTED = "rejected",
    DISMISSED = "dismissed",
}

M.PRIORITY = {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    URGENT = "urgent",
}

M.ORDER = {
    PRIORITY_CREATED = "priority_created",
}

-- Durable inbox event types on the owner inbox component thread.
M.EVENT = {
    CREATED = "kickside.inbox.events:item.created",
    VERSION = "kickside.inbox.events:item.version",
    RESOLVED = "kickside.inbox.events:item.resolved",
    DELETED = "kickside.inbox.events:item.deleted",
    DELIVERY_CLAIMED = "kickside.inbox.events:delivery.claimed",
}

function M.component_topic(component_id: string): string
    return "component." .. tostring(component_id)
end

function M.resolution_id(item: any): string
    local suffix = item.aggregate_key ~= nil and (":" .. tostring(item.version_event_id or item.created_event_id)) or ""
    return "resolve:" .. item.id .. suffix
end

M.ERROR = {
    NOT_FOUND = "inbox.not_found",
    TITLE_REQUIRED = "inbox.title_required",
    TYPE_REQUIRED = "inbox.item_type_required",
    ALREADY_RESOLVED = "inbox.already_resolved",
    ACTION_NOT_ALLOWED = "inbox.action_not_allowed",
}

type Metadata = { [string]: any }

type InboxItem = {
    id: string,
    item_type: string,
    title: string,
    content: string?,
    metadata_json: string?,
    metadata: Metadata,
    source_id: string?,
    aggregate_key: string?,
    version_event_id: string?,
    status: string,
    priority: string,
    actor_id: string?,
    created_at: any,
    created_event_id: string?,
    trace_context: Metadata?,
    action: string?,
    form: Metadata?,
    resolution_id: string?,
    resolved_by: string?,
    resolved_at: any?,
    resolved_event_id: string?,
}

type InboxCreateParams = {
    item_type: string?,
    title: string?,
    content: string?,
    metadata: Metadata?,
    metadata_json: string?,
    source_id: string?,
    aggregate_key: string?,
    idempotency_key: string?,
    priority: string?,
    actor_id: string?,
    trace_context: Metadata?,
}

M.Metadata = Metadata
M.InboxItem = InboxItem
M.InboxCreateParams = InboxCreateParams

return M
