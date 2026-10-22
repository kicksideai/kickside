-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local writer = require("writer")
local apply = require("apply")
local claim = require("claim")
local invoke = require("invoke")
local pin = require("pin")
local prune = require("prune")

local function query(db: sql.DB, statement: string, params: table): table
    local rows, err = db:query(statement, params)
    if err then error(tostring(err)) end
    return rows
end
local function execute(db: sql.DB, statement: string, params: table)
    local _, err = db:execute(statement, params)
    if err then error(tostring(err)) end
end
local function registration(db: sql.DB, thread: string): table
    local result, err = writer.register_projection(db, thread, {
        kind = "retained-input", worker_ref = "func://app:test_count_worker",
        worker_input_mode = "prefetch_events", system_identity = true,
    })
    if err then error(tostring(err)) end
    return result
end
local function fixture(): (string, table)
    local db = assert(sql.get("app:db"))
    local thread = uuid.v7()
    execute(db, "INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,3)", { thread, thread })
    for seq = 1, 3 do
        execute(db, [[INSERT INTO kickside_event (id,thread_id,type,role,body,seq,created_at)
            VALUES ($1,$2,'test:event','user','{}',$3,'2000-01-01T00:00:00Z')]], { uuid.v7(), thread, seq })
    end
    local registered = registration(db, thread)
    execute(db, "UPDATE kickside_projection_cursor SET last_seq=1 WHERE id=$1", { registered.cursor_id })
    db:release()
    return thread, registered
end
local function block(thread: string, registered: table): table
    local db = assert(sql.get("app:db"))
    execute(db, "UPDATE kickside_job SET scheduled_at=created_at WHERE id=$1", { registered.job_id })
    local batch, err = claim.claim_batch(db, tostring(db:type()), 16, nil, nil)
    if err then error(tostring(err)) end
    local job: table? = nil
    for _, row in ipairs(batch) do if row.id == registered.job_id then job = row end end
    if not job then error("slot is not claimed") end
    local snapshot = query(db, "SELECT * FROM kickside_projection_cursor WHERE id=$1", { registered.cursor_id })[1]
    db:release()
    local result, failure = apply.fail("app:db", job, snapshot,
        errors.new({kind = errors.INVALID, message = "invalid declaration", retryable = false}), true)
    test.is_nil(failure)
    test.is_true(result.invalid)
    return snapshot
end
local function sweep(db: sql.DB, thread: string): table
    local result, err = prune.prune_thread(db, thread, {cutoff = "2001-01-01T00:00:00Z"})
    if err then error(tostring(err)) end
    return result
end

return test.run_cases(function()
    test.describe("blocked projection retention", function()
        test.it("retains unread events through a deterministic block and releases protection on correction", function()
            local thread, registered = fixture()
            block(thread, registered)
            local db = assert(sql.get("app:db"))
            local held, read_err = pin.read(db, thread, "projection:" .. registered.cursor_id)
            test.is_nil(read_err)
            test.not_nil(held)
            test.eq(tonumber(held.cursor_seq), 1)
            test.eq(sweep(db, thread).deleted, 1)
            test.eq(#query(db, "SELECT seq FROM kickside_event WHERE thread_id=$1", {thread}), 2)
            registration(db, thread)
            test.is_nil(select(1, pin.read(db, thread, "projection:" .. registered.cursor_id)))
            test.eq(sweep(db, thread).deleted, 0, "the corrected cursor protects the same input")
            execute(db, "UPDATE kickside_job SET scheduled_at=created_at WHERE id=$1", { registered.job_id })
            local jobs, claim_err = claim.claim_batch(db, tostring(db:type()), 16, nil, nil)
            test.is_nil(claim_err)
            db:release()
            local job: table? = nil
            for _, row in ipairs(jobs) do if row.id == registered.job_id then job = row end end
            test.not_nil(job)
            local folded, fold_err = invoke.run({job = job, payload = {cursor_id = registered.cursor_id}})
            test.is_nil(fold_err)
            test.eq(folded.last_seq, 3)
            db = assert(sql.get("app:db"))
            test.eq(sweep(db, thread).deleted, 2)
            test.is_nil(select(2, writer.remove_projection(db, thread, {projection_id = registered.projection_id})))
            db:release()
        end)
        test.it("transfers protection to a paused cursor and can block again after resume", function()
            local thread, registered = fixture()
            block(thread, registered)
            local db = assert(sql.get("app:db"))
            test.is_nil(select(2, writer.pause(db, thread, {cursor_id = registered.cursor_id})))
            test.is_nil(select(1, pin.read(db, thread, "projection:" .. registered.cursor_id)))
            test.eq(sweep(db, thread).deleted, 1)
            test.is_nil(select(2, writer.resume(db, thread, {cursor_id = registered.cursor_id})))
            db:release()
            block(thread, registered)
            db = assert(sql.get("app:db"))
            local held, read_err = pin.read(db, thread, "projection:" .. registered.cursor_id)
            test.is_nil(read_err)
            test.not_nil(held)
            test.eq(tonumber(held.cursor_seq), 1)
            test.eq(sweep(db, thread).deleted, 0)
            test.is_nil(select(2, writer.remove_projection(db, thread, {projection_id = registered.projection_id})))
            db:release()
        end)
        test.it("leaves no pin when an old failure loses the cursor generation fence", function()
            local thread, registered = fixture()
            local snapshot = block(thread, registered)
            local db = assert(sql.get("app:db"))
            registration(db, thread)
            db:release()
            local result, err = apply.fail("app:db", {id = registered.job_id}, snapshot,
                errors.new({kind = errors.INVALID, message = "old failure"}), true)
            test.is_nil(err)
            test.is_nil(result)
            db = assert(sql.get("app:db"))
            test.is_nil(select(1, pin.read(db, thread, "projection:" .. registered.cursor_id)))
            test.eq(sweep(db, thread).deleted, 1)
            test.is_nil(select(2, writer.remove_projection(db, thread, {projection_id = registered.projection_id})))
            db:release()
        end)
        test.it("releases the blocked pin when its projection is removed", function()
            local thread, registered = fixture()
            block(thread, registered)
            local db = assert(sql.get("app:db"))
            test.eq(sweep(db, thread).deleted, 1)
            local removed, err = writer.remove_projection(db, thread, {projection_id = registered.projection_id})
            test.is_nil(err)
            test.eq(removed.removed_cursors, 1)
            test.is_nil(select(1, pin.read(db, thread, "projection:" .. registered.cursor_id)))
            test.eq(sweep(db, thread).deleted, 2)
            db:release()
        end)
    end)
end)
