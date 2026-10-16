local registry = require("registry")
local time = require("time")
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

return M
