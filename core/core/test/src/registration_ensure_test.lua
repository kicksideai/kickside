-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local writer = require("writer")
local invoke = require("invoke")
local claim = require("claim")

local function define_tests()
    test.describe("projection declaration convergence", function()
        for _, status in ipairs({"active", "paused", "invalid"}) do
            test.it("rebuilds an ensured declaration whose fold inputs change and keeps its " .. status .. " cursor status", function()
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
                body.stats = {count = 4, nested = {value = "folded"}}
                assert(db:execute("UPDATE kickside_projection SET body=$1,last_event_seq=4 WHERE id=$2",
                    {assert(json.encode(body)), registered.projection_id}))
                assert(db:execute("UPDATE kickside_projection_cursor SET last_seq=4,status=$1,last_error='retained error' WHERE id=$2",
                    {status, registered.cursor_id}))
                assert(db:execute("UPDATE kickside_projection_cursor SET last_seq=4 WHERE id=$1", {sibling.cursor_id}))
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
                local after = assert(db:query("SELECT body,state,last_event_seq FROM kickside_projection WHERE id=$1", {registered.projection_id}))[1]
                local refreshed = assert(json.decode(after.body))
                test.eq(refreshed.events.input[2].type, "new.event")
                test.eq(refreshed.worker_config.version, 2)
                test.is_nil(refreshed.drop_notify)
                test.is_nil(refreshed.stats, "the fold folded under the old inputs is discarded")
                test.eq(after.state, "pending")
                test.eq(tonumber(after.last_event_seq), 0)
                local cursor = assert(db:query("SELECT last_seq,status,last_error,generation FROM kickside_projection_cursor WHERE id=$1",
                    {registered.cursor_id}))[1]
                test.eq(tonumber(cursor.last_seq), 0, "the fold replays the thread under the new inputs")
                test.eq(cursor.status, status)
                test.eq(cursor.last_error, "retained error")
                test.eq(tonumber(cursor.generation), registered.generation + 1, "old worker snapshots cannot overwrite the rebuilt fold")
                local sibling_cursor = assert(db:query("SELECT last_seq,generation FROM kickside_projection_cursor WHERE id=$1", {sibling.cursor_id}))[1]
                test.eq(tonumber(sibling_cursor.generation), sibling.generation + 1, "all cursors share the refreshed declaration")
                test.eq(tonumber(sibling_cursor.last_seq), 0, "every cursor of the projection replays")
                assert(db:execute("UPDATE kickside_projection_cursor SET last_seq=4 WHERE projection_id=$1", {registered.projection_id}))
                local repeated, repeat_err = writer.register_projection(db, id, params)
                test.is_nil(repeat_err)
                test.eq(repeated.generation, ensured.generation, "an unchanged ensure does not fence a current worker")
                local kept = assert(db:query("SELECT last_seq FROM kickside_projection_cursor WHERE id=$1", {registered.cursor_id}))[1]
                test.eq(tonumber(kept.last_seq), 4, "an unchanged ensure keeps cursor progress")
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

        test.it("refreshes a teardown hook without discarding the fold or cursor progress", function()
            local db = assert(sql.get("app:db"))
            local id = uuid.v7()
            assert(db:execute([[INSERT INTO kickside_thread
                (id,thread_class,component_id,event_count) VALUES ($1,'ensure',$2,7)]], {id, id}))
            local params = {kind = "ensure", worker_ref = "func://app:test_count_worker",
                system_identity = true, events = {input = {{type = "old.event"}}},
                drop_notify = {thread_id = id, type = "removed"}}
            local registered = assert(writer.register_projection(db, id, params))
            local rows = assert(db:query("SELECT body FROM kickside_projection WHERE id=$1", {registered.projection_id}))
            local body = assert(json.decode(rows[1].body))
            body.stats = {count = 4}
            assert(db:execute("UPDATE kickside_projection SET body=$1,last_event_seq=4 WHERE id=$2",
                {assert(json.encode(body)), registered.projection_id}))
            assert(db:execute("UPDATE kickside_projection_cursor SET last_seq=4 WHERE id=$1", {registered.cursor_id}))
            params.ensure = true
            params.drop_notify = nil
            local ensured, ensure_err = writer.register_projection(db, id, params)
            test.is_nil(ensure_err)
            test.eq(ensured.generation, registered.generation + 1)
            local after = assert(db:query("SELECT body,last_event_seq FROM kickside_projection WHERE id=$1", {registered.projection_id}))[1]
            local refreshed = assert(json.decode(after.body))
            test.is_nil(refreshed.drop_notify)
            test.eq(refreshed.stats.count, 4)
            test.eq(tonumber(after.last_event_seq), 4)
            local cursor = assert(db:query("SELECT last_seq FROM kickside_projection_cursor WHERE id=$1", {registered.cursor_id}))[1]
            test.eq(tonumber(cursor.last_seq), 4)
            assert(writer.remove_projection(db, id, {projection_id = registered.projection_id}))
            assert(db:execute("DELETE FROM kickside_thread WHERE id=$1", {id}))
            assert(db:release())
        end)

        test.it("folds events of a newly declared input type that precede the declaration change", function()
            local db = assert(sql.get("app:db"))
            local id = uuid.v7()
            local types = {"widen.kept", "widen.added", "widen.kept", "widen.added"}
            assert(db:execute([[INSERT INTO kickside_thread
                (id,thread_class,component_id,event_count) VALUES ($1,'ensure',$2,$3)]], {id, id, #types}))
            for seq, event_type in ipairs(types) do
                assert(db:execute([[INSERT INTO kickside_event (id,thread_id,type,role,body,seq)
                    VALUES ($1,$2,$3,'user','{}',$4)]], {uuid.v7(), id, event_type, seq}))
            end
            local params = {kind = "widen", worker_ref = "func://app:test_count_worker",
                worker_input_mode = "prefetch_events", system_identity = true, ensure = true,
                events = {input = {{type = "widen.kept"}}}}
            local registered = assert(writer.register_projection(db, id, params))
            local dbtype = assert(db:type())
            assert(db:release())
            local function fold(): table
                local claim_db = assert(sql.get("app:db"))
                local claimed, claim_err = claim.claim_batch(claim_db, tostring(dbtype), 16, nil, nil)
                assert(claim_db:release())
                test.is_nil(claim_err)
                local job: any = nil
                for _, row in ipairs(claimed or {}) do
                    if row.id == registered.job_id then job = row end
                end
                test.not_nil(job, "the projection slot is runnable")
                local _, advance_err = invoke.run({job = job, payload = {cursor_id = registered.cursor_id}})
                test.is_nil(advance_err)
                local read = assert(sql.get("app:db"))
                local row = assert(read:query([[SELECT p.body,c.last_seq FROM kickside_projection p
                    JOIN kickside_projection_cursor c ON c.projection_id=p.id WHERE p.id=$1]], {registered.projection_id}))[1]
                assert(read:release())
                return {body = assert(json.decode(row.body)), last_seq = tonumber(row.last_seq)}
            end
            local first = fold()
            test.eq(first.body.stats.count, 2)
            test.eq(first.last_seq, #types)
            local widen_db = assert(sql.get("app:db"))
            params.events = {input = {{type = "widen.kept"}, {type = "widen.added"}}}
            local _, widen_err = writer.register_projection(widen_db, id, params)
            assert(widen_db:release())
            test.is_nil(widen_err)
            local rebuilt = fold()
            test.eq(rebuilt.body.stats.count, #types, "every event matching the new inputs reaches the fold exactly once")
            test.eq(rebuilt.last_seq, #types)
            local cleanup = assert(sql.get("app:db"))
            assert(writer.remove_projection(cleanup, id, {projection_id = registered.projection_id}))
            assert(cleanup:execute("DELETE FROM kickside_event WHERE thread_id=$1", {id}))
            assert(cleanup:execute("DELETE FROM kickside_thread WHERE id=$1", {id}))
            assert(cleanup:release())
        end)
    end)
end

return {run = test.run_cases(define_tests)}
