-- The Data Sync declaration upgrade bootloader: on every boot and module
-- update it brings each installed sync's stored declaration to the current
-- Trigger Spec v2 through the automation engine. A current declaration is left
-- as it is, so each sync is rewritten once; a sync whose upgrade command is
-- refused stays listed in the result details and is retried on the next run.

local automations = require("automations_lib")

local SYNC_TYPE = "kickside.sync:sync"

local function run(_: any?): any
    local report, err = automations.upgrade_declarations(SYNC_TYPE)
    if err or not report then
        return { status = "error", message = "data sync declaration upgrade failed: " .. tostring(err) }
    end
    local upgraded, failed = #report.upgraded, #report.failed
    return {
        status = "success",
        message = "data sync declarations: " .. upgraded .. " upgraded, " .. report.current .. " current, "
            .. failed .. " refused",
        details = report,
    }
end

return { run = run }
