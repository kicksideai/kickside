local pg = require("pg")

local SCOPE = "app:pg_test"

-- Test worker: joins a group and forwards every broadcast on `topic` back to
-- the parent under "worker.got". On "quit" it leaves the group and exits,
-- which drops it from membership.
local function run(args)
    local parent = tostring(args.parent)
    local group = tostring(args.group)
    local topic = tostring(args.topic)

    local scope, err = pg.open(SCOPE)
    if err then error("worker pg.open: " .. tostring(err)) end

    local ok, jerr = scope:join(group)
    if jerr then error("worker join: " .. tostring(jerr)) end

    local evt = process.listen(topic)
    local quit = process.listen("quit")
    local events = process.events()

    local closed = false
    local function close(): string?
        if closed then return nil end
        closed = true

        local _, leave_err = scope:leave(group)
        local _, release_err = scope:release()

        if leave_err then return tostring(leave_err) end
        if release_err then return tostring(release_err) end
        return nil
    end

    while true do
        local res = channel.select({ evt:case_receive(), quit:case_receive(), events:case_receive() })
        if res.channel == quit then
            local close_err = close()
            if close_err then return { status = "left", cleanup_error = close_err } end
            return { status = "left" }
        elseif res.channel == events then
            local event = res.value
            local kind = type(event) == "table" and event.kind or nil
            if kind == process.event.CANCEL or kind == process.event.EXIT or kind == process.event.LINK_DOWN then
                close()
                return { status = "stopped" }
            end
        else
            process.send(parent, "worker.got", res.value)
        end
    end
end

return { run = run }
