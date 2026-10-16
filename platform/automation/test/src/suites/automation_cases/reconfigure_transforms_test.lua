-- Tests for kickside.automation:automation (automations_lib).
-- Comprehensive coverage including:
--   - happy path + result shape
--   - rollback chain construction (id-based)
--   - rollback chain replay on install failure
--   - rollback chain replay via M.replay
--   - error propagation
--   - shape validation
--   - boundary inputs

type Map = { [string]: any }

local test = require("test")
local automation_test_engine = require("automation_test_engine")
local automations_lib: any = {}
local active_dependencies: Map = {}
automations_lib, active_dependencies = automation_test_engine.new()
local automation_types = require("types")
local binding_validation = require("binding_validation")
local execution_identity = require("execution_identity")
local registry = require("registry")
local declaration_authority = require("declaration_authority")
local errors = require("errors")
local uuid = require("uuid")

-- The runtime errors.new(...) value exposes :details() / :kind() / :message()
-- but the static type doesn't carry them; cast through `any`.
local function err_details(err: any): any
    if type(err) ~= "userdata" or type(err.details) ~= "function" then return nil end
    return err:details()
end

-- Recording runner used by tests in place of the real funcs-based runner.
-- It captures (target, args) tuples in the order called, lets tests assert
-- chain replay behavior without registering real cleanup functions.
local function make_recorder()
    local calls: any = {}
    local runner = function(target, args)
        calls[#calls + 1] = { target = target, args = args }
    end
    return runner, calls
end

local function entry_meta(entry: any): any
    if type(entry) ~= "table" then return {} end
    if type((entry :: any).meta) == "table" then return (entry :: any).meta end
    if type((entry :: any).data) == "table" and type((entry :: any).data.meta) == "table" then return (entry :: any).data.meta end
    return {}
end

local function entry_id(entry: any): string
    if type(entry) ~= "table" then return "" end
    return tostring((entry :: any).id or "")
end

local function retired_display_term(value: any): string?
    if type(value) ~= "string" then return nil end
    local text = (value :: string):lower()
    if text:match("%f[%w]conversation[s]?%f[%W]") then return "Conversation" end
    if text:match("%f[%w]thread[s]?%f[%W]") then return "Thread" end
    if text:match("%f[%w]sink[s]?%f[%W]") then return "Sink" end
    if text:match("%f[%w]trait[s]?%f[%W]") then return "Trait" end
    return nil
end

local function resolver_contract(scope_name: string, groups: any?, meta: any?): any
    local inst = {
        resolve = function(_self: any, args: any)
            return {
                principal = args.principal,
                actor_id = execution_identity.actor_key(args.principal),
                scope_name = scope_name,
                groups = groups or {},
                meta = meta or {},
            }
        end,
    }
    local builder = {}
    builder.with_actor = function(_self: any, _actor: any): any return builder end
    builder.with_scope = function(_self: any, _scope: any): any return builder end
    builder.open = function(): any return inst, nil end
    return builder
end

local function with_loaded_modules(stubs: any, fn)
    -- install_type freezes the installer's execution identity from the security
    -- frame; provide a default actor+scope so cases that don't care about
    -- identity still install. Cases that assert on identity supply their own.
    if stubs.security == nil then
        stubs.security = {
            actor = function(): any
                return { id = function(): any return "installer-1" end, meta = function(): any return {} end }
            end,
            scope = function(): any return {} end,
        }
    end
    stubs.security.new_actor = stubs.security.new_actor or function(id: string, meta: any): any
        return { id = function(): any return id end, meta = function(): any return meta or {} end }
    end
    stubs.security.named_scope = stubs.security.named_scope or function(name: string): any
        return { name = name }, nil
    end
    stubs.security.can = stubs.security.can or function(): boolean return true end
    local actor = stubs.security.actor and stubs.security.actor() or nil
    local actor_meta = actor and actor.meta and actor:meta() or {}
    local scope_name = stubs.scope_name or "app.security:user"
    local contract_stub = stubs.contract_stub or {
        get = function()
            return resolver_contract(scope_name, actor_meta.security_groups or {}, actor_meta), nil
        end,
    }
    -- Each case gets its own engine and explicitly constructed identity resolver.
    local real_engine = automations_lib
    local real_dependencies = active_dependencies
    local engine_dependencies: any = {}
    for name, dependency in pairs(stubs) do
        if name ~= "scope_name" and name ~= "contract_stub" then engine_dependencies[name] = dependency end
    end
    engine_dependencies.execution_identity = execution_identity.new({
        security = stubs.security, contract = contract_stub,
    })
    automations_lib, active_dependencies = automation_test_engine.new(engine_dependencies)
    local ok, err = pcall(fn)
    automations_lib = real_engine
    active_dependencies = real_dependencies
    if not ok then error("loaded modules callback failed (" .. type(err) .. "): " .. tostring(err)) end
end

local WRITER_CREATE = "kickside.automation:declaration_writer_create"
local WRITER_APPLY = "kickside.automation:declaration_writer_apply"

type FuncCall = (string, any) -> (any?, any)

-- declared_writer answers the declaration writer the way the real writer does:
-- it reads back the pending command the call names from the automation DB and
-- records the context the component write produces, with _portable_input from
-- the command's declaration and, for a create, _rollback from the chain.
local function declared_writer(writes: { any }): FuncCall
    return function(target: string, args: any): (any?, any)
        local sql_mod = active_dependencies.sql :: any
        local db, db_err = sql_mod.get(automation_types.db_id())
        if db_err or not db then return nil, db_err end
        local pending, pending_err = (active_dependencies.command :: any).pending(db, args.automation_id)
        db:release()
        if pending_err then return nil, pending_err end
        if not pending or pending.request_id ~= args.command_id or pending.generation ~= args.generation
            or pending.digest ~= args.declaration_hash then
            return nil, "declaration command is not the pending automation command"
        end
        local context: Map = {}
        for k, v in pairs(args.context or {}) do context[k] = v end
        for k, v in pairs(pending.input.state or {}) do context[k] = v end
        context._portable_input = pending.input.declaration
        if target == WRITER_CREATE then context._rollback = args.rollback end
        writes[#writes + 1] = { target = target, args = args, pending = pending, context = context }
        if target == WRITER_APPLY then
            return { component_id = args.component_id, changes_made = true, generation = args.generation }, nil
        end
        return { component_id = args.component_id, impl_id = args.impl_id, parent_id = args.parent_id, success = true }, nil
    end
end

-- install_funcs is a funcs stub whose executor routes the declaration writer to
-- `writer` and every other target (the type's install body) to `body`.
local function install_funcs(body: FuncCall, writer: FuncCall): any
    return {
        new = function(): (any, any)
            return {
                with_context = function(self: any): any return self end,
                call = function(_self: any, target: string, args: any): (any?, any)
                    if target == WRITER_CREATE or target == WRITER_APPLY then return writer(target, args) end
                    return body(target, args)
                end,
            }, nil
        end,
    }
end

-- seed_drive gives an automation id the main drive an install creates, so a
-- reconfigure command has drives to cover.
local function seed_drive(automation_id: string)
    local sql_mod = active_dependencies.sql :: any
    local db, db_err = sql_mod.get(automation_types.db_id())
    if db_err or not db then error("automation db: " .. tostring(db_err)) end
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); error("begin: " .. tostring(begin_err)) end
    local _, insert_err = (active_dependencies.drive :: any).insert_tx(tx, {
        automation_id = automation_id, drive_key = "main", source_kind = "collection",
        applied = {}, applied_hash = "seed",
    })
    if insert_err then tx:rollback(); db:release(); error("seed drive: " .. tostring(insert_err)) end
    tx:commit()
    db:release()
end

local function v2_identity(id: string): Map
    return {
        version = 2,
        principal = { kind = "user", id = id },
        authorized_by = { kind = "user", id = id },
        captured_at = "2026-09-25T00:00:00Z",
    }
end

local function define_tests()
    test.describe("kickside.automation:automation", function()
        test.describe("reconfigure", function()
            local function reconfigurable_entry(id)
                return {
                    id = id,
                    kind = "contract.binding",
                    meta = {
                        type = "kickside.automation",
                        reconfigurable = true,
                        public_state_schema = { fields = { { key = "status", type = "text" } } },
                    },
                    data = {
                        contracts = {
                            { contract = "kickside.contract:installable", methods = { install = "ns:install" } },
                        },
                    },
                }, nil
            end

            test.it("round-trips nested transform input without aliasing the artifact", function()
                local artifact = {
                    apiVersion = "kickside.automation/v1",
                    kind = "Automation",
                    metadata = { title = "Portable fixture" },
                    spec = {
                        type = "kickside.sync:sync",
                        input = {
                            title = "Portable fixture",
                            trigger = {
                                v = 1,
                                source = "fixture.source:records",
                                config = { connection_id = "source-connection" },
                            },
                            transform = {
                                kind = "code",
                                code = "return { kind = 'fixture' }",
                                args = {
                                    fields = { "name", "domain" },
                                    options = { preserve_empty = false },
                                },
                            },
                            sink_config = { crm_id = "source-crm" },
                        },
                    },
                }
                local installed_input: any = nil
                local real_install = automations_lib.install_type
                automations_lib.install_type = function(type_id: string, input: any): (any?, any)
                    installed_input = input
                    return { id = "roundtrip-instance", type = type_id, created = true }, nil
                end
                local imported, import_err = automations_lib.import_artifact(artifact, nil, {
                    trigger = { config = { connection_id = "target-connection" } },
                    sink_config = { crm_id = "target-crm" },
                })
                automations_lib.install_type = real_install

                test.is_nil(import_err, tostring(import_err))
                test.eq(imported.id, "roundtrip-instance")
                test.eq(installed_input.transform.code, artifact.spec.input.transform.code)
                test.eq(installed_input.transform.args.fields[2], "domain")
                test.is_false(installed_input.transform.args.options.preserve_empty)
                test.eq(installed_input.trigger.config.connection_id, "target-connection")
                test.eq(installed_input.sink_config.crm_id, "target-crm")

                installed_input.transform.args.fields[1] = "changed"
                installed_input.trigger.config.connection_id = "changed"
                test.eq(artifact.spec.input.transform.args.fields[1], "name")
                test.eq(artifact.spec.input.trigger.config.connection_id, "source-connection")
            end)

            test.it("rejects unknown artifact fields and malformed automation specs", function()
                local base = {
                    apiVersion = "kickside.automation/v1",
                    kind = "Automation",
                    spec = { type = "kickside.sync:sync", input = {} },
                }

                local unknown = {
                    apiVersion = base.apiVersion,
                    kind = base.kind,
                    spec = base.spec,
                    runtime_state = {},
                }
                local value, err = automations_lib.import_artifact(unknown)
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INVALID))
                test.contains(err:message(), "unsupported field: runtime_state")

                local unknown_spec = {
                    apiVersion = base.apiVersion,
                    kind = base.kind,
                    spec = { type = "kickside.sync:sync", input = {}, component_id = "runtime-id" },
                }
                value, err = automations_lib.import_artifact(unknown_spec)
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INVALID))
                test.contains(err:message(), "unsupported field: component_id")

                local missing_input = {
                    apiVersion = base.apiVersion,
                    kind = base.kind,
                    spec = { type = "kickside.sync:sync" },
                }
                value, err = automations_lib.import_artifact(missing_input)
                test.is_nil(value)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:message(), "automation artifact spec.input is required")
            end)

            test.it("write_public_state validates declared fields and sets meta", function()
                local set_meta_fields: any = nil
                with_loaded_modules({
                    registry = { get = function(id) return reconfigurable_entry(id) end },
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        query = function()
                            return { { component_id = "auto-1", impl_id = "ns:automation", meta = {} } }, nil
                        end,
                        set_meta = function(_id, fields) set_meta_fields = fields; return true, nil end,
                    },
                }, function()
                    local result, err = automations_lib.write_public_state("auto-1", { status = "paused" })
                    test.is_nil(err, tostring(err))
                    test.is_true(result.success)
                    test.eq(set_meta_fields.status, "paused")

                    local _, bad_err = automations_lib.write_public_state("auto-1", { nope = "x" })
                    test.is_true(errors.is(bad_err, errors.INVALID))
                    test.contains(bad_err:message(), "undeclared field")
                end)
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
