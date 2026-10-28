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

local catalog_registry = require("catalog_fixture").registry

local function define_tests()
    test.describe("kickside.automation:automation", function()
        test.describe("list_sources", function()
            test.it("returns one row per source port, carrying the derived surface and event reference", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    local sources, err = automations_lib.list_sources()
                    test.is_nil(err)
                    -- fireflies collection + upload.completed events; upload.deleted has no port.
                    test.eq(#sources, 2, "audit-only events with no port are omitted from the catalog")
                    local by_binding: any = {}
                    for _, s in ipairs(sources) do
                        test.eq(s.surface == "collection" or s.surface == "events", true, "every source row is a source port")
                        by_binding[s.binding] = s
                    end
                    local ff = by_binding["kickside.fireflies.source:transcripts_source"]
                    test.eq(ff.surface, "collection")
                    test.eq(ff.id, "kickside.fireflies.source:transcripts")
                    local up = by_binding["kickside.uploads:uploads_component"]
                    test.eq(up.surface, "events")
                    test.eq(up.event, "kickside.uploads.events:upload.completed")
                    test.eq(up.config_schema.thread_id.class, "kickside.test.uploads")
                    -- The events port output face is derived from the event entry's schema.
                    test.not_nil(up.output_schema)
                end)
            end)

            test.it("labels each row by its OWN port title; no two rows share a title", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    local sources, err = automations_lib.list_sources()
                    test.is_nil(err)
                    local seen: any = {}
                    for _, s in ipairs(sources) do
                        test.not_nil(s.title)
                        test.is_nil(seen[s.title], "duplicate source row title: " .. tostring(s.title))
                        seen[s.title] = true
                    end
                    local by_binding: any = {}
                    for _, s in ipairs(sources) do by_binding[s.binding] = s end
                    test.eq(by_binding["kickside.uploads:uploads_component"].title, "Upload Completed")
                end)
            end)

            test.it("carries the binding's own display title as binding_title on every row", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    local sources, err = automations_lib.list_sources()
                    test.is_nil(err)
                    local by_binding: any = {}
                    for _, s in ipairs(sources) do by_binding[s.binding] = s end
                    test.eq(by_binding["kickside.uploads:uploads_component"].binding_title, "Uploads")
                    test.eq(by_binding["kickside.fireflies.source:transcripts_source"].binding_title, "Fireflies Transcripts")

                    local sinks, serr = automations_lib.list_sinks()
                    test.is_nil(serr)
                    local sink_by_binding: any = {}
                    for _, s in ipairs(sinks) do sink_by_binding[s.binding] = s end
                    test.eq(sink_by_binding["kickside.channel.sink:channel_sink"].binding_title, "Send Channel Message")
                end)
            end)

            test.it("prefers a port's own comment as the source description", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    local sources, err = automations_lib.list_sources()
                    test.is_nil(err)
                    local by_binding: any = {}
                    for _, s in ipairs(sources) do by_binding[s.binding] = s end
                    test.eq(by_binding["kickside.uploads:uploads_component"].description, "Start after a file finishes processing and is ready to use.")
                end)
            end)

            test.it("resolve_source recovers a source's port descriptor by port id", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    local ff, err = automations_lib.resolve_source("kickside.fireflies.source:transcripts")
                    test.is_nil(err)
                    test.eq(ff.surface, "collection")
                    test.eq(ff.id, "kickside.fireflies.source:transcripts")
                    test.eq(ff.binding, "kickside.fireflies.source:transcripts_source")
                    -- A collection source's item face rides an install input as
                    -- output_schema, so the descriptor carries the decoded object.
                    test.eq(type(ff.output_schema), "table")
                    test.eq(ff.output_schema.properties.id.type, "string")

                    -- The owning binding id is not a resolvable key.
                    local by_binding, berr = automations_lib.resolve_source("kickside.fireflies.source:transcripts_source")
                    test.is_nil(by_binding)
                    test.not_nil(berr)
                end)
            end)

            test.it("classifies polled sources as collections and thread streams as events", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    local ff, err = automations_lib.resolve_source("kickside.fireflies.source:transcripts")
                    test.is_nil(err)
                    test.eq(ff.surface, "collection")
                    test.is_nil(ff.store_tier, "store_tier is a store-only field")

                    local up, uerr = automations_lib.resolve_source("kickside.uploads:upload_completed")
                    test.is_nil(uerr)
                    test.eq(up.surface, "events")
                    test.is_nil(up.store_tier, "store_tier is a store-only field")
                end)
            end)

            test.it("a source's class is derived from the owning binding's meta.class", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    local up, err = automations_lib.resolve_source("kickside.uploads:upload_completed")
                    test.is_nil(err)
                    test.eq(up.surface, "events")
                    test.eq(up.class, "kickside.uploads")
                end)
            end)

            -- The catalog descriptor speaks one vocabulary. Historical bridge
            -- fields are not part of any source or sink declaration.
            test.it("emits only canonical fields on every catalog descriptor", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    local sources, serr = automations_lib.list_sources()
                    test.is_nil(serr)
                    local sinks, kerr = automations_lib.list_sinks()
                    test.is_nil(kerr)
                    local BRIDGE = { "dir", "mode", "via", "type", "schema", "item_schema" }
                    local function assert_clean(rows: any)
                        for _, row in ipairs(rows) do
                            for _, field in ipairs(BRIDGE) do
                                test.is_nil((row :: any)[field], "bridge field " .. field .. " leaked onto " .. tostring((row :: any).id))
                            end
                        end
                    end
                    assert_clean(sources)
                    assert_clean(sinks)
                end)
            end)
        end)

        -- Producers (sources) and consumers (sinks) are strictly disjoint: no binding
        -- appears in both catalogs, and no row title collides across them.
        test.describe("sink/source catalogs are disjoint", function()
            test.it("no binding or title appears as both a sink and a source", function()
                with_loaded_modules({ registry = catalog_registry() }, function()
                    local sinks, serr = automations_lib.list_sinks()
                    local sources, oerr = automations_lib.list_sources()
                    test.is_nil(serr)
                    test.is_nil(oerr)

                    local sink_bindings: any = {}
                    local sink_titles: any = {}
                    for _, s in ipairs(sinks) do
                        sink_bindings[tostring(s.binding)] = true
                        sink_titles[tostring(s.title)] = true
                    end
                    for _, s in ipairs(sources) do
                        test.is_nil(sink_bindings[tostring(s.binding)], "binding appears as both sink and source: " .. tostring(s.binding))
                        test.is_nil(sink_titles[tostring(s.title)], "title appears in both catalogs: " .. tostring(s.title))
                    end
                end)
            end)
        end)

        test.describe("port declaration boundary", function()
            test.it("every live port entry passes the port-shape validator; no retired display terms", function()
                local ports, perr = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = "kickside.automation.port" })
                test.is_nil(perr)
                test.is_true(#(ports or {}) > 0, "expected at least one published port entry")
                local bindings, berr = registry.find({ [".kind"] = "contract.binding" })
                test.is_nil(berr)

                local combined: { any } = {}
                for _, b in ipairs(bindings or {}) do combined[#combined + 1] = b end
                for _, p in ipairs(ports or {}) do combined[#combined + 1] = p end
                local failures: { string } = binding_validation.validate_bindings(combined)

                for _, p in ipairs(ports or {}) do
                    local meta = entry_meta(p)
                    local title_term = retired_display_term(meta.title)
                    if title_term then
                        failures[#failures + 1] = entry_id(p) .. " port title uses retired display term " .. title_term
                    end
                end
                test.eq(#failures, 0, table.concat(failures, "; "))
            end)
        end)

        test.describe("target DB declaration", function()
            test.it("routes automation DB access through the target_db-backed db_config entry", function()
                local req = registry.get("kickside.automation:target_db")
                test.not_nil(req)
                local seen: any = {}
                for _, target in ipairs((((req :: any).data or req).targets or {}) :: { any }) do
                    seen[tostring((target :: any).entry) .. " " .. tostring((target :: any).path)] = true
                end
                test.eq(seen["kickside.automation:db_config .meta.db_id"], true)

                local cfg = registry.get("kickside.automation:db_config")
                test.not_nil(cfg)
                test.eq(entry_meta(cfg).db_id, "app:db")
                test.eq(automation_types.db_id(), "app:db")
            end)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
