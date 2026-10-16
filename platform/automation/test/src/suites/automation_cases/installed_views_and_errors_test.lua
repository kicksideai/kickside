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
        test.describe("list_installed public_state projection", function()
            test.it("retains durable automations whose kind is no longer installed", function()
                with_loaded_modules({
                    registry = {
                        find = function() return {}, nil end,
                        get = function() return nil, errors.new({ kind = errors.NOT_FOUND, message = "kind removed" }) end,
                    },
                    command = { ids = function() return { "removed-automation" }, nil end },
                    component = {
                        ACCESS = { READ = 1 },
                        query = function(args)
                            test.eq(args.actor_id, "viewer")
                            test.eq(args.component_ids[1], "removed-automation")
                            return { { component_id = "removed-automation", impl_id = "ns:removed",
                                meta = { title = "Preserved", class = "custom-class" } } }, nil
                        end,
                    },
                }, function()
                    local rows, err = automations_lib.list_installed({ actor_id = "viewer" })
                    test.is_nil(err)
                    test.eq(#rows, 1)
                    test.eq(rows[1].id, "removed-automation")
                    test.eq(rows[1].availability.code, "unavailable")
                    test.contains(rows[1].availability.message, "ns:removed")
                    test.is_nil(rows[1].public_state)
                end)
            end)

            -- A lookup failure is the listing's typed error, never an empty list.
            test.it("answers the registry's and the component store's failures as typed errors", function()
                local unavailable = errors.new({ message = "registry unavailable", kind = errors.UNAVAILABLE, retryable = true })
                with_loaded_modules({
                    registry = { find = function(_query: any): (any, any) return nil, unavailable end },
                }, function()
                    local rows, err = automations_lib.list_installed({})
                    test.is_nil(rows)
                    test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
                    local runtime, runtime_err = automations_lib.list_runtime({})
                    test.is_nil(runtime)
                    test.is_true(errors.is(runtime_err, errors.UNAVAILABLE), tostring(runtime_err))
                end)
                local failed = errors.new({ message = "component store down", kind = errors.INTERNAL })
                with_loaded_modules({
                    registry = { find = function(_query: any): (any, any) return { { id = "ns:automation" } }, nil end },
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        query = function(_args: any): (any, any) return nil, failed end,
                        list_system = function(_args: any): (any, any) return nil, failed end,
                    },
                }, function()
                    for _, opts in ipairs({ {}, { actor_id = "viewer-1" } }) do
                        local rows, err = automations_lib.list_installed(opts)
                        test.is_nil(rows)
                        test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
                        local runtime, runtime_err = automations_lib.list_runtime(opts)
                        test.is_nil(runtime)
                        test.is_true(errors.is(runtime_err, errors.INTERNAL), tostring(runtime_err))
                    end
                end)
            end)

            test.it("projects each row's materialized public_state, coercing typed meta, with the schema resolved once per type and no per-row status call", function()
                local get_calls: { [string]: integer } = {}
                with_loaded_modules({
                    registry = {
                        find = function(query: any): (any, any)
                            test.eq(query["meta.type"], "kickside.automation")
                            test.eq(query[".kind"], "contract.binding")
                            return { { id = "ns:automation" }, { id = "ns:bare" } }, nil
                        end,
                        get = function(id: string): (any, any)
                            get_calls[id] = (get_calls[id] or 0) + 1
                            if id == "ns:automation" then
                                return {
                                    id = id, kind = "contract.binding",
                                    meta = {
                                        type = "kickside.automation",
                                        public_state_schema = { fields = {
                                            { key = "enabled", type = "boolean" },
                                            { key = "accepted_count", type = "integer" },
                                        } },
                                    },
                                }, nil
                            end
                            return { id = id, kind = "contract.binding", meta = { type = "kickside.automation" } }, nil
                        end,
                    },
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        -- A per-row status/state read would go through query; the list
                        -- path must never touch it -- the state is projected from the
                        -- meta already loaded by list_system.
                        query = function(_args: any): (any, any)
                            error("list_installed must not issue a per-component query")
                        end,
                        list_system = function(_args: any): (any, any)
                            test.eq(_args.parent_id, "crm-1")
                            return {
                                { component_id = "auto-1", impl_id = "ns:automation", parent_id = "crm-1", meta = { class = "automation", enabled = "true", accepted_count = "9" } },
                                { component_id = "auto-2", impl_id = "ns:automation", parent_id = "crm-1", meta = { class = "automation", accepted_count = "4" } },
                                { component_id = "bare-1", impl_id = "ns:bare", meta = { class = "automation" } },
                            }, nil
                        end,
                    },
                }, function()
                    local rows, err = automations_lib.list_installed({ parent_id = "crm-1" })
                    test.is_nil(err)
                    test.eq(#rows, 3)

                    -- TEXT-stored integer coerced to a number, boolean coerced.
                    test.eq(rows[1].public_state.accepted_count, 9)
                    test.eq(type(rows[1].public_state.accepted_count), "number")
                    test.eq(rows[1].public_state.enabled, true)
                    test.eq(rows[1].parent_id, "crm-1")
                    test.eq(rows[2].public_state.accepted_count, 4)

                    -- A type declaring no public_state_schema omits public_state.
                    test.is_nil(rows[3].public_state)

                    -- Schema resolved once for the shared type, not per row.
                    test.eq(get_calls["ns:automation"], 1)
                end)
            end)
        end)

        -- ─── error propagation ──────────────────────────────────────

        test.describe("error propagation", function()
            test.it("rejects malformed list pagination before opening components", function()
                local rows, limit_err = automations_lib.list_installed({ limit = 25.5 })
                test.is_nil(rows)
                test.contains(limit_err, "limit must be an integer")

                local _, offset_err = automations_lib.list_installed({ offset = 1.5 })
                test.contains(offset_err, "offset must be an integer")
            end)

            test.it("accepts explicit pagination without a compiled page ceiling", function()
                local rows, limit_err = automations_lib.list_installed({ limit = 501 })
                test.is_nil(limit_err)
                test.not_nil(rows)

                local _, offset_err = automations_lib.list_installed({ offset = -1 })
                test.contains(offset_err, "offset must be non-negative")
            end)

            test.it("propagates structured errors.new() values", function()
                local data, err = automations_lib.install(function(t)
                    return nil, errors.new({
                        message = "name is required",
                        kind = errors.INVALID,
                        details = { field = "name" },
                    })
                end)
                test.is_nil(data)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
                test.eq(err:message(), "name is required")
                test.eq(err_details(err).field, "name")
            end)

            test.it("propagates string errors", function()
                local data, err = automations_lib.install(function(t)
                    return nil, "plain string error"
                end)
                test.is_nil(data)
                test.not_nil(err)
            end)

            test.it("returns nil data on every error path", function()
                local paths = {
                    function(t) return nil, "string err" end,
                    function(t) return nil, errors.new({ message = "structured" }) end,
                    function(t) return { metadata = { title = "x" } } end,  -- shape err
                    function(t) return "not a table" end,                   -- shape err
                    function(t) return { state = "not a table" } end,       -- shape err
                    function(t) return { state = { x = 1 }, metadata = "bad" } end,  -- shape err
                }
                for _, body in ipairs(paths) do
                    local data, err = automations_lib.install(body)
                    test.is_nil(data, "expected nil data on error path")
                    test.not_nil(err, "expected error on this path")
                end
            end)

            test.it("preserves error details across body return", function()
                local data, err = automations_lib.install(function(t)
                    return nil, errors.new({
                        message = "validation failed",
                        kind = errors.INVALID,
                        details = {
                            field = "schedule_expression",
                            value = "*/0 * * * *",
                            reason = "step value cannot be zero",
                        },
                    })
                end)
                test.is_nil(data)
                local d = err_details(err)
                test.eq(d.field, "schedule_expression")
                test.eq(d.value, "*/0 * * * *")
                test.eq(d.reason, "step value cannot be zero")
            end)
        end)

        -- ─── durable state helpers ─────────────────────────────────

    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
