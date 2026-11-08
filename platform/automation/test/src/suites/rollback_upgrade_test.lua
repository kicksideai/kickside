-- The stored rollback upgrade over real installed automations: an automation
-- installed under the retired trigger runtime holds that runtime's install
-- teardown in its stored rollback chain, and its uninstall replays the chain.
local test = require("test")
local json = require("json")
local uuid = require("uuid")
local funcs = require("funcs")
local h = require("round_harness")
local pin = require("retention_pin")
local deletion_worker = require("deletion_worker")

type Map = { [string]: any }

local MANAGE = "kickside.automation.agent:automations_manage"
local KIND = "kickside.automation.agent.fixture:automation_type"
local UPGRADE = "kickside.automation:rollback_upgrade"
local TRIGGER_TEARDOWN = "kickside.automation.trigger:trigger_service_install_rollback"
local SCHEDULE_DELETE = "kickside.automation.schedule:delete_schedule"
local PROBE = "kickside.automation:owner_gc_rollback_probe"
local STAMP = "2026-08-14T09:30:00Z"

local function context(id: string): Map
    local raw = h.query("SELECT private_context FROM kickside_components WHERE component_id=$1", { id })[1].private_context
    if type(raw) == "table" then return raw :: Map end
    return json.decode(tostring(raw)) :: Map
end

local function revision(id: string): number
    return tonumber(h.query("SELECT context_revision FROM kickside_components WHERE component_id=$1", { id })[1].context_revision) :: number
end

local function count(statement: string, params: { any }): integer
    return #h.query(statement, params)
end

local function targets(chain: any): string
    local out: { string } = {}
    for _, step in ipairs(chain or {}) do out[#out + 1] = tostring(step.target) end
    return table.concat(out, ",")
end

-- trigger_teardown(id, mode, registration) -> the trigger service's install
-- teardown step, in the shape the trigger runtime recorded it.
local function trigger_teardown(id: string, mode: string, registration: Map): Map
    return { target = TRIGGER_TEARDOWN, args = { component_id = id, mode = mode, registration = registration } }
end

local function poll_teardown(id: string): Map
    return trigger_teardown(id, "poll", { poll_schedule_id = uuid.v7(), schedule_type = "interval",
        backfill_since = "2026-08-01T00:00:00Z" })
end

-- store_legacy(id, steps) gives the automation the rollback chain an install
-- under the trigger runtime recorded: its steps ahead of the current ones.
local function store_legacy(id: string, steps: { Map }): ()
    local ctx = context(id)
    local chain: { Map } = {}
    for _, step in ipairs(steps) do chain[#chain + 1] = step end
    for _, step in ipairs(ctx._rollback or {}) do chain[#chain + 1] = step end
    ctx._rollback = chain
    h.exec("UPDATE kickside_components SET private_context=$1, context_revision=context_revision+1 WHERE component_id=$2",
        { json.encode(ctx), id })
end

-- subscribe(env) gives the automation an event drive on its source thread,
-- retained by the drive's pin, and item ledger and receipt rows.
local function subscribe(env: Map): ()
    local id = env.automation_id
    h.new_drive({ automation_id = id, drive_key = "events", source_kind = "event", source_thread_id = env.thread_id,
        action = { source_ref = "fixture:events", event_type = h.EVENT_TYPE } })
    local core = h.db()
    local receipt, pin_err = pin.pin_lower(core, { thread_id = env.thread_id, consumer_key = "drive:" .. id .. ":events",
        command_id = "install:" .. id, command_generation = 1, target_cursor = 0 })
    core:release()
    test.is_nil(pin_err, tostring(pin_err))
    h.set_drive(id, "events", "pin_generation = $1", { receipt.pin_generation })
    h.exec([[INSERT INTO kickside_trigger_item_ledger
        (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
         first_failed_at,last_failed_at,created_at,updated_at)
        VALUES ($1,'source','item','item','item','{}','parked',$2,$2,$2,$2)]], { id, STAMP })
    h.exec([[INSERT INTO kickside_automation_receipt
        (owner_id,source_port,item_key,map_slot,identity_key,updated_at)
        VALUES ($1,'source','item','main','item',$2)]], { id, STAMP })
end

-- installed(prefix) -> the round harness environment holding an installed
-- automation of a kind whose deletable is the automation owner delete.
local function installed(prefix: string): Map
    local env = h.setup(prefix)
    local result, err = env.caller:call(MANAGE, { action = "install", type = KIND, input = { title = "Legacy install" } })
    test.is_nil(err, tostring(err))
    test.is_true((result :: Map).success, tostring((result :: Map).error))
    env.automation_id = (result :: Map).id
    return env
end

local function owned_rows(env: Map): Map
    local id = env.automation_id
    return {
        component = count("SELECT component_id FROM kickside_components WHERE component_id=$1", { id }),
        drives = count("SELECT drive_key FROM kickside_automation_drive WHERE automation_id=$1", { id }),
        pins = count("SELECT consumer_key FROM kickside_retention_pin WHERE thread_id=$1 AND consumer_key=$2",
            { env.thread_id, "drive:" .. id .. ":events" }),
        ledger = count("SELECT item_key FROM kickside_trigger_item_ledger WHERE owner_id=$1", { id }),
        receipts = count("SELECT item_key FROM kickside_automation_receipt WHERE owner_id=$1", { id }),
        commands = count("SELECT automation_id FROM kickside_automation_command WHERE automation_id=$1", { id }),
    }
end

local function run_upgrade(): Map
    local result, err = funcs.new():call(UPGRADE)
    test.is_nil(err, tostring(err))
    test.eq((result :: Map).status, "success", tostring((result :: Map).message))
    return (result :: Map).details :: Map
end

local function entry_of(list: { Map }, id: string): Map?
    for _, entry in ipairs(list) do
        if entry.id == id then return entry end
    end
    return nil
end

local function uninstall(env: Map): ()
    local accepted, err = env.caller:call(MANAGE, { action = "uninstall", id = env.automation_id })
    test.is_nil(err, tostring(err))
    test.not_nil(accepted)
end

-- assert_deleted(env) runs the deletion job through its bounded owner pages
-- and proves the automation's owned rows are gone.
local function assert_deleted(env: Map): ()
    local finished: Map = { deleted = false }
    for _ = 1, 10 do
        local page, page_err = deletion_worker.run(env.automation_id)
        test.is_nil(page_err, tostring(page_err))
        finished = page :: Map
        if finished.deleted then break end
        test.not_nil(finished.rearm, "an unfinished owner delete rearms its job")
    end
    test.is_true(finished.deleted, json.encode(finished))
    local rows = owned_rows(env)
    for name, n in pairs(rows) do test.eq(n, 0, name .. " of the uninstalled automation") end
end

local function define_tests()
    test.describe("automation stored rollback upgrade", function()
        test.it("uninstalls an automation whose stored rollback names the retired trigger teardown once upgraded", function()
            local env = installed("rollback_upgrade")
            local id = env.automation_id
            subscribe(env)
            h.exec("CREATE TABLE IF NOT EXISTS owner_gc_rollback_log (component_id TEXT PRIMARY KEY, keep_thread TEXT NOT NULL)")
            local current = targets(context(id)._rollback)
            store_legacy(id, { poll_teardown(id), { target = SCHEDULE_DELETE, args = { schedule_id = uuid.v7() } },
                { target = PROBE, args = { component_id = id } } })
            if current ~= "" then current = "," .. current end

            local report = run_upgrade()
            test.is_nil(entry_of(report.failed, id))
            local entry = entry_of(report.upgraded, id)
            test.not_nil(entry, "the legacy chain is upgraded")
            test.eq(table.concat((entry :: Map).removed, ","), TRIGGER_TEARDOWN .. "," .. SCHEDULE_DELETE)
            test.eq(targets(context(id)._rollback), PROBE .. current)

            uninstall(env)
            assert_deleted(env)
            test.eq(count("SELECT component_id FROM owner_gc_rollback_log WHERE component_id=$1", { id }), 1,
                "the current rollback step is replayed")
        end)

        test.it("completes a deletion that failed on the retired target when it is retried after the upgrade", function()
            local env = installed("rollback_retry")
            local id = env.automation_id
            subscribe(env)
            store_legacy(id, { poll_teardown(id) })

            uninstall(env)
            local failed, fail_err = deletion_worker.run(id)
            test.is_nil(failed)
            test.contains(tostring(fail_err), "no handler registered for target", tostring(fail_err))
            test.eq(owned_rows(env).component, 1)

            local entry = entry_of(run_upgrade().upgraded, id)
            test.not_nil(entry, "an automation in deletion is upgraded")
            test.eq(table.concat((entry :: Map).removed, ","), TRIGGER_TEARDOWN)

            uninstall(env)
            assert_deleted(env)
        end)

        test.it("leaves an automation with a current rollback chain untouched", function()
            local env = installed("rollback_current")
            local id = env.automation_id
            local chain = json.encode(context(id)._rollback or {})
            local before = revision(id)
            local report = run_upgrade()
            test.is_nil(entry_of(report.upgraded, id))
            test.is_nil(entry_of(report.failed, id))
            test.is_nil(entry_of(report.retained, id))
            test.eq(revision(id), before)
            test.eq(json.encode(context(id)._rollback or {}), chain)
        end)

        test.it("upgrades a legacy chain once across repeated runs", function()
            local env = installed("rollback_once")
            local id = env.automation_id
            store_legacy(id, { trigger_teardown(id, "timer", { schedule_id = uuid.v7(), schedule_type = "cron" }) })
            test.not_nil(entry_of(run_upgrade().upgraded, id))
            local once = revision(id)
            local chain = json.encode(context(id)._rollback or {})
            local again = run_upgrade()
            test.is_nil(entry_of(again.upgraded, id))
            test.is_nil(entry_of(again.failed, id))
            test.eq(revision(id), once)
            test.eq(json.encode(context(id)._rollback or {}), chain)
        end)

        test.it("keeps a retired watch teardown whose source-thread projection the owner delete leaves in place", function()
            local env = installed("rollback_watch")
            local id = env.automation_id
            local before = targets(context(id)._rollback)
            store_legacy(id, { trigger_teardown(id, "watch", { projection_id = uuid.v7(), thread_id = env.thread_id }) })
            local stored = revision(id)
            local report = run_upgrade()
            test.is_nil(entry_of(report.upgraded, id))
            local kept = entry_of(report.retained, id)
            test.not_nil(kept, "the watch teardown is reported as kept")
            test.eq((kept :: Map).mode, "watch")
            test.eq((kept :: Map).target, TRIGGER_TEARDOWN)
            test.eq(revision(id), stored)
            local expected = before == "" and TRIGGER_TEARDOWN or TRIGGER_TEARDOWN .. "," .. before
            test.eq(targets(context(id)._rollback), expected)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
