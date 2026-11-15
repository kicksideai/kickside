-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local time = require("time")
local channel = require("channel")
local json = require("json")
local fixture = require("fixture")
local sweeper = require("sweeper")
local append = require("append")
local prune = require("prune")

return {run = test.run_cases(function()
    test.describe("Retention append latency", function()
        test.it("drains a synthetic backlog while the same thread accepts appends", function()
            local count = 1500000
            local thread = fixture.make_thread()
            fixture.add_bulk_events(thread, count, 120)
            local db = fixture.open_db()
            local done = channel.new(1)
            local finished = false
            coroutine.spawn(function()
                local success, value = pcall(function()
                    local writer = fixture.open_db()
                    local durations = {}
                    repeat
                        -- Time subtraction retains the monotonic clock across wall-clock adjustments.
                        local start = time.now()
                        local tx = assert(writer:begin())
                        local result, err = append.append_events_tx(tx, thread,
                            {{type = "test:load", body_json = "{}"}})
                        if err then tx:rollback(); error(err) end
                        assert(tx:commit())
                        test.eq(result.inserted, 1)
                        durations[#durations + 1] = time.now():sub(start):nanoseconds() / 1000000
                        time.sleep("2ms")
                    until finished
                    writer:release()
                    return durations
                end)
                done:send({success = success, value = value})
            end)
            local start = time.now()
            local total, passes = 0, 0
            while total < count do
                local result, err = sweeper.run(db)
                test.is_nil(err)
                test.is_true(result.events > 0)
                test.is_true(result.events <= 5000)
                total, passes = total + result.events, passes + 1
            end
            local elapsed = time.now():sub(start):nanoseconds() / 1000000000
            finished = true
            local writer = done:receive()
            test.is_true(writer.success, tostring(writer.value))
            local latencies = writer.value
            table.sort(latencies)
            local rows = assert(db:query("SELECT COUNT(*) AS n FROM kickside_event WHERE thread_id=$1", {thread}))
            test.eq(tonumber(rows[1].n), #latencies)
            test.eq(fixture.boundary_of(thread), count)
            test.is_true(#latencies > 0)
            local metric = {
                events = count, seconds = elapsed, events_per_second = count / elapsed, passes = passes,
                lock_batch = prune.MAX_LOCK_BATCH, appends = #latencies,
                append_p50_ms = latencies[math.ceil(#latencies * .5)],
                append_p99_ms = latencies[math.ceil(#latencies * .99)],
                append_max_ms = latencies[#latencies], engine = db:type(),
            }
            db:release()
            test.is_true(metric.append_max_ms < 1000,
                "same-thread appends wait more than a second: " .. assert(json.encode(metric)))
        end)
    end)
end)}
