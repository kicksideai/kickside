-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local security = require("security")
local contract = require("contract")
local process = require("process")
local channel = require("channel")
local time = require("time")
local provision = require("provision")
local lifecycle = require("lifecycle")
local register = require("register")
local prune = require("prune")
local writer = require("writer")
local IMPL = "app:lifecycle_convergence_kind"
local KIND = "test.lifecycle.converge"
local function scope(): any return assert(security.named_scope("wippy.security:process")) end
local function actor(): any return security.new_actor("system:lifecycle", {system = true, security_groups = {}}) end
local function create(): string
    local id = uuid.v4()
    local svc: any = assert(assert(contract.get("kickside.component:component_service")):with_actor(actor()):with_scope(scope()):open())
    local result = assert(svc:register({component_id = id, impl_id = IMPL, meta = {class = KIND}}))
    test.is_true(result.success)
    return id
end
local function state(id: string): any
    local db = assert(sql.get("app:db"))
    local rows = assert(db:query([[SELECT p.id,p.body,p.updated_at,p.declaration_digest,c.id AS cursor_id,
        c.last_seq,c.generation,c.job_id,c.status FROM kickside_projection p
        JOIN kickside_projection_cursor c ON c.projection_id=p.id AND c.cursor_key='progress'
        WHERE p.thread_id=$1 AND p.kind=$2 AND p.projection_key='custom']], {lifecycle.thread_id(id), KIND}))
    assert(db:release())
    local row: any = rows[1]
    if row then row.body = assert(json.decode(row.body)) end
    return row
end
local function converge(continuation: table?): any
    local result, err = provision.converge(actor(), scope(), continuation)
    test.is_nil(err)
    for _, skip in ipairs(result.skipped) do error(skip.reason) end
    return result
end
local function catch_up(id: string)
    local events = process.events()
    local pid = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes"))
    local deadline = time.now():add("5s")
    local caught_up = false
    repeat
        local db = assert(sql.get("app:db"))
        local head = assert(db:query("SELECT event_count FROM kickside_thread WHERE id=$1", {lifecycle.thread_id(id)}))[1]
        assert(db:release())
        caught_up = tonumber(state(id).last_seq) == tonumber(head.event_count)
        if not caught_up then time.sleep("10ms") end
    until caught_up or time.now():after(deadline)
    assert(process.cancel(pid))
    while true do
        local event = channel.select({events:case_receive()}).value
        if type(event) == "table" and tostring(event.from) == tostring(pid) and event.kind == process.event.EXIT then break end
    end
    test.is_true(caught_up, "lifecycle cursor reaches the head within five seconds")
end
return {run = test.run_cases(function()
    test.describe("bounded lifecycle declaration convergence", function()
        test.before_each(function()
            assert(provision.ensure_system(actor(), scope()))
            converge()
        end)
        test.it("keeps lifecycle-only custom declarations unchanged on repeated boots", function()
            converge()
            local id = create()
            local before = state(id)
            local db = assert(sql.get("app:db"))
            test.eq(#assert(db:query("SELECT id FROM kickside_thread WHERE id=$1", {id})), 0)
            assert(db:release())
            for _ = 1, 2 do
                local unchanged = converge()
                test.eq(unchanged.healed, 0, assert(json.encode(unchanged)))
            end
            local after = state(id)
            test.eq(after.id, before.id)
            test.eq(after.generation, before.generation)
            test.eq(after.updated_at, before.updated_at)
        end)
        for _, loss in ipairs({"projection", "cursor", "job", "job_link"}) do
            test.it("restores lifecycle-only " .. loss .. " loss with custom keys", function()
                local id = create()
                local before = state(id)
                local db = assert(sql.get("app:db"))
                assert(db:execute("UPDATE kickside_projection_cursor SET last_seq=1,status='paused' WHERE id=$1", {before.cursor_id}))
                if loss == "job" then
                    assert(db:execute("DELETE FROM kickside_job WHERE id=$1", {before.job_id}))
                elseif loss == "job_link" then
                    assert(db:execute("UPDATE kickside_projection_cursor SET job_id=NULL WHERE id=$1", {before.cursor_id}))
                else
                    assert(db:execute("DELETE FROM kickside_projection_cursor WHERE id=$1", {before.cursor_id}))
                    if loss == "projection" then assert(db:execute("DELETE FROM kickside_projection WHERE id=$1", {before.id})) end
                end
                assert(db:release())
                local repaired = converge()
                test.eq(repaired.healed, 1, assert(json.encode(repaired)))
                local after = state(id)
                test.not_nil(after)
                test.not_nil(after.job_id)
                db = assert(sql.get("app:db"))
                test.eq(#assert(db:query("SELECT id FROM kickside_job WHERE id=$1", {after.job_id})), 1)
                assert(db:release())
                if loss == "job" or loss == "job_link" then
                    if loss == "job_link" then test.eq(after.job_id, before.job_id)
                    else test.is_true(after.job_id ~= before.job_id) end
                    test.eq(after.cursor_id, before.cursor_id)
                    test.eq(after.generation, before.generation)
                    test.eq(tonumber(after.last_seq), 1)
                    test.eq(after.status, "paused")
                end
                local unchanged = converge()
                test.eq(unchanged.healed, 0, assert(json.encode(unchanged)))
            end)
        end
        for _, pruned in ipairs({false, true}) do
            test.it("refreshes lifecycle digests with " .. (pruned and "pruned" or "retained") .. " history", function()
                local id = create()
                local tid = lifecycle.thread_id(id)
                catch_up(id)
                local db = assert(sql.get("app:db"))
                assert(register.register_projection(db, tid, {kind = KIND, projection_key = "custom", cursor_key = "progress",
                    worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events", system_identity = true,
                    events = {input = {{type = "kickside.component.events:created"}}}, ensure = true}))
                assert(lifecycle.append(db, id, "updated", uuid.v4(), {}))
                assert(db:release())
                catch_up(id)
                local before = state(id)
                test.eq(tonumber(before.last_seq), 2)
                test.eq(tonumber(before.body.stats.count), 1)
                if pruned then
                    db = assert(sql.get("app:db"))
                    test.eq(assert(prune.prune_thread(db, tid, {cutoff = "2100-01-01T00:00:00Z", max_total = 1})).deleted, 1)
                    assert(db:release())
                end
                local repaired = converge()
                test.eq(repaired.healed, 1, assert(json.encode(repaired)))
                local refreshed = state(id)
                test.eq(#refreshed.body.events.input, 2)
                test.is_true(tonumber(refreshed.generation) > tonumber(before.generation))
                test.eq(refreshed.body.declaration_status.from_seq, 3)
                test.eq(tonumber(refreshed.last_seq), 2)
                catch_up(id)
                test.eq(tonumber(state(id).body.stats.count), 1)
                db = assert(sql.get("app:db"))
                assert(lifecycle.append(db, id, "updated", uuid.v4(), {}))
                assert(db:release())
                catch_up(id)
                test.eq(tonumber(state(id).body.stats.count), 2)
                local unchanged = converge()
                test.eq(unchanged.healed, 0, assert(json.encode(unchanged)))
            end)
        end
        test.it("repairs more than 256 lifecycle components through continuation pages", function()
            local ids = {}
            for _ = 1, 260 do ids[#ids + 1] = create() end
            local db = assert(sql.get("app:db"))
            for _, id in ipairs(ids) do
                assert(db:execute("UPDATE kickside_projection SET declaration_digest=NULL WHERE thread_id=$1", {lifecycle.thread_id(id)}))
            end
            assert(db:release())
            local continuation, total, turns = nil, 0, 0
            repeat
                local result = converge(continuation)
                test.is_true(result.checked <= 256)
                total = total + result.healed
                turns = turns + 1
                continuation = result.continuation
            until not continuation
            test.eq(total, 260)
            test.is_true(turns >= 2)
            for _, id in ipairs(ids) do
                test.not_nil(state(id).declaration_digest)
                db = assert(sql.get("app:db"))
                assert(writer.remove_projection(db, lifecycle.thread_id(id), {kind = KIND, projection_key = "custom"}))
                assert(db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id}))
                assert(db:release())
            end
        end)
    end)
end)}
