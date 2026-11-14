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
    local summary: table = {checked = 0, healed = 0, skipped = {}}
    local continuation: table? = nil
    repeat
        local page, err = provision.converge(
            security.new_actor("system:lifecycle", {system = true, security_groups = {}}), scope, continuation)
        test.is_nil(err)
        for _, skipped in ipairs(page.skipped) do error(skipped.reason) end
        summary.checked = summary.checked + page.checked
        summary.healed = summary.healed + page.healed
        continuation = page.continuation
    until not continuation
    return summary
end

return {run = test.run_cases(function()
    test.describe("declared projection boot convergence", function()
        test.before_each(function()
            local scope = assert(security.named_scope("wippy.security:process"))
            assert(provision.ensure_system(security.new_actor("system:lifecycle", {system = true, security_groups = {}}), scope))
            converge(scope)
        end)
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
        for _, history in ipairs({"retained", "pruned", "legacy"}) do
        for _, boot in ipairs({false, true}) do
        test.it("refreshes " .. history .. " declarations forward only/boot=" .. tostring(boot), function()
            local threads, actor, scope, id = setup(true)
            local params = {thread_id = id, kind = KIND,
                worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep", via = "thread"}}, output = {}}}
            assert(threads:register_projection(params))
            for _, event_type in ipairs({"app:threads_keep", "app:threads_skip", "app:threads_keep"}) do
                assert(threads:append_event({thread_id = id, event = {type = event_type, body = {}}}))
            end
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            local before = state(id)
            test.eq(tonumber(before.last_seq), 3)
            test.eq(tonumber(before.body.stats.count), 2)
            if history ~= "retained" then
                local db = assert(sql.get("app:db"))
                if history == "pruned" then
                    test.eq(assert(prune.prune_thread(db, id,
                        {cutoff = "2100-01-01T00:00:00Z", max_total = 1})).deleted, 1)
                else
                    before.body.declaration_status = nil
                    assert(db:execute("UPDATE kickside_projection SET body=$1,declaration_digest=NULL WHERE id=$2",
                        {assert(json.encode(before.body)), before.id}))
                end
                assert(db:release())
            end
            -- An input waiting at refresh is outside the new declaration's range too.
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_skip", body = {}}}))
            if boot then
                declare(id)
                test.is_true(converge(scope).healed >= 1)
            else
                params.ensure = true
                params.events.input[2] = {type = "app:threads_skip", via = "thread"}
                assert(threads:register_projection(params))
            end
            local refreshed = state(id)
            test.eq(#refreshed.body.events.input, 2)
            test.eq(refreshed.body.events.input[2].type, "app:threads_skip")
            test.eq(tonumber(refreshed.generation), assert(tonumber(before.generation)) + 1)
            test.eq(tonumber(refreshed.last_seq), 4)
            test.eq(tonumber(refreshed.body.stats.count), 2)
            test.eq(refreshed.body.declaration_status.revision, 2)
            test.eq(refreshed.body.declaration_status.from_seq, 5)
            local listed = assert(threads:list_projections({thread_id = id}))
            local listed_body = listed.projections[1].body
            if type(listed_body) == "string" then listed_body = assert(json.decode(listed_body)) end
            test.eq(listed_body.declaration_status.from_seq, 5)
            test.eq(listed_body.declaration_status.revision, 2)
            assert(threads:append_event({thread_id = id, event = {type = "app:threads_skip", body = {}}}))
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            local after = state(id)
            test.eq(tonumber(after.last_seq), 5)
            test.eq(tonumber(after.body.stats.count), 3, "old skipped inputs stay skipped")
            test.eq(after.body.declaration_status.from_seq, 5, "worker body preserves the marker")
            test.eq(after.id, before.id)
            test.eq(after.job_id, before.job_id)
        end)
        end
        end
        for _, changed in ipairs({false, true}) do
        test.it("keeps explicit reset replay behaviour/changed=" .. tostring(changed), function()
            local threads, actor, scope, id = setup(true)
            local params = {thread_id = id, kind = KIND,
                worker_ref = "func://app:test_count_worker", worker_input_mode = "prefetch_events",
                events = {input = {{type = "app:threads_keep"}}, output = {}}}
            assert(threads:register_projection(params))
            for _, event_type in ipairs({"app:threads_keep", "app:threads_skip", "app:threads_keep"}) do
                assert(threads:append_event({thread_id = id, event = {type = event_type, body = {}}}))
            end
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            local before = state(id)
            test.eq(tonumber(before.body.stats.count), 2)
            before.body.declaration_status = nil
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_projection SET body=$1 WHERE id=$2",
                {assert(json.encode(before.body)), before.id}))
            assert(db:release())
            params.reset = true
            if changed then params.events.input[2] = {type = "app:threads_skip"} end
            assert(threads:register_projection(params))
            test.eq(tonumber(state(id).last_seq), 0)
            test.is_nil(state(id).body.stats)
            start_pool()
            assert(threads:catch_up_projection({thread_id = id, kind = KIND, max_ticks = 5}))
            stop_pool()
            local after = state(id)
            test.eq(tonumber(after.last_seq), 3)
            test.eq(tonumber(after.body.stats.count), changed and 3 or 2)
        end)
        end
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
