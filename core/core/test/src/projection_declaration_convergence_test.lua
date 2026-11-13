-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local security = require("security")
local contract = require("contract")
local process = require("process")
local channel = require("channel")
local provision = require("provision")
local prune = require("prune")
local register = require("proj_register")
local apply = require("apply")
local claim = require("claim")
local clock = require("clock")
local time = require("time")

local KIND = "test.declaration.refresh"
local IMPL = "app:projection_declaration_refresh_kind"
local worker_pid: string? = nil
local worker_events: any = nil

local function stop_pool()
    if not worker_pid then return end
    assert(process.cancel(worker_pid))
    while true do
        local event = channel.select({worker_events:case_receive()}).value
        if type(event) == "table" and tostring(event.from) == worker_pid and event.kind == process.event.EXIT then
            worker_pid, worker_events = nil, nil
            return
        end
    end
end

local function start_pool()
    worker_events = process.events()
    worker_pid = tostring(assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes")))
end

local function state(id: string): table
    local db = assert(sql.get("app:db"))
    local rows = assert(db:query([[SELECT p.id,p.body,p.declaration_digest,p.updated_at,c.generation,c.last_seq,c.job_id
        FROM kickside_projection p JOIN kickside_projection_cursor c ON c.projection_id=p.id
        WHERE p.thread_id=$1 AND p.kind=$2]], {id, KIND}))
    assert(db:release())
    local row: any = rows[1]
    row.body = assert(json.decode(row.body))
    return row
end

local function setup(plain: boolean?): (any, any, any, string)
    local actor = security.new_actor("declaration-owner-" .. uuid.v4(), {security_groups = {}})
    local scope = assert(security.named_scope("wippy.security:process"))
    local threads = assert(assert(contract.get("kickside.core:threads")):with_actor(actor):with_scope(scope):open())
    local id = uuid.v4()
    assert(threads:create({id = id, impl_id = plain and "app:projection_declaration_manual_kind" or IMPL,
        thread_class = plain and "test.declaration.manual" or nil}))
    return threads, actor, scope, id
end

local function declare(id: string, previous_shape: boolean?)
    local prior: any = previous_shape and state(id).body or nil
    local db = assert(sql.get("app:db"))
    assert(db:execute("UPDATE kickside_components SET impl_id=$1 WHERE component_id=$2", {IMPL, id}))
    assert(db:execute("UPDATE kickside_thread SET thread_class=$1 WHERE id=$2", {"test.declaration.refresh", id}))
    assert(db:execute("UPDATE kickside_component_meta SET value=$1 WHERE component_id=$2 AND key='thread_class'", {"test.declaration.refresh", id}))
    if previous_shape then
        local body: any = prior
        body.declaration_status = nil
        assert(db:execute("UPDATE kickside_projection SET body=$1 WHERE thread_id=$2 AND kind=$3", {assert(json.encode(body)), id, KIND}))
    end
    assert(db:release())
end

local function converge(scope: any): table
    local summary, err = provision.converge(
        security.new_actor("system:lifecycle", {system = true, security_groups = {}}), scope)
    test.is_nil(err)
    for _, skipped in ipairs(summary.skipped) do error(skipped.reason) end
    return summary
end

return {run = test.run_cases(function()
    test.describe("declared projection boot convergence", function()
        test.after_each(stop_pool)
        test.it("hashes declarations independent of key order and fold state", function()
            local first = assert(register.declaration_digest({meta = {worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events"},
                worker_config = {alpha = 1, nested = {left = 2, right = 3}}}))
            local second = assert(register.declaration_digest({stats = {count = 100},
                worker_config = {nested = {right = 3, left = 2}, alpha = 1},
                meta = {worker_input_mode = "prefetch_events", worker_ref = "func://app:test_count_worker"}}))
            test.eq(first, second)
            test.is_false(first == assert(register.declaration_digest({meta = {worker_ref = "func://app:test_count_worker"}})))
        end)
        test.it("fills a missing digest without refreshing an unchanged declaration", function()
            local threads, actor, scope, id = setup()
            local before = state(id)
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_projection SET declaration_digest=NULL WHERE id=$1", {before.id}))
            assert(db:release())
            converge(scope)
            local after = state(id)
            test.eq(after.declaration_digest, before.declaration_digest)
            test.eq(after.generation, before.generation)
            test.eq(after.last_seq, before.last_seq)
            test.eq(assert(json.encode(after.body)), assert(json.encode(before.body)))
            test.eq(converge(scope).checked, 0)
        end)
        for _, changed_again in ipairs({false, true}) do
        test.it("rebuilds old input without emitting its outputs again/" .. tostring(changed_again), function()
            local threads, actor, scope, id = setup(true)
            assert(threads:register_projection({thread_id = id, kind = KIND,
                worker_ref = "func://app:test_emitting_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep"}}, output = {{type = "app:threads_note"}}}}))
            for _, event_type in ipairs({"app:threads_keep", "app:threads_skip", "app:threads_keep"}) do
                assert(threads:append_event({thread_id = id, event = {type = event_type, role = "user", body = {}}}))
            end
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            stop_pool()
            test.eq(tonumber(state(id).body.count), 2, "old filter consumes two inputs")
            local function outputs(): table
                local db = assert(sql.get("app:db"))
                local rows = assert(db:query("SELECT body FROM kickside_event WHERE thread_id=$1 AND type='app:threads_note' ORDER BY seq", {id}))
                assert(db:release())
                local counts = {}
                for _, row in ipairs(rows) do
                    local n = tostring(assert(json.decode(row.body)).n)
                    counts[n] = (counts[n] or 0) + 1
                end
                return counts
            end
            test.eq(outputs()["1"], 1)
            test.eq(outputs()["3"], 1)
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_components SET impl_id=$1 WHERE component_id=$2",
                {"app:projection_declaration_emitting_kind", id}))
            assert(db:release())
            converge(scope)
            if changed_again then
                assert(threads:register_projection({thread_id = id, kind = KIND, ensure = true,
                    worker_ref = "func://app:test_emitting_worker", worker_input_mode = "prefetch_events",
                    worker_config = {revision = 2},
                    events = {input = {{type = "app:threads_keep"}, {type = "app:threads_skip"}},
                        output = {{type = "app:threads_note"}}}}))
            end
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            stop_pool()
            test.eq(tonumber(state(id).body.count), 3, "rebuilt fold includes the skipped input")
            test.eq(outputs()["1"], 1)
            test.eq(outputs()["2"], 1)
            test.eq(outputs()["3"], 1)
            test.is_nil(state(id).body.declaration_status.replay)
            assert(threads:register_projection({thread_id = id, kind = KIND, ensure = true,
                worker_ref = "func://app:test_emitting_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_skip"}}, output = {{type = "app:threads_note"}}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            stop_pool()
            assert(threads:register_projection({thread_id = id, kind = KIND, ensure = true,
                worker_ref = "func://app:test_emitting_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep"}, {type = "app:threads_skip"}},
                    output = {{type = "app:threads_note"}}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            stop_pool()
            test.eq(tonumber(state(id).body.count), 3)
            test.eq(outputs()["1"], 1, "completed declaration changes preserve output identities")
            test.eq(outputs()["2"], 1)
            test.eq(outputs()["3"], 1)
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_skip", role = "user", body = {}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            stop_pool()
            test.eq(tonumber(state(id).body.count), 4)
            test.eq(outputs()["1"], 1)
            test.eq(outputs()["2"], 1)
            test.eq(outputs()["3"], 1)
        end)
        end
        for _, explicit in ipairs({false, true}) do
        test.it("rebuilds with concurrent input and preserves explicit output identities/" .. tostring(explicit), function()
            local threads, actor, scope, id = setup(true)
            assert(threads:register_projection({thread_id = id, kind = KIND,
                worker_ref = "func://app:test_emitting_worker", worker_input_mode = "prefetch_events",
                worker_config = {explicit_identity = explicit},
                events = {input = {{type = "app:threads_keep"}}, output = {{type = "app:threads_note"}}}}))
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_keep", role = "user", body = {}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            stop_pool()
            local before = state(id)
            local db = assert(sql.get("app:db"))
            local original = assert(db:query("SELECT id FROM kickside_event WHERE thread_id=$1 AND type='app:threads_note'", {id}))[1].id
            assert(db:release())
            assert(threads:register_projection({thread_id = id, kind = KIND, ensure = true,
                worker_ref = "func://app:test_emitting_worker", worker_input_mode = "prefetch_events",
                worker_config = {explicit_identity = explicit, concurrent_input_id = uuid.v4()},
                events = {input = {{type = "app:threads_keep"}, {type = "app:threads_skip"}},
                    output = {{type = "app:threads_note"}}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            stop_pool()
            db = assert(sql.get("app:db"))
            assert(db:release())
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            stop_pool()
            db = assert(sql.get("app:db"))
            local counts = assert(db:query([[SELECT type,COUNT(*) AS n FROM kickside_event
                WHERE thread_id=$1 GROUP BY type]], {id}))
            local originals = assert(db:query("SELECT id FROM kickside_event WHERE id=$1", {original}))
            assert(db:release())
            local by_type: any = {}
            for _, row in ipairs(counts) do by_type[row.type] = tonumber(row.n) end
            test.eq(by_type["app:threads_note"], 2, "in-flight input emits once without duplicating old output")
            test.eq(by_type["app:threads_skip"], 1)
            test.eq(#originals, 1, "the original output identity remains")
            test.eq(tonumber(state(id).body.count), 2)
            if explicit then
                local db = assert(sql.get("app:db"))
                local input_id = assert(db:query("SELECT id FROM kickside_event WHERE thread_id=$1 AND seq=1", {id}))[1].id
                assert(db:release())
                test.eq(original, assert(uuid.v5(before.id, input_id)), "explicit identity is unchanged")
            end
        end)
        end
        test.it("refreshes an earlier declaration and folds retained newly accepted events", function()
            local threads, actor, scope, id = setup(true)
            assert(threads:register_projection({thread_id = id, kind = KIND,
                worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep", via = "thread"}}, output = {}}}))
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_keep", role = "user", body = {}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            test.eq(tonumber(state(id).body.stats.count), 1)
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_skip", role = "user", body = {}}}))
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_keep", role = "user", body = {}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            local before = state(id)
            test.eq(tonumber(before.last_seq), 3)
            test.eq(tonumber(before.body.stats.count), 2)
            declare(id)
            local summary = converge(scope)
            test.is_true(summary.healed >= 1)
            local refreshed = state(id)
            test.eq(#refreshed.body.events.input, 2)
            test.eq(refreshed.body.events.input[2].type, "app:threads_skip")
            test.eq(tonumber(refreshed.generation), assert(tonumber(before.generation)) + 1)
            test.eq(tonumber(refreshed.last_seq), 0)
            test.is_nil(refreshed.body.stats)
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            test.eq(tonumber(state(id).body.stats.count), 3)
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_skip", role = "user", body = {}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            local after = state(id)
            test.eq(tonumber(after.last_seq), 4)
            test.eq(tonumber(after.body.stats.count), 4)
            test.eq(after.id, before.id)
            test.eq(after.job_id, before.job_id)
        end)
        test.it("delivers skipped retained events through the existing declaration refresh path", function()
            local threads, actor, scope, id = setup(true)
            assert(threads:register_projection({thread_id = id, kind = KIND,
                worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep", via = "thread"}}, output = {}}}))
            for _, kind in ipairs({"app:threads_keep", "app:threads_skip", "app:threads_keep"}) do
                assert(threads:append_event({thread_id = id, event = {type = kind, role = "user", body = {}}}))
            end
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            local before = state(id)
            test.eq(tonumber(before.last_seq), 3)
            test.eq(tonumber(before.body.stats.count), 2)
            assert(threads:register_projection({thread_id = id, kind = KIND, ensure = true,
                worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep", via = "thread"},
                    {type = "app:threads_skip", via = "thread"}}, output = {}}}))
            local refreshed = state(id)
            test.eq(#refreshed.body.events.input, 2)
            test.eq(tonumber(refreshed.generation), assert(tonumber(before.generation)) + 1)
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            test.eq(tonumber(state(id).body.stats.count), 3)
        end)
        test.it("preserves a pruned fold and exposes the forward-only declaration revision", function()
            local threads, actor, scope, id = setup(true)
            assert(threads:register_projection({thread_id = id, kind = KIND,
                worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep", via = "thread"}}, output = {}}}))
            for _, kind in ipairs({"app:threads_keep", "app:threads_skip", "app:threads_keep"}) do
                assert(threads:append_event({thread_id = id, event = {type = kind, role = "user", body = {}}}))
            end
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            local before = state(id)
            test.eq(tonumber(before.body.stats.count), 2)
            local db = assert(sql.get("app:db"))
            local pruned = assert(prune.prune_thread(db, id, {cutoff = "2100-01-01T00:00:00Z", max_total = 1}))
            assert(db:release())
            test.eq(pruned.deleted, 1)
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_skip", role = "user", body = {}}}))
            declare(id)
            converge(scope)
            local refreshed = state(id)
            test.eq(#refreshed.body.events.input, 2)
            test.eq(tonumber(refreshed.generation), assert(tonumber(before.generation)) + 1)
            test.eq(tonumber(refreshed.last_seq), 4)
            test.eq(tonumber(refreshed.body.stats.count), 2)
            local listed = assert(threads:list_projections({thread_id = id}))
            local body = listed.projections[1].body
            if type(body) == "string" then body = assert(json.decode(body)) end
            test.eq(body.declaration_status.revision, 2)
            test.eq(body.declaration_status.from_seq, 5)
            test.eq(body.declaration_status.reason, "history pruned")
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_skip", role = "user", body = {}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            test.eq(tonumber(state(id).body.stats.count), 3)
            test.eq(state(id).body.declaration_status.reason, "history pruned")
            local stable = state(id)
            test.eq(converge(scope).healed, 0)
            test.eq(state(id).generation, stable.generation)
            test.eq(state(id).body.declaration_status.revision, 2)
        end)
        test.it("preserves a fold when a destination prunes its emitted outputs", function()
            local threads, actor, scope, id = setup(true)
            local downstream, _, _, destination = setup(true)
            assert(threads:register_projection({thread_id = id, kind = KIND,
                worker_ref = "func://app:test_emitting_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep"}}, output = {{type = "app:threads_note"}}}}))
            assert(downstream:register_projection({thread_id = destination, kind = KIND,
                worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_note"}}, output = {}}}))
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_keep",
                role = "user", body = {destination = destination}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            assert(downstream:catch_up_projection({thread_id = destination, kind = KIND, max_ticks = 10}))
            stop_pool()
            test.eq(tonumber(state(destination).body.stats.count), 1)
            local db = assert(sql.get("app:db"))
            test.eq(assert(prune.prune_thread(db, destination,
                {cutoff = "2100-01-01T00:00:00Z", max_total = 1})).deleted, 1)
            test.eq(#assert(db:query("SELECT id FROM kickside_event WHERE thread_id=$1", {destination})), 0)
            test.eq(#assert(db:query("SELECT id FROM kickside_event WHERE thread_id=$1", {id})), 1)
            assert(db:execute("UPDATE kickside_components SET impl_id=$1 WHERE component_id=$2",
                {"app:projection_declaration_emitting_kind", id}))
            assert(db:release())
            converge(scope)
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            assert(downstream:catch_up_projection({thread_id = destination, kind = KIND, max_ticks = 10}))
            stop_pool()
            test.eq(tonumber(state(destination).body.stats.count), 1, "pruned outputs do not reach downstream twice")
            test.eq(tonumber(state(id).body.count), 1)
            test.eq(state(id).body.declaration_status.reason, "outputs pruned")
            test.eq(state(id).body.declaration_status.from_seq, 2)
        end)
        test.it("abandons an approved rebuild when its destination prunes before replay", function()
            local threads, actor, scope, id = setup(true)
            local downstream, _, _, destination = setup(true)
            assert(threads:register_projection({thread_id = id, kind = KIND,
                worker_ref = "func://app:test_emitting_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep"}}, output = {{type = "app:threads_note"}}}}))
            assert(downstream:register_projection({thread_id = destination, kind = KIND,
                worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_note"}}, output = {}}}))
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_keep",
                role = "user", body = {destination = destination}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            assert(downstream:catch_up_projection({thread_id = destination, kind = KIND, max_ticks = 10}))
            stop_pool()
            test.eq(tonumber(state(destination).body.stats.count), 1)
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_components SET impl_id=$1 WHERE component_id=$2",
                {"app:projection_declaration_emitting_kind", id}))
            assert(db:release())
            converge(scope)
            test.eq(tonumber(state(id).last_seq), 0, "retained history approves rebuilding")
            test.is_nil(state(id).body.declaration_status.reason)
            db = assert(sql.get("app:db"))
            test.eq(assert(prune.prune_thread(db, destination,
                {cutoff = "2100-01-01T00:00:00Z", max_total = 1})).deleted, 1)
            test.eq(#assert(db:query("SELECT id FROM kickside_event WHERE thread_id=$1", {destination})), 0)
            test.eq(#assert(db:query("SELECT id FROM kickside_event WHERE thread_id=$1", {id})), 1)
            assert(db:release())
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            assert(downstream:catch_up_projection({thread_id = destination, kind = KIND, max_ticks = 10}))
            stop_pool()
            test.eq(tonumber(state(destination).body.stats.count), 1, "pruned outputs do not reach downstream twice")
            test.eq(state(id).body.declaration_status.reason, "outputs pruned during rebuild")
            test.eq(state(id).body.declaration_status.from_seq, 2)
            test.eq(tonumber(state(id).last_seq), 1)
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_skip",
                body = {destination = destination}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            assert(downstream:catch_up_projection({thread_id = destination, kind = KIND, max_ticks = 10}))
            stop_pool()
            test.eq(tonumber(state(destination).body.stats.count), 2, "forward-only refresh emits later inputs")
            test.eq(state(id).body.declaration_status.reason, "outputs pruned during rebuild")
        end)
        test.it("merges destination proofs from the current row across two cursor snapshots", function()
            local threads, actor, scope, id = setup(true)
            local destination, other = uuid.v4(), uuid.v4()
            for _, target in ipairs({destination, other}) do
                assert(threads:create({id = target, impl_id = "app:projection_declaration_manual_kind",
                    thread_class = "test.declaration.manual"}))
            end
            local params = {thread_id = id, kind = KIND,
                worker_ref = "func://app:test_emitting_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep"}}, output = {{type = "app:threads_note"}}}}
            local first = assert(threads:register_projection(params))
            for _, target in ipairs({destination, other}) do
                assert(threads:append_event({thread_id = id, event = {type = "app:threads_keep",
                    body = {destination = target}}}))
            end
            params.cursor_key, params.start_seq, params.ensure = "second", 1, true
            local second = assert(threads:register_projection(params))
            local function load(cursor_id: string): (table, table)
                local db = assert(sql.get("app:db"))
                local dialect = assert(db:type())
                local row = assert(db:query([[SELECT c.*,p.body,p.kind FROM kickside_projection_cursor c
                    JOIN kickside_projection p ON p.id=c.projection_id WHERE c.id=$1]], {cursor_id}))[1]
                row.body = assert(json.decode(row.body))
                local tx = assert(db:begin())
                local token = uuid.v7()
                local leased = assert(claim.lease_row(tx, dialect, row.job_id, token,
                    clock.format(time.now():add("1m"), dialect), clock.now(dialect)))
                assert(tx:commit())
                assert(db:release())
                return row, {id = row.job_id, lease_token = token, execution_seq = leased.execution_seq}
            end
            local one, job_one = load(first.projection.cursor_id)
            local two, job_two = load(second.projection.cursor_id)
            local db = assert(sql.get("app:db"))
            local inputs = assert(db:query("SELECT id FROM kickside_event WHERE thread_id=$1 ORDER BY seq", {id}))
            assert(db:release())
            local writes = {}
            for index, target in ipairs({destination, other}) do
                local prepared = assert(apply.append_writes({append_events = {{thread_id = target,
                    event = {type = "app:threads_note", body = {}}}}}, id, one.body, one.projection_id, inputs[index].id))
                writes[#writes + 1] = prepared[1]
            end
            assert(apply.advance("app:db", job_one, one, 2, {body = {count = 2}, append_events = writes}))
            assert(apply.advance("app:db", job_two, two, 2, {body = {count = 1}, append_events = {writes[2]}}))
            local history = state(id).body.declaration_status.output_history
            test.eq(history.destinations[destination], 1, "second snapshot does not erase the first destination")
            test.eq(history.destinations[other], 1, "deduplication preserves the earliest sequence")
            db = assert(sql.get("app:db"))
            test.eq(assert(prune.prune_thread(db, destination,
                {cutoff = "2100-01-01T00:00:00Z", max_total = 1})).deleted, 1)
            assert(db:execute("UPDATE kickside_components SET impl_id=$1 WHERE component_id=$2",
                {"app:projection_declaration_emitting_kind", id}))
            assert(db:release())
            converge(scope)
            test.eq(state(id).body.declaration_status.reason, "outputs pruned")
        end)
        test.it("keeps an existing fold forward only without destination history proof", function()
            local threads, actor, scope, id = setup(true)
            assert(threads:register_projection({thread_id = id, kind = KIND,
                worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep"}}, output = {}}}))
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_keep", body = {}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            stop_pool()
            local before = state(id)
            before.body.declaration_status.output_history = nil
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_projection SET body=$1 WHERE id=$2",
                {assert(json.encode(before.body)), before.id}))
            assert(db:release())
            declare(id)
            converge(scope)
            local after = state(id)
            test.eq(after.body.declaration_status.reason, "output history unknown")
            test.eq(after.body.declaration_status.from_seq, 2)
            test.eq(tonumber(after.body.stats.count), 1)
            test.eq(tonumber(after.last_seq), 1)
            test.eq(converge(scope).healed, 0)
        end)
        test.it("bounds destination history and preserves overflow across declaration changes", function()
            local threads, actor, scope, id = setup(true)
            assert(threads:register_projection({thread_id = id, kind = KIND,
                worker_ref = "func://app:test_emitting_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep"}}, output = {{type = "app:threads_note"}}}}))
            for _ = 1, 64 do
                local destination = uuid.v4()
                assert(threads:create({id = destination, impl_id = "app:projection_declaration_manual_kind",
                    thread_class = "test.declaration.manual"}))
                assert(threads:append_event({thread_id = id, event = {type = "app:threads_keep",
                    body = {destination = destination}}}))
            end
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            stop_pool()
            local before = state(id)
            local count = 0
            for _ in pairs(before.body.declaration_status.output_history.destinations) do count = count + 1 end
            test.eq(count, 64)
            test.is_false(before.body.declaration_status.output_history.overflow)
            assert(threads:register_projection({thread_id = id, kind = KIND, ensure = true,
                worker_ref = "func://app:test_emitting_worker", worker_input_mode = "prefetch_events",
                worker_config = {revision = 2},
                events = {input = {{type = "app:threads_keep"}}, output = {{type = "app:threads_note"}}}}))
            test.is_nil(state(id).body.declaration_status.reason, "64 retained destinations permit rebuild")
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            stop_pool()
            local overflow_destination = uuid.v4()
            assert(threads:create({id = overflow_destination, impl_id = "app:projection_declaration_manual_kind",
                thread_class = "test.declaration.manual"}))
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_keep",
                body = {destination = overflow_destination}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 10}))
            stop_pool()
            local history = state(id).body.declaration_status.output_history
            count = 0
            for _ in pairs(history.destinations) do count = count + 1 end
            test.eq(count, 64)
            test.is_true(history.overflow)
            for revision = 3, 4 do
                assert(threads:register_projection({thread_id = id, kind = KIND, ensure = true,
                    worker_ref = "func://app:test_emitting_worker", worker_input_mode = "prefetch_events",
                    worker_config = {revision = revision},
                    events = {input = {{type = "app:threads_keep"}}, output = {{type = "app:threads_note"}}}}))
                local after = state(id)
                test.eq(after.body.declaration_status.reason, "output destinations overflow")
                test.eq(after.body.declaration_status.from_seq, 66)
                test.is_true(after.body.declaration_status.output_history.overflow)
                test.eq(tonumber(after.body.count), 65)
            end
        end)
        test.it("refreshes a legacy projection with an unknown start forward only", function()
            local threads, actor, scope, id = setup(true)
            for _ = 1, 3 do
                assert(threads:append_event({thread_id = id, event = {type = "app:threads_keep", role = "user", body = {}}}))
            end
            assert(threads:register_projection({thread_id = id, kind = KIND, start_seq = 2,
                worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep", via = "thread"}}, output = {}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            test.eq(tonumber(state(id).body.stats.count), 1)
            declare(id, true)
            converge(scope)
            local refreshed = state(id)
            test.eq(tonumber(refreshed.last_seq), 3)
            test.eq(tonumber(refreshed.body.stats.count), 1)
            test.eq(refreshed.body.declaration_status.reason, "history start unknown")
            test.eq(refreshed.body.declaration_status.from_seq, 4)
            test.is_nil(refreshed.body.declaration_status.start_seq)
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_skip", role = "user", body = {}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            test.eq(tonumber(state(id).body.stats.count), 2)
            test.eq(converge(scope).healed, 0)
        end)
        test.it("rebuilds from a projection's own start when earlier thread history is pruned", function()
            local threads, actor, scope, id = setup(true)
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_keep", role = "user", body = {}}}))
            local db = assert(sql.get("app:db"))
            test.eq(assert(prune.prune_thread(db, id, {cutoff = "2100-01-01T00:00:00Z", max_total = 1})).deleted, 1)
            assert(db:release())
            assert(threads:register_projection({thread_id = id, kind = KIND, start_seq = 1,
                worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep", via = "thread"}}, output = {}}}))
            for _, kind in ipairs({"app:threads_keep", "app:threads_skip"}) do
                assert(threads:append_event({thread_id = id, event = {type = kind, role = "user", body = {}}}))
            end
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            test.eq(tonumber(state(id).body.stats.count), 1)
            declare(id)
            converge(scope)
            test.eq(tonumber(state(id).last_seq), 1)
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            test.eq(tonumber(state(id).body.stats.count), 2)
            test.is_nil(state(id).body.declaration_status.reason)
        end)
        test.it("leaves unchanged declarations and folds untouched across repeated boot convergence", function()
            local threads, actor, scope, id = setup()
            declare(id, true)
            local before = state(id)
            converge(scope)
            converge(scope)
            local after = state(id)
            test.eq(after.id, before.id)
            test.eq(after.job_id, before.job_id)
            test.eq(after.generation, before.generation)
            test.eq(after.last_seq, before.last_seq)
            test.eq(after.updated_at, before.updated_at)
            test.eq(assert(json.encode(after.body)), assert(json.encode(before.body)))
        end)
    end)
end)}
