local M = { row_bytes = 4194304 }
function M.policy()
    return { settled_turns_ms = 48 * 60 * 60 * 1000, batch_turns = 500,
        archived_sessions_ms = 30 * 24 * 60 * 60 * 1000, batch_archives = 50,
        idle_sessions_ms = 30 * 24 * 60 * 60 * 1000, batch_idle = 50,
        max_row_bytes = M.row_bytes }, nil
end
return M
