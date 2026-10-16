local test = require("test")
local uuid = require("uuid")
local sql = require("sql")
local time = require("time")
local fixture = require("fixture")
local component = require("component")
local teardown = require("teardown")

return { run = test.run_cases(function()
    test.describe("Threads catch-up addressed selection", function()
        local context = fixture.new()
        local owned = {}
        local crowded, late, early
        local function thread()
            local created, err = context.as_owner("create", { thread_class = "catchup_address_" .. context.suffix })
            test.is_nil(err)
            owned[#owned + 1] = created.thread_id
            return created.thread_id
        end
        local function register(id, kind, key, cursor)
            local result, err = context.as_owner("register_projection", { thread_id = id, kind = kind,
                projection_key = key, cursor_key = cursor, worker_ref = "func://app:test_count_worker" })
            test.is_nil(err)
            test.not_nil(result.projection.cursor_id)
            return result.projection
        end
        test.before_all(function()
            crowded = thread()
            late = register(crowded, "z.target", "source", "ingest")
            early = register(crowded, "0.target", "source", "ingest")
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            for i = 1, 1001 do
                local projection_id = uuid.v7()
                local _, projection_err = sql.builder.insert("kickside_projection"):set_map({
                    id = projection_id, thread_id = crowded, kind = string.format("a.filler.%04d", i),
                    projection_key = "default", body = "{}", state = "valid", last_event_seq = 0 }):run_with(db):exec()
                if projection_err then db:release(); error(tostring(projection_err)) end
                local _, cursor_err = sql.builder.insert("kickside_projection_cursor"):set_map({
                    id = uuid.v7(), projection_id = projection_id, thread_id = crowded,
                    cursor_key = "default", generation = 1, last_seq = 0, status = "active",
                    created_at = "2099-01-01T00:00:00Z", updated_at = "2099-01-01T00:00:00Z" }):run_with(db):exec()
                if cursor_err then db:release(); error(tostring(cursor_err)) end
            end
            local _, release_err = db:release()
            test.is_nil(release_err)
        end)
        test.after_all(function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            for _, id in ipairs(owned) do
                local released, release_err = component.system_delete(id)
                test.is_true(released)
                if release_err then test.is_true(release_err:details().cleanup_pending) end
                local finished = false
                for _ = 1, 40 do
                    local result, err = teardown.purge_thread(db, id, nil)
                    if err then
                        test.is_true(err:details().cleanup_pending)
                    else
                        test.is_true(result.purged)
                        finished = true
                        break
                    end
                end
                test.is_true(finished)
                test.is_nil(context.component_row_exists(id))
            end
            local _, release_err = db:release()
            test.is_nil(release_err)
        end)
        test.it("leaves the jobs slot unchanged when the selected cursor already reaches the head", function()
            local id = thread()
            local selected = register(id, "current", "source", "ingest")
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local _, update_err = db:execute([[UPDATE kickside_job
                SET scheduled_at='2099-01-01T00:00:00Z',attempts=3,wake_enabled=FALSE
                WHERE id=(SELECT job_id FROM kickside_projection_cursor WHERE id=$1)]], { selected.cursor_id })
            test.is_nil(update_err)
            local before, before_err = db:query([[SELECT j.id,j.scheduled_at,j.attempts,j.wake_enabled
                FROM kickside_job j JOIN kickside_projection_cursor c ON c.job_id=j.id WHERE c.id=$1]], { selected.cursor_id })
            test.is_nil(before_err)
            test.eq(#before, 1)
            local result, err = context.as_owner("catch_up_projection", {
                thread_id = id, kind = "current", projection_key = "source", cursor_key = "ingest" })
            test.is_nil(err)
            test.is_true(result.done)
            test.eq(result.ticks, 0)
            test.eq(result.processed, 0)
            test.eq(result.last_seq, result.event_count)
            local after, after_err = db:query("SELECT id,scheduled_at,attempts,wake_enabled FROM kickside_job WHERE id=$1", { before[1].id })
            local _, release_err = db:release()
            test.is_nil(release_err)
            test.is_nil(after_err)
            test.eq(#after, 1)
            test.eq(after[1].scheduled_at, before[1].scheduled_at)
            test.eq(after[1].attempts, before[1].attempts)
            test.eq(after[1].wake_enabled, before[1].wake_enabled)
        end)
        test.it("leaves a due slot's retry and schedule state intact while waiting for pending cursor work", function()
            local id = thread()
            local selected = register(id, "due", "source", "ingest")
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            test.is_nil(select(2, db:execute("UPDATE kickside_thread SET event_count=1 WHERE id=$1", { id })))
            test.is_nil(select(2, db:execute([[UPDATE kickside_job
                SET scheduled_at='2000-01-01T00:00:00Z',attempts=3,wake_enabled=TRUE
                WHERE id=(SELECT job_id FROM kickside_projection_cursor WHERE id=$1)]], { selected.cursor_id })))
            local before, before_err = db:query([[SELECT j.id,j.scheduled_at,j.attempts
                FROM kickside_job j JOIN kickside_projection_cursor c ON c.job_id=j.id WHERE c.id=$1]], { selected.cursor_id })
            test.is_nil(before_err)
            local _, release_err = db:release()
            test.is_nil(release_err)
            local result, err = context.as_owner("catch_up_projection", {
                thread_id = id, kind = "due", projection_key = "source", cursor_key = "ingest",
                deadline = time.now():add(200 * time.MILLISECOND):utc():format("2006-01-02T15:04:05.999999999Z07:00"),
            })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            local observed, observed_err = sql.get("app:db")
            test.is_nil(observed_err)
            local after, after_err = observed:query("SELECT scheduled_at,attempts FROM kickside_job WHERE id=$1", { before[1].id })
            test.is_nil(after_err)
            test.eq(after[1].scheduled_at, before[1].scheduled_at)
            test.eq(after[1].attempts, before[1].attempts)
            local _, observed_release_err = observed:release()
            test.is_nil(observed_release_err)
        end)
        test.it("finds a requested projection beyond one thousand unrelated definitions", function()
            local result, err = context.as_owner("catch_up_projection", { thread_id = crowded,
                kind = "z.target", projection_key = "source", cursor_key = "ingest" })
            test.is_nil(err)
            test.eq(result.projection_id, late.projection_id)
            test.eq(result.cursor_id, late.cursor_id)
            test.is_true(result.done)
        end)
        test.it("finds a requested cursor beyond one thousand unrelated recent cursors", function()
            local result, err = context.as_owner("catch_up_projection", { thread_id = crowded,
                kind = "0.target", projection_key = "source", cursor_key = "ingest" })
            test.is_nil(err)
            test.eq(result.projection_id, early.projection_id)
            test.eq(result.cursor_id, early.cursor_id)
            test.is_true(result.done)
        end)
        test.it("keeps omitted keys as selection instead of defaulting their address", function()
            local result, err = context.as_owner("catch_up_projection", { thread_id = crowded, kind = "z.target" })
            test.is_nil(err)
            test.eq(result.projection_id, late.projection_id)
            test.eq(result.cursor_id, late.cursor_id)
        end)
        test.it("selects the first projection before applying an explicit cursor key", function()
            local id = thread()
            register(id, "select", "aaa", "other")
            register(id, "select", "zzz", "selected")
            local result, err = context.as_owner("catch_up_projection", {
                thread_id = id, kind = "select", cursor_key = "selected" })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.NOT_FOUND)
        end)
        test.it("selects the most recent cursor when its key is omitted", function()
            local id = thread()
            register(id, "select", "source", "older")
            local newest = register(id, "select", "source", "newer")
            local result, err = context.as_owner("catch_up_projection", {
                thread_id = id, kind = "select", projection_key = "source" })
            test.is_nil(err)
            test.eq(result.cursor_id, newest.cursor_id)
        end)
    end)
end) }
