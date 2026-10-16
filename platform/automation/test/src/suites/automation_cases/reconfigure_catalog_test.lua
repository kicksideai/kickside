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

            test.it("EE2-2562 installs imports and reconfigures with store groups for an MCP actor", function()
                local type_id = "fixture:principal_automation"
                local target_id = tostring(uuid.v7())
                local writes: { any } = {}
                local live_groups = { "store-members" }
                local record_write = declared_writer(writes)
                local function checked_writer(target, args)
                    local db, db_err = (active_dependencies.sql :: any).get(automation_types.db_id())
                    if db_err or not db then return nil, db_err end
                    local pending, read_err = (active_dependencies.command :: any).pending(db, args.automation_id)
                    db:release()
                    if read_err then return nil, read_err end
                    local command_input = pending.input
                    for _, field in ipairs({ "operator", "subject" }) do
                        local allowed, err = active_dependencies.declaration_authority.check(
                            command_input[field .. "_identity"], command_input[field .. "_id"],
                            command_input.references, target)
                        if err then return nil, err end
                        if not allowed then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "declared principal lacks access" }) end
                    end
                    return record_write(target, args)
                end
                local entry = {
                    id = type_id, kind = "contract.binding",
                    meta = { type = "kickside.automation", exportable = true, reconfigurable = true,
                        inputs = { type = "object", properties = {
                            target_id = { type = "string", ["x-reference"] = { kind = "component", access = "READ" } },
                            title = { type = "string" },
                        } } },
                    data = { contracts = { { contract = "kickside.contract:installable", methods = { install = "fixture:install" } } } },
                }
                with_loaded_modules({
                    security = { actor = function() return { id = function() return "owner-1" end,
                        meta = function() return { via = "mcp" } end } end, scope = function() return {} end },
                    contract_stub = { get = function() return resolver_contract("members", live_groups), nil end },
                    registry = { get = function() return entry, nil end },
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        validate_principal_access = function(id, mask, principal, groups)
                            test.eq(id, target_id)
                            test.eq(mask, 1)
                            test.eq(principal.id, "owner-1")
                            test.eq(type(groups), "table")
                            return groups[1] == "store-members", nil
                        end,
                        query = function() return { { component_id = writes[1].args.component_id, impl_id = type_id, meta = {} } }, nil end,
                        get_context = function() return writes[1].context, nil end,
                        get_private_context = function() return { _execution_identity = v2_identity("owner-1") }, nil end,
                    },
                    funcs = install_funcs(function() return { source = { source_kind = "none" }, state = {} }, nil end, checked_writer),
                }, function()
                    active_dependencies.declaration_authority = declaration_authority.new({
                        component = active_dependencies.component, execution_identity = active_dependencies.execution_identity,
                        registry = active_dependencies.registry, security = active_dependencies.security,
                    })
                    local installed, install_err = automations_lib.install_type(type_id, { target_id = target_id, title = "Initial" })
                    test.is_nil(install_err, tostring(install_err))
                    test.not_nil(installed)
                    local artifact, export_err = automations_lib.export_artifact(installed.id)
                    test.is_nil(export_err, tostring(export_err))
                    local imported, import_err = automations_lib.import_artifact(artifact)
                    test.is_nil(import_err, tostring(import_err))
                    test.not_nil(imported)
                    local changed, change_err = automations_lib.update_portable_input(installed.id, { target_id = target_id, title = "Changed" })
                    test.is_nil(change_err, tostring(change_err))
                    test.not_nil(changed)
                    test.eq(#writes, 3)
                    table.remove(live_groups, 1)
                    local refused, refusal = automations_lib.install_type(type_id, { target_id = target_id })
                    test.is_nil(refused)
                    test.is_true(errors.is(refusal, errors.PERMISSION_DENIED))
                    local denied, denial = automations_lib.update_portable_input(installed.id, { target_id = target_id, title = "Denied" })
                    test.is_nil(denied)
                    test.is_true(errors.is(denial, errors.PERMISSION_DENIED))
                    test.eq(#writes, 3)
                end)
            end)

            test.it("round-trips a catalog source face through install, export and import", function()
                local TYPE_ID = "fixture.sync:sync"
                local CATALOG_FACE = '{ "type": "object", "properties": { "item_key": { "type": "string" } } }'
                local FACE_PORTS = { {
                    id = "fixture.source:records",
                    kind = "registry.entry",
                    meta = { type = "kickside.automation.port", title = "Records" },
                    binding = "fixture.source:records_source",
                    output_schema = CATALOG_FACE,
                } }
                local FACE_BINDINGS = { {
                    id = "fixture.source:records_source",
                    kind = "contract.binding",
                    meta = { title = "Records source", class = { "fixture" } },
                    data = { contracts = { {
                        contract = "kickside.data:pullable",
                        methods = { pull = "fixture.source:pull" },
                    } } },
                } }
                local FACE_TYPE = {
                    id = TYPE_ID,
                    kind = "contract.binding",
                    meta = {
                        type = "kickside.automation",
                        title = "Fixture sync",
                        exportable = true,
                        inputs = {
                            type = "object",
                            additionalProperties = false,
                            required = { "title", "output_schema" },
                            properties = {
                                title = { type = "string", minLength = 1 },
                                output_schema = { type = "object" },
                            },
                        },
                    },
                    data = { contracts = { {
                        contract = "kickside.contract:installable",
                        methods = { install = "fixture.sync:install" },
                    } } },
                }

                local writes: { any } = {}
                local installs = 0
                with_loaded_modules({
                    registry = {
                        find = function(query: any): (any?, any)
                            if (query :: any)["meta.type"] == "kickside.automation.port" then return FACE_PORTS, nil end
                            return FACE_BINDINGS, nil
                        end,
                        get = function(id: any): (any?, any)
                            if tostring(id) == TYPE_ID then return FACE_TYPE, nil end
                            return nil, "registry entry not found: " .. tostring(id)
                        end,
                    },
                    funcs = install_funcs(function(_target: string, args: any): (any?, any)
                        installs = installs + 1
                        return { source = { source_kind = "none" }, state = { title = (args :: any).title } }, nil
                    end, declared_writer(writes)),
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        query = function(): (any?, any)
                            return { {
                                component_id = writes[1].args.component_id,
                                impl_id = TYPE_ID,
                                meta = { title = "Records mirror" },
                            } }, nil
                        end,
                        get_context = function(): (any?, any) return writes[1].context, nil end,
                    },
                }, function()
                    local source, source_err = automations_lib.resolve_source("fixture.source:records")
                    test.is_nil(source_err, tostring(source_err))
                    test.eq(type(source.output_schema), "table")

                    local installed, install_err = automations_lib.install_type(TYPE_ID, {
                        title = "Records mirror",
                        output_schema = source.output_schema,
                    })
                    test.is_nil(install_err, tostring(install_err))
                    test.eq(installed.id, writes[1].args.component_id)

                    local artifact, export_err = automations_lib.export_artifact(installed.id)
                    test.is_nil(export_err, tostring(export_err))
                    test.eq(type(artifact.spec.input.output_schema), "table")
                    test.eq(artifact.spec.input.output_schema.properties.item_key.type, "string")

                    local imported, import_err = automations_lib.import_artifact(artifact)
                    test.is_nil(import_err, tostring(import_err))
                    test.eq(imported.type, TYPE_ID)
                    test.eq(installs, 2)
                end)
            end)

            test.it("refuses a portable declaration the type's own install contract rejects", function()
                local TYPE_ID = "fixture.sync:sync"
                local FACE_TYPE = {
                    id = TYPE_ID,
                    kind = "contract.binding",
                    meta = {
                        type = "kickside.automation",
                        exportable = true,
                        reconfigurable = true,
                        inputs = {
                            type = "object",
                            additionalProperties = false,
                            properties = { output_schema = { type = "object" } },
                        },
                    },
                    data = { contracts = {} },
                }
                local automation_id = "sync-declaration-" .. tostring(uuid.v7())
                local writes: { any } = {}
                with_loaded_modules({
                    registry = { get = function(id: any): (any?, any)
                        if tostring(id) == TYPE_ID then return FACE_TYPE, nil end
                        return nil, "registry entry not found: " .. tostring(id)
                    end },
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        query = function(): (any?, any)
                            return { { component_id = automation_id, impl_id = TYPE_ID, meta = {} } }, nil
                        end,
                        get_context = function(): (any?, any) return { component_id = automation_id }, nil end,
                        get_private_context = function(): (any?, any)
                            return { _execution_identity = v2_identity("owner-1") }, nil
                        end,
                    },
                    funcs = install_funcs(function(target: string): (any?, any)
                        return nil, "unexpected call: " .. target
                    end, declared_writer(writes)),
                }, function()
                    seed_drive(automation_id)
                    local result, err = automations_lib.update_portable_input(automation_id, {
                        output_schema = '{ "type": "object" }',
                    })
                    test.is_nil(result)
                    test.contains(tostring(err), "output_schema must be an object")
                    test.eq(#writes, 0, "an uninstallable declaration never reaches the component")

                    local ok_result, ok_err = automations_lib.update_portable_input(automation_id, {
                        output_schema = { type = "object" },
                    }, { state = { title = "Updated" }, public_meta = { title = "Updated" } })
                    test.is_nil(ok_err, tostring(ok_err))
                    test.not_nil(ok_result)
                    test.eq(#writes, 1)
                    test.eq(writes[1].pending.input.declaration.output_schema.type, "object")
                    test.eq(writes[1].pending.input.state.title, "Updated")
                    test.eq(writes[1].pending.input.public_meta.title, "Updated")
                end)
            end)

            test.it("refuses to export a type that did not declare portability", function()
                with_loaded_modules({
                    registry = { get = function(id)
                        return {
                            id = id,
                            kind = "contract.binding",
                            meta = { type = "kickside.automation", reconfigurable = true },
                            data = { contracts = {} },
                        }, nil
                    end },
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        query = function()
                            return { {
                                component_id = "private-instance",
                                impl_id = "fixture.private:automation",
                                meta = { title = "Private fixture" },
                            } }, nil
                        end,
                        get_context = function()
                            error("private state must not be read for export")
                        end,
                    },
                }, function()
                    local artifact, err = automations_lib.export_artifact("private-instance")
                    test.is_nil(artifact)
                    test.is_true(errors.is(err, errors.INVALID))
                    test.eq(err:message(), "automation type is not exportable")
                end)
            end)

            test.it("imports an exported transform with explicit destination bindings", function()
                local artifact = {
                    apiVersion = "kickside.automation/v1",
                    kind = "Automation",
                    spec = {
                        type = "kickside.sync:sync",
                        input = {
                            title = "CRM mirror",
                            trigger = {
                                v = 1,
                                source = "provider:records",
                                config = {
                                    connection_id = "connection-source",
                                    object_type = "contacts",
                                },
                            },
                            sink_config = { crm_id = "crm-source" },
                            transform = {
                                kind = "code",
                                code = "return { kind = 'record' }",
                            },
                        },
                    },
                }
                local real_install = automations_lib.install_type
                automations_lib.install_type = function(type_id: string, input: any, parent_id: string?): (any?, any)
                    test.eq(type_id, "kickside.sync:sync")
                    test.eq(parent_id, "workspace-target")
                    test.eq(input.trigger.config.connection_id, "connection-target")
                    test.eq(input.trigger.config.object_type, "contacts")
                    test.eq(input.sink_config.crm_id, "crm-target")
                    test.eq(input.transform.kind, "code")
                    test.eq(input.transform.code, "return { kind = 'record' }")
                    return { id = "sync-target", type = type_id, created = true }, nil
                end

                local imported, err = automations_lib.import_artifact(artifact, "workspace-target", {
                    trigger = { config = { connection_id = "connection-target" } },
                    sink_config = { crm_id = "crm-target" },
                })
                automations_lib.install_type = real_install

                test.is_nil(err, tostring(err))
                test.eq(imported.id, "sync-target")
                test.eq(artifact.spec.input.trigger.config.connection_id, "connection-source")
                test.eq(artifact.spec.input.sink_config.crm_id, "crm-source")
            end)

        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
