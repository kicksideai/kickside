-- Automation install and teardown mechanics: the install body runner and its
-- rollback recorder, install_type (install command over the main source
-- and the declaration writer's privileged create), and replay of a persisted rollback chain.

local automation_types = require("types")
local support = require("engine_support")
local drive_plan = require("engine_drive_plan")
local declaration = require("engine_declaration")
local schema = require("engine_schema")
local errors = require("errors")

type Map = { [string]: any }

type Logger = {
    warn: (Logger, string, Map?) -> (),
    debug: (Logger, string, Map?) -> (),
}

type LoggerModule = {
    named: (LoggerModule, string) -> Logger,
}

local part = {}

-- attach(M, dependencies, P) defines this part's engine functions on M; P
-- carries the private helpers the engine parts share.
function part.attach(M: any, dependencies: any, P: any): ()
    local uuid = dependencies.uuid
    local AUTOMATION_TYPE = support.AUTOMATION_TYPE
    local class_array_from_meta = support.class_array_from_meta
    local copy_map = support.copy_map
    local portable_copy = support.portable_copy
    local safe_component_metadata = support.safe_component_metadata
    local normalize_rollback_chain = declaration.normalize_rollback_chain
    local validate_install_input = schema.validate_install_input
    local validate_public_state = schema.validate_public_state
    local validate_result = declaration.validate_result
    local automation_error = support.automation_error

    local function rollback_logger(): Logger
        local logger_mod = dependencies.logger :: LoggerModule
        return logger_mod:named("automations.rollback")
    end

    -- The default runner uses funcs:call to invoke the persisted target id.
    -- funcs.new():call inherits the calling actor from the surrounding frame,
    -- so cleanup contracts (e.g. knowledge_bases:delete) run with the caller's
    -- authority automatically — no explicit with_actor needed.
    --
    -- Cleanup contracts return (result, err) and never raise, so the runner must
    -- surface call_err to the caller. run_rollback treats a returned error as a
    -- failed step the same as a raise, keeping the retain-for-retry guard live
    -- when a child resource is not actually torn down.
    local function default_runner(target: string, args: Map): any
        local funcs = dependencies.funcs :: automation_types.FuncsModule
        local executor, err = funcs.new()
        if err or not executor then
            error("automations.rollback: funcs.new failed: " .. tostring(err))
        end
        local result, call_err = executor:call(target, args)
        if call_err then
            local lg = rollback_logger()
            lg:warn("rollback call failed", { target = target, error = tostring(call_err) })
            return call_err
        end
        if type(result) == "table" and result.success == false then
            local reported = result.error
            return type(reported) == "userdata" and reported or errors.new({
                message = "rollback target " .. target .. " failed: " .. tostring(reported),
                kind = errors.INTERNAL, retryable = true,
            })
        end
        if result == nil then
            return errors.new({ message = "rollback target " .. target .. " returned no result",
                kind = errors.INTERNAL, retryable = true })
        end
        return nil
    end

    -- run_rollback returns the number of entries that did not clean up. Each
    -- step answers its error as a value, so a failure on entry N still
    -- attempts N-1.
    local function run_rollback(chain: { automation_types.RollbackStep }): (integer, any?)
        local failed = 0
        local first_error: any? = nil
        -- Reverse order: last-registered cleans up first.
        for i = #chain, 1, -1 do
            local entry = chain[i]
            if entry and type(entry.target) == "string" then
                local ret = default_runner(entry.target, entry.args or {})
                if ret ~= nil then
                    failed = failed + 1
                    if first_error == nil then first_error = ret end
                    local lg = rollback_logger()
                    lg:warn("rollback step returned error", {
                        target = entry.target, error = tostring(ret),
                    })
                end
            end
        end
        return failed, first_error
    end

    -- M.install runs `body` with a `t.rollback(target_id, args)` recorder.
    function M.install(body: any): (automation_types.InstallResult?, any)

        local chain: { automation_types.RollbackStep } = {}
        local t: automation_types.InstallRecorder = {
            rollback = function(target_id: string, args: Map?)
                if type(target_id) == "string" and target_id ~= "" then
                    chain[#chain + 1] = {
                        target = target_id,
                        args = type(args) == "table" and args or {},
                    }
                end
            end,
        }

        local data, err = body(t)
        if err ~= nil then
            run_rollback(chain)
            return nil, err
        end

        local shape_err = validate_result(data)
        if shape_err ~= nil then
            run_rollback(chain)
            return nil, shape_err
        end

        return ({
            state    = data.state,
            metadata = data.metadata or {},
            public_state = data.public_state,
            created  = data.created,
            source = data.source,
            rollback = chain,
        } :: automation_types.InstallResult), nil
    end

    M.trigger_overrides = declaration.trigger_overrides

    -- M.replay invokes a persisted rollback chain. Same reverse-order
    -- semantics as install-failure rollback. Returns (attempted_count, failed_count).
    --
    -- opts.options (table) is forwarded to every cleanup target as
    -- args._delete_options at call time. Cleanup handlers may consult those
    -- option flags (e.g. {keep_thread = true}) to skip specific steps. The
    -- options bag is merged INTO each step's args, never replaces it; the
    -- original persisted chain is not mutated.
    function M.replay(chain: any, opts: any?): (integer, integer, any?)
        local replay_opts = (type(opts) == "table" and opts or {}) :: automation_types.ReplayOptions
        if type(chain) ~= "table" then return 0, 0 end
        local source_chain = chain :: { automation_types.RollbackStep }
        local options: Map? = type(replay_opts.options) == "table" and replay_opts.options or nil
        local effective_chain: { automation_types.RollbackStep } = source_chain
        if options ~= nil then
            local cloned: { automation_types.RollbackStep } = {}
            for i, e in ipairs(source_chain) do
                if type(e) == "table" and type(e.target) == "string" then
                    local merged_args: Map = {}
                    if type(e.args) == "table" then
                        for k, v in pairs(e.args) do merged_args[k] = v end
                    end
                    merged_args._delete_options = options
                    cloned[i] = { target = e.target, args = merged_args }
                else
                    cloned[i] = e
                end
            end
            effective_chain = cloned
        end
        local failed, first_error = run_rollback(effective_chain)
        return #source_chain, failed, first_error
    end

    function P.install_binding(type_id: any, input: any): (any?, any)
        if type(type_id) ~= "string" or type_id == "" then
            return nil, errors.new({message = "type is required", kind = errors.INVALID, retryable = false,
                details = {code = "automation_type_required", field = "type"}})
        end
        local registry = dependencies.registry :: automation_types.RegistryModule

        local raw_entry, get_err = registry.get(type_id)
        local entry = raw_entry :: automation_types.RegistryEntry?
        if get_err then return nil, errors.wrap(get_err, "automation type lookup failed") end
        if not entry or entry.kind ~= "contract.binding" then
            return nil, errors.new({message = "automation type not found", kind = errors.NOT_FOUND, retryable = false,
                details = {code = "automation_type_not_found", field = "type"}})
        end
        local entry_meta: Map = entry.meta or {}
        if entry_meta.type ~= AUTOMATION_TYPE then
            return nil, errors.new({message = "binding is not an automation type", kind = errors.INVALID, retryable = false,
                details = {code = "automation_type_invalid", field = "type"}})
        end
        local input_err = validate_install_input(entry_meta.inputs, input)
        if input_err then return nil, input_err end

        return entry, nil
    end

    function P.install_spec(entry: any, result: any, input: any, parent_id: any,
        component_id: string, operator_id: string, operator_identity: any): (any?, any)
        local shape_err = validate_result(result)
        if shape_err ~= nil then return nil, shape_err end
        if (result :: Map).enabled ~= nil and type((result :: Map).enabled) ~= "boolean" then
            return nil, automation_error("install result enabled must be a boolean", errors.INVALID)
        end
        -- An installable kind declares its main drive's source (A22).
        local source_err = declaration.validate_source((result :: Map).source)
        if source_err ~= nil then return nil, source_err end

        local result_t: automation_types.InstallResult = result :: automation_types.InstallResult
        local state: Map = result_t.state
        local metadata: Map = type(result_t.metadata) == "table" and result_t.metadata or {}
        local public_state: Map? = type(result_t.public_state) == "table" and result_t.public_state or nil
        local public_state_err = validate_public_state((entry.meta or {}).public_state_schema, public_state)
        if public_state_err then return nil, public_state_err end
        local rollback, rollback_err = normalize_rollback_chain(result_t.rollback)
        if rollback_err or not rollback then return nil, rollback_err end
        local rollback_chain = rollback :: { automation_types.RollbackStep }

        local kickside_component_meta: Map = (safe_component_metadata(metadata, "Untitled") :: Map)
        -- class stored as TEXT; flatten an array class to its first (canonical) value.
        local classes = class_array_from_meta((entry.meta or {}))
        if #classes > 0 then kickside_component_meta.class = classes[1] end
        if public_state ~= nil then
            for k, v in pairs(public_state :: Map) do
                kickside_component_meta[k] = v
            end
        end

        return {
            kind = "install",
            automation_id = component_id,
            operator_id = operator_id :: string,
            subject_id = operator_id :: string,
            operator_identity = operator_identity,
            declaration = portable_copy(type(input) == "table" and input or {}),
            state = state,
            public_meta = kickside_component_meta,
            type_id = entry.id,
            schema = (entry.meta or {}).inputs,
            main_source = result_t.source,
            enabled = (result :: Map).enabled,
            writer = "kickside.automation:declaration_writer_create",
            writer_args = {
                impl_id = entry.id,
                parent_id = parent_id,
                context = { component_id = component_id },
                meta = {},
                rollback = rollback_chain,
            },
        }, nil
    end

    -- install_type: run the binding's installable.install via funcs:call (under
    -- the calling actor), then persist the resulting umbrella component. On any
    -- post-install failure the rollback chain is replayed.
    function M.install_type(type_id: string, input: any, parent_id: string?): (automation_types.InstallTypeResult?, error?)
        local entry, binding_err = P.install_binding(type_id, input)
        if binding_err or not entry then return nil, binding_err end
        local entry_meta: Map = entry.meta or {}
        local funcs = dependencies.funcs :: automation_types.FuncsModule
        local placement_parent_id: string? = nil
        if type(parent_id) == "string" and parent_id ~= "" then placement_parent_id = parent_id end

        -- The installer is the automation's operator; the component's creation
        -- makes them its creator (initial ADMIN and execution identity together).
        local security_mod = dependencies.security :: any
        local installer = security_mod.actor()
        local operator_id = installer and installer:id() or nil
        if type(operator_id) ~= "string" or operator_id == "" then
            return nil, automation_error("an authenticated actor is required to install an automation", errors.PERMISSION_DENIED)
        end

        -- Deny an inaccessible declared resource before the kind's install
        -- body can create children or call a provider. The writer repeats this
        -- same live check after reservation, immediately before component write.
        local reference_input = type(input) == "table" and input or {}
        local declared_refs, refs_err = (dependencies.declaration_references :: any).collect(entry_meta.inputs, reference_input)
        if refs_err or not declared_refs then return nil, refs_err end
        local preflight_identity: any = nil
        if #declared_refs > 0 then
            local identity, identity_err = (dependencies.execution_identity :: any).capture()
            if identity_err or not identity then return nil, identity_err end
            preflight_identity = identity
            local allowed, access_err = (dependencies.declaration_authority :: any).check(
                identity, operator_id, declared_refs, nil)
            if access_err then return nil, access_err end
            if not allowed then
                return nil, (errors.new({ message = "operator lacks a declared resource grant",
                    kind = errors.PERMISSION_DENIED, retryable = false,
                    details = { error_kind = "access" } }) :: error)
            end
        end

        local install_target = M.find_method(entry, "install")
        if not install_target then
            return nil, errors.new({message = "type does not declare installable.install", kind = errors.INVALID, retryable = false,
                details = {code = "automation_install_method_missing", field = "type"}})
        end

        -- Pre-allocate the component id so the install body can orchestrate against
        -- it through plain contracts (grant access, create child resources, …); the
        -- id rides in the call context and whatever the body does is undone via the
        -- rollback chain if registration fails. A timer source declares recurring work.
        local component_id = uuid.v7()

        -- funcs.new():call inherits the calling actor from this frame, so the body
        -- runs with the caller's authority; with_context exposes the component id.
        local executor, exec_err = funcs.new()
        if exec_err then return nil, errors.wrap(exec_err, "executor") end
        if not executor then
            return nil, errors.new({message = "executor: unavailable", kind = errors.INTERNAL, retryable = false,
                details = {code = "automation_executor_missing", field = "executor"}})
        end

        local contextual, context_err = (executor :: any):with_context({ component_id = component_id })
        if context_err then return nil, errors.wrap(context_err, "executor context") end
        if not contextual then
            return nil, errors.new({message = "executor context: unavailable", kind = errors.INTERNAL, retryable = false,
                details = {code = "automation_executor_context_missing", field = "executor"}})
        end
        local result, call_err = (contextual :: any):call(
            install_target :: string, (type(input) == "table" and input or {}) :: Map)
        if call_err ~= nil then return nil, call_err end
        entry.id = type_id
        local spec, spec_err = P.install_spec(entry, result, input, placement_parent_id,
            component_id, operator_id, preflight_identity)
        if spec_err or not spec then return nil, spec_err end
        local created, create_err = P.run_declaration_command(spec)
        if create_err or not created then return nil, create_err end

        return ({
            id = component_id,
            type = type_id,
            metadata = copy_map(spec.public_meta),
            created = type(result.created) == "table" and result.created or nil,
            drives = drive_plan.install_drive_keys((result :: Map).source),
        } :: automation_types.InstallTypeResult), nil
    end
end

return part
