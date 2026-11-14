-- Projection cursor states and bounds shared by registration and worker validation.
local M = {}

M.CURSOR_STATUS = {
    ACTIVE = "active",
    PAUSED = "paused",
    INVALID = "invalid",
}

M.KEY_DEFAULT = "default"
M.KIND_MAX_LEN = 120
M.KEY_MAX_LEN = 120

M.WORKER_RUNTIME = { FUNC = "func", PROC = "proc" }
M.WORKER_SCHEME = { FUNC = "func://", PROC = "proc://" }
M.WORKER_INPUT_MODE = {
    PREFETCH_EVENTS = "prefetch_events",
    CURSOR_ONLY = "cursor_only",
}
M.WORKER_INPUT_MODE_DEFAULT = "cursor_only"
M.WORKER_ID_MAX_LEN = 240
M.WORKER_REF_MAX_LEN = 260

M.DEBOUNCE_MAX_MS = 604800000 -- Seven days is the largest admitted debounce.
M.START_SEQ = { MIN = 0, MAX = 2147483647 }

return M
