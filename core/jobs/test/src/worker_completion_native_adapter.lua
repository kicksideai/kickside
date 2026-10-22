local fixture = require("fixture")
local M = {}
function M.complete_worker_tx(tx, id, lease, opts)
    return fixture.result("transition", {already_completed = fixture.already, status = "completed"})
end
function M.worker_settled_tx(tx, id, lease) return fixture.result("settled", fixture.settled) end
function M.fail_job(db, job, dialect, message, classification)
    local _, err = fixture.result("park", true)
    return err
end
function M.fail_tx(tx, job, dialect, message, classification, retry_floor)
    fixture.retry_floor = retry_floor
    local _, err = fixture.result("failure", true)
    return err
end
function M.finalize_job_run(tx, dialect, run_ctx, status, output, actions, message)
    local _, err = fixture.result("history", true)
    return err
end
function M.notify(id, sequence, owner)
    fixture.notifications = fixture.notifications + 1
    local _, err = fixture.result("notify", true)
    return err
end
return M
