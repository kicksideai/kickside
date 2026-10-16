-- Test-owned process.service target that records its PID, then runs the real
-- jobs worker pool root, which claims into its own supervised slot loops. The
-- PID row lets the harness distinguish this service from the module's normal
-- worker service when proving supervisor restarts and in-place upgrades.
local sql = require("sql")
local uuid = require("uuid")
local registry = require("registry")
local worker_pool = require("worker_pool")

local function run(handover: any?): (any?, error?)
    local db, db_err = sql.get("app:db")
    if db_err or not db then error("service probe db unavailable: " .. tostring(db_err)) end
    local version = registry.current_version()
    local _, err = sql.builder.insert("jobs_service_probe")
        :set_map({ stamp = uuid.v7(), pid = tostring(process.pid()), started_version = tostring(version and version:id()) })
        :run_with(db):exec()
    db:release()
    if err then error("service probe PID insert failed: " .. tostring(err)) end
    return worker_pool.main(handover)
end

return { run = run }
