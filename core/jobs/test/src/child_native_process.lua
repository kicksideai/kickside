local native = require("process")
local fixture = require("fixture")
local M = {registry = {CONSISTENT = native.registry.CONSISTENT}}
function M.registry.register(...) return fixture.result("register", true) end
function M.registry.unregister(...) return true, nil end
function M.listen(...) return {} end
function M.unlisten(...) end
function M.events(...) return {} end
function M.spawn_linked_monitored(...)
    fixture.spawns = fixture.spawns + 1
    return fixture.result("spawn", "child-pid")
end
return M
