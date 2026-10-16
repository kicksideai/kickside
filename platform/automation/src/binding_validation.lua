local M = {}
local json = require("json")
local registry = require("registry")

type FailureList = { string }
type Map = { [string]: any }

local PORT_META_TYPE = "kickside.automation.port"
local EVENT_META_TYPE = "kickside.core.threads.event"
local WRITABLE_CONTRACT = "kickside.data:writable"
local PULLABLE_CONTRACT = "kickside.data:pullable"

-- The writable ABI: the only operation names a store port may declare.
local WRITABLE_OPS: { [string]: boolean } = { upsert = true, delete = true, list_keys = true }

-- An operation value carries ONLY the writable-ABI params (contract §3): the write
-- item shape is the port's root input_schema, never a per-op copy.
local OP_DECL_FIELDS: { [string]: boolean } = { ["function"] = true, requires_dest_ref = true }

-- The complete set of port-entry declaration fields; anything else is sprawl.
local PORT_DECL_FIELDS: { [string]: boolean } = {
    binding = true, event = true, operations = true,
    input_schema = true, output_schema = true, config_schema = true, reconcile = true, input_mode = true,
}

-- A store may opt into a declared non-generic input envelope. The vocabulary is
-- exactly what the delivery path honors: source_payload hands the source item's
-- payload through untransformed, and transform_output declares the transform
-- result itself as the sink's writable ABI - a typed destination whose input
-- shape is its own contract, never wrapped in the document envelope generic
-- content stores read.
local STORE_INPUT_MODES: { [string]: boolean } = { source_payload = true, transform_output = true }

-- Standard registry-entry keys that are never part of a port's declaration surface.
local ENTRY_STANDARD_KEYS: { [string]: boolean } = {
    name = true, kind = true, meta = true, id = true, data = true, version = true,
    source = true, imports = true, modules = true, method = true, contracts = true,
}

local function entry_meta(entry: any): Map
    if type(entry) ~= "table" then return {} end
    if type((entry :: any).meta) == "table" then return (entry :: any).meta :: Map end
    if type((entry :: any).data) == "table" and type((entry :: any).data.meta) == "table" then return (entry :: any).data.meta :: Map end
    return {}
end

local function entry_data(entry: any): Map
    if type(entry) == "table" and type((entry :: any).data) == "table" then return (entry :: any).data :: Map end
    return {}
end

local function entry_id(entry: any): string
    if type(entry) ~= "table" then return "" end
    return tostring((entry :: any).id or "")
end

-- A port entry carries its declaration fields at the top level in yaml; the live
-- registry surfaces them under .data. Read either.
local function port_field(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    local data = (entry :: any).data
    if type(data) == "table" and (data :: Map)[key] ~= nil then return (data :: Map)[key] end
    return (entry :: Map)[key]
end

-- The declared field names of a port entry (for unknown-field rejection).
local function port_declared_keys(entry: any): { [string]: boolean }
    local out: { [string]: boolean } = {}
    if type(entry) ~= "table" then return out end
    local data = (entry :: any).data
    if type(data) == "table" then
        for k, _ in pairs(data :: Map) do if type(k) == "string" then out[k] = true end end
        return out
    end
    for k, _ in pairs(entry :: Map) do
        if type(k) == "string" and not ENTRY_STANDARD_KEYS[k] then out[k] = true end
    end
    return out
end

local function is_port_entry(entry: any): boolean
    return entry_meta(entry).type == PORT_META_TYPE
end

local function has_contract(entry: any, contract_id: string): boolean
    local contracts = entry_data(entry).contracts
    if type(contracts) ~= "table" then return false end
    for _, raw in ipairs(contracts :: { any }) do
        local c = type(raw) == "table" and (raw :: Map) or {}
        if c.contract == contract_id then return true end
    end
    return false
end

local function has_contract_method(entry: any, contract_id: string, method: string): boolean
    local contracts = entry_data(entry).contracts
    if type(contracts) ~= "table" then return false end
    for _, raw in ipairs(contracts :: { any }) do
        local c = type(raw) == "table" and (raw :: Map) or {}
        if c.contract == contract_id and type(c.methods) == "table" and type(c.methods[method]) == "string" and c.methods[method] ~= "" then
            return true
        end
    end
    return false
end

local function event_output_set(entry: any): { [string]: boolean }
    local set: { [string]: boolean } = {}
    local events = entry_meta(entry).events
    local list = type(events) == "table" and type((events :: Map).output) == "table" and (events :: Map).output or {}
    for _, raw in ipairs(list :: { any }) do
        local typ = type(raw) == "table" and (raw :: Map).type or nil
        if type(typ) == "string" and typ ~= "" then set[typ] = true end
    end
    return set
end

local function canonical_event_type(typ: string): boolean
    return typ:match("^[%w_%.]+%.events:[%w_%-]+%.[%w_%-]+$") ~= nil
end

local function decode_schema(raw: any): (any?, string?)
    if type(raw) == "table" then return raw, nil end
    if type(raw) ~= "string" or raw == "" then return nil, nil end
    local decoded, err = json.decode(raw)
    if err then return nil, tostring(err) end
    return decoded, nil
end

local function table_empty(t: any): boolean
    if type(t) ~= "table" then return false end
    return next(t :: { [any]: any }) == nil
end

local function validate_property_schema(failures: FailureList, id: string, schema_name: string, path: string, schema: any)
    if type(schema) ~= "table" then return end
    local s = schema :: Map
    if table_empty(s) then
        failures[#failures + 1] = id .. " " .. schema_name .. " property " .. path .. " is bare; add a type or description"
        return
    end
    if type(s.properties) == "table" then
        for name, child in pairs(s.properties :: { [string]: any }) do
            validate_property_schema(failures, id, schema_name, path .. "." .. tostring(name), child)
        end
    end
    if type(s.items) == "table" then
        validate_property_schema(failures, id, schema_name, path .. "[]", s.items)
    end
end

local function validate_schema(failures: FailureList, id: string, schema_name: string, raw: any)
    local schema, err = decode_schema(raw)
    if err then
        failures[#failures + 1] = id .. " " .. schema_name .. " is not valid JSON schema: " .. err
        return
    end
    if type(schema) == "table" and type((schema :: Map).properties) == "table" then
        for name, prop in pairs((schema :: Map).properties :: { [string]: any }) do
            validate_property_schema(failures, id, schema_name, tostring(name), prop)
        end
    end
end

-- Resolve a referenced entry: prefer the offline index (self-contained fixtures),
-- fall back to the live registry.
local function lookup(index: Map, id: string): any
    if type(id) ~= "string" or id == "" then return nil end
    if index[id] ~= nil then return index[id] end
    local entry, err = registry.get(id)
    if err or type(entry) ~= "table" then return nil end
    return entry
end

-- Rules 1-6 (contract §3) for one port entry.
local function validate_port(failures: FailureList, index: Map, port: any)
    local id = entry_id(port)
    local meta = entry_meta(port)

    -- Rule 5: title required.
    if type(meta.title) ~= "string" or (meta.title :: string) == "" then
        failures[#failures + 1] = id .. " port is missing meta.title"
    end

    -- Rule 6: unknown fields rejected.
    for key, _ in pairs(port_declared_keys(port)) do
        if not PORT_DECL_FIELDS[key] then
            failures[#failures + 1] = id .. " port declares unknown field " .. key
        end
    end

    -- Rule 1: binding exists and implements a backing.
    local binding_id = tostring(port_field(port, "binding") or "")
    local binding_entry: any = nil
    if binding_id == "" then
        failures[#failures + 1] = id .. " port declares no binding"
    else
        binding_entry = lookup(index, binding_id)
        if binding_entry == nil then
            failures[#failures + 1] = id .. " port binding not found: " .. binding_id
        end
    end
    local outputs: { [string]: boolean } = binding_entry ~= nil and event_output_set(binding_entry) or {}
    local has_writable = binding_entry ~= nil and has_contract(binding_entry, WRITABLE_CONTRACT)
    local has_pullable = binding_entry ~= nil and has_contract(binding_entry, PULLABLE_CONTRACT)
    local has_events = next(outputs) ~= nil
    if binding_entry ~= nil and not has_events and not has_writable and not has_pullable then
        failures[#failures + 1] = id .. " port binding " .. binding_id .. " implements no backing (events.output | writable | pullable)"
    end

    -- Markers.
    local event = port_field(port, "event")
    local operations = port_field(port, "operations")
    local has_event = type(event) == "string" and (event :: string) ~= ""
    local has_operations = operations ~= nil

    -- Rule 2: exactly one kind marker (ordered precedence: event > operations >
    -- pullable). Declaring both markers is an error.
    if has_event and has_operations then
        failures[#failures + 1] = id .. " port declares both event and operations markers"
    end

    if has_event then
        -- events port. Rule 2: event resolves to an event-type entry AND is listed
        -- in the binding's events.output.
        local event_entry = lookup(index, event :: string)
        if event_entry == nil then
            failures[#failures + 1] = id .. " port event does not resolve: " .. tostring(event)
        else
            if entry_meta(event_entry).type ~= EVENT_META_TYPE then
                failures[#failures + 1] = id .. " port event " .. tostring(event) .. " is not a " .. EVENT_META_TYPE .. " entry"
            end
            -- Rule 3: the event entry carries the output-face schema.
            local schema = (event_entry :: any).schema
            if schema == nil and type((event_entry :: any).data) == "table" then schema = (event_entry :: any).data.schema end
            if schema == nil then
                failures[#failures + 1] = id .. " port event " .. tostring(event) .. " has no schema (the events port output face)"
            end
        end
        if binding_entry ~= nil and not outputs[event :: string] then
            failures[#failures + 1] = id .. " port event " .. tostring(event) .. " is missing from the binding's events.output"
        end
    elseif has_operations then
        -- store port. Rule 2: operations is a map ⊆ writable ABI. Rule 1: writable.write.
        if type(operations) ~= "table" then
            failures[#failures + 1] = id .. " port operations must be a map"
        else
            local ops = operations :: Map
            if binding_entry ~= nil and not has_contract_method(binding_entry, WRITABLE_CONTRACT, "write") then
                failures[#failures + 1] = id .. " store port binding has no " .. WRITABLE_CONTRACT .. ".write"
            end
            for op, decl in pairs(ops) do
                if type(op) ~= "string" or not WRITABLE_OPS[op] then
                    failures[#failures + 1] = id .. " store port declares unknown operation " .. tostring(op)
                elseif type(decl) == "table" then
                    for key, _ in pairs(decl :: Map) do
                        if not OP_DECL_FIELDS[key] then
                            failures[#failures + 1] = id .. " operation " .. op .. " declares unknown field " .. tostring(key)
                        end
                    end
                end
            end
            if ops.list_keys ~= nil then
                local lk = type(ops.list_keys) == "table" and (ops.list_keys :: Map) or {}
                if ops.delete == nil then
                    failures[#failures + 1] = id .. " store port list_keys requires a delete operation"
                end
                if type(lk["function"]) ~= "string" or lk["function"] == "" then
                    failures[#failures + 1] = id .. " store port list_keys is missing function"
                end
            end
        end
        -- Rule 3: store ⇒ input_schema required.
        if port_field(port, "input_schema") == nil then
            failures[#failures + 1] = id .. " store port is missing input_schema"
        end
        validate_schema(failures, id, "input_schema", port_field(port, "input_schema"))
        validate_schema(failures, id, "output_schema", port_field(port, "output_schema"))
    else
        -- collection port (no marker): the binding must be pullable.
        if binding_entry ~= nil and not has_pullable then
            failures[#failures + 1] = id .. " port declares no kind marker and its binding is not pullable"
        end
        -- Rule 3: collection ⇒ output_schema required.
        if port_field(port, "output_schema") == nil then
            failures[#failures + 1] = id .. " collection port is missing output_schema"
        end
        validate_schema(failures, id, "output_schema", port_field(port, "output_schema"))
        -- reconcile is a collection-only concern; when present it names pull_keys.
        local reconcile = port_field(port, "reconcile")
        if reconcile ~= nil then
            local rec = type(reconcile) == "table" and (reconcile :: Map) or {}
            if type(rec.pull_keys) ~= "string" or rec.pull_keys == "" then
                failures[#failures + 1] = id .. " collection port reconcile is missing pull_keys function"
            end
        end
    end

    local input_mode = port_field(port, "input_mode")
    if input_mode ~= nil then
        if not has_operations then
            failures[#failures + 1] = id .. " port input_mode is only valid for a store port"
        elseif type(input_mode) ~= "string" or not STORE_INPUT_MODES[input_mode :: string] then
            failures[#failures + 1] = id .. " port input_mode is unsupported: " .. tostring(input_mode)
        end
    end

    -- reconcile on a non-collection port is meaningless.
    if (has_event or has_operations) and port_field(port, "reconcile") ~= nil then
        failures[#failures + 1] = id .. " port declares reconcile but is not a collection port"
    end

    -- Rule 4: config_schema may declare at most one picker field. That field is the
    -- primary selector by implication. A role:primary marker is allowed only when it
    -- names that picker; it is never a fallback selector.
    local config_schema = port_field(port, "config_schema")
    if type(config_schema) == "table" then
        local picker_count = 0
        local primary_count = 0
        for _, def in pairs(config_schema :: Map) do
            if type(def) == "table" then
                local field = def :: Map
                local has_picker = type(field.picker) == "string" and field.picker ~= "" and field.picker ~= "wc-schema-form"
                if has_picker then picker_count = picker_count + 1 end
                if field.role == "primary" then
                    primary_count = primary_count + 1
                    if not has_picker then
                        failures[#failures + 1] = id .. " port config_schema role:primary field has no picker"
                    end
                end
            end
        end
        if picker_count > 1 then
            failures[#failures + 1] = id .. " port config_schema declares more than one picker field"
        end
        if primary_count > 1 then
            failures[#failures + 1] = id .. " port config_schema declares more than one role:primary field"
        end
    end
end

-- validate_bindings: registry-validation + install-gate check. Validates every PORT
-- entry in `entries` against its binding + event references (resolved from the input
-- first, else the live registry), and keeps the binding-level rule that every
-- meta.events.output value is a well-formed <module>.events:<noun>.<verb> id.
function M.validate_bindings(entries: any): FailureList
    local failures: FailureList = {}
    local list = type(entries) == "table" and (entries :: { any }) or {}

    local index: Map = {}
    for _, entry in ipairs(list) do
        local eid = entry_id(entry)
        if eid ~= "" then index[eid] = entry end
    end

    for _, entry in ipairs(list) do
        -- Binding-level: events.output values must be canonical event-type ids.
        for typ, _ in pairs(event_output_set(entry)) do
            if not canonical_event_type(typ) then
                failures[#failures + 1] = entry_id(entry) .. " events.output " .. typ .. " is not <module>.events:<noun>.<verb>"
            end
        end
        if is_port_entry(entry) then
            validate_port(failures, index, entry)
        end
    end

    table.sort(failures)
    return failures
end

return M
