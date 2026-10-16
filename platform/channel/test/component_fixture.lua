local test_state = require("test_state")

local M = {}

M.ACCESS = { READ = 1, WRITE = 2, DELETE = 4, ADMIN = 8 }

-- validate_access(component_id, mask) -> (level?, err?): the caller's grant on
-- a component, answered from the sink access state.
function M.validate_access(component_id: string, mask: number): (any?, any?)
    test_state.state.sink_access_calls = test_state.state.sink_access_calls or {}
    test_state.state.sink_access_calls[#test_state.state.sink_access_calls + 1] = {
        id = component_id, access = mask,
    }
    if test_state.state.sink_access_error then return nil, test_state.state.sink_access_error end
    return 15, nil
end

function M.validate_principal_access(component_id, mask, principal, groups, access_filter)
    test_state.state.connection_access_calls = test_state.state.connection_access_calls or {}
    table.insert(test_state.state.connection_access_calls, {
        component_id = component_id, mask = mask, principal = principal,
        groups = groups, access_filter = access_filter,
    })
    if test_state.state.connection_write_denied then return false, errors.new({ message = "connection WRITE revoked", kind = errors.PERMISSION_DENIED }) end
    return true, nil
end

local function matches_meta(row: any, meta_filters: any): boolean
    if type(meta_filters) ~= "table" then return true end
    local meta = type(row.meta) == "table" and row.meta or {}
    for key, value in pairs(meta_filters) do
        if tostring(meta[key]) ~= tostring(value) then return false end
    end
    return true
end

local function in_list(value: any, list: any): boolean
    if type(list) ~= "table" then return false end
    for _, v in ipairs(list) do
        if v == value then return true end
    end
    return false
end

-- list_system filters the component model by component_ids / impl_ids / meta,
-- mirroring the indexed core read the channel uses for routing and guards.
function M.list_system(args: any): any
    if test_state.state.component_list_error then return nil, test_state.state.component_list_error end
    args = type(args) == "table" and args or {}
    local out: { any } = {}
    for _, row in pairs(test_state.state.components or {}) do
        local keep = true
        if type(args.component_ids) == "table" and #args.component_ids > 0 then
            if not in_list(row.component_id, args.component_ids) then keep = false end
        end
        if keep and type(args.impl_ids) == "table" and #args.impl_ids > 0 then
            if not in_list(row.impl_id, args.impl_ids) then keep = false end
        end
        if keep and not matches_meta(row, args.meta) then keep = false end
        if keep then
            out[#out + 1] = { component_id = row.component_id, impl_id = row.impl_id, meta = row.meta }
        end
    end
    return out
end

function M.get_identity_receipt(component_id: string): (any?, any?)
    local responder = test_state.state.responders[component_id]
    if not responder then return nil, "component not found" end
    return { component_id = component_id, identity_generation = responder.identity_generation or 0,
        principal = responder.execution_identity.principal,
        execution_identity = responder.execution_identity }, nil
end

function M.set_meta(component_id: string, fields: any): (boolean, any)
    test_state.state.set_meta_calls[#test_state.state.set_meta_calls + 1] = {
        component_id = component_id,
        fields = fields,
    }
    return true, nil
end

function M.open(id, access, contract_id)
    return { test_connection = function(_, args)
        test_state.state.connection_validation_args = args
        return test_state.state.connection_validation_result or { success = true }, nil
    end }, nil
end

M.set_runtime_meta = M.set_meta

return M
