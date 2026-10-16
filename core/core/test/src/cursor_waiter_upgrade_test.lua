local test = require("test")
local process = require("process")
local registry = require("registry")
local time = require("time")
local channel = require("channel")
local uuid = require("uuid")

local BROKER = "app:isolated_cursor_waiter"
local original, broker

local function receive(ch: any, label: string): any
    local selected = channel.select({ ch:case_receive(), time.after("5s"):case_receive() })
    test.eq(selected.channel, ch, label .. " does not arrive")
    return selected.value
end

local function register(replies: any, topic: string, cursor: string): string
    local id = uuid.v7()
    local sent, err = process.send(broker, "cursor_waiter.register", {
        request_id = id, cursor_id = cursor, target_seq = 5,
        reply_pid = tostring(process.pid()), reply_topic = topic,
        deadline_ns = time.now():unix_nano() + 30 * time.SECOND,
    })
    test.is_nil(err)
    test.is_true(sent)
    local reply = receive(replies, "registration acknowledgment")
    test.eq(reply.request_id, id)
    test.eq(reply.kind, "registered")
    test.eq(reply.broker_pid, broker)
    return id
end

local function define_tests()
    test.describe("native cursor waiter upgrade", function()
        test.before_each(function()
            original = assert(registry.current_version())
            local pid, err = process.spawn_monitored(BROKER, "app:processes")
            test.is_nil(err)
            test.not_nil(pid)
            broker = tostring(pid)
        end)
        test.after_each(function()
            local cancelled, err = process.cancel(broker)
            test.is_nil(err)
            test.is_true(cancelled)
            local events = process.events()
            local deadline = time.after("5s")
            while true do
                local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                test.eq(selected.channel, events, "owned broker does not stop")
                if selected.value.kind == process.event.EXIT and tostring(selected.value.from) == broker then
                    test.is_nil(selected.value.result.error)
                    break
                end
            end
            local restored, restore_err = registry.apply_version(original)
            test.is_nil(restore_err)
            test.is_true(restored)
        end)

        test.it("delivers a committed cursor to a waiter admitted before new code activates", function()
            local topic = "test.cursor_upgrade.reply:" .. uuid.v7()
            local replies = process.listen(topic)
            local cursor = "upgrade-cursor-" .. uuid.v7()
            local id = register(replies, topic, cursor)
            local generation_topic = topic .. ":generation"
            local generations = process.listen(generation_topic)
            local entry = assert(registry.get(BROKER))
            local data = {}
            for key, value in pairs(entry.data) do data[key] = value end
            local replaced
            data.source, replaced = data.source:gsub("local function broker_main([^\n]*)\n",
                "local function broker_main%1\n    assert(process.send(" .. string.format("%q", tostring(process.pid()))
                .. ", " .. string.format("%q", generation_topic) .. ", { generation = 2 }))\n", 1)
            test.eq(replaced, 1, "the actual broker source changes")
            local changes = assert(registry.snapshot()):changes()
            changes:update({ id = entry.id, kind = entry.kind, meta = entry.meta, data = data })
            local _, apply_err = changes:apply()
            test.is_nil(apply_err)
            test.eq(receive(generations, "new code activation").generation, 2)
            local sent, err = process.send(broker, "cursor_waiter.commit", { cursor_id = cursor, last_seq = 5, status = "active" })
            test.is_nil(err)
            test.is_true(sent)
            local reached = receive(replies, "the original waiter's cursor change")
            test.eq(reached.request_id, id)
            test.eq(reached.kind, "changed")
            test.eq(reached.last_seq, 5)
            register(replies, topic, "upgrade-probe-" .. uuid.v7())
            process.unlisten(replies)
            process.unlisten(generations)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
