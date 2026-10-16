-- lifecycle consts: the system lifecycle reaper's shared vocabulary. The reaper is a
-- single scope:system component (a thread) owned by the system actor; a deletion is
-- reported as an event on its thread, and a projection on that thread fans the report
-- out by deleting every component the named owner still owns. No new machinery -- it is
-- a provisioned component-kind declaration + a projection + grants, riding the existing thread engine.

local autoinit = require("autoinit")

local M = {}

-- The system actor that owns the lifecycle thread. system:* actors are infrastructure
-- identities (see component access notes); this one is the reaper's authority.
M.SYSTEM_ACTOR = "system:lifecycle"
M.SYSTEM_SCOPE = "wippy.security:process"

-- The provisioned class/id of the singleton lifecycle component (one global instance).
M.CLASS = "lifecycle"

-- Reserved component meta key recording an owner; list_system filters on it.
M.OWNER_META_KEY = "owner"

-- Deletion report event types appended to the lifecycle thread.
M.EVENT = {
    PRINCIPAL_DELETED = "kickside.lifecycle.events:principal.deleted",
    COMPONENT_DELETED = "kickside.lifecycle.events:component.deleted",
}

-- Deterministic id of the singleton lifecycle thread. A thread IS its component, so
-- this is both the component id (autoinit) and the thread id callers append to.
function M.thread_id(): string
    return autoinit.component_id(autoinit.SYSTEM_SCOPE_KEY :: string, M.CLASS) :: string
end

return M
