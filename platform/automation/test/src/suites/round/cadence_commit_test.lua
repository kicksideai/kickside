-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Cadence is chosen at the durable-round boundary. Interval polls start their
-- next interval after that boundary; occurrence schedules keep the first
-- occurrence that became due while a round held its token.

local test = require("test")
local time = require("time")
local channel = require("channel")
local drive = require("drive")
local claim = require("round_claim")
local h = require("round_harness")

type Map = { [string]: any }

local PORT = "kickside.automation.round.fixture:records"

local function scheduled(kind: string, schedule: Map): Map
    return { drive_key = "cadence", source_kind = kind,
        action = { source_ref = PORT, schedule = schedule } }
end

local function define_tests()
    test.describe("round cadence across durable commit", function()
        test.it("uses the durable completion for interval polling and the round boundary for occurrences", function()
            local interval, interval_err = claim.next_after_round(scheduled("collection", {
                type = "interval", expression = "5s" }), "2026-11-08T12:00:00Z", "2026-11-08T12:00:10Z")
            test.is_nil(interval_err, tostring(interval_err))
            test.eq(interval, "2026-11-08T12:00:15Z")

            local cron, cron_err = claim.next_after_round(scheduled("collection", {
                type = "cron", expression = "* * * * *" }), "2026-11-08T12:00:50Z", "2026-11-08T12:01:10Z")
            test.is_nil(cron_err, tostring(cron_err))
            test.eq(cron, "2026-11-08T12:01:00Z", "the occurrence during the round remains due")

            local timer, timer_err = claim.next_after_round(scheduled("timer", {
                type = "interval", expression = "1m" }), "2026-11-08T12:00:50Z", "2026-11-08T12:01:10Z")
            test.is_nil(timer_err, tostring(timer_err))
            test.eq(timer, "2026-11-08T12:01:50Z", "timer occurrences retain their cadence boundary")
        end)

        for _,cooldown_ms in ipairs({60000,1000}) do
            test.it("honors the later of the source cooldown and interval after max_pages with " .. tostring(cooldown_ms) .. "ms cooldown",function()
                local env=h.setup("cadence_cooldown")
                local start=time.now():utc()
                local clock=start
                local original_now,original_after=drive.utc_now,drive.utc_after
                drive.utc_now=function() return clock:format(time.RFC3339) end
                drive.utc_after=function(ms) return clock:add(ms*time.MILLISECOND):format(time.RFC3339) end
                local ok,message=pcall(function()
                    h.new_drive({automation_id=env.automation_id,drive_key="poll",source_kind="collection",
                        action={source_ref=PORT,config={items={},continuing=true,retry_after_ms=cooldown_ms},
                            schedule={type="interval",expression="5s"}},policy={round={max_pages=1}}})
                    h.set_drive(env.automation_id,"poll","next_run_at=$1",{h.PAST})
                    local _,err=env.run(env.automation_id,"poll")
                    test.is_nil(err,tostring(err))
                    local completed=h.read_drive(env.automation_id,"poll")
                    local delay=math.max(cooldown_ms,5000)
                    local expected=start:add(delay*time.MILLISECOND):format(time.RFC3339)
                    test.eq(completed.pass_pages,0,"max_pages ends the pass")
                    test.eq(completed.next_run_at,expected)
                    test.eq(env.last_completion().options.rearm,expected)

                    clock=start:add(math.min(cooldown_ms,5000)*time.MILLISECOND)
                    local _,early_err=env.run(env.automation_id,"poll")
                    test.is_nil(early_err,tostring(early_err))
                    test.eq(h.read_drive(env.automation_id,"poll").round_seq,completed.round_seq,
                        "the shorter deadline cannot start another acquisition")
                    clock=start:add(delay*time.MILLISECOND)
                    local _,due_err=env.run(env.automation_id,"poll")
                    test.is_nil(due_err,tostring(due_err))
                    test.eq(h.read_drive(env.automation_id,"poll").round_seq,completed.round_seq+1,
                        "acquisition resumes when both deadlines pass")
                end)
                drive.utc_now,drive.utc_after=original_now,original_after
                if not ok then error(message) end
            end)
        end

        for _,case in ipairs({{kind="collection",schedule={type="cron",expression="* * * * *"}},
            {kind="timer",schedule={type="cron",expression="* * * * *"}},
            {kind="timer",schedule={type="interval",expression="1m"}}}) do
            test.it("retains a due " .. case.kind .. " " .. case.schedule.type .. " occurrence across a slow commit",function()
                local env=h.setup("occurrence_commit")
                local start=time.now():utc():format(time.RFC3339):sub(1,17) .. "50Z"
                local parsed=time.parse(time.RFC3339,start)
                local finish=parsed:add(80*time.SECOND):format(time.RFC3339)
                local clock=start
                local original=drive.utc_now
                drive.utc_now=function() return clock end
                local ok,message=pcall(function()
                    h.new_drive({automation_id=env.automation_id,drive_key="occurrence",source_kind=case.kind,
                        action={source_ref=PORT,config={items={}},schedule=case.schedule}})
                    h.set_drive(env.automation_id,"occurrence","next_run_at=$1",{h.PAST})
                    local ready,allow,done=channel.new(1),channel.new(1),channel.new(1)
                    coroutine.spawn(function()
                        local result,err=env.run(env.automation_id,"occurrence",function(identity,target,args,opts)
                            if target == "kickside.automation:round_acquire" then ready:send(true);allow:receive() end
                            return env.run_as(identity,target,args,opts)
                        end)
                        done:send({result=result,err=err})
                    end)
                    ready:receive()
                    local db=h.db()
                    local tx=assert(db:begin())
                    local _,lock_err=tx:execute("UPDATE kickside_automation_drive SET last_round_at=last_round_at WHERE automation_id=$1 AND drive_key='occurrence'",{env.automation_id})
                    test.is_nil(lock_err,tostring(lock_err))
                    allow:send(true)
                    time.sleep("1100ms")
                    clock=finish
                    local _,commit_err=tx:commit();db:release()
                    test.is_nil(commit_err,tostring(commit_err))
                    local result=done:receive()
                    test.is_nil(result.err,tostring(result.err))
                    local expected,expected_err=claim.next_due(scheduled(case.kind,case.schedule),start)
                    test.is_nil(expected_err,tostring(expected_err))
                    test.eq(h.read_drive(env.automation_id,"occurrence").next_run_at,expected)
                    test.is_true(expected<finish,"one overlapping occurrence remains pending")
                    local seq=h.read_drive(env.automation_id,"occurrence").round_seq
                    local _,pending_err=env.run(env.automation_id,"occurrence")
                    test.is_nil(pending_err,tostring(pending_err))
                    local after=h.read_drive(env.automation_id,"occurrence")
                    test.eq(after.round_seq,seq+1)
                    test.is_true(after.next_run_at>finish,"overlapping ticks leave at most one pending occurrence")
                    local _,idle_err=env.run(env.automation_id,"occurrence")
                    test.is_nil(idle_err,tostring(idle_err))
                    test.eq(h.read_drive(env.automation_id,"occurrence").round_seq,after.round_seq,"no catch-up burst")
                end)
                drive.utc_now=original
                if not ok then error(message) end
            end)
        end

        test.it("does not immediately rearm an interval poll delayed in durable commit", function()
            local env = h.setup("cadence_commit")
            h.new_drive({ automation_id = env.automation_id, drive_key = "poll", source_kind = "collection",
                action = { source_ref = PORT, config = { items = {} }, schedule = { type = "interval", expression = "1s" } } })
            h.set_drive(env.automation_id, "poll", "next_run_at=$1", { h.PAST })

            local acquired, allow_acquire, done = channel.new(1), channel.new(1), channel.new(1)
            coroutine.spawn(function()
                local result, err = env.run(env.automation_id, "poll", function(identity: any, target: string, args: any, opts: any): (any?, any)
                    if target == "kickside.automation:round_acquire" then
                        acquired:send(true)
                        allow_acquire:receive()
                    end
                    return env.run_as(identity, target, args, opts)
                end)
                done:send({ result = result, err = err })
            end)
            acquired:receive()

            local db = h.db()
            local tx, begin_err = db:begin()
            test.is_nil(begin_err, tostring(begin_err))
            local _, lock_err = tx:execute("UPDATE kickside_automation_drive SET last_round_at=last_round_at"
                .. " WHERE automation_id=$1 AND drive_key=$2", { env.automation_id, "poll" })
            test.is_nil(lock_err, tostring(lock_err))
            allow_acquire:send(true)
            time.sleep("1100ms")
            local _, commit_err = tx:commit()
            db:release()
            test.is_nil(commit_err, tostring(commit_err))

            local finished = done:receive()
            test.is_nil(finished.err, tostring(finished.err))
            local completed = h.read_drive(env.automation_id, "poll")
            test.is_true(drive.after(completed.next_run_at, drive.utc_now()),
                "the next interval begins after the durable commit, not before its lock wait")
            test.eq(env.last_completion().options.rearm, completed.next_run_at)
            test.is_nil(completed.round_token)
        end)
    end)
end

return test.run_cases(define_tests)
