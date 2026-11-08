-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The stored rollback upgrade bootloader: on every boot and module update it
-- brings each installed automation's stored rollback chain to the current
-- cleanup targets through the automation engine. A current chain is left as
-- it is, so each automation is rewritten once; an automation whose upgrade is
-- refused stays listed in the result details and is upgraded on a later run.

local automations = require("automations_lib")

local function run(_: any?): any
    local report, err = automations.upgrade_rollbacks()
    if err or not report then
        return { status = "error", message = "automation rollback upgrade failed: " .. tostring(err) }
    end
    return {
        status = "success",
        message = "automation rollback chains: " .. #report.upgraded .. " upgraded, " .. report.current .. " current, "
            .. #report.retained .. " retired steps kept, " .. #report.failed .. " refused",
        details = report,
    }
end

return { run = run }
