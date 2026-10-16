-- This privileged fixture is copied into disposable apps only.
local http = require("http")
local process = require("process")
local sql = require("sql")
local system = require("system")
local registry = require("registry")
local channel = require("channel")
local json = require("json")
local contract = require("contract")
local security = require("security")
local jobs = require("jobs")
local waiters = require("waiters")
local realtime = require("realtime")

local function record(key, kind, body)
    local db = assert(sql.get("app:db"))
    local _, err = db:execute("INSERT INTO cluster_observation(key,kind,body) VALUES($1,$2,$3)",
        {key, kind, assert(json.encode(body))})
    db:release()
    assert(not err, tostring(err))
end

local function waiter(args)
    -- The actor and observer share a bounded cursor-progress assertion.
    local w, err = waiters.begin_wait(args.cursor_id, 1, 30000)
    assert(w, tostring(err))
    record(args.key, "ready", {pid=tostring(process.pid())})
    while true do
        local notice, expired, wait_err = waiters.wait_until_reached(w)
        assert(not wait_err and not expired, tostring(wait_err or "waiter expired"))
        if tonumber(notice.last_seq) and tonumber(notice.last_seq) >= 1 then
            record(args.key, "received", notice)
            break
        end
    end
    waiters.close_wait(w)
end

local function client(args)
    local welcome = assert(process.listen("welcome"))
    local incoming = assert(process.listen("cluster.push"))
    local hub = assert(process.spawn("wippy.relay:user", "app:processes", {
        user_id=args.key, plugins={}, config={max_connections_per_user=10, heartbeat_interval="30s"},
        central_hub_pid=tostring(process.pid()), user_metadata={}
    }))
    assert(process.send(hub, "ws.join", {client_pid=tostring(process.pid())}))
    local joined = channel.select({welcome:case_receive(),process.events():case_receive()})
    assert(joined.channel == welcome, "relay user hub exited before welcome")
    record(args.key, "ready", {hub=tostring(hub), client=tostring(process.pid())})
    local delivered = channel.select({incoming:case_receive(),process.events():case_receive()})
    assert(delivered.channel == incoming, "client exited before push")
    record(args.key, "received", delivered.value)
    process.terminate(hub)
end

local function job(input)
    local p = input.payload
    record(p.key, "attempt", {pid=tostring(process.pid()),job_id=input.job.id})
    if p.hold and string.find(tostring(process.pid()), "node-a", 1, true) then
        -- An explicit mailbox barrier, released only by killing A.
        local gate = assert(process.listen("cluster.release"))
        channel.select({gate:case_receive(),process.events():case_receive()})
    end
    record(p.key, "effect", {pid=tostring(process.pid()),job_id=input.job.id})
    return {ok=true,record={completed=true}}, nil
end

local function threads()
    -- A test-owned system thread needs no invented user or identity adapter.
    local actor = security.new_actor("system:cluster_test", {security_groups={}})
    local scope = assert(security.named_scope("wippy.security:process"))
    return assert(assert(contract.get("kickside.core:threads")):with_actor(actor):with_scope(scope):open())
end

local function fold(input)
    local body = input.projection.body or {}
    body.count = (tonumber(body.count) or 0) + (tonumber(input.range.processed_count) or 0)
    return {body=body,last_seq=input.range.to_seq}
end

local function handler()
    local req, res = http.request(), http.response()
    local body = assert(req:body_json())
    local result = {}
    if body.op == "snapshot" then
        local names = {}
        for _, name in ipairs(body.names or {}) do
            local row = {}
            for _, scope in ipairs({"LOCAL","CONSISTENT"}) do
                local pid, err = process.registry.lookup(name, process.registry[scope])
                row[scope] = pid and tostring(pid) or ""
                row[scope.."_error"] = err and tostring(err) or ""
            end
            local pid, err = process.registry.lookup(name)
            row.resolved = pid and tostring(pid) or ""
            row.error = err and tostring(err) or ""
            names[name] = row
        end
        local members, member_err = system.cluster.members()
        assert(members, tostring(member_err))
        local leader = system.cluster.leader()
        result = {names=names,members=members,leader=leader,raft_role=system.raft.role(),raft_stats=system.raft.stats(),processes=assert(system.hosts.processes("app:processes")),
            services=assert(system.supervisor.states())}
    elseif body.op == "remove_service" or body.op == "restore_service" then
        local snap = assert(registry.snapshot())
        local changes = snap:changes()
        local saved = {}
        if body.op == "remove_service" then
            for _, id in ipairs(body.services) do
                saved[#saved+1] = assert(snap:get(id))
                local _, err = changes:delete(id)
                assert(not err,tostring(err))
            end
        else
            for _, entry in ipairs(body.entries) do
                local _, err = changes:create(entry)
                assert(not err,tostring(err))
            end
        end
        local _, err = changes:apply()
        assert(not err,tostring(err))
        result = {entries=saved}
    elseif body.op == "enable" then
        local snap = assert(registry.snapshot())
        local changes = snap:changes()
        for _, id in ipairs(body.services) do
            local entry = assert(snap:get(id))
            entry.data.lifecycle.auto_start = true
            local _, update_err = changes:update(entry)
            assert(not update_err, tostring(update_err))
        end
        local _, apply_err = changes:apply()
        assert(not apply_err, tostring(apply_err))
        result = {enabled=true}
    elseif body.op == "waiter" or body.op == "client" then
        local pid, err = process.spawn("app.test.cluster:"..body.op,"app:processes",body)
        assert(pid,tostring(err))
        result = {pid=tostring(pid)}
    elseif body.op == "prepare_cursor" then
        local api = threads()
        local thread, create_err = api:create({thread_class="cluster_round2"})
        assert(thread,tostring(create_err))
        local projection, projection_err = api:register_projection({thread_id=thread.thread_id,
            kind="cluster.count",worker_ref="func://app.test.cluster:fold"})
        assert(projection,tostring(projection_err))
        result={thread_id=thread.thread_id,cursor_id=projection.projection.cursor_id,
            projection_id=projection.projection_id}
    elseif body.op == "commit" then
        local appended, append_err = threads():append_event({thread_id=body.thread_id,
            event={type="kickside.threads:message.created",body={text=body.key}}})
        assert(appended,tostring(append_err))
        result=appended
    elseif body.op == "enqueue" then
        local out, err = jobs.enqueue({namespace="cluster_test",scope="round2",key=body.key,
            owner_locator={kind="cluster_test",id="round2"},
            job_type="app.test.cluster:job",immutable_payload={key=body.key,hold=body.hold==true},max_attempts=3})
        assert(out,tostring(err))
        result=out
    elseif body.op == "push" then
        result=realtime.notify({user_id=body.key,topic="cluster.push",data={key=body.key,origin="A"}})
        assert(result.success, tostring(result.error))
    else
        error("unknown cluster operation")
    end
    res:write_json(result)
end
return {handler=handler,waiter=waiter,client=client,job=job,fold=fold}
