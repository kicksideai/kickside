-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local sql = require("sql")
local time = require("time")
local cache = require("settings_cache")

local function run(): table
    local db = assert(sql.get("app:db"))
    local rows = assert(db:query("SELECT retained, created_ms FROM settings_retention_probe WHERE id=1"))
    if not rows[1] then db:release(); return { success = true, deleted = 0 } end
    local settings = assert(assert(contract.get("kickside.settings:settings")):open())
    local policy = settings:get({ namespace = "kickside.settings.test", key = "retention_days" })
    assert(policy.success, tostring(policy.error))
    local deadline = assert(tonumber(rows[1].created_ms)) + policy.value * 86400000
    local purge = tonumber(rows[1].retained) == 1 and deadline <= time.now():unix_nano() / 1000000
    assert(db:execute([[UPDATE settings_retention_probe SET calls=calls+1,
        observed_days=$1, revision=$2, retained=$3 WHERE id=1]],
        { policy.value, cache.revision(), purge and 0 or tonumber(rows[1].retained) }))
    db:release()
    return { success = true, deleted = purge and 1 or 0,
        deadline_ms = not purge and tonumber(rows[1].retained) == 1 and deadline or nil }
end

return { run = run }
