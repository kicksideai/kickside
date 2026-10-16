-- Sends one reconcile request to the projector with this function frame as its
-- reply destination and returns at once, so the reply finds a departed caller.
local function run(args: { pid: string, groups: { string }? }): (boolean, error?)
    local sent, send_err = process.send(args.pid, "reconcile", {
        groups = args.groups,
        reply_pid = tostring(process.pid()),
        reply_topic = "test.scope_lifecycle.departed:" .. tostring(process.pid()),
    })
    if send_err then return false, send_err end
    return sent == true, nil
end

return { run = run }
