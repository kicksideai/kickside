-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local process = require("process")
local time = require("time")
local channel = require("channel")
local funcs = require("funcs")
local deletion_worker = require("deletion_worker")
local component = require("component")
local registry = require("registry")
local M = {}
local function service(owner: string): any
    local scope = assert(security.named_scope("wippy.security:process"))
    return assert(assert(contract.get("kickside.component:component_service"))
        :with_actor(security.new_actor(owner, {})):with_scope(scope):open())
end
local function member_scope(no_reader: boolean?)
    local policies, seen = {}, {}
    local function include(policy_id)
        if seen[policy_id] then return end
        seen[policy_id] = true
        local entry = assert(registry.get(policy_id))
        policies[#policies + 1] = assert(security.policy(policy_id))
        for _, child in ipairs(entry.meta.includes or {}) do include(child) end
    end
    if no_reader then
        policies[#policies + 1] = assert(security.policy("app:deletion_member_components"))
        include("kickside.component.security:module_runtime")
        policies[#policies + 1] = assert(security.policy("kickside.core.jobs.security:module_access"))
        policies[#policies + 1] = assert(security.policy("app:deletion_member_jobs"))
    else
        include("kickside.component.security:module_access")
        include("kickside.core.jobs.security:module_access")
    end
    policies[#policies + 1] = assert(security.policy("kickside.component:retention_db_access"))
    policies[#policies + 1] = assert(security.policy("app:deletion_member_binding"))
    local scope = assert(security.new_scope(policies))
    return scope
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
    -- Cancellation only requests the drain; the next case enqueues its own job
    -- and needs the pool gone, so wait for the pool's monitored exit.
    local events = process.events()
    local canceled, cancel_err = process.cancel(pid, "2s")
    test.is_nil(cancel_err, tostring(cancel_err))
    test.is_true(canceled)
    local exit_deadline = time.after("10s")
    while true do
        local selected = channel.select({events:case_receive(), exit_deadline:case_receive()})
        test.eq(selected.channel, events, "job worker pool does not exit after cancellation")
        local event = selected.value
        if event.kind == process.event.EXIT and tostring(event.from) == tostring(pid) then
            test.is_nil(event.result and event.result.error, tostring(event.result and event.result.error))
            break
        end
    end
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
        test.it("accepts DELETE grants without caller policy reader authority", function()
            local owner = "delete-job-" .. uuid.v4()
            local member = "delete-member-" .. uuid.v4()
            local id = seed("retention", owner)
            local actor = security.new_actor(member, {})
            local scope = member_scope(true)
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.core.jobs.policy:settings_overrides"), "undefined")
            for _, resource in ipairs({"kickside.settings:settings", "kickside.settings:settings_binding", "get_namespace"}) do
                for _, action in ipairs({"registry.get", "contract.get", "contract.open", "contract.call"}) do
                    test.eq(scope:evaluate(actor, action, resource), "undefined")
                end
            end
            test.eq(scope:evaluate(actor, "registry.get", "kickside.component:delete_worker"), "undefined")
            local caller = funcs.new():with_actor(actor):with_scope(scope)
            local denied, deny_err = caller:call("kickside.component.binding:delete_component_func", {component_id = id})
            test.is_nil(deny_err, tostring(deny_err))
            test.is_false(denied.success)
            test.eq(denied.kind, errors.PERMISSION_DENIED)
            test.eq(#jobs(id), 0)
            local db = assert(sql.get("app:db"))
            assert(db:execute("INSERT INTO kickside_component_access (access_id,component_id,source_component_id,subject_id,subject_type,access_mask,created_at) VALUES ($1,$2,$3,$4,'user',$5,0)",
                {uuid.v7(), id, id, member, 4}))
            assert(db:release())
            local accepted, accept_err = caller:call("kickside.component.binding:delete_component_func", {component_id = id})
            test.is_nil(accept_err, tostring(accept_err))
            test.is_true(accepted.success, tostring(accepted.error))
            test.is_true(accepted.in_progress)
            test.is_nil(accepted.notification_error, tostring(accepted.notification_error))
            test.eq(accepted.job_id, jobs(id)[1].id)
            test.eq(scope:evaluate(actor, "registry.get", "kickside.component:delete_worker"), "undefined")
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.core.jobs.policy:settings_overrides"), "undefined")
            pool_until(id)
        end)
        test.it("enrolls legacy deletion marks without caller policy reader authority", function()
            local owner = "delete-job-" .. uuid.v4()
            local id = seed("retention", owner)
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_components SET deleting_at=$1 WHERE component_id=$2", {time.now():utc():format_rfc3339(), id}))
            assert(db:release())
            local actor = security.new_actor(owner, {})
            local scope = member_scope(true)
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.core.jobs.policy:settings_overrides"), "undefined")
            local result, err = funcs.new():with_actor(actor):with_scope(scope):call("kickside.component:retention", {change = {owner_locator = {id = id}}})
            test.is_nil(err, tostring(err))
            test.is_true(result.success, tostring(result.error))
            test.eq(#jobs(id), 1)
            pool_until(id)
        end)
        for _, mode in ipairs({"retention", "crash"}) do
            test.it("completes exclusive cleanup after " .. mode, function()
                local owner = "delete-job-" .. uuid.v4()
                local id = seed(mode, owner)
                local result, err = service(owner):delete({component_id = id, delete_options = {marker = "kept"}})
                test.is_nil(err, tostring(err))
                test.is_true(result.success, tostring(result.error))
                test.is_true(result.in_progress)
                test.is_false(result.deleted)
                test.eq(result.job_id, jobs(id)[1].id)
                local visible = service(owner):get({component_id = id})
                test.not_nil(visible.deleting_at)
                test.eq(visible.deletion_job_id, result.job_id)
                test.eq(visible.deletion_job.status, "pending")
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
        test.it("projects deletion state through every reader and access context", function()
            local owner = "delete-job-" .. uuid.v4()
            local id = seed("retention", owner)
            local accepted = service(owner):delete({component_id = id})
            test.eq(type(accepted.job_id), "string")
            local access = service(owner):get_access_context({component_id = id})
            test.not_nil(access.deleting_at); test.eq(access.deletion_job_id, accepted.job_id)
            local readers = {
                service(owner):list({filter = {component_ids = {id}}}),
                service(owner):query({component_ids = {id}}),
                service(owner):list_children({}),
            }
            for _, response in ipairs(readers) do
                test.not_nil(response.components)
                local found = false
                for _, row in ipairs(response.components) do
                    if row.component_id == id then
                        found = true; test.not_nil(row.deleting_at); test.eq(row.deletion_job_id, accepted.job_id)
                    end
                end
                test.is_true(found, "marked component remains listed")
            end
            local rows = assert(component.list_system({component_ids = {id}}))
            test.not_nil(rows[1].deleting_at); test.eq(rows[1].deletion_job_id, accepted.job_id)
            local hidden = service("other-" .. uuid.v4()):get({component_id = id})
            test.is_false(hidden.success); test.is_nil(hidden.deletion_job)
            pool_until(id)
        end)
        for _, method in ipairs({"set_meta", "update", "delete"}) do
            test.it("preserves owned notification authority for member " .. method, function()
                local owner = "delete-job-" .. uuid.v4()
                local id = seed("retention", owner)
                local svc = assert(assert(contract.get("kickside.component:component_service"))
                    :with_actor(security.new_actor(owner, {})):with_scope(member_scope()):open())
                local request = {component_id = id}
                if method == "set_meta" then request.fields = {title = "Updated"}
                elseif method == "update" then request.commands = {{type = "SET_META", payload = {fields = {title = "Updated"}}}} end
                local result, err = svc[method](svc, request)
                test.is_nil(err, tostring(err)); test.is_true(result.success, tostring(result.error))
                test.is_nil(result.notification_error, tostring(result.notification_error))
                if method ~= "delete" then test.is_true(service(owner):delete({component_id = id}).success) end
                pool_until(id)
            end)
        end
        test.it("exposes deletion progress to members only with component READ", function()
            local owner = "delete-job-" .. uuid.v4()
            local reader = "delete-reader-" .. uuid.v4()
            local writer = "delete-writer-" .. uuid.v4()
            local id = seed("retention", owner)
            local db = assert(sql.get("app:db"))
            for _, grant in ipairs({{reader, 1}, {writer, 2}}) do
                assert(db:execute("INSERT INTO kickside_component_access (access_id,component_id,source_component_id,subject_id,subject_type,access_mask,created_at) VALUES ($1,$2,$3,$4,'user',$5,0)",
                    {uuid.v7(), id, id, grant[1], grant[2]}))
            end
            assert(db:release())
            local accepted = service(owner):delete({component_id = id})
            local scope = member_scope()
            local function get(actor)
                local svc = assert(assert(contract.get("kickside.component:component_service"))
                    :with_actor(security.new_actor(actor, {})):with_scope(scope):open())
                local result, err = svc:get({component_id = id})
                test.is_nil(err, tostring(err))
                return result
            end
            local visible = get(reader)
            test.is_true(visible.success, tostring(visible.error))
            test.eq(visible.deletion_job_id, accepted.job_id)
            test.eq(visible.deletion_job.status, "pending")
            for _, actor in ipairs({writer, "ungranted-" .. uuid.v4()}) do
                local hidden = get(actor)
                test.is_false(hidden.success); test.is_nil(hidden.deletion_job_id); test.is_nil(hidden.deletion_job)
            end
            pool_until(id)
        end)
        test.it("preserves terminal failure until an authorized explicit retry", function()
            local owner = "delete-job-" .. uuid.v4()
            local id = seed("dead_once", owner)
            local accepted = service(owner):delete({component_id = id, delete_options = {marker = "original"}})
            local _, failure = deletion_worker.run(id)
            test.not_nil(failure)
            test.eq(jobs(id)[1].status, "dead")
            local visible = service(owner):get({component_id = id})
            test.not_nil(visible.deleting_at); test.eq(visible.deletion_job_id, accepted.job_id)
            test.eq(visible.deletion_job.status, "dead")
            test.eq(visible.deletion_job.attempts, 1)
            test.not_nil(visible.deletion_job.last_error)
            for _ = 1, 2 do
                local retained, err = funcs.call("kickside.component:retention", {change = {owner_locator = {id = id}}})
                test.is_nil(err); test.is_true(retained.success)
                local ok, pending = component.system_delete(id, "reparent_root")
                test.is_false(ok); test.not_nil(pending)
            end
            test.eq(#jobs(id), 1, "maintenance cannot restart a dead job")
            local refused = service("other-" .. uuid.v4()):delete({component_id = id})
            test.is_false(refused.success); test.eq(#jobs(id), 1)
            local retried = service(owner):delete({component_id = id, delete_options = {marker = "replacement"}})
            test.is_true(retried.success); test.is_false(retried.deleted)
            test.eq(type(retried.job_id), "string"); test.is_true(retried.job_id ~= accepted.job_id)
            test.eq(service(owner):get({component_id = id}).deletion_job_id, retried.job_id)
            local result, retry_err = deletion_worker.run(id)
            test.is_nil(retry_err); test.is_true(result.deleted)
            test.eq(query("SELECT option_marker FROM deletion_job_cleanup WHERE component_id=$1", {id})[1].option_marker, "original")
        end)
        test.it("continues successful bounded pages without failure attempts", function()
            local owner = "delete-job-" .. uuid.v4()
            local id = seed("retention", owner)
            local db = assert(sql.get("app:db"))
            for _ = 1, 125 do
                assert(db:execute("INSERT INTO kickside_component_access (access_id,component_id,source_component_id,subject_id,subject_type,access_mask) VALUES ($1,$2,$3,$4,'user',1)", {uuid.v4(), id, id, "reader-" .. uuid.v4()}))
            end
            assert(db:release())
            local children = {}
            for _ = 1, 5 do children[#children + 1] = seed("retention", owner, id) end
            test.is_true(service(owner):delete({component_id = id, child_policy = "reparent_root"}).success)
            for page = 1, 6 do
                local result, err = deletion_worker.run(id)
                test.is_nil(err, tostring(err))
                if page < 6 then
                    test.eq(type(result.rearm), "string")
                    test.eq(jobs(id)[1].status, "pending")
                    test.eq(tonumber(jobs(id)[1].attempts), 0)
                else test.is_true(result.deleted) end
            end
            for _, child in ipairs(children) do
                test.is_true(service(owner):delete({component_id = child}).success)
                test.is_true(deletion_worker.run(child).deleted)
            end
        end)
        test.it("accepts a children-first subtree and waits before parent cleanup", function()
            local owner = "delete-job-" .. uuid.v4()
            local parent = seed("retention", owner)
            local child = seed("retention", owner, parent)
            test.is_true(service(owner):delete({component_id = child}).success)
            test.is_true(service(owner):delete({component_id = parent}).success)
            for _ = 1, 5 do
                local before = time.now()
                local waiting, err = deletion_worker.run(parent)
                test.is_nil(err, tostring(err))
                test.is_false(waiting.deleted)
                test.is_true(assert(time.parse(time.RFC3339, waiting.rearm)):after(before))
                test.eq(tonumber(jobs(parent)[1].attempts), 0)
                test.eq(#query("SELECT component_id FROM deletion_job_owned WHERE component_id=$1", {parent}), 1)
                test.is_true(service(owner):get({component_id = parent}).success)
                test.eq(query("SELECT parent_id FROM kickside_components WHERE component_id=$1", {child})[1].parent_id, parent)
            end
            pool_until(parent)
            test.eq(#query("SELECT component_id FROM kickside_components WHERE component_id IN ($1,$2)", {parent, child}), 0)
            test.eq(tonumber(query("SELECT calls FROM deletion_job_cleanup WHERE component_id=$1", {parent})[1].calls), 1)
        end)
        test.it("waits through child cleanup pages and preserves the first ordinary intent", function()
            local owner = "delete-job-" .. uuid.v4()
            local parent = seed("retention", owner)
            local child = seed("pages", owner, parent)
            test.is_true(service(owner):delete({component_id = child}).success)
            test.is_true(service(owner):delete({component_id = parent}).success)
            test.is_true(service(owner):delete({component_id = parent, child_policy = "reparent_root"}).success)
            for _ = 1, 5 do
                test.eq(type(deletion_worker.run(child).rearm), "string")
                local waiting, err = deletion_worker.run(parent)
                test.is_nil(err, tostring(err)); test.eq(type(waiting.rearm), "string")
                test.eq(tonumber(jobs(parent)[1].attempts), 0)
                test.eq(query("SELECT parent_id FROM kickside_components WHERE component_id=$1", {child})[1].parent_id, parent)
                test.eq(#query("SELECT component_id FROM deletion_job_owned WHERE component_id=$1", {parent}), 1)
            end
            test.is_true(deletion_worker.run(child).deleted)
            test.is_true(deletion_worker.run(parent).deleted)
        end)
        test.it("waits for a dead child without retrying either job", function()
            local owner = "delete-job-" .. uuid.v4()
            local parent = seed("retention", owner)
            local child = seed("dead_once", owner, parent)
            local accepted = service(owner):delete({component_id = child})
            local _, child_err = deletion_worker.run(child)
            test.not_nil(child_err)
            test.is_true(service(owner):delete({component_id = parent}).success)
            test.eq(#jobs(child), 1, "parent acceptance cannot retry a dead child")
            local waiting, err = deletion_worker.run(parent)
            test.is_nil(err, tostring(err)); test.eq(type(waiting.rearm), "string")
            test.eq(jobs(parent)[1].status, "pending")
            test.eq(tonumber(jobs(parent)[1].attempts), 0)
            test.eq(#query("SELECT component_id FROM deletion_job_owned WHERE component_id=$1", {parent}), 1)
            local retried = service(owner):delete({component_id = child})
            test.is_true(retried.job_id ~= accepted.job_id)
            test.eq(#jobs(parent), 1)
            local waiting, wait_err = deletion_worker.run(parent)
            test.is_nil(wait_err, tostring(wait_err)); test.eq(type(waiting.rearm), "string")
            test.is_true(deletion_worker.run(child).deleted)
            test.is_true(deletion_worker.run(parent).deleted)
        end)
        for _, status in ipairs({"done", "cancelled", "missing"}) do
            test.it("does not treat a " .. status .. " child job as row absence", function()
                local owner = "delete-job-" .. uuid.v4()
                local parent = seed("retention", owner)
                local child = seed("retention", owner, parent)
                local accepted = service(owner):delete({component_id = child})
                test.is_true(service(owner):delete({component_id = parent}).success)
                local db = assert(sql.get("app:db"))
                if status == "missing" then
                    assert(db:execute("DELETE FROM kickside_job WHERE id=$1", {accepted.job_id}))
                else
                    assert(db:execute("UPDATE kickside_job SET status=$1 WHERE id=$2", {status, accepted.job_id}))
                end
                assert(db:release())
                local waiting, err = deletion_worker.run(parent)
                test.is_nil(err, tostring(err)); test.eq(type(waiting.rearm), "string")
                test.eq(jobs(parent)[1].status, "pending")
                test.eq(tonumber(jobs(parent)[1].attempts), 0)
                test.eq(#query("SELECT component_id FROM kickside_components WHERE component_id=$1", {child}), 1)
                test.eq(#query("SELECT component_id FROM deletion_job_owned WHERE component_id=$1", {parent}), 1)
                test.is_true(service(owner):delete({component_id = child}).success)
                test.is_true(deletion_worker.run(child).deleted)
                test.eq(#jobs(parent), 1)
                test.is_true(deletion_worker.run(parent).deleted)
            end)
        end
        test.it("rejects mixed live and marked children without accepting the parent", function()
            local owner = "delete-job-" .. uuid.v4()
            local parent = seed("retention", owner)
            local marked = seed("retention", owner, parent)
            local live = seed("retention", owner, parent)
            test.is_true(service(owner):delete({component_id = marked}).success)
            local refused = service(owner):delete({component_id = parent})
            test.is_false(refused.success); test.eq(#jobs(parent), 0)
            test.is_true(service(owner):delete({component_id = live}).success)
            test.is_true(service(owner):delete({component_id = parent}).success)
            test.is_true(deletion_worker.run(marked).deleted)
            test.is_true(deletion_worker.run(live).deleted)
            test.is_true(deletion_worker.run(parent).deleted)
        end)
        test.it("explicitly reroots marked children without retrying their deletion", function()
            local owner = "delete-job-" .. uuid.v4()
            local parent = seed("retention", owner)
            local child = seed("dead_once", owner, parent)
            local accepted = service(owner):delete({component_id = child})
            test.not_nil(select(2, deletion_worker.run(child)))
            test.is_true(service(owner):delete({component_id = parent, child_policy = "reparent_root"}).success)
            test.is_true(deletion_worker.run(parent).deleted)
            test.is_nil(query("SELECT parent_id FROM kickside_components WHERE component_id=$1", {child})[1].parent_id)
            test.eq(service(owner):get({component_id = child}).deletion_job_id, accepted.job_id)
            test.eq(jobs(child)[1].status, "dead"); test.eq(#jobs(child), 1)
            test.is_true(service(owner):delete({component_id = child}).success)
            test.is_true(deletion_worker.run(child).deleted)
        end)
        test.it("waits for a legacy marked child until retention enrolls it", function()
            local owner = "delete-job-" .. uuid.v4()
            local parent = seed("retention", owner)
            local child = seed("retention", owner, parent)
            local db = assert(sql.get("app:db"))
            assert(db:execute("UPDATE kickside_components SET deleting_at=$1 WHERE component_id=$2", {time.now():utc():format_rfc3339(), child}))
            assert(db:release())
            test.is_true(service(owner):delete({component_id = parent}).success)
            local waiting, err = deletion_worker.run(parent)
            test.is_nil(err, tostring(err)); test.eq(type(waiting.rearm), "string")
            test.eq(#jobs(child), 0); test.eq(tonumber(jobs(parent)[1].attempts), 0)
            local retained, retain_err = funcs.call("kickside.component:retention", {change = {owner_locator = {id = child}}})
            test.is_nil(retain_err, tostring(retain_err)); test.is_true(retained.success)
            test.eq(#jobs(child), 1)
            test.is_true(deletion_worker.run(child).deleted)
            test.is_true(deletion_worker.run(parent).deleted)
        end)
        test.it("purges a deep chain after bottom-up acceptance", function()
            local owner = "delete-job-" .. uuid.v4()
            local chain = {}
            for i = 1, 8 do chain[i] = seed("retention", owner, chain[i - 1]) end
            for i = #chain, 1, -1 do test.is_true(service(owner):delete({component_id = chain[i]}).success) end
            for i = 1, #chain - 1 do
                local waiting, err = deletion_worker.run(chain[i])
                test.is_nil(err, tostring(err)); test.eq(type(waiting.rearm), "string")
            end
            for i = #chain, 1, -1 do test.is_true(deletion_worker.run(chain[i]).deleted) end
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
