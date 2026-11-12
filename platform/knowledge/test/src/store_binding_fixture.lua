-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Two bindings of kickside.knowledge:kb_store_lifecycle: the default one knows
-- no store, the named one serves the "bound" engine's store row.

local BOUND_KB = "3d9ba14d-4cd3-47b7-a63b-25868c2dcaff"

local function unknown(component_id: any): (any, error?)
    return nil, errors.new({ kind = errors.NOT_FOUND, message = "store not found: " .. tostring(component_id) })
end

local function default_get(args: any): (any, error?)
    return unknown(args and args.component_id)
end

local function bound_get(args: any): (any, error?)
    if args and args.component_id == BOUND_KB then
        return { success = true, component_id = BOUND_KB, kb_type = "bound", embedding_model = "embed", enrichment_agent_id = "stored-agent", config = { served_by = "bound" } }, nil
    end
    return unknown(args and args.component_id)
end

local function accepted(_args: any): (any, error?)
    return { success = true, served_by = "default" }, nil
end

local function bound_accepted(_args: any): (any, error?)
    return { success = true, served_by = "bound" }, nil
end

local function bound_update(args: any): (any, error?)
    local sql = require("sql")
    local db, err = sql.get("app:db")
    if err then return nil, err end
    local _, write_err = db:execute("UPDATE kickside_components SET updated_at = CAST(CAST(updated_at AS BIGINT) + 1 AS TEXT) WHERE component_id = $1", { args.component_id })
    db:release()
    if write_err then return nil, write_err end
    return bound_accepted(args)
end

return {
    bound_update = bound_update,
    BOUND_KB = BOUND_KB,
    default_get = default_get,
    bound_get = bound_get,
    accepted = accepted,
    bound_accepted = bound_accepted,
}
