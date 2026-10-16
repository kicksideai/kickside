-- threads-slice constants. Owns the field bounds and default values. Cross-slice
-- entity types and access masks live in kickside.core:types; the component
-- contract id and its impl_id for thread components live here because only this
-- slice talks to the component service.

local M = {}

-- The component contract this slice registers threads with and checks access
-- against. A thread IS a component: create registers one, access flows through
-- get_access_context, delete removes it. No SQL touches the component tables.
M.COMPONENT_SERVICE = "kickside.component:component_service"

-- impl_id for plain ad-hoc thread components. Typed autoinit component threads
-- use their declaring component impl_id and are scoped as threads by meta.type.
M.THREAD_IMPL_ID = "kickside.core:thread"

-- The public threads contract id. System teardown opens this binding AS a thread's
-- owner to delete through the gated path, so kickside.threads:thread.deleted fires with its cascade.
M.THREADS_CONTRACT = "kickside.core:threads"

-- Reserved component meta key the component service stamps with a thread's owner
-- (the creating user). The owner-scoped reverse lookup filters list_system on it.
M.OWNER_META_KEY = "owner"

-- Default thread_class when the caller omits one.
M.DEFAULT_THREAD_CLASS = "conversation"

-- Field bounds mirrored from schema/usage limits.
M.LIMITS = {
    THREAD_CLASS_MAX_LEN = 64,
    CREATED_AT_MAX_LEN = 64,
    LIST_DEFAULT = 100,
    LIST_MAX = 1000,
    EVENTS_DEFAULT = 200,
    EVENTS_MAX = 1000,
}

-- Default content shape for an event body when the caller omits it.
M.CONTENT_DEFAULT = {
    TYPE = "application/json",
    MODE = "inline",
}

-- Default role for a posted message / ingested event.
M.DEFAULT_ROLE = "user"

-- Event types the writers emit.
M.EVENT_TYPE = {
    MESSAGE_CREATED = "kickside.threads:message.created",
}

-- Exported table vocabulary. Teardown executes the owner-specific bounded pages
-- in teardown_page; this list does not drive deletion of Jobs-owned rows.
M.CASCADE_TABLES = {
    "kickside_event",
    "kickside_projection_cursor",
    "kickside_job_run",
    "kickside_job",
    "kickside_retention_policy",
    "kickside_retention_pin",
    "kickside_retention_pin_tombstone",
    "kickside_projection",
}

-- Edge table cascaded on delete (matches either endpoint).
M.EDGE_TABLE = "kickside_thread_edge"

return M
