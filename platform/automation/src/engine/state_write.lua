-- Automation state writes: public state, the patch_state product patch and
-- the portable install input.

local automation_types = require("types")
local support = require("engine_support")
local schema = require("engine_schema")
local declaration_mod = require("engine_declaration")
local errors = require("errors")

type Map = { [string]: any }

local part = {}

-- attach(M, dependencies, P) defines this part's engine functions on M; P
-- carries the private helpers the engine parts share.
function part.attach(M: any, dependencies: any, P: any): ()
    local EXECUTION_IDENTITY_KEY = support.EXECUTION_IDENTITY_KEY
    local PORTABLE_INPUT_KEY = support.PORTABLE_INPUT_KEY
    local copy_private_state = support.copy_private_state
    local portable_copy = support.portable_copy
    local portable_merge = support.portable_merge
    local public_state_field_map = schema.public_state_field_map
    local validate_install_input = schema.validate_install_input
    local validate_public_field_value = schema.validate_public_field_value
    local automation_error = support.automation_error

    -- The component's engine-owned keys (its declaration and execution identity)
    -- are visible to ADMIN only, so the declaration commands read them through
    -- the trusted system read after the caller's WRITE access is established.
    local function owned_context(component_id: string): (Map?, any)
        local component = dependencies.component :: automation_types.ComponentModule
        local ctx, ctx_err = component.get_private_context(component_id)
        if ctx_err then return nil, ctx_err end
        if type(ctx) ~= "table" then return nil, automation_error("automation not found", errors.NOT_FOUND) end
        return ctx :: Map, nil
    end
    P.owned_context = owned_context

    -- apply_declaration writes the portable declaration through the automation's
    -- reconfigure command: the caller is its operator and the automation's
    -- current execution identity its subject. A main_source re-declares the main
    -- drive's source with the declaration.
    local function apply_declaration(component_id: string, input: Map, main_source: Map?,
        state: Map?, public_meta: Map?, enabled: boolean?): (Map?, any)
        local security_mod = dependencies.security :: any
        local actor = security_mod.actor()
        local operator_id = actor and actor:id() or nil
        if type(operator_id) ~= "string" or operator_id == "" then
            return nil, automation_error("an authenticated actor is required to reconfigure an automation", errors.PERMISSION_DENIED)
        end
        local ctx, ctx_err = owned_context(component_id)
        if ctx_err or not ctx then return nil, ctx_err end
        local identity = (ctx :: Map)[EXECUTION_IDENTITY_KEY]
        if type(identity) ~= "table" or type((identity :: Map).principal) ~= "table" then
            return nil, automation_error("automation " .. component_id .. " has no execution identity", errors.INVALID)
        end
        local execution_identity = dependencies.execution_identity :: any
        local component = dependencies.component :: any
        local rows, rows_err = component.query({
            component_ids = { component_id }, access_mask = component.ACCESS.WRITE, include = { meta = true },
        })
        if rows_err or type(rows) ~= "table" or type(rows[1]) ~= "table" then
            return nil, rows_err or automation_error("automation kind is unavailable", errors.NOT_FOUND)
        end
        local type_id = rows[1].impl_id
        local entry, entry_err = (dependencies.registry :: any).get(type_id)
        if entry_err or type(entry) ~= "table" or type(entry.meta) ~= "table" then
            return nil, entry_err or automation_error("automation kind schema is unavailable", errors.INVALID)
        end
        return P.run_declaration_command({
            kind = "reconfigure",
            automation_id = component_id,
            operator_id = operator_id,
            subject_id = execution_identity.actor_key((identity :: Map).principal),
            subject_identity = identity,
            type_id = type_id,
            schema = entry.meta.inputs,
            declaration = portable_copy(input),
            main_source = main_source,
            state = state,
            public_meta = public_meta,
            enabled = enabled,
            writer = "kickside.automation:declaration_writer_apply",
            writer_args = {},
        })
    end

    -- write_public_state partially updates a component's public state (its render/read
    -- model) through component public meta, validating each provided field against the
    -- type's public_state_schema. WRITE-gated. Automation control methods (pause/resume,
    -- status transitions) use it so the card and list reflect a state change live via the
    -- component.meta.changed relay, without owning a projection.
    function M.write_public_state(component_id: string, patch: any): (any, error?)
        if type(component_id) ~= "string" or component_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "id is required" }) end
        if type(patch) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "patch must be a table" }) end
        local component = dependencies.component :: automation_types.ComponentModule
        local registry = dependencies.registry :: automation_types.RegistryModule
        local schema, _, schema_err = P.public_state_component(component, registry, component_id, component.ACCESS.WRITE)
        if schema_err then return nil, schema_err end
        local allowed_map, fields_err = public_state_field_map(schema)
        if fields_err then return nil, fields_err end
        local allowed: { [string]: any } = allowed_map or {}

        -- title/comment are core component-meta fields (not schema-declared read-model
        -- fields); a reconfigure that renames writes them alongside its public_state.
        local CORE_META: { [string]: boolean } = { title = true, comment = true }
        local fields: Map = {}
        for k, v in pairs(patch :: Map) do
            if type(k) ~= "string" then
                return nil, errors.new({ kind = errors.INVALID, message = "public_state field keys must be strings" })
            elseif CORE_META[k] then
                fields[k] = tostring(v)
            elseif allowed[k] ~= nil then
                local verr = validate_public_field_value(allowed[k], v, patch)
                if verr then return nil, verr end
                fields[k] = v
            else
                return nil, errors.new({ kind = errors.INVALID, message = "public_state contains undeclared field: " .. tostring(k) })
            end
        end
        if next(fields) == nil then return nil, errors.new({ kind = errors.INVALID, message = "patch must set at least one field" }) end

        local ok, set_err = (component :: any).set_meta(component_id, fields)
        if not ok then return nil, set_err end
        return { success = true, id = component_id, public_state = fields }, nil
    end

    -- patch_state merges a product's own private state fields and, with
    -- opts.public_meta, its public meta in one component update. The
    -- engine-owned keys (rollback chain, component id, public state, execution
    -- identity, portable declaration) are refused.
    function M.patch_state(component_id: string, patch: any, opts: automation_types.PatchStateOptions?): (any, any)
        if type(component_id) ~= "string" or component_id == "" then return nil, "id is required" end
        if type(patch) ~= "table" then return nil, "patch must be a table" end
        if (patch :: Map)._rollback ~= nil then
            return nil, "invalid patch: _rollback is managed by the automation runtime"
        end
        if (patch :: Map).component_id ~= nil then
            return nil, "invalid patch: component_id is managed by the automation runtime"
        end
        if (patch :: Map).public_state ~= nil then
            return nil, "invalid patch: public_state is managed by component public meta"
        end
        if (patch :: Map)[EXECUTION_IDENTITY_KEY] ~= nil then
            return nil, "invalid patch: " .. EXECUTION_IDENTITY_KEY .. " is managed by the automation runtime"
        end
        if (patch :: Map)[PORTABLE_INPUT_KEY] ~= nil then
            return nil, "invalid patch: portable install input is managed by the automation runtime"
        end
        if opts and opts.public_meta ~= nil and type(opts.public_meta) ~= "table" then
            return nil, "public_meta must be a table"
        end

        local component = dependencies.component :: automation_types.ComponentModule
        local current, read_err = component.get_context(component_id, component.ACCESS.WRITE)
        if read_err then return nil, read_err end

        -- The returned state is the stored state with this write applied;
        -- readers derive component_id, so it is not part of it.
        local next_state: Map = {}
        if type(current) == "table" then
            for k, v in pairs(current :: Map) do
                if k ~= "component_id" then next_state[k] = v end
            end
        end
        local write_patch: Map = {}
        for key, value in pairs(patch :: Map) do
            write_patch[key] = value
            next_state[key] = value
        end

        local commands: { any } = { { type = "PATCH_CONTEXT", payload = { patch = write_patch } } }
        if opts and type(opts.public_meta) == "table" and next(opts.public_meta) ~= nil then
            commands[#commands + 1] = { type = "SET_META", payload = { fields = opts.public_meta } }
        end
        local _, update_err = component.update(component_id, commands)
        if update_err then return nil, update_err end
        return { success = true, id = component_id, state = copy_private_state(next_state, true) }, nil
    end

    -- update_portable_input reserves the exported declaration and the kind's
    -- new state in one command. The declaration writer applies them in the
    -- component step before the new drive state can finalize.
    -- The declaration is held to the type's own meta.inputs here, the same contract
    -- install_type enforces, so an exported artifact is installable by construction.
    -- merge_portable_input folds an edit's fields over the STORED declaration and
    -- persists the merged whole. A reconfigure caller sends only what it changed;
    -- replacing the declaration wholesale with that partial input is how exported
    -- artifacts silently lost field maps and backfill windows. Arrays replace,
    -- maps merge -- the same law portable_merge applies to import overrides.
    function M.merge_portable_input(component_id: string, patch: any): (any, any)
        if type(component_id) ~= "string" or component_id == "" then return nil, "id is required" end
        if type(patch) ~= "table" then return nil, "portable install input patch must be a table" end
        local component = dependencies.component :: automation_types.ComponentModule
        local _, access_err = component.get_context(component_id, component.ACCESS.WRITE)
        if access_err then return nil, access_err end
        local owned, owned_err = owned_context(component_id)
        if owned_err or not owned then return nil, owned_err end
        local stored = (owned :: Map)[PORTABLE_INPUT_KEY]
        local merged = portable_merge(type(stored) == "table" and (stored :: Map) or nil, patch)
        return M.update_portable_input(component_id, merged)
    end

    -- opts = { source?, state?, public_meta?, enabled? }. The kind's state
    -- patch and public fields ride the same recoverable component step as its
    -- declaration; the component fence acknowledges them together (§4.7, §6.3).
    function M.update_portable_input(component_id: string, input: any, opts: any?): (any, any)
        if type(component_id) ~= "string" or component_id == "" then return nil, "id is required" end
        if type(input) ~= "table" then return nil, "portable install input must be a table" end
        if opts ~= nil and type(opts) ~= "table" then return nil, automation_error("declaration options must be a table", errors.INVALID) end
        local component = dependencies.component :: automation_types.ComponentModule
        local _, access_err = component.get_context(component_id, component.ACCESS.WRITE)
        if access_err then return nil, access_err end

        local registry = dependencies.registry :: automation_types.RegistryModule
        local rows, query_err = component.query({
            component_ids = { component_id },
            access_mask = component.ACCESS.WRITE,
            include = { meta = true },
        })
        if query_err then return nil, query_err end
        local row = rows and rows[1]
        if not row or type(row.impl_id) ~= "string" or row.impl_id == "" then return nil, "automation not found" end
        local raw_entry, get_err = registry.get(row.impl_id :: string)
        local entry = raw_entry :: automation_types.RegistryEntry?
        if get_err or not entry then return nil, get_err or "automation type not found" end
        local input_err = validate_install_input((entry.meta or {}).inputs, input)
        if input_err then return nil, input_err end

        local source = type(opts) == "table" and (opts :: Map).source or nil
        if source ~= nil then
            local source_err = declaration_mod.validate_source(source)
            if source_err then return nil, source_err end
        end
        if type(opts) == "table" and opts.schedules ~= nil then
            return nil, automation_error("scheduled methods are removed; declare a timer source", errors.INVALID)
        end
        local enabled: boolean? = nil
        if type(opts) == "table" then enabled = (opts :: Map).enabled end
        if enabled ~= nil and type(enabled) ~= "boolean" then
            return nil, automation_error("declaration enabled must be a boolean", errors.INVALID)
        end
        local state = type(opts) == "table" and (opts :: Map).state or nil
        if state ~= nil then
            if type(state) ~= "table" then return nil, automation_error("declaration state must be a table", errors.INVALID) end
            for key in pairs(state :: Map) do
                if type(key) ~= "string" or key == "component_id" or key == "public_state"
                    or key == "_portable_input" or key == "_execution_identity" or key == "_rollback" then
                    return nil, automation_error("declaration state contains a reserved field: " .. tostring(key), errors.INVALID)
                end
            end
        end
        local public_meta = type(opts) == "table" and (opts :: Map).public_meta or nil
        if public_meta ~= nil then
            if type(public_meta) ~= "table" then return nil, automation_error("declaration public_meta must be a table", errors.INVALID) end
            local fields, fields_err = public_state_field_map((entry.meta or {}).public_state_schema)
            if fields_err then return nil, fields_err end
            for key, value in pairs(public_meta :: Map) do
                if key ~= "title" and key ~= "comment" then
                    local field = fields and fields[key] or nil
                    if not field then return nil, automation_error("public_state contains undeclared field: " .. tostring(key), errors.INVALID) end
                    local value_err = validate_public_field_value(field, value, public_meta)
                    if value_err then return nil, value_err end
                elseif type(value) ~= "string" then
                    return nil, automation_error("public metadata " .. key .. " must be a string", errors.INVALID)
                end
            end
        end
        local applied, apply_err = apply_declaration(component_id, input :: Map, source, state, public_meta, enabled)
        if apply_err or not applied then return nil, apply_err end
        return { success = true, id = component_id, generation = (applied :: Map).generation }, nil
    end
end

return part
