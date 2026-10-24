local source_scope = require("source_scope")
local test = require("test")
local registry = require("registry")
local registry_fixture = require("registry_fixture")
local channel = require("channel")
local time = require("time")
local storage = require("store")
local funcs = require("funcs")
local security = require("security")
local consts = require("security_consts")

local PROJECTOR = "kickside.security.service:scope_projection_proc"
local GROUP = "app:upgrade_members"
local original, projector

local function receive(replies: any): any
    local selected = channel.select({ replies:case_receive(), time.after("5s"):case_receive() })
    test.eq(selected.channel, replies, "the scope projector never answers")
    return selected.value
end

local function request(pid: string): any
    local topic = "test.scope_upgrade.reply:" .. tostring(process.pid())
    local replies = process.listen(topic)
    test.is_true((process.send(pid, consts.RECONCILE_TOPIC,
        { reply_pid = tostring(process.pid()), reply_topic = topic })))
    local result = receive(replies)
    process.unlisten(replies)
    return result
end

local function update_source(topic: string): ()
    local entry = assert(registry.get(PROJECTOR))
    local data = {}
    for key, value in pairs(entry.data) do data[key] = value end
    local replaced
    data.source, replaced = data.source:gsub("function M%.main%(%)",
        "function M.main()\n    process.send(" .. string.format("%q", tostring(process.pid())) .. ", "
        .. string.format("%q", topic) .. ", { generation = 2 })", 1)
    test.eq(replaced, 1, "the actual projector source must change")
    local _, err = registry_fixture.apply(function(changes)
        changes:update({ id = entry.id, kind = entry.kind, meta = entry.meta, data = data })
    end, time.now():add(5 * time.SECOND))
    test.is_nil(err)
end

local function define_tests()
    test.describe("native scope projector upgrade", function()
        test.before_each(function()
            original = assert(registry.current_version())
            local _, err = registry_fixture.apply(function(changes)
                changes:create({ id = "app:upgrade_member_policy", kind = "security.policy", data = {
                    groups = { GROUP }, policy = { actions = "access", resources = "app:upgrade_resource", effect = "allow" } } })
            end, time.now():add(5 * time.SECOND))
            test.is_nil(err)
            local pid, spawn_err = process.spawn_monitored(PROJECTOR, "app:processes", {})
            test.is_nil(spawn_err)
            projector = tostring(pid)
            test.is_true(request(projector).success)
        end)

        test.after_each(function()
            if projector then
                local cancelled, err = process.cancel(projector)
                test.is_nil(err)
                test.is_true(cancelled)
                local events = process.events()
                local deadline = time.after("5s")
                while true do
                    local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                    test.eq(selected.channel, events, "owned projector never stops")
                    if selected.value.kind == process.event.EXIT and tostring(selected.value.from) == projector then
                        test.is_nil(selected.value.result.error)
                        break
                    end
                end
                projector = nil
            end
            local records = assert(storage.get("app:invalidation_records"))
            records:delete("delay")
            records:release()
            local restored, err = registry.apply_version(original)
            test.is_nil(err)
            test.is_true(restored)
        end)

        test.it("activates new code without replacing the registered process", function()
            local topic = "test.scope_upgrade.generation:" .. tostring(process.pid())
            local generations = process.listen(topic)
            update_source(topic)
            local generation = receive(generations)
            process.unlisten(generations)
            test.eq(generation.generation, 2)
            test.eq(tostring((process.registry.lookup(consts.SCOPE_PROJECTION_TOPIC))), projector)
            test.is_true(request(projector).success)
            local scope = assert(source_scope.resolve(GROUP))
            test.eq(scope:evaluate(security.new_actor("new-member"), "access", "app:upgrade_resource"), "allow")
        end)

        test.it("finishes an in-flight projection and answers queued requests across the upgrade", function()
            local records = assert(storage.get("app:invalidation_records"))
            records:set("delay", "1s")
            local before = #(records:get("calls") or {})
            records:release()
            local topic = "test.scope_upgrade.pending:" .. tostring(process.pid())
            local replies = process.listen(topic)
            test.is_true((process.send(projector, consts.RECONCILE_TOPIC,
                { fence_groups = { GROUP }, reply_pid = tostring(process.pid()), reply_topic = topic })))
            local deadline = time.now():add(5 * time.SECOND)
            local entered = false
            while time.now():before(deadline) do
                local probe = assert(storage.get("app:invalidation_records"))
                entered = #(probe:get("calls") or {}) > before
                probe:release()
                if entered then break end
                time.sleep("10ms")
            end
            test.is_true(entered, "the projection pass never enters its in-flight invalidation")
            local generation_topic = topic .. ":generation"
            local generations = process.listen(generation_topic)
            update_source(generation_topic)
            test.is_true((process.send(projector, consts.RECONCILE_TOPIC,
                { reply_pid = tostring(process.pid()), reply_topic = topic })))
            test.is_true(receive(replies).success, "the in-flight request loses its reply")
            test.is_true(receive(replies).success, "the queued request loses its reply")
            test.eq(receive(generations).generation, 2)
            process.unlisten(replies)
            process.unlisten(generations)
            test.eq(tostring((process.registry.lookup(consts.SCOPE_PROJECTION_TOPIC))), projector)
            test.is_true(request(projector).success)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
