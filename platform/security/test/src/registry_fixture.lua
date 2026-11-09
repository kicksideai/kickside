local registry = require("registry")
local time = require("time")
local channel = require("channel")
local M = {}

function M.apply(build, deadline)
    while true do
        local snapshot, snapshot_err = registry.snapshot()
        if snapshot_err then return nil, snapshot_err end
        local changes = snapshot:changes()
        local build_err = build(changes, snapshot)
        if build_err then return nil, build_err end
        local applied, apply_err = changes:apply()
        if not apply_err or not errors.is(apply_err, errors.CONFLICT) or not time.now():before(deadline) then
            return applied, apply_err
        end
    end
end

function M.start_projector()
    local pid = assert(process.spawn_monitored("kickside.security.service:scope_projection_proc", "app:processes", {}))
    local topic = "test.scope_writer.ready:" .. tostring(process.pid())
    local replies = process.listen(topic)
    assert(process.send(pid, "reconcile", {reply_pid = tostring(process.pid()), reply_topic = topic}))
    local timer = assert(time.after("5s"))
    local selected = channel.select({replies:case_receive(), timer:case_receive()})
    process.unlisten(replies)
    assert(selected.channel == replies, "scope writer becomes ready before the fixture writes")
    assert(selected.value.success, tostring(selected.value.error))
    return pid
end

function M.stop_projector(pid)
    assert(process.cancel(pid))
    local events = process.events()
    local timer = assert(time.after("5s"))
    while true do
        local selected = channel.select({events:case_receive(), timer:case_receive()})
        assert(selected.channel == events, "owned scope writer stops before the next fixture")
        local event = selected.value
        if event.kind == process.event.EXIT and tostring(event.from) == tostring(pid) then
            assert(not event.result.error, tostring(event.result.error))
            return
        end
    end
end

return M
