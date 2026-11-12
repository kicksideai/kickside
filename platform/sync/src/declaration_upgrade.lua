-- The Data Sync declaration upgrade bootloader: on every boot and module
-- update it brings each installed sync's stored declaration to the current
-- Trigger Spec v2 through the automation engine. A current declaration is left
-- as it is, so each sync is rewritten once; a sync holding another command
-- pending or whose upgrade is refused stays listed in the result details and
-- is upgraded on a later run.

local automations = require("automations_lib")

local SYNC_TYPE = "kickside.sync:sync"

local function run(_: any?): any
    local report, err = automations.upgrade_declarations(SYNC_TYPE)
    if err or not report then
        return { status = "error", message = "data sync declaration upgrade failed: " .. tostring(err) }
    end
    return {
        status = "success",
        message = "data sync declarations: " .. #report.upgraded .. " upgraded, " .. report.current .. " current, "
            .. #report.pending .. " behind a pending command, " .. #report.failed .. " refused",
        details = report,
    }
end

return { run = run }
