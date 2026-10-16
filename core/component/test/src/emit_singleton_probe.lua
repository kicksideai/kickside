local component = require("component")

-- Probe entry: calls component.emit_singleton_event under whatever actor + scope the
-- caller bound onto the func executor, so a test can exercise the ambient-frame path
-- (the client reads security.actor()/scope() ambiently, not from arguments). Returns a
-- flat envelope the test asserts on.
local function run(args: any): any
    args = type(args) == "table" and args or {}
    local class = type(args.class) == "string" and args.class or ""
    local event: { [string]: any } = {}
    if type(args.event) == "table" then
        for key, value in pairs(args.event) do
            if type(key) == "string" then event[key] = value end
        end
    end
    local res, err = component.emit_singleton_event(class, event)
    return {
        ok = res ~= nil and err == nil,
        err = err and tostring((err :: any).message or err) or nil,
    }
end

return { run = run }
