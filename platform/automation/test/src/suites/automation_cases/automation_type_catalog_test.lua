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
        test.describe("list_types", function()
            test.it("catalogs Data Sync drive controls independently of declared actions", function()
                local binding = {
                    id = "kickside.sync:sync", kind = "contract.binding",
                    meta = { type = "kickside.automation", title = "Data Sync",
                        actions = { { name = "pause" }, { name = "inspect" } } },
                    data = { contracts = { { contract = "test:kind", methods = {
                        pause = "test:private_pause", inspect = "test:inspect",
                    } } } },
                }
                with_loaded_modules({ registry = { find = function(): (any, any)
                    return { binding }, nil
                end } }, function()
                    local types, err = automations_lib.list_types({})
                    test.is_nil(err, tostring(err))
                    local row = types[1] :: any
                    test.not_nil(row.controls, "Data Sync must expose engine controls")
                    test.eq(#row.controls, 6)
                    local names: Map = {}
                    for _, control in ipairs(row.controls) do
                        names[control.name] = control
                        test.is_nil(control.target, "controls cannot invoke kind methods")
                    end
                    for _, name in ipairs({ "pause", "resume", "run_now", "replay", "resync", "discard" }) do
                        test.not_nil(names[name], name)
                    end
                    test.is_true(names.replay.request_id_required)
                    test.is_true(names.resync.request_id_required)
                    test.is_true(names.discard.keys_required)
                    test.eq(#row.actions, 1)
                    test.eq(row.actions[1].name, "inspect")
                    test.eq(row.actions[1].target, "test:inspect")
                    binding.meta.actions = nil
                    local bare, bare_err = automations_lib.list_types({})
                    test.is_nil(bare_err, tostring(bare_err))
                    test.eq(#bare[1].actions, 0)
                    test.eq(#bare[1].controls, 6, "controls need no meta.actions")
                end)
            end)

            -- Control surfaces render a row of every kind, including the kinds the
            -- install catalog must not offer. The catalog carries them with
            -- installable = false rather than omitting them, so a row's title,
            -- icon, actions, and public_state_schema stay server-owned.
            test.it("carries unannounced kinds flagged non-installable", function()
                with_loaded_modules({
                    registry = {
                        find = function(query: any): (any, any)
                            test.eq(query["meta.type"], "kickside.automation")
                            return {
                                {
                                    id = "ns:automation",
                                    kind = "contract.binding",
                                    meta = { type = "kickside.automation", title = "Demo" },
                                    data = { contracts = {} },
                                },
                                {
                                    id = "ns:internal",
                                    kind = "contract.binding",
                                    meta = {
                                        type = "kickside.automation",
                                        title = "Internal Kind",
                                        announced = false,
                                        reconfigurable = true,
                                        actions = { { name = "execute" }, { name = "pause" } },
                                    },
                                    data = { contracts = {
                                        { contract = "ns:runtime", methods = { execute = "ns:execute" } },
                                        { contract = "ns:control", methods = { pause = "ns:pause" } },
                                    } },
                                },
                            }, nil
                        end,
                    },
                }, function()
                    local types, err = automations_lib.list_types({})
                    test.is_nil(err, tostring(err))
                    test.eq(#types, 2)
                    local by_id: { [string]: any } = {}
                    for _, entry in ipairs(types) do by_id[entry.id] = entry end
                    test.eq(by_id["ns:automation"].installable, true)
                    local internal = by_id["ns:internal"]
                    test.not_nil(internal)
                    test.eq(internal.installable, false)
                    test.eq(internal.title, "Internal Kind")
                    test.eq(internal.reconfigurable, true)
                    test.eq(#internal.actions, 1)
                end)
            end)

            test.it("discovers provider-owned catalog adapters without treating arbitrary metadata as installable", function()
                with_loaded_modules({
                    registry = {
                        find = function(query)
                            test.eq(query["meta.type"], "kickside.automation")
                            test.is_nil(query[".kind"])
                            return {
                                {
                                    id = "provider:adapter",
                                    kind = "registry.entry",
                                    meta = {
                                        type = "kickside.automation",
                                        title = "Provider adapter",
                                        component = { create = { view = "provider:setup" } },
                                    },
                                },
                                {
                                    id = "provider:metadata_only",
                                    kind = "registry.entry",
                                    meta = { type = "kickside.automation", title = "Not installable" },
                                },
                            }, nil
                        end,
                    },
                    view_components = {
                        get = function(id)
                            test.eq(id, "provider:setup")
                            return {
                                id = id,
                                name = "Setup",
                                title = "Setup",
                                tag_name = "provider-setup",
                                base_path = "provider",
                                entry_point = "setup.js",
                            }, nil
                        end,
                    },
                }, function()
                    local types, err = automations_lib.list_types({})
                    test.is_nil(err)
                    test.eq(#types, 1)
                    test.eq(types[1].id, "provider:adapter")
                    test.eq(types[1].component.create_ui.tag_name, "provider-setup")
                    test.eq(#types[1].controls, 0, "create-only adapters do not own drives")
                end)
            end)

            test.it("surfaces public_state_schema for declarative UI controls", function()
                with_loaded_modules({
                    registry = {
                        find = function(query)
                            test.eq(query["meta.type"], "kickside.automation")
                            return {
                                {
                                    id = "ns:automation",
                                    kind = "contract.binding",
                                    meta = {
                                        type = "kickside.automation",
                                        name = "demo",
                                        title = "Demo",
                                        public_state_schema = {
                                            fields = {
                                                { key = "enabled", type = "checkbox", patchable = true, hide_zero = true, hidden = true },
                                            },
                                        },
                                    },
                                    data = { contracts = {} },
                                },
                            }, nil
                        end,
                    },
                }, function()
                    local types, err = automations_lib.list_types({})
                    test.is_nil(err)
                    test.eq(#types, 1)
                    test.eq(types[1].public_state_schema.fields[1].key, "enabled")
                    test.eq(types[1].public_state_schema.fields[1].patchable, true)
                    test.eq(types[1].public_state_schema.fields[1].hide_zero, true)
                    test.eq(types[1].public_state_schema.fields[1].hidden, true)
                end)
            end)

            test.it("resolves create.view into a loadable view component record", function()
                with_loaded_modules({
                    registry = {
                        find = function(query)
                            return {
                                {
                                    id = "ns:automation",
                                    kind = "contract.binding",
                                    meta = {
                                        type = "kickside.automation",
                                        name = "demo",
                                        title = "Demo",
                                        component = {
                                            create = { view = "ns:setup_view" },
                                        },
                                    },
                                    data = { contracts = {} },
                                },
                            }, nil
                        end,
                    },
                    view_components = {
                        get = function(id)
                            test.eq(id, "ns:setup_view")
                            return {
                                id = id,
                                name = "Setup",
                                title = "Setup UI",
                                tag_name = "wc-demo-setup",
                                base_path = "demo-static",
                                entry_point = "setup.js",
                            }, nil
                        end,
                    },
                }, function()
                    local types, err = automations_lib.list_types({})
                    test.is_nil(err)
                    local create_ui = types[1].component.create_ui
                    test.eq(create_ui.tag_name, "wc-demo-setup")
                    test.eq(create_ui.base_path, "demo-static")
                    test.eq(create_ui.entry_point, "setup.js")
                end)
            end)

            test.it("resolves manage.view into a loadable view component record", function()
                with_loaded_modules({
                    registry = {
                        find = function(query)
                            return {
                                {
                                    id = "ns:automation",
                                    kind = "contract.binding",
                                    meta = {
                                        type = "kickside.automation",
                                        name = "demo",
                                        title = "Demo",
                                        component = {
                                            manage = { view = "ns:manage_view" },
                                        },
                                    },
                                    data = { contracts = {} },
                                },
                            }, nil
                        end,
                    },
                    view_components = {
                        get = function(id)
                            test.eq(id, "ns:manage_view")
                            return {
                                id = id,
                                name = "Manage",
                                title = "Manage UI",
                                tag_name = "wc-demo-manage",
                                base_path = "demo-static",
                                entry_point = "manage.js",
                            }, nil
                        end,
                    },
                }, function()
                    local types, err = automations_lib.list_types({})
                    test.is_nil(err)
                    local manage_ui = types[1].component.manage_ui
                    test.eq(manage_ui.tag_name, "wc-demo-manage")
                    test.eq(manage_ui.base_path, "demo-static")
                    test.eq(manage_ui.entry_point, "manage.js")
                end)
            end)

            test.it("passes component create views through source descriptors", function()
                with_loaded_modules({
                    registry = {
                        find = function(query)
                            if query["meta.type"] == "kickside.automation.port" then
                                return {
                                    {
                                        id = "ns:webhook_received",
                                        kind = "registry.entry",
                                        meta = { type = "kickside.automation.port", title = "Webhook event received" },
                                        binding = "ns:webhook",
                                        event = "ns.events:webhook.inbound",
                                    },
                                }, nil
                            end
                            return {
                                {
                                    id = "ns:webhook",
                                    kind = "contract.binding",
                                    meta = {
                                        title = "Webhook",
                                        class = { "kickside.webhooks" },
                                        component = { create = { view = "ns:webhook_create" } },
                                        events = { output = { { type = "ns.events:webhook.inbound" } } },
                                    },
                                    data = { contracts = {} },
                                },
                            }, nil
                        end,
                        get = function(id)
                            if id == "ns.events:webhook.inbound" then
                                return { id = id, meta = { type = "kickside.core.threads.event" }, schema = { type = "object" } }, nil
                            end
                            return nil, "not found"
                        end,
                    },
                    view_components = {
                        get = function(id)
                            test.eq(id, "ns:webhook_create")
                            return {
                                id = id,
                                title = "Create webhook",
                                tag_name = "kickside-webhook-create",
                                base_path = "kickside-webhooks",
                                entry_point = "create.js",
                            }, nil
                        end,
                    },
                }, function()
                    local sources, err = automations_lib.list_sources()
                    test.is_nil(err)
                    test.eq(#sources, 1)
                    local create_ui = ((sources[1] :: any).component :: any).create_ui
                    test.eq(create_ui.tag_name, "kickside-webhook-create")
                    test.eq(create_ui.entry_point, "create.js")
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
