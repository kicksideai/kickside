local stores = require("stores")

local function resolve(args: any): (any, error?)
    local _, row, engine, err = stores.resolve_component_store(args.component_id)
    if err then return nil, err end
    return { kb_type = row.kb_type, served_by = row.config and row.config.served_by, engine_kb_type = engine.kb_type }, nil
end

return { resolve = resolve }
