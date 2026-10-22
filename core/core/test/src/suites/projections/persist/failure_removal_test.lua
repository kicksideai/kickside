local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local channel = require("channel")
local writer = require("writer")
local apply = require("apply")
local claim = require("claim")
local cancellation = require("cancellation")
local prune_scaffold = require("prune_scaffold")

local function define_tests()
    test.describe("projection failure and removal", function()
        test.it("serializes failure behind removal before taking a cursor lock", function()
            local db = assert(sql.get("app:db"))
            local dialect = assert(db:type())
            local thread_id = uuid.v7()
            assert(db:execute([[INSERT INTO kickside_thread
                (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,1)]], {thread_id, thread_id}))
            local registered = assert(writer.register_projection(db, thread_id, {
                kind = "failure-removal", worker_ref = "func://app:test_count_worker", system_identity = true,
            }))
            local batch = assert(claim.claim_batch(db, dialect, 16, nil, nil))
            local job: table? = nil
            for _, row in ipairs(batch) do if row.id == registered.job_id then job = row end end
            assert(job, "projection slot is not claimed")
            local snapshots = assert(db:query("SELECT * FROM kickside_projection_cursor WHERE id=$1", {registered.cursor_id}))
            local done = channel.new(1)
            local previous = writer._modules.job_lifecycle_cancel
            writer._modules.job_lifecycle_cancel = {
                cancel_jobs_tx = function(tx: any, dbtype: string, params: table): (any, error?, any)
                    local count, err, executions = cancellation.cancel_jobs_tx(tx, dbtype, params)
                    if err then return count, err, executions end
                    coroutine.spawn(function()
                        local result, fail_err = apply.fail("app:db", job, snapshots[1],
                            errors.new({kind = errors.INVALID, message = "invalid declaration"}), true)
                        done:send({result = result, err = fail_err})
                    end)
                    prune_scaffold.await_lock_waiter(dbtype)
                    return count, nil, executions
                end,
            }
            local removed, remove_err = writer.remove_projection(db, thread_id, {projection_id = registered.projection_id})
            writer._modules.job_lifecycle_cancel = previous
            assert(db:release())
            local failed = done:receive()
            test.is_nil(remove_err)
            test.not_nil(removed)
            test.is_nil(failed.err)
            test.is_nil(failed.result)
            db = assert(sql.get("app:db"))
            local cursors = assert(db:query("SELECT id FROM kickside_projection_cursor WHERE id=$1", {registered.cursor_id}))
            local slots = assert(db:query("SELECT status FROM kickside_job WHERE id=$1", {registered.job_id}))
            assert(db:release())
            test.eq(#cursors, 0)
            test.eq(slots[1].status, "cancelled")
        end)
    end)
end

return test.run_cases(define_tests)
