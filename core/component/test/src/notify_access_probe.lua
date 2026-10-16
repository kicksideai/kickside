local component = require("component")

-- Fans one component notification out to the component's stored audience in
-- the caller's frame.
local function run(args: { component_id: string, data: table }): (any?, error?)
    return component.notify_access(args.component_id, nil, args.data, nil)
end

return { run = run }
