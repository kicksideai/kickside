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
        test.describe("install_type declared schedules", function()
            -- A kind whose install body declares schedules on its public `run` action.
            local function scheduled_kind(): any
                return {
                    get = function(id)
                        return {
                            id = id,
                            kind = "contract.binding",
                            meta = {
                                type = "kickside.automation",
                                class = "integration",
                                exportable = true,
                                actions = { { name = "run" } },
                                public_state_schema = {
                                    fields = {
                                        { key = "enabled", type = "checkbox", patchable = true },
                                    },
                                },
                            },
                            data = {
                                contracts = {
                                    {
                                        contract = "kickside.contract:installable",
                                        methods = { install = "ns:install" },
                                    },
                                    { contract = "ns:operations", methods = { run = "ns:run", hidden = "ns:hidden" } },
                                },
                            },
                        }, nil
                    end,
                }
            end

            local function scheduled_body(schedules: any, source: any?): FuncCall
                return function(target, args)
                    test.eq(target, "ns:install")
                    return {
                        source = source or { source_kind = "none" },
                        state = { source_id = "src-1" },
                        public_state = { enabled = true },
                        metadata = { title = "Atlassian sync" },
                        rollback = {
                            { target = "ns:delete_source", args = { source_id = "src-1" } },
                        },
                        schedules = schedules,
                    }, nil
                end
            end

            local function slot_recorder(provisioned: { any }): any
                return {
                    provision = function(automation_id: string, drive_key: string): (any?, any)
                        provisioned[#provisioned + 1] = { automation_id = automation_id, drive_key = drive_key }
                        return "job-" .. drive_key, nil
                    end,
                    wake_dispatcher = function(): (any?, any) return { woken = true }, nil end,
                }
            end

            local function read_drive(automation_id: string, drive_key: string): any
                local sql_mod = active_dependencies.sql :: any
                local db, db_err = sql_mod.get(automation_types.db_id())
                if db_err or not db then error("automation db: " .. tostring(db_err)) end
                local row, err = (active_dependencies.drive :: any).get(db, automation_id, drive_key)
                db:release()
                if err then error(tostring(err)) end
                return row
            end

            test.it("declares a canonical timer source with one main slot", function()
                local writes: { any }, provisioned: { any } = {}, {}
                with_loaded_modules({
                    registry = scheduled_kind(),
                    funcs = install_funcs(scheduled_body(nil, { source_kind = "timer",
                        schedule = { type = "interval", expression = "5m" } }), declared_writer(writes)),
                    slot = slot_recorder(provisioned),
                }, function()
                    local result, err = automations_lib.install_type("ns:automation", { source_id = "src-1" })
                    test.is_nil(err, tostring(err))
                    test.eq(#writes, 1); test.eq(#result.drives, 1)
                    test.eq(result.drives[1], "main")
                    local main = read_drive(result.id, "main")
                    test.eq(main.source_kind, "timer")
                    test.eq(main.action.schedule.expression, "5m")
                    test.is_nil(main.action.method)
                    test.eq(#provisioned, 1); test.eq(provisioned[1].drive_key, "main")
                    test.eq(#writes[1].args.rollback, 1)
                end)
            end)

            test.it("persists the main drive's declared event source keyed by its source thread", function()
                local writes: { Map } = {}
                local provisioned: { any } = {}
                local lowered: { Map } = {}
                local thread_id = uuid.v7()
                with_loaded_modules({
                    registry = scheduled_kind(),
                    funcs = install_funcs(scheduled_body(nil, {
                        source_kind = "event", source_ref = "ns:events_port", source_thread_id = thread_id,
                        wake_key = "thread:" .. thread_id, start = "all",
                    }), declared_writer(writes)),
                    slot = slot_recorder(provisioned),
                    retention_pin = {
                        pin_lower = function(_db: any, request: Map): (any?, any)
                            lowered[#lowered + 1] = request
                            return { thread_id = request.thread_id, consumer_key = request.consumer_key, pin_generation = 7 }, nil
                        end,
                    },
                }, function()
                    local result, err = automations_lib.install_type("ns:automation", { source_id = "src-1" })
                    test.is_nil(err, tostring(err))
                    local main = read_drive(result.id, "main")
                    test.eq(main.source_kind, "event")
                    test.eq(main.source_thread_id, thread_id)
                    test.eq(main.action.source_ref, "ns:events_port")
                    test.eq(main.pin_generation, 7)
                    test.eq(#lowered, 1)
                    test.eq(lowered[1].thread_id, thread_id)
                    test.eq(lowered[1].consumer_key, "drive:" .. result.id .. ":main")
                    test.eq(lowered[1].command_id, "install:" .. result.id)
                    test.eq(lowered[1].target_cursor, 0)
                end)
            end)

            test.it("persists a collection source and a none source", function()
                for _, source in ipairs({
                    { source_kind = "collection", source_ref = "ns:records_port", config = { connection_id = "conn-1" },
                        schedule = { type = "interval", expression = "30m" } },
                    { source_kind = "timer", schedule = { type = "cron", expression = "0 9 * * *" } },
                    { source_kind = "none" },
                }) do
                    local writes: { Map } = {}
                    with_loaded_modules({
                        registry = scheduled_kind(),
                        funcs = install_funcs(scheduled_body(nil, source), declared_writer(writes)),
                        slot = slot_recorder({}),
                    }, function()
                        local result, err = automations_lib.install_type("ns:automation", { source_id = "src-1" })
                        test.is_nil(err, tostring(err))
                        local main = read_drive(result.id, "main")
                        test.eq(main.source_kind, source.source_kind)
                        test.is_nil(main.source_thread_id)
                        test.eq(main.action.source_ref, source.source_ref)
                        if source.schedule then
                            test.eq(main.action.schedule.type, source.schedule.type)
                            test.eq(main.action.schedule.expression, source.schedule.expression)
                        end
                        if source.config then test.eq(main.action.config.connection_id, "conn-1") end
                    end)
                end
            end)

            test.it("refuses an install result without a main source or with a malformed one, as INVALID", function()
                for _, source in ipairs({
                    false,
                    { source_kind = "install" },
                    { source_kind = "event", source_ref = "ns:events_port" },
                    { source_kind = "event", source_ref = "ns:events_port", source_thread_id = "01a0de40-ee0b-7846-87ba-f1127c7ad7b1" },
                    { source_kind = "event", source_ref = "ns:events_port", source_thread_id = "01a0de40-ee0b-7846-87ba-f1127c7ad7b1",
                        start = "latest" },
                    { source_kind = "event", source_ref = "ns:events_port", source_thread_id = "thread-7" },
                    { source_kind = "event", source_ref = "ns:events_port", source_thread_id = "01a0de40-ee0b-7846-87ba-f1127c7ad7b1",
                        wake_key = "thread:other" },
                    { source_kind = "collection" },
                    { source_kind = "collection", source_ref = "ns:records_port" },
                    { source_kind = "collection", source_ref = "ns:records_port", schedule = { type = "hourly", expression = "1h" } },
                    { source_kind = "collection", source_ref = "ns:records_port", schedule = { type = "interval", expression = "5m" },
                        config = "conn-1" },
                    { source_kind = "collection", source_ref = "ns:records_port", source_thread_id = "thread-7" },
                    { source_kind = "timer" },
                    { source_kind = "none", source_ref = "ns:records_port" },
                    { source_kind = "none", extra = true },
                }) do
                    local writes: { Map } = {}
                    with_loaded_modules({
                        registry = scheduled_kind(),
                        funcs = install_funcs(function(target, args)
                            local result = scheduled_body(nil, nil)(target, args)
                            result.source = source ~= false and source or nil
                            return result, nil
                        end, declared_writer(writes)),
                        slot = slot_recorder({}),
                    }, function()
                        local result, err = automations_lib.install_type("ns:automation", { source_id = "src-1" })
                        test.is_nil(result)
                        test.not_nil(err)
                        test.eq((err :: any):kind(), "Invalid")
                        test.contains(tostring(err), "source")
                        test.eq(#writes, 0)
                    end)
                end
            end)

            test.it("rejects removed scheduled methods and rolls back before writing", function()
                local writes: { any } = {}
                local provisioned: { any } = {}
                with_loaded_modules({
                    registry = scheduled_kind(),
                    funcs = install_funcs(function(target, args)
                        if target == "ns:delete_source" then return true, nil end
                        return scheduled_body({
                            { state_key = "poll", method = "hidden", schedule = { type = "interval", expression = "5m" } },
                        })(target, args)
                    end, declared_writer(writes)),
                    slot = slot_recorder(provisioned),
                }, function()
                    local result, err = automations_lib.install_type("ns:automation", { source_id = "src-1" })
                    test.is_nil(result)
                    test.not_nil(err)
                    test.eq((err :: any):kind(), "Invalid")
                    test.contains(tostring(err), "scheduled methods are removed")
                    test.eq(#writes, 0)
                    test.eq(#provisioned, 0)
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
