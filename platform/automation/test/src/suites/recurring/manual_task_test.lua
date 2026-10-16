local test = require("test")
local h = require("round_harness")
local uuid = require("uuid")
local json = require("json")
local canonical_json = require("canonical_json")

local KIND = "kickside.automation.manual:task"
local PORT = "kickside.automation.recurring.fixture:action"
local TOOL = "kickside.automation.agent:automations_manage"

return {run = test.run_cases(function()
    test.describe("BOT-MANUAL-EXECUTION-TASK fixed declared writable target", function()
        local env
        local ids = {}
        local function install(input)
            local result, err = env.caller:call(TOOL, {action = "install", type = KIND, input = input or {
                title = "Manual check", target = {kind = "action", port = PORT, input = {text = "explicit"}}}})
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            ids[#ids + 1] = result.id
            return result.id
        end
        local function control(id, action, request)
            local result, err = env.caller:call(TOOL, {action = "control", id = id, control = action,
                request_id = request or uuid.v7()})
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            return result
        end
        test.before_all(function()
            env = h.setup("manual_task")
            h.exec("CREATE TABLE IF NOT EXISTS recurring_fixture_log (owner_id TEXT, identity_key TEXT, actor_id TEXT, body TEXT)")
        end)
        test.after_each(function()
            for _, id in ipairs(ids) do
                local result, err = env.caller:call(TOOL, {action = "uninstall", id = id})
                test.is_nil(err, tostring(err))
                test.not_nil(result)
            end
            ids = {}
        end)
        test.it("installs a protected manual root with a slot and no implicit execution", function()
            local id = install()
            local d = h.read_drive(id, "main")
            test.eq(d.source_kind, "manual")
            test.is_nil(d.action.schedule)
            test.not_nil(d.job_id)
            test.eq(d.event_seq, 0)
            local result, err = env.run(id, "main")
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            test.eq(#h.query("SELECT * FROM recurring_fixture_log WHERE owner_id=$1", {id}), 0)
            test.eq(env.last_completion().options.record.status, "parked")
        end)
        test.it("delivers the fixed declared target once for each run and replay preserves its key", function()
            local id, request = install(), uuid.v7()
            control(id, "run_now", request)
            local result, err = env.run(id, "main")
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            local rows = h.query("SELECT identity_key,actor_id,body FROM recurring_fixture_log WHERE owner_id=$1", {id})
            test.eq(#rows, 1)
            test.eq(rows[1].actor_id, env.owner)
            test.eq(json.decode(rows[1].body).text, "explicit")
            control(id, "run_now", request)
            env.run(id, "main")
            test.eq(#h.query("SELECT * FROM recurring_fixture_log WHERE owner_id=$1", {id}), 1)
            control(id, "run_now")
            env.run(id, "main")
            local next_rows = h.query("SELECT identity_key FROM recurring_fixture_log WHERE owner_id=$1", {id})
            test.eq(#next_rows, 2)
            test.is_true(next_rows[1].identity_key ~= next_rows[2].identity_key)
        end)
        test.it("retains an empty action input as an object in its declaration", function()
            local id = install({target = {kind = "action", port = PORT, input = canonical_json.object({})}})
            local rows = h.query("SELECT private_context FROM kickside_components WHERE component_id=$1", {id})
            local stored = type(rows[1].private_context) == "table" and rows[1].private_context or json.decode(rows[1].private_context)
            test.eq(json.encode(stored.target.input), "{}", "stored target input")
            test.eq(json.encode(stored._portable_input.target.input), "{}", "stored portable input")
        end)
        test.it("rejects an undeclared target or a target input that fails its port schema before install", function()
            for _, target in ipairs({{kind = "action", port = "absent:port", input = {}},
                {kind = "action", port = "kickside.automation.recurring.fixture:typed_action", input = {}}}) do
                local result, err = env.caller:call(TOOL, {action = "install", type = KIND, input = {target = target}})
                test.is_nil(result)
                test.not_nil(err)
            end
        end)
    end)
end)}
