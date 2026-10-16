-- Shared engine vocabulary: the entity shapes the persistence layer returns and
-- the constant sets that cross slice boundaries. Component-private constants
-- (job tiers, scheduler poll windows, projection batch sizes, notification topics)
-- live in the slice that owns them, not here.
--
-- Types are exported as module fields (e.g. core_types.Thread) and referenced
-- through a slice's import alias.

local M = {}

-- ─── Entities ──────────────────────────────────────────────────────────

-- A thread is the append-only container events are written into. attrs is
-- stored as serialized JSON; state is one of THREAD_STATE's lifecycle values.
type Thread = {
    id: string,
    thread_class: string,
    attrs: string,
    state: string,
    event_count: integer,
    component_id: string,
    last_event_ts: string?,
    created_at: string,
    updated_at: string,
}

-- A single immutable event in a thread's log.
type Event = {
    id: string,
    thread_id: string,
    type: string,
    role: string?,
    body: string?,
    token_count: integer?,
    seq: integer,
    content_type: string?,
    content_mode: string?,
    content_ref: string?,
    content_hash: string?,
    content_bytes: integer?,
    external_source: string?,
    external_id: string?,
    external_version: string?,
    trace_context: {
        trace_id: string,
        run_id: string,
        caused_by_event_id: string?,
        correlation_key: string?,
    }?,
    created_at: string,
}

-- A derived view over a thread's events, advanced by a projection worker.
type Projection = {
    id: string,
    thread_id: string,
    kind: string,
    projection_key: string,
    body: string,
    state: string,
    last_event_seq: integer,
    created_at: string,
    updated_at: string,
}

M.Thread = Thread
M.Event = Event
M.Projection = Projection

-- ─── Cross-slice constant vocabularies ─────────────────────────────────
-- These mirror schema CHECK constraints and are read by more than one slice
-- (threads, retention, projections, scheduler), so they are shared.

-- Thread lifecycle. Written by threads, read by retention and scheduler.
M.THREAD_STATE = {
    OPEN = "open",
    CLOSED = "closed",
    ARCHIVED = "archived",
    ERROR = "error",
}

-- How an event body is stored: inline in the row, by reference, or both.
M.CONTENT_MODE = {
    INLINE = "inline",
    REF = "ref",
    HYBRID = "hybrid",
}

-- Validity of a projection relative to its thread's event log.
M.PROJECTION_STATE = {
    VALID = "valid",
    INVALID = "invalid",
    PENDING = "pending",
}

-- ─── Access masks ──────────────────────────────────────────────────────
-- Bitmask used when requesting an access level from the kickside.component
-- contract (core delegates all grant storage and group resolution to it).
-- Matches the component module's mask values. Typed so consumers read each bit as
-- an integer, not any.
type AccessMasks = {
    READ: integer,
    WRITE: integer,
    DELETE: integer,
    ADMIN: integer,
    FULL: integer,
}
M.AccessMasks = AccessMasks
M.ACCESS = {
    READ = 1,
    WRITE = 2,
    DELETE = 4,
    ADMIN = 8,
    FULL = 15,
} :: AccessMasks

return M
