-- Boot warmer for the settings cache. Loads every override row into the
-- store.memory cache so settings reads are served from memory rather than the DB.
-- Declared as a meta.type=bootloader entry that requires the migration bootloader,
-- so kickside_settings exists before this runs.

local writer = require("settings_writer")

local function run(_: any?): any
    local _, err = writer.reload()
    if err then
        return { status = "error", message = "settings cache warm failed: " .. tostring(err) }
    end
    return { status = "success", message = "settings cache warmed" }
end

return { run = run }
