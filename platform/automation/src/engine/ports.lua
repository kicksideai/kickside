-- The port catalog (first-class kickside.automation.port entries): sources
-- and sinks with their descriptors, the registry-versioned catalog
-- snapshot and port resolution. The sink writer lives in engine_sink_writer.

local automation_types = require("types")
local support = require("engine_support")
local schema = require("engine_schema")

type Map = { [string]: any }

local part = {}

-- attach(M, dependencies, P) defines this part's engine functions on M; P
-- carries the private helpers the engine parts share.
function part.attach(M: any, dependencies: any, P: any): ()
    local PORT_META_TYPE = support.PORT_META_TYPE
    local PULLABLE_CONTRACT = support.PULLABLE_CONTRACT
    local entry_field = support.entry_field
    local first_class = support.first_class
    local schema_or_nil = support.schema_or_nil
    local trim = support.trim
    local field_key = schema.field_key

    -- Whether a binding entry implements a data contract (non-empty method on it).
    local function binding_implements(binding_entry: any, contract_id: string): boolean
        local data = type(binding_entry) == "table" and (binding_entry :: any).data or nil
        local contracts = type(data) == "table" and (data :: Map).contracts or nil
        if type(contracts) ~= "table" then return false end
        for _, raw in ipairs(contracts :: { any }) do
            local c = type(raw) == "table" and (raw :: Map) or {}
            if c.contract == contract_id then return true end
        end
        return false
    end

    -- Whether a store port's operations map declares an operation. The canonical form
    -- is a map ({ upsert = {...} }); validation rejects every other encoding.
    local function declares_operation(operations: any, name: string): boolean
        if type(operations) ~= "table" then return false end
        return (operations :: Map)[name] ~= nil
    end

    -- The write-capability tier of a store port: "full" when it declares the whole
    -- upsert + delete + list_keys set (written items can be reconciled and retracted),
    -- "append_only" when it only receives writes.
    local function store_tier(operations: any): string
        if declares_operation(operations, "upsert")
            and declares_operation(operations, "delete")
            and declares_operation(operations, "list_keys") then
            return "full"
        end
        return "append_only"
    end

    -- Resolve the output face of an events port from its referenced event-type entry's
    -- schema (the event's one home). Returns nil when the event entry cannot be read.
    local function event_output_face(registry: automation_types.RegistryModule, event_id: string): any
        if type(event_id) ~= "string" or event_id == "" then return nil end
        local entry, err = registry.get(event_id)
        if err or type(entry) ~= "table" then return nil end
        local schema = (entry :: any).schema
        if schema ~= nil then return schema_or_nil(schema) end
        local data = (entry :: any).data
        if type(data) == "table" then return schema_or_nil((data :: Map).schema) end
        return nil
    end

    -- port_descriptor derives one catalog descriptor from a port entry and its owning
    -- binding, by the ordered precedence markers > pullable backing. Returns nil + an
    -- error string when the port cannot be classified or its backing is missing.
    local function port_descriptor(registry: automation_types.RegistryModule, port_entry: any, binding_index: { [string]: any }): (Map?, string?)
        local typed_port = port_entry :: automation_types.RegistryEntry
        local port_meta: Map = typed_port.meta or {}
        local binding = tostring(entry_field(port_entry, "binding") or "")
        if binding == "" then return nil, tostring(typed_port.id) .. " declares no binding" end
        local binding_entry = binding_index[binding]
        if binding_entry == nil then return nil, tostring(typed_port.id) .. " binding not found: " .. binding end
        local binding_meta: Map = (type((binding_entry :: any).meta) == "table" and (binding_entry :: any).meta or {}) :: Map

        local event = entry_field(port_entry, "event")
        local operations = entry_field(port_entry, "operations")
        -- A port declares its data faces as JSON schema text; the catalog serves them
        -- decoded, so an install input built from a descriptor face (a data sync
        -- carries its source face as output_schema) matches the object shape the
        -- installing type declares in meta.inputs.
        local output_schema = schema_or_nil(entry_field(port_entry, "output_schema"))
        local input_schema = schema_or_nil(entry_field(port_entry, "input_schema"))
        local input_mode = entry_field(port_entry, "input_mode")

        -- A component-picker selector picks an instance of the port's own binding,
        -- so the binding's thread_class is the picker's listing filter. Carry it onto
        -- the field (the schema form forwards a field's `class` to the picker) on a
        -- copy, since the registry entry is shared. A binding that declares no
        -- thread_class yields an unfiltered picker: that is a missing declaration on
        -- the binding, not something to infer here.
        local config_schema = entry_field(port_entry, "config_schema")
        local binding_thread_class = tostring(binding_meta.thread_class or "")
        if type(config_schema) == "table" and binding_thread_class ~= "" then
            local enriched: Map = {}
            for field_key, field_value in pairs(config_schema :: Map) do
                if type(field_value) == "table"
                    and tostring((field_value :: Map).picker or "") == "wc-component-picker"
                    and (field_value :: Map).class == nil then
                    local field_copy: Map = {}
                    for k, v in pairs(field_value :: Map) do field_copy[k] = v end
                    field_copy.class = binding_thread_class
                    enriched[field_key] = field_copy
                else
                    enriched[field_key] = field_value
                end
            end
            config_schema = enriched
        end
        local desc: Map = {
            id = typed_port.id,
            binding = binding,
            class = first_class(binding_meta),
            config_schema = config_schema,
            title = (type(port_meta.title) == "string" and port_meta.title ~= "" and port_meta.title) or typed_port.id,
            name = (type(port_meta.title) == "string" and port_meta.title ~= "" and port_meta.title) or typed_port.id,
            binding_title = (type(binding_meta.title) == "string" and binding_meta.title ~= "" and binding_meta.title) or binding,
            description = port_meta.comment or binding_meta.comment or "",
            icon = port_meta.icon or binding_meta.icon or "",
            provider = binding_meta.provider or "",
            group = binding_meta.group or "",
        }
        local component_block = P.enrich_component_block(binding_meta.component)
        if component_block then desc.component = component_block end

        if type(event) == "string" and event ~= "" then
            -- events port: output face derived from the referenced event-type entry's
            -- schema (the event's one home).
            desc.surface = "events"
            desc.event = event
            desc.output_schema = event_output_face(registry, event :: string)
        elseif operations ~= nil then
            desc.surface = "store"
            desc.operations = operations
            desc.input_schema = input_schema
            desc.output_schema = output_schema
            -- The sink's declared delivery semantics and input shape (design v5 §3.2).
            desc.delivery = binding_meta.delivery
            desc.input_shape = binding_meta.input_shape
            if type(input_mode) == "string" and input_mode ~= "" then desc.input_mode = input_mode end
            desc.store_tier = store_tier(operations)
        elseif binding_implements(binding_entry, PULLABLE_CONTRACT) then
            desc.surface = "collection"
            desc.output_schema = output_schema
            local reconcile = entry_field(port_entry, "reconcile")
            if reconcile ~= nil then desc.reconcile = reconcile end
        else
            return nil, tostring(typed_port.id) .. " declares no kind marker and its binding is not pullable"
        end
        return desc, nil
    end

    -- build_catalog derives a descriptor for every port entry, indexed against the
    -- contract.binding entries that back them. A port that fails to classify is logged
    -- and skipped so one bad declaration never blanks the catalog.
    -- The registry version token gating the catalog snapshot: an opaque comparable
    -- value naming the registry view this runtime currently serves. nil on a
    -- runtime without the capability — the caller then builds per call, exactly
    -- the pre-snapshot behavior, so freshness is never emulated with a clock.
    local function registry_version_token(): (any, error?)
        local registry = dependencies.registry
        if type((registry :: any).current_version) ~= "function" then return nil, nil end
        local version, verr = (registry :: any).current_version()
        if verr ~= nil then return nil, errors.wrap(verr, "read port registry version") end
        local token = version ~= nil and (version :: any):id() or nil
        if token == nil then
            return nil, errors.new({kind = errors.INTERNAL, retryable = false,
                message = "port registry version is missing", details = {code = "registry_version_missing"}})
        end
        return token, nil
    end

    -- One immutable catalog per registry version. Port resolution runs on every
    -- delivered event batch and every poll tick; rebuilding the catalog there
    -- means materializing every contract.binding per event, which is what burned
    -- prod flat. The double-token read publishes a snapshot only when the registry
    -- view held still across the build; a racing change discards the build and the
    -- next caller rebuilds against the newer view. A version change replaces the
    -- whole snapshot, so a renamed or deleted port fails closed instead of
    -- resolving from a stale catalog.
    local catalog_snapshot: Map = {}

    local function build_catalog(): ({Map}?, any, { [string]: Map }?)
        local token, token_err = registry_version_token()
        if token_err then return nil, token_err, nil end
        if token ~= nil and catalog_snapshot.token == token and catalog_snapshot.list ~= nil then
            return catalog_snapshot.list :: {Map}, nil, catalog_snapshot.by_id :: { [string]: Map }
        end

        local registry = dependencies.registry :: automation_types.RegistryModule
        local ports, perr = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = PORT_META_TYPE })
        if perr then return nil, perr, nil end
        local bindings, berr = registry.find({ [".kind"] = "contract.binding" })
        if berr then return nil, berr, nil end

        local binding_index: { [string]: any } = {}
        for _, b in ipairs(bindings or {}) do
            binding_index[tostring((b :: automation_types.RegistryEntry).id or "")] = b
        end

        local out: {Map} = {}
        local by_id: { [string]: Map } = {}
        for _, port_entry in ipairs(ports or {}) do
            local desc, derr = port_descriptor(registry, port_entry, binding_index)
            if desc then
                out[#out + 1] = desc
                by_id[tostring((desc :: Map).id or "")] = desc
            elseif derr then
                local logger_mod = dependencies.logger
                if logger_mod then
                    (logger_mod :: any):named("automations.catalog"):error("port entry skipped", { error = derr })
                end
            end
        end
        table.sort(out, function(a: Map, b: Map) return tostring(a.title or "") < tostring(b.title or "") end)

        if token ~= nil then
            local after, after_err = registry_version_token()
            if after_err then return nil, after_err, nil end
            if after == token then
                catalog_snapshot.token = token
                catalog_snapshot.list = out
                catalog_snapshot.by_id = by_id
            end
        end
        return out, nil, by_id
    end

    -- Partition the catalog by data direction, derived from the port surface: store
    -- ports flow IN (sinks); collection and events ports flow OUT (sources).
    local function surface_is_dir(surface: string, dir: string): boolean
        if dir == "in" then return surface == "store" end
        return surface == "collection" or surface == "events"
    end

    local function list_io(dir: string): ({Map}?, any)
        local catalog, err = build_catalog()
        if err then return nil, err end
        local out: {Map} = {}
        for _, desc in ipairs(catalog or {}) do
            if surface_is_dir(tostring((desc :: Map).surface or ""), dir) then out[#out + 1] = desc end
        end
        return out, nil
    end

    -- list_sinks: every store port (surface="store"). The binding's
    -- kickside.data:writable.write is the backing. Every row carries store_tier
    -- ("full" | "append_only") — consumers read the computed field, not operations.
    function M.list_sinks(): ({Map}?, error?)
        local list, err = list_io("in")
        if err then return nil, err end
        return (list :: {Map}?), nil
    end

    -- list_sources: every source port (surface="collection" | "events"). Collection
    -- sources are pulled through their kickside.data:pullable backing; events sources
    -- are component thread events consumed by an automation-owned projection. Consumers
    -- read the computed surface, not dir/mode.
    function M.list_sources(): ({Map}?, error?)
        local list, err = list_io("out")
        if err then return nil, err end
        return (list :: {Map}?), nil
    end

    -- resolve_io_port recovers a port descriptor by its PORT ENTRY id — the
    -- descriptor the run path (write_to_sink / read_from_source) needs to act through
    -- the port's backing. Stored specs carry port entry ids (v3 cutover), so the
    -- match is by `id` only. Returns nil with an error when no port declares the id.
    local function resolve_io_port(key: string, dir: string, label: string): (Map?, any)
        if type(key) ~= "string" or key == "" then return nil, errors.new({ kind = errors.INVALID, retryable = false, message = label .. " port is required" }) end
        local _, err, by_id = build_catalog()
        if err then return nil, errors.wrap(err, "port registry unavailable") end
        local desc = (by_id :: { [string]: Map })[key]
        if desc ~= nil and surface_is_dir(tostring(desc.surface or ""), dir) then
            return desc, nil
        end
        return nil, errors.new({ kind = errors.INVALID, retryable = false, message = label .. " port not found: " .. key })
    end

    -- resolve_sink / resolve_source: the port descriptor an automation stored
    -- under its sink / source port id, recovered at run time.
    function M.resolve_sink(port_id: string): (Map?, any)
        local desc, err = resolve_io_port(port_id, "in", "sink")
        return (desc :: Map?), err
    end

    function M.resolve_source(port_id: string): (Map?, any)
        local desc, err = resolve_io_port(port_id, "out", "source")
        return (desc :: Map?), err
    end

    -- source_thread(endpoint, thread_id) -> the thread an events source reads: the
    -- selected one, or the installing actor's one instance of a picker-less
    -- per-user source.
    function M.source_thread(endpoint: Map, thread_id: string?): (string?, error?)
        if thread_id and thread_id ~= "" then return thread_id, nil end
        for _, field in pairs(type(endpoint.config_schema) == "table" and (endpoint.config_schema :: Map) or {}) do
            local picker = type(field) == "table" and (field :: Map).picker or nil
            if type(picker) == "string" and picker ~= "" and picker ~= "wc-schema-form" then
                return nil, errors.new({kind = errors.INVALID, retryable = false, message = "the events source " .. tostring(endpoint.id) .. " requires a selected thread_id", details = {code = "source_instance_required", field = "trigger.config.thread_id"}})
            end
        end
        local resolved, err = M.component_id_for_actor(trim(endpoint.class))
        if err then return nil, (errors.wrap(err, "the events source " .. tostring(endpoint.id) .. " has no instance") :: error) end
        if not resolved or trim(resolved) == "" then
            return nil, (errors.new({kind = errors.INTERNAL, retryable = false,
                message = "the events source " .. tostring(endpoint.id) .. " has no instance",
                details = {code = "source_identity_missing", field = "trigger.config.thread_id"}}) :: error)
        end
        return trim(resolved), nil
    end

    function M.source_samples(port_id: string, config: any, limit: any): (Map?, any)
        if type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > 100 then
            return nil, errors.new({kind = errors.INVALID, message = "sample limit must be an integer between 1 and 100", retryable = false})
        end
        local desc, resolve_err = M.resolve_source(port_id)
        if resolve_err or not desc then return nil, resolve_err end
        local selected = type(config) == "table" and (config :: Map) or {}
        local request: Map = { source_ref = port_id, config = selected, limit = limit, idempotency_key = (dependencies.uuid :: any).v7() }
        if desc.surface == "events" then
            local thread_id, thread_err = M.source_thread(desc, trim(selected.thread_id))
            if thread_err then return nil, thread_err end
            request.source_kind, request.source_thread_id, request.event_type = "event", thread_id, desc.event
        else
            request.source_kind = "collection"
        end
        local page, call_err = (dependencies.funcs :: any).new():call("kickside.automation:round_acquire", request)
        local acquired, acquire_err = (dependencies.failure_classification :: any).native_result(page, call_err)
        if acquire_err then return nil, acquire_err end
        if type(acquired) ~= "table" or type(acquired.items) ~= "table" then
            return nil, errors.new({kind = errors.INTERNAL, message = "source acquisition returns no items"})
        end
        local samples: {any} = {}
        for _, item in ipairs(acquired.items) do
            if #samples >= limit then break end
            if item.op ~= "delete" and item.payload ~= nil then samples[#samples + 1] = item.payload end
        end
        local schema_config: Map = {}
        for key, value in pairs(selected) do schema_config[key] = value end
        if request.source_thread_id then schema_config.thread_id = request.source_thread_id end
        local output_schema, schema_err = M.source_schema(port_id, schema_config)
        if schema_err then return nil, schema_err end
        return { samples = samples, output_schema = output_schema }, nil
    end

    -- Resolve a selected source's payload face through its optional contract.
    -- Static catalog descriptors remain immutable and kind-wide.
    function M.source_schema(port_id: string, config: any): (any?, any)
        local desc, resolve_err = M.resolve_source(port_id)
        if resolve_err or not desc then return nil, resolve_err end
        local registry = dependencies.registry :: automation_types.RegistryModule
        local binding, binding_err = registry.get(tostring(desc.binding))
        if binding_err then return nil, binding_err end
        local contract_id = "kickside.trigger:source_schema"
        if not binding_implements(binding, contract_id) then return desc.output_schema, nil end
        local selected = type(config) == "table" and (config :: Map) or {}
        local component_id = trim(selected.thread_id)
        if component_id == "" then
            return nil, errors.new({ kind = errors.INVALID, message = "source schema requires selected thread_id", retryable = false })
        end
        local definition, definition_err = (dependencies.contract :: any).get(contract_id)
        if definition_err or not definition then return nil, definition_err end
        local instance, open_err = definition:with_context({ component_id = component_id }):open(tostring(desc.binding))
        if open_err or not instance then return nil, open_err end
        local answer, describe_err = instance:describe({})
        if describe_err then return nil, describe_err end
        if type(answer) ~= "table" or type(answer.context_schema) ~= "table" then
            return nil, errors.new({ kind = errors.INTERNAL, message = "source schema describe returns no context_schema", retryable = false })
        end
        return answer.context_schema, nil
    end

    -- The deterministic per-actor component id for a class. A per-user singleton
    -- source component (uploads, inbox) has exactly one instance, so a trigger on it
    -- resolves the instance from the installing actor + class instead of prompting a
    -- picker that would only ever offer one choice.
    function M.component_id_for_actor(class: string): (string?, error?)
        if type(class) ~= "string" or class == "" then
            return nil, (errors.new({kind = errors.INVALID, retryable = false, message = "source declares no class",
                details = {code = "source_class_required", field = "class"}}) :: error)
        end
        local sec = dependencies.security
        local actor = sec and (sec :: any).actor()
        if not actor then
            return nil, (errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "authentication required",
                details = {code = "authentication_required", field = "actor"}}) :: error)
        end
        local actor_id = (actor :: any):id()
        if type(actor_id) ~= "string" or actor_id == "" then
            return nil, (errors.new({kind = errors.INTERNAL, retryable = false, message = "actor id unavailable",
                details = {code = "actor_identity_unavailable", field = "actor.id"}}) :: error)
        end
        local id = (dependencies.autoinit :: any).component_id(actor_id, class)
        return (id :: string), nil
    end

    P.registry_version_token = registry_version_token
end

return part
