-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local json = require("json")
local time = require("time")
local process = require("process")
local funcs = require("funcs")
local logger = require("logger")
local component = require("component")
local upgrade = require("engine_upgrade")
local h = require("round_harness")
local deletion_worker = require("deletion_worker")
local jobs = require("jobs")

type Map = { [string]: any }
local KIND = "kickside.automation.agent.fixture:automation_type"

local function wait_until(check: () -> boolean, message: string): ()
    for _ = 1, 1500 do
        if check() then return end
        time.sleep("10ms")
    end
    test.fail(message)
end

-- Previous releases can leave an accepted deletion with a terminal job even
-- after its stored rollback chain has already been upgraded.
local function dead_deletion(env: Map, id: string): ()
    local result, err = env.caller:call("kickside.automation.agent:automations_manage", {action = "uninstall", id = id})
    test.is_nil(err, tostring(err))
    test.is_true(result.success, json.encode(result))
    h.exec("UPDATE kickside_job SET status='dead',attempts=1,last_error='no handler registered for target'"
        .. " WHERE owner_kind='component' AND owner_id=$1", {id})
end

return {run = test.run_cases(function()
    test.describe("rollback maintenance with live deletion workers", function()
        local worker: string? = nil
        test.after_each(function()
            if worker then
                -- Drain work left by a failed assertion before the next case
                -- starts its idle pool. This notice is outside the assertion.
                local _, err = jobs.nudge_workers()
                test.is_nil(err, tostring(err))
                wait_until(function(): boolean
                    return #h.query("SELECT id FROM kickside_job WHERE job_type='kickside.component:delete_worker'"
                        .. " AND status IN ('pending','running')", {}) == 0
                end, "deletion fixture drains before pool shutdown")
                h.stop_worker(worker)
                worker = nil
            end
        end)

        local function idle_pool(): ()
            worker = h.start_worker()
            wait_until(function(): boolean
                return process.registry.lookup("kickside.core.jobs.worker_pool", process.registry.CONSISTENT) == worker
                    and #h.query("SELECT id FROM kickside_job_worker", {}) > 0
                    and #h.query("SELECT id FROM kickside_job WHERE status='running'", {}) == 0
            end, "Jobs pool starts idle")
            -- Let the startup dispatch finish before maintenance enqueues work.
            time.sleep("200ms")
        end

        test.it("wakes an idle pool after maintenance commits an accepted deletion", function()
            local env = h.setup("rollback_idle", KIND)
            dead_deletion(env, env.automation_id)
            idle_pool()
            local result, err = funcs.new():call("kickside.automation:rollback_upgrade")
            test.is_nil(err, tostring(err))
            test.eq(result.status, "success", json.encode(result))
            local deleted, delete_err = deletion_worker.await(env.automation_id)
            test.is_nil(delete_err, tostring(delete_err))
            test.is_true(deleted, "maintenance wakes the existing idle pool without another enqueue")
        end)

        test.it("visits every deletion when workers remove the previous page", function()
            local env = h.setup("rollback_pages", KIND)
            local ids = {env.automation_id}
            for _ = 2, 101 do
                local result, err = env.caller:call("kickside.automation.agent:automations_manage",
                    {action = "install", type = KIND, input = {}})
                test.is_nil(err, tostring(err))
                test.is_true(result.success, json.encode(result))
                ids[#ids + 1] = result.id
            end
            for _, id in ipairs(ids) do dead_deletion(env, id) end
            idle_pool()
            local previous: {Map} = {}
            local pages = 0
            local engine: any = {}
            upgrade.attach(engine, {
                automation_db = {},
                registry = {find = function(): (any, any) return {{id = KIND}}, nil end},
                funcs = funcs, logger = logger,
                component = {list_system = function(filter: any): (any, any)
                    filter.component_ids = ids
                    -- Isolate paging from the independent post-commit notice guard.
                    if #previous > 0 then
                        local _, nudge_err = jobs.nudge_workers()
                        test.is_nil(nudge_err, tostring(nudge_err))
                    end
                    for _, row in ipairs(previous) do
                        local deleted, err = deletion_worker.await(row.component_id)
                        test.is_nil(err, tostring(err))
                        test.is_true(deleted)
                    end
                    local rows, err = component.list_system(filter)
                    previous = rows or {}
                    if #previous > 0 then pages = pages + 1 end
                    return rows, err
                end},
            }, {})
            local report, err = engine.upgrade_rollbacks()
            test.is_nil(err, tostring(err))
            test.eq(#report.failed, 0, json.encode(report))
            test.eq(report.current, 101, "maintenance visits the page after deleted rows")
            test.eq(pages, 2)
            for _, id in ipairs(ids) do
                local deleted, delete_err = deletion_worker.await(id)
                test.is_nil(delete_err, tostring(delete_err))
                test.is_true(deleted)
            end
        end)
    end)
end)}
