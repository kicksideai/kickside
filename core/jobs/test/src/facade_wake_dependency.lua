local fixture = require("fixture")

-- These facade fixtures cover transactions and health, with no registered pool.
local function notify_workers(_entry_id: string): (integer, error?)
    return 0, nil
end

return {
    notify_workers = notify_workers,
    nudge_workers = fixture.nudge_workers,
    wake_tx = fixture.wake_tx,
    wake_job = fixture.wake_job,
    due_backlog = fixture.due_backlog,
}
