local registry = require("registry")
local function run(): (any?, any?)
    local entries, find_err = registry.find({ ["meta.type"] = "agent.trait" })
    if find_err then return nil, find_err end
    local leaked = false
    for _, entry in ipairs(entries) do
        if entry.id:find("kickside.self_reflection", 1, true) == 1 then leaked = true end
    end
    local visible, visible_err = registry.get("app:definition")
    if visible_err then return nil, visible_err end
    local hidden, hidden_err = registry.get("kickside.self_reflection:definition")
    return { leaked = leaked, visible = visible ~= nil, hidden = hidden,
        denied = errors.is(hidden_err, errors.PERMISSION_DENIED) }, nil
end
return { run = run }
