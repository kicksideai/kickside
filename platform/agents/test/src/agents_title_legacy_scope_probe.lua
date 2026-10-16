local agents_by_name = require("agents_by_name")

local function run(args)
    return agents_by_name.resolve_identifiers((args or {}).identifiers or {})
end

return { run = run }
