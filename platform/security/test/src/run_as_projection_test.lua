local test = require("test")
local registry = require("registry")
local channel = require("channel")
local time = require("time")

local PROJECTOR = "kickside.security.service:scope_projection_proc"
local spawned: { any } = {}

local function stop_spawned(): ()
    local events = process.events()
    for _, pid in ipairs(spawned) do
        local cancelled = process.cancel(pid)
        if cancelled then
            local deadline = time.after("5s")
            while true do
                local selected = channel.select({events:case_receive(), deadline:case_receive()})
                test.is_false(selected.channel == deadline, "run-as projector did not stop")
                if selected.value.kind == process.event.EXIT and selected.value.from == pid then break end
            end
        end
    end
    spawned = {}
end

local function install_policy(id: string, group: string, resource: string): ()
    local changes = assert(registry.snapshot()):changes()
    changes:create({
        id = id,
        kind = "security.policy",
        data = { groups = {group}, policy = {actions = "access", resources = resource, effect = "allow"} },
    })
    test.is_nil(select(2, changes:apply()))
end

local function remove_policy(id: string): ()
    local changes = assert(registry.snapshot()):changes()
    changes:delete(id)
    test.is_nil(select(2, changes:apply()))
end

local function request(pid: string, payload: any): (any?, string?)
    local topic = "test.run_as_projection.reply:" .. tostring(process.pid())
    local replies = process.listen(topic)
    payload.reply_pid = tostring(process.pid())
    payload.reply_topic = topic
    local sent, send_err = process.send(pid, "reconcile", payload)
    if not sent then process.unlisten(replies); return nil, tostring(send_err) end
    local selected = channel.select({replies:case_receive(), time.after("10s"):case_receive()})
    process.unlisten(replies)
    if selected.channel ~= replies then return nil, "scope projection request timed out" end
    return selected.value, nil
end

local function define_tests()
    test.describe("run-as scope projection", function()
        local original
        test.before_each(function()
            original = assert(registry.current_version())
        end)
        test.after_each(function()
            stop_spawned()
            local restored, restore_err = registry.apply_version(original)
            test.is_nil(restore_err)
            test.is_true(restored)
        end)
        test.it("coalesces concurrent stale requests for one membership set", function()
            local group = "app:run_as_projection_coalesced"
            local policy = "app:run_as_projection_coalesced_policy"
            install_policy(policy, group, "app:run_as_projection_coalesced")
            local projector, spawn_err = process.spawn_monitored(PROJECTOR, "app:processes", {})
            test.is_nil(spawn_err)
            test.not_nil(projector)
            spawned[#spawned + 1] = projector
            local pid = tostring(projector)
            local ready, ready_err = request(pid, {})
            test.is_nil(ready_err)
            test.is_true(ready.success, tostring(ready.error))
            local topic = "test.run_as_projection.coalesced:" .. tostring(process.pid())
            local replies = process.listen(topic)
            local before = assert(registry.current_version()):id()
            local count = 8
            for _ = 1, count do
                local sent, send_err = process.send(pid, "reconcile", {
                    groups = {group}, reply_pid = tostring(process.pid()), reply_topic = topic,
                })
                test.is_nil(send_err)
                test.is_true(sent)
            end
            local names, answered = {}, 0
            local deadline = time.after("10s")
            while answered < count do
                local selected = channel.select({replies:case_receive(), deadline:case_receive()})
                if selected.channel ~= replies then break end
                answered = answered + 1
                test.is_true(selected.value.success, tostring(selected.value.error))
                names[tostring(selected.value.scope_name)] = true
            end
            process.unlisten(replies)
            local passes = assert(registry.current_version()):id() - before
            local distinct = 0
            for _ in pairs(names) do distinct = distinct + 1 end
            test.eq(answered, count, "concurrent materialization requests went unanswered")
            test.eq(distinct, 1)
            test.is_true(passes <= 1, "same set took " .. tostring(passes) .. " projection passes")
            remove_policy(policy)
            local settled, settled_err = request(pid, {})
            test.is_nil(settled_err)
            test.is_true(settled.success, tostring(settled.error))
        end)

        test.it("coalesces concurrent stale requests for one membership set", function()
            local group = "app:run_as_projection_coalesced"
            local policy = "app:run_as_projection_coalesced_policy"
            install_policy(policy, group, "app:run_as_projection_coalesced")
            local projector, spawn_err = process.spawn_monitored(PROJECTOR, "app:processes", {})
            test.is_nil(spawn_err)
            test.not_nil(projector)
            spawned[#spawned + 1] = projector
            local pid = tostring(projector)
            local ready, ready_err = request(pid, {})
            test.is_nil(ready_err)
            test.is_true(ready.success, tostring(ready.error))
            local topic = "test.run_as_projection.coalesced:" .. tostring(process.pid())
            local replies = process.listen(topic)
            local before = assert(registry.current_version()):id()
            local count = 8
            for _ = 1, count do
                local sent, send_err = process.send(pid, "reconcile", {
                    groups = {group}, reply_pid = tostring(process.pid()), reply_topic = topic,
                })
                test.is_nil(send_err)
                test.is_true(sent)
            end
            local names, answered = {}, 0
            local deadline = time.after("10s")
            while answered < count do
                local selected = channel.select({replies:case_receive(), deadline:case_receive()})
                if selected.channel ~= replies then break end
                answered = answered + 1
                test.is_true(selected.value.success, tostring(selected.value.error))
                names[tostring(selected.value.scope_name)] = true
            end
            process.unlisten(replies)
            local passes = assert(registry.current_version()):id() - before
            local distinct = 0
            for _ in pairs(names) do distinct = distinct + 1 end
            test.eq(answered, count, "concurrent materialization requests went unanswered")
            test.eq(distinct, 1)
            test.is_true(passes <= 1, "same set took " .. tostring(passes) .. " projection passes")
            remove_policy(policy)
            local settled, settled_err = request(pid, {})
            test.is_nil(settled_err)
            test.is_true(settled.success, tostring(settled.error))
        end)
    end)
end

return test.run_cases(define_tests)
