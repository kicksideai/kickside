-- Drive slot provisioning and the dispatcher wake it shares with every
-- declaration command that creates or re-keys a drive's slot (design v5
-- §4.7; A52 no polling).

local errors = require("errors")

local M = {}

-- Shared by upgrade repair and unserved live wake demand. Point reads and a
-- bounded convergence check preserve source moves and the deletion fence.
-- The supplied database is a handle, never an open migration transaction.
function M.repair_drive(dependencies: any, db: any, automation_id: string, drive_key: string): (string?, any)
    local slot = dependencies.slot :: any
    local function read(): (any?, any)
        local rows, err = db:query("SELECT automation_id,drive_key,revision,command_generation,source_kind,source_thread_id,job_id,pending_command_id"
            .. " FROM kickside_automation_drive WHERE automation_id=$1 AND drive_key=$2", {automation_id,drive_key})
        if err then return nil, err end
        return rows[1], nil
    end
    local before, read_err = read()
    if read_err then return nil, read_err end
    for attempt = 1, 3 do
        if not before or before.pending_command_id == "owner-delete:" .. automation_id then return nil, nil end
        if before.source_kind == "none" then return nil, nil end
        local id, err = slot.provision(automation_id, drive_key)
        local after, after_err = read()
        if after_err then return nil, after_err end
        if err then
            if (errors.is(err, errors.CONFLICT) or errors.is(err, errors.NOT_FOUND))
                and (not after or after.source_kind == "none"
                    or after.pending_command_id == "owner-delete:" .. automation_id) then return nil, nil end
            return nil, err
        end
        if not after or after.pending_command_id == "owner-delete:" .. automation_id then return nil, nil end
        if after.source_kind == "none" then
            local _, cancel_err = slot.provision(automation_id, drive_key)
            return nil, cancel_err
        end
        if before.revision == after.revision and before.command_generation == after.command_generation
            and before.source_kind == after.source_kind and before.source_thread_id == after.source_thread_id
            and type(id) == "string" and id ~= "" and after.job_id == id then
            return id, nil
        end
        if attempt == 3 then
            -- Keep a durable repair mark under sustained source churn. Enqueue
            -- will reuse the canonical active job on the next bounded attempt.
            local _, detach_err = db:execute("UPDATE kickside_automation_drive SET job_id=NULL WHERE automation_id=$1"
                .. " AND drive_key=$2 AND job_id=$3 AND (pending_command_id IS NULL OR pending_command_id<>$4)",
                {automation_id,drive_key,id,"owner-delete:" .. automation_id})
            if detach_err then return nil, detach_err end
            return nil, errors.new({kind = errors.CONFLICT, retryable = true,
                message = "drive changed during slot repair; retry"})
        end
        before = after
    end
    return nil, nil
end

-- Failed notifications propagate to the caller's durable job/control retry.
function M.wake_dispatcher(dependencies: any, _automation_id: string, _request_id: string?): any
    local _, err = (dependencies.slot :: any).wake_dispatcher()
    return err
end

function M.provision_slots(dependencies: any, automation_id: string, drive_keys: { string }): any
    local slot = dependencies.slot :: any
    for _, key in ipairs(drive_keys) do
        local _, slot_err = slot.provision(automation_id, key)
        if slot_err then return slot_err end
    end
    return nil
end

return M
