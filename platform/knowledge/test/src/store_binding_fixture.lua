-- Two bindings of kickside.knowledge:kb_store_lifecycle: the default one knows
-- no store, the named one serves the "bound" engine's store row.

local BOUND_KB = "kb-store-binding"

local function unknown(component_id: any): (any, error?)
    return nil, errors.new({ kind = errors.NOT_FOUND, message = "store not found: " .. tostring(component_id) })
end

local function default_get(args: any): (any, error?)
    return unknown(args and args.component_id)
end

local function bound_get(args: any): (any, error?)
    if args and args.component_id == BOUND_KB then
        return { success = true, component_id = BOUND_KB, kb_type = "bound", embedding_model = "embed", config = { served_by = "bound" } }, nil
    end
    return unknown(args and args.component_id)
end

local function accepted(_args: any): (any, error?)
    return { success = true, served_by = "default" }, nil
end

local function bound_accepted(_args: any): (any, error?)
    return { success = true, served_by = "bound" }, nil
end

return {
    BOUND_KB = BOUND_KB,
    default_get = default_get,
    bound_get = bound_get,
    accepted = accepted,
    bound_accepted = bound_accepted,
}
