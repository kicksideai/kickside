-- Workflow definition history grows with edits and publication markers past
-- any former per-workflow count; one encoded event above the row byte limit
-- is refused without being stored.
local test = require("test")
local uuid = require("uuid")
local store = require("store")
local workflow = require("workflow")
local types = require("types")
local version_publish = require("version_publish")
local json = require("json")

local FORMER_EVENTS_PER_WORKFLOW = 100000

local function command(kind: string, body: any): any
    return { type = kind, body = body }
end

return test.run_cases(function()
    test.describe("workflow definition history", function()
        test.it("records edits and publication markers as durable history", function()
            local id = uuid.v4()
            local _, edit_err = workflow.apply(id, {
                command(types.COMMAND.NODE_ADD, { id = "a", kind = "block", ref = "app:block.engine_linear" }),
                command(types.COMMAND.NODE_ADD, { id = "b", kind = "block", ref = "app:block.engine_linear" }),
                command(types.COMMAND.EDGE_ADD, { id = "e", source_id = "a", target_id = "b" }),
            }, "tester")
            test.is_nil(edit_err, tostring(edit_err))
            local published, publish_err = version_publish.publish(id, "tester")
            test.is_nil(publish_err, tostring(publish_err))
            test.is_true(published.ok)
            local db = assert(store.open_db())
            local physical = assert(db:query("SELECT COUNT(*) AS n FROM workflow_def_events WHERE workflow_id=$1", { id }))
            db:release()
            test.is_true(tonumber(physical[1].n) >= 4)
        end)

        test.it("edits a workflow holding more history than any former per-workflow count", function()
            local id = uuid.v4()
            local _, first_err = workflow.apply(id, { command(types.COMMAND.PARAM_SET,
                { key = "count", value = 0 }) }, "tester")
            test.is_nil(first_err, tostring(first_err))
            local db = assert(store.open_db())
            local seeded, seed_err = db:execute([[WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<]]
                .. tostring(FORMER_EVENTS_PER_WORKFLOW) .. [[)
                INSERT INTO workflow_def_events (workflow_id,seq,type,body,actor,created_at)
                SELECT $1,x+1000,$2,'{"key":"seed","value":1}','tester','2026-01-01T00:00:00Z' FROM n]],
                { id, types.EVENT.PARAM_SET })
            test.is_nil(seed_err, tostring(seed_err))
            test.eq(tonumber(seeded.rows_affected), FORMER_EVENTS_PER_WORKFLOW)
            local _, head_err = db:execute("UPDATE workflow_def_state SET head_seq=$1 WHERE workflow_id=$2",
                { FORMER_EVENTS_PER_WORKFLOW + 1000, id })
            db:release()
            test.is_nil(head_err, tostring(head_err))
            local edited, edit_err = workflow.apply(id, { command(types.COMMAND.PARAM_SET,
                { key = "count", value = 3 }) }, "tester")
            test.is_nil(edit_err, tostring(edit_err))
            test.eq(edited.state.params.count, 3)
            local verify = assert(store.open_db())
            local rows = assert(verify:query("SELECT COUNT(*) AS n FROM workflow_def_events WHERE workflow_id=$1", { id }))
            verify:release()
            test.eq(tonumber(rows[1].n), FORMER_EVENTS_PER_WORKFLOW + 2)
        end)

        test.it("refuses an encoded event beyond the policy row byte limit", function()
            local id = uuid.v4()
            local db = assert(store.open_db())
            local tx = assert(db:begin())
            local denied = store.append_event(tx, id, 1, types.EVENT.PARAM_SET,
                { key = "oversize", value = string.rep("x", 4194304) }, "tester")
            tx:rollback()
            test.not_nil(denied)
            test.is_true(errors.is(denied, errors.INVALID), tostring(denied))
            test.eq(denied:details().reason, "row_too_large")
            local rows = assert(db:query("SELECT seq FROM workflow_def_events WHERE workflow_id=$1", { id }))
            db:release()
            test.eq(#rows, 0)
        end)

        test.it("admits the exact encoded row edge and refuses the next byte", function()
            local id = uuid.v4()
            local empty = assert(json.encode({ key = "edge", value = "" }))
            local body = { key = "edge", value = string.rep("x", 4194304 - #empty) }
            test.eq(#assert(json.encode(body)), 4194304)
            local db = assert(store.open_db())
            local exact_tx = assert(db:begin())
            local exact_err = store.append_event(exact_tx, id, 1, types.EVENT.PARAM_SET, body, "tester")
            test.is_nil(exact_err, tostring(exact_err))
            local _, commit_err = exact_tx:commit()
            test.is_nil(commit_err, tostring(commit_err))
            local over_tx = assert(db:begin())
            body.value = body.value .. "x"
            local denied = store.append_event(over_tx, id, 2, types.EVENT.PARAM_SET, body, "tester")
            over_tx:rollback()
            test.is_true(errors.is(denied, errors.INVALID), tostring(denied))
            test.eq(denied:details().cap, 4194304)
            local rows = assert(db:query("SELECT seq FROM workflow_def_events WHERE workflow_id=$1", { id }))
            db:release()
            test.eq(#rows, 1)
        end)

        test.it("accepts two concurrent definition appends", function()
            local id = uuid.v4()
            local _, edit_err = workflow.apply(id, { command(types.COMMAND.PARAM_SET,
                { key = "baseline", value = 1 }) }, "tester")
            test.is_nil(edit_err, tostring(edit_err))
            local ready, start, done = channel.new(2), channel.new(2), channel.new(2)
            for n = 1, 2 do
                coroutine.spawn(function()
                    ready:send(true)
                    start:receive()
                    local handle = assert(store.open_db())
                    local tx = assert(handle:begin())
                    local err = store.append_event(tx, id, n + 1, types.EVENT.PARAM_SET,
                        { key = "race-" .. tostring(n), value = n }, "tester")
                    if err then tx:rollback() else
                        local _, commit_err = tx:commit()
                        err = commit_err
                    end
                    handle:release()
                    done:send(err)
                end)
            end
            ready:receive(); ready:receive()
            start:send(true); start:send(true)
            for _ = 1, 2 do test.is_nil((done:receive())) end
            local final = assert(store.open_db())
            local rows = assert(final:query("SELECT seq FROM workflow_def_events WHERE workflow_id=$1", { id }))
            final:release()
            test.eq(#rows, 3)
        end)
    end)
end)
