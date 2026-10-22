-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local stores = require("stores")

local function resolve(args: any): (any, error?)
    local _, row, engine, err = stores.resolve_component_store(args.component_id)
    if err then return nil, err end
    return { kb_type = row.kb_type, served_by = row.config and row.config.served_by, engine_kb_type = engine.kb_type }, nil
end

local function exercise(args: any): (any, error?)
    local store, err = stores.open_engine_store({
        store_contract = "kickside.knowledge:kb_store_lifecycle",
        store_binding = args.binding,
    })
    if err then return nil, err end
    return store[args.method](store, {component_id = "kb-store-binding"})
end

return { resolve = resolve, exercise = exercise }
