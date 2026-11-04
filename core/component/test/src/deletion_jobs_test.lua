local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local process = require("process")
local time = require("time")
local channel = require("channel")
local funcs = require("funcs")
local M = {}
local function service(owner: string): any
    local scope = assert(security.named_scope("wippy.security:process"))
    return assert(assert(contract.get("kickside.component:component_service"))
        :with_actor(security.new_actor(owner, {})):with_scope(scope):open())
end
function M.request(args: any): any
    return service(args.owner):delete({component_id = args.id, delete_options = args.options})
end
local function query(statement: string, args: any?): any
    local db = assert(sql.get("app:db"))
    local rows, err = db:query(statement, args or {})
    db:release()
    if err then error(err) end
    return rows
end
local function jobs(id: string): any
    return query("SELECT id,status,attempts,payload,priority FROM kickside_job WHERE owner_kind='component' AND owner_id=$1", {id})
end
local function pool_until(id: string, crash: boolean?)
    local pid = assert(process.spawn_monitored("kickside.core.jobs.service:worker", "app:processes", {}))
    local ok, failure = pcall(function()
        local deadline = time.now():add("20s")
        local stopped = false
        while time.now():before(deadline) do
            local rows = jobs(id)
            if crash and not stopped and #rows == 1 and rows[1].status == "running" then
                local entries = query("SELECT calls,worker_pid FROM deletion_job_cleanup WHERE component_id=$1", {id})
                if #entries == 1 and tonumber(entries[1].calls) == 1 and type(entries[1].worker_pid) == "string" then
                    local canceled, cancel_err = process.cancel(entries[1].worker_pid, "1s")
                    test.is_nil(cancel_err, tostring(cancel_err))
                    test.is_true(canceled)
                    stopped = true
                end
            end
            if #rows == 1 and rows[1].status == "done" then return end
            if #rows == 1 and rows[1].status == "dead" then error("deletion job dies: " .. tostring(rows[1].id)) end
            time.sleep("10ms")
        end
        error("deletion job does not complete")
    end)
    local canceled, cancel_err = process.cancel(pid, "2s")
    test.is_nil(cancel_err, tostring(cancel_err))
    test.is_true(canceled)
    if not ok then error(failure) end
end
local function seed(mode: string, owner: string, parent: string?): string
    local result, err = service(owner):register({impl_id = "app:deletion_jobs_binding", parent_id = parent,
        private_context = {mode = mode}})
    test.is_nil(err, tostring(err))
    test.is_true(result.success, tostring(result.error))
    local db = assert(sql.get("app:db"))
    local _, schema_err = db:execute("CREATE TABLE IF NOT EXISTS deletion_job_owned (component_id TEXT PRIMARY KEY, body TEXT NOT NULL)")
    test.is_nil(schema_err, tostring(schema_err))
    local _, insert_err = db:execute("INSERT INTO deletion_job_owned(component_id,body) VALUES ($1,$2)", {result.component_id, "owned"})
    db:release()
    test.is_nil(insert_err, tostring(insert_err))
    return result.component_id
end
M.run = test.run_cases(function()
    test.describe("Jobs component deletion", function()
        for _, mode in ipairs({"retention", "crash"}) do
            test.it("completes exclusive cleanup after " .. mode, function()
                local owner = "delete-job-" .. uuid.v4()
                local id = seed(mode, owner)
                local result, err = service(owner):delete({component_id = id, delete_options = {marker = "kept"}})
                test.is_nil(err, tostring(err))
                test.is_true(result.success, tostring(result.error))
                test.is_true(result.in_progress)
                test.is_false(result.deleted)
                test.eq(#jobs(id), 1)
                test.eq(tonumber(jobs(id)[1].priority), 0)
                test.eq(#query("SELECT component_id FROM kickside_components WHERE component_id=$1 AND deleting_at IS NOT NULL", {id}), 1)
                pool_until(id, mode == "crash")
                local calls = query("SELECT calls,actor,option_marker,remaining FROM deletion_job_cleanup WHERE component_id=$1", {id})
                test.eq(tonumber(calls[1].calls), mode == "crash" and 2 or 1)
                test.eq(calls[1].actor, "system:kickside.component.retention")
                test.eq(calls[1].option_marker, "kept")
                test.eq(tonumber(calls[1].remaining), 0)
                test.eq(#query("SELECT component_id FROM deletion_job_owned WHERE component_id=$1", {id}), 0)
                test.eq(#query("SELECT component_id FROM kickside_components WHERE component_id=$1", {id}), 0)
                test.eq(tonumber(query("SELECT COUNT(*) AS n FROM kickside_job_run WHERE job_id=$1", {jobs(id)[1].id})[1].n), mode == "crash" and 2 or 1)
            end)
        end
        test.it("deduplicates concurrent requests and retention into one job", function()
            local owner = "delete-job-" .. uuid.v4()
            local id = seed("retention", owner)
            local first = assert(process.spawn_monitored("app:deletion_jobs_request", "app:processes", {owner = owner, id = id}))
            local second = assert(process.spawn_monitored("app:deletion_jobs_request", "app:processes", {owner = owner, id = id}))
            local events, deadline = process.events(), time.after("10s")
            local seen = {}
            while not seen[tostring(first)] or not seen[tostring(second)] do
                local selected = channel.select({events:case_receive(), deadline:case_receive()})
                test.eq(selected.channel, events, "concurrent requests do not finish")
                local event = selected.value
                if event.kind == process.event.EXIT and (tostring(event.from) == tostring(first) or tostring(event.from) == tostring(second)) then
                    test.is_nil(event.result.error, tostring(event.result.error))
                    test.is_true(event.result.value.success, tostring(event.result.value.error))
                    test.is_true(event.result.value.in_progress)
                    seen[tostring(event.from)] = true
                end
            end
            local retained, retain_err = funcs.call("kickside.component:retention", {change = {owner_locator = {id = id}}})
            test.is_nil(retain_err, tostring(retain_err))
            test.is_true(retained.success, tostring(retained.error))
            test.eq(#jobs(id), 1)
            pool_until(id)
            test.eq(tonumber(query("SELECT calls FROM deletion_job_cleanup WHERE component_id=$1", {id})[1].calls), 1)
        end)
        test.it("retains the first accepted policy and options on an active deletion", function()
            local owner = "delete-job-" .. uuid.v4()
            local parent = seed("retention", owner)
            local child = seed("retention", owner, parent)
            local first, first_err = service(owner):delete({component_id = parent, child_policy = "reparent_root", delete_options = {marker = "original"}})
            test.is_nil(first_err); test.is_true(first.in_progress)
            local active, active_err = service(owner):delete({component_id = parent, delete_options = {marker = "later"}})
            test.is_nil(active_err); test.is_true(active.in_progress)
            test.eq(#jobs(parent), 1)
            pool_until(parent)
            local cleanup = query("SELECT calls,option_marker FROM deletion_job_cleanup WHERE component_id=$1", {parent})
            test.eq(tonumber(cleanup[1].calls), 1)
            test.eq(cleanup[1].option_marker, "original")
            local moved = query("SELECT parent_id FROM kickside_components WHERE component_id=$1", {child})
            test.eq(#moved, 1); test.is_nil(moved[1].parent_id)
            test.is_true(service(owner):delete({component_id = child}).in_progress)
            pool_until(child)
        end)
        test.it("rejects structural writes involving a component after deletion intent commits", function()
            local owner = "delete-job-" .. uuid.v4()
            local parent = seed("retention", owner)
            local mover = seed("retention", owner)
            test.is_true(service(owner):delete({component_id = parent}).in_progress)
            local child, create_err = service(owner):register({impl_id = "app:deletion_jobs_binding", parent_id = parent})
            test.is_nil(create_err, tostring(create_err))
            test.is_false(child.success)
            local moved, move_err = service(owner):set_placement({component_id = mover, parent_id = parent})
            test.is_nil(move_err, tostring(move_err))
            test.is_false(moved.success)
            local reordered, reorder_err = service(owner):set_placement({component_id = parent, parent_id = false})
            test.is_nil(reorder_err, tostring(reorder_err))
            test.is_false(reordered.success)
            test.eq(#jobs(parent), 1)
            pool_until(parent)
            test.is_true(service(owner):delete({component_id = mover}).in_progress)
            pool_until(mover)
        end)
        test.it("rejects authorization and preflight before enqueue", function()
            local owner = "delete-job-" .. uuid.v4()
            local id = seed("retention", owner)
            local refused, err = service("other-" .. uuid.v4()):delete({component_id = id})
            test.is_nil(err, tostring(err)); test.is_false(refused.success)
            test.eq(#jobs(id), 0)
            local child = seed("retention", owner, id)
            refused, err = service(owner):delete({component_id = id})
            test.is_nil(err, tostring(err)); test.is_false(refused.success)
            test.eq(#jobs(id), 0)
            test.eq(#query("SELECT component_id FROM kickside_components WHERE component_id=$1 AND deleting_at IS NULL", {id}), 1)
            local accepted = service(owner):delete({component_id = child})
            test.is_true(accepted.success)
            pool_until(child)
            accepted = service(owner):delete({component_id = id})
            test.is_true(accepted.success)
            pool_until(id)
        end)
    end)
end)
return M
