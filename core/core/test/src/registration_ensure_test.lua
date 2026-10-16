-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local writer = require("writer")

local function define_tests()
    test.describe("projection declaration convergence", function()
        for _, status in ipairs({"active", "paused", "invalid"}) do
            test.it("refreshes an ensured declaration and preserves its fold and " .. status .. " cursor", function()
                local db = assert(sql.get("app:db"))
                local id = uuid.v7()
                assert(db:execute([[INSERT INTO kickside_thread
                    (id,thread_class,component_id,event_count) VALUES ($1,'ensure',$2,7)]], {id, id}))
                local params = {kind = "ensure", worker_ref = "func://app:test_count_worker",
                    system_identity = true, events = {input = {{type = "old.event"}}},
                    worker_config = {version = 1}, drop_notify = {thread_id = id, type = "removed"}}
                local registered, register_err = writer.register_projection(db, id, params)
                test.is_nil(register_err)
                params.cursor_key = "sibling"
                local sibling, sibling_err = writer.register_projection(db, id, params)
                test.is_nil(sibling_err)
                params.cursor_key = nil
                local rows = assert(db:query("SELECT body FROM kickside_projection WHERE id=$1", {registered.projection_id}))
                local body = assert(json.decode(rows[1].body))
                body.stats = {count = 4, nested = {value = "retained"}}
                assert(db:execute("UPDATE kickside_projection SET body=$1,last_event_seq=4 WHERE id=$2",
                    {assert(json.encode(body)), registered.projection_id}))
                assert(db:execute("UPDATE kickside_projection_cursor SET last_seq=4,status=$1,last_error='retained error' WHERE id=$2",
                    {status, registered.cursor_id}))
                params.ensure = true
                params.events = {input = {{type = "old.event"}, {type = "new.event"}}}
                params.worker_config = {version = 2}
                params.drop_notify = nil
                local ensured, ensure_err = writer.register_projection(db, id, params)
                test.is_nil(ensure_err)
                test.eq(ensured.projection_id, registered.projection_id)
                test.eq(ensured.cursor_id, registered.cursor_id)
                test.eq(ensured.job_id, registered.job_id)
                test.eq(ensured.created, false)
                local after = assert(db:query("SELECT body,last_event_seq FROM kickside_projection WHERE id=$1", {registered.projection_id}))[1]
                local refreshed = assert(json.decode(after.body))
                test.eq(refreshed.events.input[2].type, "new.event")
                test.eq(refreshed.worker_config.version, 2)
                test.is_nil(refreshed.drop_notify)
                test.eq(refreshed.stats.count, 4)
                test.eq(refreshed.stats.nested.value, "retained")
                test.eq(tonumber(after.last_event_seq), 4)
                local cursor = assert(db:query("SELECT last_seq,status,last_error,generation FROM kickside_projection_cursor WHERE id=$1",
                    {registered.cursor_id}))[1]
                test.eq(tonumber(cursor.last_seq), 4)
                test.eq(cursor.status, status)
                test.eq(cursor.last_error, "retained error")
                test.eq(tonumber(cursor.generation), registered.generation + 1, "old worker snapshots cannot overwrite the refreshed declaration")
                local sibling_cursor = assert(db:query("SELECT generation FROM kickside_projection_cursor WHERE id=$1", {sibling.cursor_id}))[1]
                test.eq(tonumber(sibling_cursor.generation), sibling.generation + 1, "all cursors share the refreshed declaration")
                local repeated, repeat_err = writer.register_projection(db, id, params)
                test.is_nil(repeat_err)
                test.eq(repeated.generation, ensured.generation, "an unchanged ensure does not fence a current worker")
                params.events = nil
                local unfiltered, unfilter_err = writer.register_projection(db, id, params)
                test.is_nil(unfilter_err)
                test.eq(unfiltered.generation, ensured.generation + 1)
                local last = assert(db:query("SELECT body FROM kickside_projection WHERE id=$1", {registered.projection_id}))[1]
                test.is_nil(assert(json.decode(last.body)).events)
                local removed, remove_err = writer.remove_projection(db, id, {projection_id = registered.projection_id})
                test.is_nil(remove_err)
                test.eq(removed.removed_cursors, 2)
                assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {id}))
                assert(db:release())
            end)
        end
    end)
end

return {run = test.run_cases(define_tests)}
