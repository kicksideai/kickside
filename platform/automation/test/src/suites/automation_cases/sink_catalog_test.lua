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

-- The writing automation every writable body the sink writer carries names as its origin.
local ORIGIN = "sink-catalog-test-automation"
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

local catalog_registry = require("catalog_fixture").registry

local function define_tests()
    test.describe("kickside.automation:automation", function()
        test.describe("list_sinks", function()
            test.it("opens a thread-selected sink under its component identity", function()
                local opened_context: any = nil
                local written: any = nil
                with_loaded_modules({
                    contract = {
                        get = function(id: string): (any?, any?)
                            test.eq(id, "kickside.data:writable")
                            return {
                                with_options = function(self: any, options: any): any
                                    test.eq(options.retry.max_attempts, 1)
                                    return self
                                end,
                                with_context = function(_self: any, context: any): any
                                    opened_context = context
                                    return {
                                        open = function(_builder: any, binding: string): (any?, any?)
                                            test.eq(binding, "provider.flows:destination_kind")
                                            return {
                                                write = function(_inst: any, body: any): (any?, any?)
                                                    written = body
                                                    return { success = true, result = "created" }, nil
                                                end,
                                            }, nil
                                        end,
                                    }
                                end,
                            }, nil
                        end,
                    },
                }, function()
                    local writer, err = automations_lib.open_sink_writer("provider.flows:destination_kind", {
                        thread_id = "destination-target-1",
                        draft = false,
                    })
                    test.is_nil(err)
                    test.not_nil(writer)
                    test.eq(opened_context.thread_id, "destination-target-1")
                    test.eq(opened_context.component_id, "destination-target-1")
                    test.eq(opened_context.draft, false)

                    local result, werr = (writer :: any):write({ sink_op = "upsert", origin = ORIGIN })
                    test.is_nil(werr)
                    test.eq(result.success, true)
                    test.eq(written.sink_op, "upsert")
                    test.eq(written.origin, ORIGIN)
                end)
            end)

            test.it("rejects a writable result that does not explicitly acknowledge success", function()
                with_loaded_modules({
                    contract = {
                        get = function(id: string): (any?, any?)
                            test.eq(id, "kickside.data:writable")
                            return {
                                with_options = function(self: any, options: any): any
                                    test.eq(options.retry.max_attempts, 1)
                                    return self
                                end,
                                with_context = function(_self: any, _context: any): any
                                    return {
                                        open = function(_builder: any, _binding: string): (any?, any?)
                                            return {
                                                write = function(_inst: any, _body: any): (any?, any?)
                                                    return {}, nil
                                                end,
                                            }, nil
                                        end,
                                    }
                                end,
                            }, nil
                        end,
                    },
                }, function()
                    local writer = select(1, automations_lib.open_sink_writer("provider.flows:destination_kind", {}))
                    test.not_nil(writer)
                    local result, werr = (writer :: any):write({ sink_op = "upsert", origin = ORIGIN })
                    test.is_nil(result)
                    test.contains(tostring(werr), "success=true")
                end)
            end)

            test.it("hands back the sink's structured error envelope on a failed write", function()
                with_loaded_modules({
                    contract = {
                        get = function(id: string): (any?, any?)
                            test.eq(id, "kickside.data:writable")
                            return {
                                with_options = function(self: any, options: any): any
                                    test.eq(options.retry.max_attempts, 1)
                                    return self
                                end,
                                with_context = function(_self: any, _context: any): any
                                    return {
                                        open = function(_builder: any, _binding: string): (any?, any?)
                                            return {
                                                write = function(_inst: any, _body: any): (any?, any?)
                                                    return {
                                                        success = false,
                                                        error = {
                                                            code = "dependency_missing",
                                                            message = "related company not found",
                                                            retriable = true,
                                                            scope = "item",
                                                            dependency_key = "crm:c1:record:company:9",
                                                        },
                                                    }, nil
                                                end,
                                            }, nil
                                        end,
                                    }
                                end,
                            }, nil
                        end,
                    },
                }, function()
                    local writer = select(1, automations_lib.open_sink_writer("provider.flows:destination_kind", {}))
                    test.not_nil(writer)
                    local result, werr, envelope = (writer :: any):write({ sink_op = "upsert", origin = ORIGIN })
                    test.is_nil(result)
                    test.eq(tostring(werr), "related company not found")
                    test.eq((envelope :: any).code, "dependency_missing")
                    test.eq((envelope :: any).dependency_key, "crm:c1:record:company:9")
                    test.eq((envelope :: any).retriable, true)
                end)
            end)

            test.it("preserves typed writable open and call failures", function()
                with_loaded_modules({
                    contract = {
                        get = function(_id: string): (any?, any?)
                            return {
                                with_options = function(self: any, options: any): any
                                    test.eq(options.retry.max_attempts, 1)
                                    return self
                                end,
                                with_context = function(_self: any, _context: any): any
                                    return {
                                        open = function(_builder: any, _binding: string): (any?, any?)
                                            return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "destination open denied" })
                                        end,
                                    }
                                end,
                            }, nil
                        end,
                    },
                }, function()
                    local writer, err = automations_lib.open_sink_writer("provider.flows:destination_kind", {})
                    test.is_nil(writer)
                    test.eq(err.kind, errors.PERMISSION_DENIED)
                    test.eq(err.retriable, false)
                    test.contains(err.message, "destination open denied")
                end)

                with_loaded_modules({
                    contract = {
                        get = function(_id: string): (any?, any?)
                            return {
                                with_options = function(self: any, options: any): any
                                    test.eq(options.retry.max_attempts, 1)
                                    return self
                                end,
                                with_context = function(_self: any, _context: any): any
                                    return {
                                        open = function(_builder: any, _binding: string): (any?, any?)
                                            return {
                                                write = function(_inst: any, _body: any): (any?, any?)
                                                    return nil, errors.new({ kind = errors.UNAVAILABLE, message = "destination call unavailable" })
                                                end,
                                            }, nil
                                        end,
                                    }
                                end,
                            }, nil
                        end,
                    },
                }, function()
                    local writer = select(1, automations_lib.open_sink_writer("provider.flows:destination_kind", {}))
                    test.not_nil(writer)
                    local result, err, envelope = (writer :: any):write({ sink_op = "upsert", origin = ORIGIN })
                    test.is_nil(result)
                    test.contains(tostring(err), "destination call unavailable")
                    test.eq((envelope :: Map).kind, errors.UNAVAILABLE)
                    test.eq((envelope :: Map).retriable, true)
                    test.eq((envelope :: Map).terminal, false)
                end)
            end)

            test.it("returns one store descriptor per store port, keyed to its binding", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    local sinks, err = automations_lib.list_sinks()
                    test.is_nil(err)
                    test.eq(#sinks, 2, "each fixture store port once; no dm sink, no kind sinks")
                    local by_binding: any = {}
                    for _, s in ipairs(sinks) do
                        test.eq(s.surface, "store", "every sink row is a store port")
                        by_binding[s.binding] = (by_binding[s.binding] or 0) + 1
                    end
                    test.eq(by_binding["kickside.channel.sink:channel_sink"], 1)
                    test.eq(by_binding["kickside.knowledge.sink:kb_embed_sink"], 1)
                end)
            end)

            test.it("carries the picker config schema the UI needs, resolvable by port id", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    local ch, err = automations_lib.resolve_sink("kickside.channel.sink:channel_post")
                    test.is_nil(err)
                    test.eq(ch.binding, "kickside.channel.sink:channel_sink")
                    test.eq(ch.id, "kickside.channel.sink:channel_post")
                    test.eq(ch.config_schema.channel_id.picker, "wc-channel-picker")
                    -- A port declares its faces as JSON schema text; the catalog
                    -- serves the decoded object, the shape every install input
                    -- built from a descriptor face must carry.
                    test.eq(type(ch.output_schema), "table")
                    test.eq(ch.output_schema.properties.success.type, "boolean")
                    test.eq(type(ch.input_schema), "table")
                    test.eq(ch.input_schema.properties.content.type, "string")

                    local kb, kerr = automations_lib.resolve_sink("kickside.knowledge.sink:kb_embed")
                    test.is_nil(kerr)
                    test.eq(kb.config_schema.kb_id.picker, "wc-kb-picker")
                end)
            end)

            test.it("classifies every sink as a store and computes its tier from declared operations", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    -- upsert-only is an append_only store; the full upsert+delete+list_keys
                    -- set is a full store.
                    local ch, err = automations_lib.resolve_sink("kickside.channel.sink:channel_post")
                    test.is_nil(err)
                    test.eq(ch.surface, "store")
                    test.eq(ch.store_tier, "append_only")

                    local kb, kerr = automations_lib.resolve_sink("kickside.knowledge.sink:kb_embed")
                    test.is_nil(kerr)
                    test.eq(kb.surface, "store")
                    test.eq(kb.store_tier, "full")
                end)
            end)

            test.it("errors when a stored sink_binding names no store port", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    local ep, err = automations_lib.resolve_sink("ns:not_a_sink")
                    test.is_nil(ep)
                    test.not_nil(err)
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
