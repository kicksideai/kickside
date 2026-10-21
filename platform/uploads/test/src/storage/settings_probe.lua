local inspect = require("inspect")
local probe = require("probe")
local ctx = require("ctx")
local M = {}
function M.run(): (any?, any?)
    probe.reset()
    local _, err
    if ctx.get("storage_action") == "configure" then _, err = inspect.configure()
    else _, err = inspect.handle() end
    if err then return nil, err end
    return { status = probe.status or 200, body = probe.body }, nil
end
return M
