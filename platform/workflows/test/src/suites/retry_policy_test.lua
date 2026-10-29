-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local json = require("json")
local uuid = require("uuid")
local workflow = require("workflow")
local version_publish = require("version_publish")
local version_read = require("version_read")
local compiler = require("compiler")
local retry = require("retry")
local sql = require("sql")

local function step(document)
    for _, node in ipairs(document.nodes) do if node.id == "step" then return node end end
    error("step missing")
end
local function native(commands)
    for _, command in ipairs(commands) do
        if command.type == "CREATE_NODE" and command.payload.metadata.def_node_id == "step" then return command.payload end
    end
    error("native step missing")
end
local function create(fields)
    local id = uuid.v4()
    local body = { id = "step", kind = "block", ref = "app:block.engine_linear" }
    for key, value in pairs(fields) do body[key] = value end
    local _, err = workflow.apply(id, {{ type = "node.add", body = body }}, "tester")
    test.is_nil(err, tostring(err))
    return id
end
local function run()
    test.describe("Workflow retry policy", function()
        test.it("round-trips separate node fields through storage publish and remint", function()
            local fields = { retry_policy = { maximum_attempts = 3, initial_interval = "10ms" },
                start_to_close_timeout = "2s", schedule_to_close_timeout = 8000 }
            local id = create(fields)
            local snapshot, read_err = workflow.state(id)
            test.is_nil(read_err)
            local node = step(snapshot)
            test.eq(node.retry_policy.maximum_attempts, 3)
            test.eq(node.start_to_close_timeout, "2s")
            test.eq(node.schedule_to_close_timeout, 8000)
            test.is_nil(node.config.retry_policy)
            local published, publish_err = version_publish.publish(id, "tester")
            test.is_nil(publish_err)
            test.is_true(published.ok, json.encode(published.errors))
            local frozen, frozen_err = version_read.get(id, published.version)
            test.is_nil(frozen_err)
            test.eq(step(frozen.document).retry_policy.maximum_attempts, 3)
            test.eq(native(frozen.compiled_commands).config.retry_policy.maximum_attempts, 3)
            local commands, _, remint_err = compiler.remint(frozen.compiled_commands, uuid.v4, {})
            test.is_nil(remint_err)
            local runtime = native(commands)
            test.eq(runtime.config.start_to_close_timeout, "2s")
            test.eq(runtime.config.schedule_to_close_timeout, 8000)
            test.eq(runtime.config.retry_policy.maximum_attempts, 3)
            test.is_true(runtime.node_id ~= "step")
        end)
        test.it("preserves an empty policy object across commands storage history publication and remint", function()
            for _, empty in ipairs({ {}, json.decode("{}") }) do
                local id = create({ retry_policy = empty })
                local events, events_err = workflow.events(id, 0)
                test.is_nil(events_err)
                test.eq(json.encode(events[1].body.retry_policy), "{}", "command event policy")
                local state, state_err = workflow.state(id)
                test.is_nil(state_err)
                test.eq(json.encode(step(state).retry_policy), "{}", "stored node policy")
                local db, db_err = sql.get("app:db")
                test.is_nil(db_err)
                local rows, query_err = db:query("SELECT retry_policy FROM workflow_def_nodes WHERE workflow_id=$1 AND id=$2", {id, "step"})
                test.is_nil(query_err)
                test.eq(rows[1].retry_policy, "{}", "projection column policy")
                local changed, change_err = workflow.apply(id, {{type = "node.update", body = {id = "step", retry_policy = {maximum_attempts = 3}}}}, "tester")
                test.is_nil(change_err)
                local history, history_err = db:query("SELECT tracker FROM workflow_undo_history WHERE workflow_id=$1", {id})
                test.is_nil(history_err)
                local tracker = json.decode(history[1].tracker)
                test.eq(json.encode(tracker.undo[1].forward[1].body.retry_policy), "{}", "history forward policy")
                test.eq(json.encode(tracker.undo[2].inverse[1].body.retry_policy), "{}", "history inverse policy")
                local released, release_err = db:release()
                test.is_nil(release_err)
                test.is_true(released)
                local undone, undo_err = workflow.undo(id, "tester")
                test.is_nil(undo_err)
                test.eq(json.encode(step(undone.state).retry_policy), "{}", "undo policy")
                local redone, redo_err = workflow.redo(id, "tester")
                test.is_nil(redo_err)
                test.eq(step(redone.state).retry_policy.maximum_attempts, 3)
                local updated, update_err = workflow.apply(id, {{type = "node.update", body = {id = "step", retry_policy = empty}}}, "tester")
                test.is_nil(update_err)
                test.eq(json.encode(updated.events[1].body.retry_policy), "{}", "update policy")
                local published, publish_err = version_publish.publish(id, "tester")
                test.is_nil(publish_err)
                test.is_true(published.ok, json.encode(published.errors))
                local frozen, frozen_err = version_read.get(id, published.version)
                test.is_nil(frozen_err)
                test.eq(json.encode(step(frozen.document).retry_policy), "{}", "frozen policy")
                test.eq(json.encode(native(frozen.compiled_commands).config.retry_policy), "{}", "compiled policy")
                local commands, _, remint_err = compiler.remint(frozen.compiled_commands, uuid.v4, {})
                test.is_nil(remint_err)
                test.eq(json.encode(native(commands).config.retry_policy), "{}", "reminted policy")
            end
        end)
        test.it("reports an unknown Block without claiming its retry policy is invalid", function()
            local id = create({ref = "example:missing_block", retry_policy = {maximum_attempts = 3}})
            local result, err = version_publish.publish(id, "tester")
            test.is_nil(err)
            test.is_false(result.ok)
            local unknown = false
            for _, issue in ipairs(result.errors) do
                test.is_true(issue.code ~= "node_retry_invalid", json.encode(issue))
                if issue.code == "block_unknown" and issue.node_id == "step" then unknown = true end
            end
            test.is_true(unknown, json.encode(result.errors))
        end)
        test.it("sets and clears fields through the JSON command codec and undo redo", function()
            local id = create({})
            local changed, change_err = workflow.apply(id, json.decode('[' ..
                '{"type":"node.update","body":{"id":"step","retry_policy":{"maximum_attempts":4},' ..
                '"start_to_close_timeout":"1s","schedule_to_close_timeout":9000}}]'), "tester")
            test.is_nil(change_err)
            test.eq(step(changed.state).retry_policy.maximum_attempts, 4)
            local cleared, clear_err = workflow.apply(id, json.decode('[' ..
                '{"type":"node.update","body":{"id":"step","retry_policy":false,"start_to_close_timeout":false}}]'), "tester")
            test.is_nil(clear_err)
            test.is_nil(step(cleared.state).retry_policy)
            test.is_nil(step(cleared.state).start_to_close_timeout)
            test.eq(step(cleared.state).schedule_to_close_timeout, 9000)
            local undone, undo_err = workflow.undo(id, "tester")
            test.is_nil(undo_err)
            test.eq(step(undone.state).retry_policy.maximum_attempts, 4)
            local redone, redo_err = workflow.redo(id, "tester")
            test.is_nil(redo_err)
            test.is_nil(step(redone.state).retry_policy)
            local snapshot = workflow.state(id)
            test.is_nil(step(snapshot).retry_policy)
        end)
        test.it("rejects retry overrides on agent wait and structural nodes", function()
            for _, ref in ipairs({"app:block.configurable_agent", "app:block.test_external_wait"}) do
                local id = create({ref = ref, retry_policy = {maximum_attempts = 3}})
                local published, err = version_publish.publish(id, "tester")
                test.is_nil(err)
                test.is_false(published.ok)
                local found = false
                for _, issue in ipairs(published.errors) do
                    if issue.node_id == "step" and issue.message == "retry_policy is supported only on func nodes" then found = true end
                end
                test.is_true(found, json.encode(published.errors))
            end
            local problems = compiler.validate_config_requirements({nodes = {
                {id = "branch", kind = "branch", start_to_close_timeout = "1s"}}}, {})
            test.eq(problems[1].node_id, "branch")
            test.eq(problems[1].message, "start_to_close_timeout is supported only on func nodes")
        end)
        test.it("keeps a frozen version independent of subsequent draft policy edits", function()
            local id = create({retry_policy = {maximum_attempts = 3}})
            local published, err = version_publish.publish(id, "tester")
            test.is_nil(err)
            test.is_true(published.ok)
            local _, apply_err = workflow.apply(id, {{type = "node.update", body = {
                id = "step", retry_policy = {maximum_attempts = 8}}}}, "tester")
            test.is_nil(apply_err)
            local frozen = version_read.get(id, published.version)
            test.eq(native(frozen.compiled_commands).config.retry_policy.maximum_attempts, 3)
        end)
        test.it("refuses publication with shared validation errors attached to the node", function()
            for _, fields in ipairs({ { retry_policy = { maximum_attempts = -1 } },
                { start_to_close_timeout = 0 }, { schedule_to_close_timeout = "bad" } }) do
                local _, expected = retry.validate(fields, "func")
                local id = create(fields)
                local result, err = version_publish.publish(id, "tester")
                test.is_nil(err)
                test.is_false(result.ok)
                local found = false
                for _, issue in ipairs(result.errors) do
                    if issue.node_id == "step" and issue.message:find(expected, 1, true) then found = true end
                end
                test.is_true(found, json.encode(result.errors))
            end
        end)
    end)
end
return { run = test.run_cases(run) }
