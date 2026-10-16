local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local channel = require("channel")
local lifecycle = require("lifecycle")
local slot_purge = require("slot_purge")
local function define_tests()
    test.describe("slot owner cleanup", function()
        test.it("settles concurrent purges of the same slot", function()
            local db, connect_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(connect_err)) end
            test.is_nil(connect_err)
            local dbtype = tostring(db:type())
            local identity = { namespace = "test", scope = uuid.v7(), key = "purge" }
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = identity.scope }, job_identity = identity,
                job_type = "test.purge", slot = true, parked = true,
            })
            test.is_nil(enqueue_err)
            local blocker: sql.Transaction? = nil
            if dbtype == sql.type.POSTGRES then
                local tx, begin_err = db:begin()
                test.is_nil(begin_err)
                blocker = tx
                local _, lock_err = tx:query("SELECT id FROM kickside_job WHERE id=$1 FOR UPDATE", { id })
                test.is_nil(lock_err)
            end
            local done = channel.new(2)
            for _ = 1, 2 do
                coroutine.spawn(function()
                    local removed, err = slot_purge.purge_slot(identity)
                    done:send({ removed = removed, err = err })
                end)
            end
            local waiting = blocker == nil
            local observe_err: any = nil
            if blocker then
                for _ = 1, 500 do
                    local rows, query_err = db:query("SELECT count(*) AS n FROM pg_stat_activity WHERE datname=current_database()"
                        .. " AND wait_event_type='Lock' AND query LIKE 'SELECT id,status FROM kickside_job%'")
                    if query_err then observe_err = query_err; break end
                    if tonumber(rows[1].n) >= 2 then waiting = true; break end
                    time.sleep("10ms")
                end
                local _, commit_err = blocker:commit()
                test.is_nil(commit_err)
            end
            db:release()
            local one, two = done:receive(), done:receive()
            test.is_nil(observe_err)
            test.is_true(waiting, "both purges wait for the same row lock")
            test.is_nil(one.err, tostring(one.err))
            test.is_nil(two.err, tostring(two.err))
            test.not_nil(one.removed)
            test.not_nil(two.removed)
            test.eq((one.removed :: integer) + (two.removed :: integer), 1)
            local again, retry_err = slot_purge.purge_slot(identity)
            test.is_nil(retry_err)
            test.eq(again, 0)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
