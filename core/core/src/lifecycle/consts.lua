-- lifecycle consts: the system lifecycle reaper's shared vocabulary. The reaper is a
-- single scope:system component (a thread) owned by the system actor; a deletion is
-- reported as an event on its thread, and a projection on that thread fans the report
-- out by deleting every component the named owner still owns. No new machinery -- it is
-- a provisioned component-kind declaration + a projection + grants, riding the existing thread engine.

local autoinit = require("autoinit")

local M = {}

-- The declared framework actor that owns the lifecycle thread and supplies the
-- reaper's authority (execution_identity owns the shared exact inventory).
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

-- Registered name of the resident boot process and the topic the migrations-applied
-- bootloader messages it on once an install's migrations have run.
M.BOOT_NAME = "kickside.core.lifecycle:boot_process"
M.MIGRATIONS_APPLIED_TOPIC = "kickside.core.lifecycle.migrations_applied"

-- Migration namespaces that own the tables boot convergence reads, followed
-- through every convergence path: core (threads, projections, retention),
-- component (components and their meta, read through the component query),
-- jobs (the projection cursors' jobs) and users (the Users scope resolver that
-- resolves a component's stored execution identity reads users, delegation
-- epochs, bot accounts, groups and profiles). Convergence waits until every
-- migration in these namespaces is applied. A required namespace with no
-- registered migrations is a misconfiguration; users is absent when the
-- application binds another scope resolver.
M.CONVERGE_SCHEMA = {
    { namespace = "kickside.core.migrations", required = true },
    { namespace = "kickside.component.migrations", required = true },
    { namespace = "kickside.core.jobs.migrations", required = true },
    { namespace = "kickside.users.migrations", required = false },
}

-- While convergence is parked on a pending migration, boot re-reads the
-- ledger at this interval.
M.SCHEMA_RETRY_MS = 1000

-- Deterministic id of the singleton lifecycle thread. A thread IS its component, so
-- this is both the component id (autoinit) and the thread id callers append to.
function M.thread_id(): string
    return autoinit.component_id(autoinit.SYSTEM_SCOPE_KEY :: string, M.CLASS) :: string
end

return M
