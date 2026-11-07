-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- migrations_applied: the bootloader that follows the migration bootloader. It
-- tells the resident boot process that the install's schema is in place, so
-- convergence of the installed code runs against the schema that code reads.
-- At cold boot the boot process is not running yet and converges on its own
-- start, which the service lifecycle orders after the bootloaders.

local process = require("process")
local consts = require("lifecycle_consts")

local function run(_: any?): any
    local pid, lookup_err = process.registry.lookup(consts.BOOT_NAME, process.registry.CONSISTENT)
    if lookup_err and not errors.is(lookup_err, errors.NOT_FOUND) then
        return { status = "error", message = "lifecycle boot lookup failed: " .. tostring(lookup_err) }
    end
    if not pid then
        return { status = "success", message = "lifecycle boot converges on its start" }
    end
    local _, send_err = process.send(tostring(pid), consts.MIGRATIONS_APPLIED_TOPIC, {})
    if send_err then
        return { status = "error", message = "lifecycle boot message failed: " .. tostring(send_err) }
    end
    return { status = "success", message = "lifecycle convergence requested" }
end

return { run = run }
