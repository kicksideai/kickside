-- Drive slot provisioning and the dispatcher wake it shares with every
-- declaration command that creates or re-keys a drive's slot (design v5
-- §4.7; A52 no polling).

local M = {}

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
