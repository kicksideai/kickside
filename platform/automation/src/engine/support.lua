-- Pure helpers and shared vocabulary of the automation engine: reserved
-- private-context keys, registry entry field readers, portable-input copy and
-- merge, and small value utilities. No dependencies are injected here.

local automation_types = require("types")
local json = require("json")
local canonical_json = require("canonical_json")
local execution_identity = require("execution_identity")
local errors = require("errors")

local P = {}

type Map = { [string]: any }

-- automation_error keeps a structured cause's kind, retryability and details
-- under the engine's message; a plain cause is carried in the message.
local function automation_error(message: string, kind: string, cause: any?): error
    if type(cause) == "userdata" then
        return (errors.wrap(cause, message) :: error)
    end
    return (errors.new({ message = message .. (cause ~= nil and (": " .. tostring(cause)) or ""), kind = kind }) :: error)
end

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function copy_map(raw: any): Map
    local out: Map = {}
    if type(raw) ~= "table" then return out end
    for k, v in pairs(raw :: Map) do out[k] = v end
    return out
end

-- Reserved private_context key for the component's v2 execution identity,
-- written by the component create path and its identity commands. Provider
-- types keep only their own wiring (which agent, which channel) in state.
local EXECUTION_IDENTITY_KEY = execution_identity.CONTEXT_KEY

local function pagination_int(value: any, name: string): (integer?, string?)
    if value == nil then return nil, nil end
    if type(value) ~= "number" or value ~= math.floor(value) then
        return nil, name .. " must be an integer"
    end

    local n = value :: integer
    if n < 0 then return nil, name .. " must be non-negative" end
    return n, nil
end

local PORTABLE_INPUT_KEY = "_portable_input"

-- ─── contract metadata helpers ─────────────────────────────────────────
--
-- The api endpoints walk binding metadata/contracts to discover what install /
-- delete / action methods are exposed. These helpers centralize the walking
-- so api/install_automation, api/list_types, api/call_action stay slim.

local LIFECYCLE_METHODS = automation_types.LIFECYCLE_METHODS

-- Pull the contracts list off a registry entry. Lua entry records expose
-- {id, kind, meta, data} — the YAML `contracts:` array lives in entry.data,
-- so entry.contracts is always nil.
local function entry_contracts(entry: automation_types.RegistryEntry?): { automation_types.BindingContract }
    if type(entry) ~= "table" then return {} end
    local data = entry.data
    if type(data) ~= "table" then return {} end
    local contracts = data.contracts
    if type(contracts) ~= "table" then return {} end
    return contracts
end

local function declared_action_name(spec: any): string?
    if type(spec) == "string" then return spec end
    if type(spec) == "table" and type(spec.name) == "string" then return spec.name end
    return nil
end

-- ─── Platform lifecycle ops (used by HTTP api + MCP tool) ──────────────
--
-- These wrap the steps that go from "user wants to install/list/delete an
-- automation" into "umbrella component with private_context + rollback
-- chain". Both api/* and the MCP admin tool delegate to these so the
-- behaviour stays in one place.

local AUTOMATION_TYPE = automation_types.AUTOMATION_TYPE

local function class_array_from_meta(entry_meta: Map): {string}
    local out: {string} = {}
    if type(entry_meta.class) == "table" then
        for _, c in ipairs(entry_meta.class) do out[#out + 1] = c end
    elseif type(entry_meta.class) == "string" then
        out[#out + 1] = entry_meta.class
    end
    return out
end

local function copy_private_state(raw: any, omit_runtime: boolean?): automation_types.AutomationPrivateContext
    local out: automation_types.AutomationPrivateContext = {}
    if type(raw) ~= "table" then return out end
    for k, v in pairs(raw :: Map) do
        local hidden_runtime = omit_runtime == true and (k == "component_id" or k == "_rollback"
            or k == EXECUTION_IDENTITY_KEY or k == PORTABLE_INPUT_KEY)
        if not hidden_runtime then
            out[k] = v
        end
    end
    return out
end

-- Reserved private_context keys the engine owns; never surfaced as provider state.
local RUNTIME_VIEW_RESERVED_STATE_KEYS: { [string]: boolean } = {
    _rollback = true,
    public_state = true,
    component_id = true,
    [EXECUTION_IDENTITY_KEY] = true,
    [PORTABLE_INPUT_KEY] = true,
}

local function strip_reserved_state(raw: any): Map
    local out: Map = {}
    if type(raw) ~= "table" then return out end
    for k, v in pairs(raw :: Map) do
        if not RUNTIME_VIEW_RESERVED_STATE_KEYS[k] then out[k] = v end
    end
    return out
end

local function metadata_string(value: any, fallback: string): string
    if type(value) == "string" then return value end
    return fallback
end

local function safe_component_metadata(metadata: Map, fallback_title: string?): any
    local out: Map = {
        title = metadata_string(metadata.title, fallback_title or "Untitled"),
        icon = metadata_string(metadata.icon, ""),
        comment = metadata_string(metadata.comment, ""),
    }
    return out
end

-- ─── the port catalog (first-class kickside.automation.port entries) ─────────
-- A published connection point on a binding is a registry.entry with
-- meta.type = kickside.automation.port. It carries `binding` (the backing) and
-- exactly one kind marker: `event` (an events port, a real reference to a
-- kickside.core.threads.event entry), `operations` (a store port, the writable
-- ABI capability map), or neither (a collection port, whose backing implements
-- kickside.data:pullable). Publication is existence: an internal/audit event has
-- no port. The catalog walks the port entries and DERIVES each descriptor once --
-- kind, output face, class, store tier, presentation -- and every downstream
-- consumer (round, sync, UI) reads the derived descriptor, never re-derives.
--
-- Descriptor identity: `id` is the PORT ENTRY id; `binding` is the owning binding
-- id for runtime open + presentation. Declarations reference port entry
-- ids. The descriptor speaks the canonical vocabulary: `surface` is the kind,
-- `event` the events reference, `config_schema` the
-- config face, `output_schema`/`input_schema` the data faces, `operations` the
-- store ABI.
local PORT_META_TYPE = "kickside.automation.port"
local PULLABLE_CONTRACT = "kickside.data:pullable"

-- Read a port entry's declaration field. Live registry entries carry non-standard
-- top-level yaml keys under `.data`; test fixtures may set them directly.
local function entry_field(entry: any, key: string): any
    if type(entry) == "table" then
        local data = (entry :: any).data
        if type(data) == "table" and (data :: Map)[key] ~= nil then
            return (data :: Map)[key]
        end
        return (entry :: Map)[key]
    end
    return nil
end

-- The first declared class of a binding (meta.class is a string or a string list).
local function first_class(meta: Map): string
    local cls = meta.class
    if type(cls) == "string" then return cls :: string end
    if type(cls) == "table" and type((cls :: { any })[1]) == "string" then return tostring((cls :: { any })[1]) end
    return ""
end

-- A registry declaration carries a JSON schema either as a yaml mapping or as
-- the JSON text of a block scalar. Both forms decode to the same object here, so
-- every consumer of a declared schema reads one shape.
local function decode_json_table(raw: any): Map
    if type(raw) == "table" then return raw :: Map end
    if type(raw) ~= "string" or raw == "" then return {} end
    local decoded, err = json.decode(raw)
    if err or type(decoded) ~= "table" then return {} end
    return decoded :: Map
end

local function schema_or_nil(raw: any): any?
    local schema = decode_json_table(raw)
    if next(schema) == nil then return nil end
    return schema
end

local WRITABLE_CONTRACT = "kickside.data:writable"

-- Canonical drive-control vocabulary. Catalogs publish these descriptors and
-- the executor validates against this same table; kind metadata cannot override it.
local DRIVE_CONTROLS: { [string]: automation_types.AutomationControl } = {
    pause = { name = "pause" },
    resume = { name = "resume" },
    run_now = { name = "run_now" },
    replay = { name = "replay", request_id_required = true },
    resync = { name = "resync", request_id_required = true },
    discard = { name = "discard", request_id_required = true, keys_required = true },
}

local GENERIC_ACTIONS: { [string]: boolean } = {
    status = true,
    health = true,
    reconfigure = true,
    set_execution_identity = true,
}

for name, _ in pairs(DRIVE_CONTROLS) do GENERIC_ACTIONS[name] = true end

local function is_array(value: Map): boolean
    local count = 0
    for key, _ in pairs(value) do
        if type(key) ~= "number" or key < 1 or key ~= math.floor(key) then return false end
        count = count + 1
    end
    for index = 1, count do
        if value[index] == nil then return false end
    end
    return count > 0
end

local function portable_copy(value: any): any
    if type(value) ~= "table" then return value end
    local source = value :: Map
    if next(source) == nil then
        return json.encode(source) == "{}" and canonical_json.object({}) or {}
    end
    local out: Map = {}
    if is_array(source) then
        for index, item in ipairs(source) do out[index] = portable_copy(item) end
        return out
    end
    for key, item in pairs(source) do out[key] = portable_copy(item) end
    return out
end

local function portable_merge(base: any, overrides: any): any
    if type(overrides) ~= "table" then return overrides end
    local override_map = overrides :: Map
    if is_array(override_map) then
        local copied: Map = {}
        for index, value in ipairs(override_map) do copied[index] = portable_merge(nil, value) end
        return copied
    end
    local out: Map = (next(override_map) == nil and json.encode(override_map) == "{}")
        and canonical_json.object({}) or {}
    if type(base) == "table" and not is_array(base :: Map) then
        for key, value in pairs(base :: Map) do out[key] = portable_merge(nil, value) end
    end
    for key, value in pairs(override_map) do
        out[key] = portable_merge(out[key], value)
    end
    return out
end

local function reject_unknown_fields(value: Map, allowed: Map, label: string): error?
    for key, _ in pairs(value) do
        if type(key) ~= "string" or allowed[key] ~= true then
            return errors.new({ kind = errors.INVALID, message = label .. " contains unsupported field: " .. tostring(key) })
        end
    end
    return nil
end

local function is_object(value: any): boolean
    if type(value) ~= "table" then return false end
    for key, _ in pairs(value :: Map) do
        if type(key) ~= "string" then return false end
    end
    return true
end

P.AUTOMATION_TYPE = AUTOMATION_TYPE
P.EXECUTION_IDENTITY_KEY = EXECUTION_IDENTITY_KEY
P.GENERIC_ACTIONS = GENERIC_ACTIONS
P.DRIVE_CONTROLS = DRIVE_CONTROLS
P.LIFECYCLE_METHODS = LIFECYCLE_METHODS
P.PORTABLE_INPUT_KEY = PORTABLE_INPUT_KEY
P.PORT_META_TYPE = PORT_META_TYPE
P.PULLABLE_CONTRACT = PULLABLE_CONTRACT
P.WRITABLE_CONTRACT = WRITABLE_CONTRACT
P.class_array_from_meta = class_array_from_meta
P.copy_map = copy_map
P.copy_private_state = copy_private_state
P.declared_action_name = declared_action_name
P.entry_contracts = entry_contracts
P.entry_field = entry_field
P.first_class = first_class
P.is_object = is_object
P.pagination_int = pagination_int
P.portable_copy = portable_copy
P.portable_merge = portable_merge
P.reject_unknown_fields = reject_unknown_fields
P.safe_component_metadata = safe_component_metadata
P.schema_or_nil = schema_or_nil
P.strip_reserved_state = strip_reserved_state
P.trim = trim

P.automation_error = automation_error

return P
