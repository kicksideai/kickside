-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")
local runner = require("runner")
local drive = require("drive")
local jobs = require("jobs")
local types = require("types")
local cleanup = require("cleanup")

local CAPACITY = "kickside.core.jobs.migrations:22_capacity_groups"
local REPAIR = "kickside.automation.migrations:13_stranded_drives"
local FORWARD = "kickside.automation.migrations:14_stranded_drive_wake_recovery"

local function checked(value: any, err: any): any
    if err then error(err) end
    return value
end

local function apply(id: string): any
    local result = checked(funcs.call(id, {database_id=types.db_id(),id=id}))
    test.eq(result.status,"complete",tostring(result.error))
    return result
end

local function upgrade(forward_only: boolean)
    -- Model an existing installation: Automation has durable work and Jobs
    -- has its pre-capacity schema. Fresh empty databases cannot expose this.
    local db = checked(sql.get(types.db_id()))
    local owner = uuid.v7()
    local ok, failure = pcall(function()
        local tx = checked(db:begin())
        checked(drive.insert_tx(tx,{automation_id=owner,drive_key="main",source_kind="timer"}))
        checked(tx:execute("UPDATE kickside_automation_drive SET enabled=false,cursor='retained',"
            .. "event_seq=12,command_generation=9,job_id=$1 WHERE automation_id=$2",{uuid.v7(),owner}))
        checked(tx:commit())
        local before = checked(db:query("SELECT * FROM kickside_automation_drive WHERE automation_id=$1",{owner}))[1]
        checked(db:execute("DROP INDEX uq_kickside_job_running_legacy_concurrency"))
        checked(db:execute("DROP INDEX idx_kickside_job_running_capacity"))
        checked(db:execute("ALTER TABLE kickside_job DROP COLUMN capacity_group"))
        checked(db:execute("CREATE UNIQUE INDEX uq_kickside_job_running_concurrency"
            .. " ON kickside_job(concurrency_key) WHERE concurrency_key IS NOT NULL AND status='running'"))
        checked(db:execute("DELETE FROM _migrations WHERE id IN ($1,$2)",{CAPACITY,FORWARD}))
        if not forward_only then checked(db:execute("DELETE FROM _migrations WHERE id=$1",{REPAIR})) end

        -- The published framework runner determines the order from the actual
        -- registry entries; no test-side ordering or direct schema repair.
        local migration_runner = runner.setup(types.db_id())
        local result = migration_runner:run()
        test.eq(result.status,"complete",tostring(result.error))
        local after = checked(db:query("SELECT * FROM kickside_automation_drive WHERE automation_id=$1",{owner}))[1]
        test.is_true(after.job_id ~= before.job_id)
        test.eq(checked(jobs.get_job(after.job_id)).status,"pending")
        for key, value in pairs(before) do
            if key ~= "job_id" then test.eq(after[key],value,key) end
        end
        test.eq(migration_runner:run().migrations_applied,0)
        test.eq(checked(drive.get(db,owner,"main")).job_id,after.job_id)
    end)
    -- Restore the shared test schema even for the negative control, so later
    -- suites cannot inherit a missing column or a runnable fixture job.
    cleanup({owner})
    apply(CAPACITY)
    apply(REPAIR)
    apply(FORWARD)
    db:release()
    if not ok then error(failure) end
end

return test.run_cases(function()
    test.describe("stranded-drive schema upgrade order",function()
        test.it("migrates Jobs before repairing an existing drive",function() upgrade(false) end)
        test.it("migrates Jobs before forward recovery when the original repair is already applied",function() upgrade(true) end)
    end)
end)
