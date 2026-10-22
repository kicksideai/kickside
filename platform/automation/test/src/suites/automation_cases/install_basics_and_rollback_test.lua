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
        test.it("propagates canonical principal resolution denial during preflight", function()
            local resolution_error = errors.new({ kind = errors.PERMISSION_DENIED, message = "principal delegation denied" })
            local authority = declaration_authority.new({
                component = {},
                security = { actor = function() return {
                    id = function() return "user-1" end,
                    meta = function() return { security_groups = { "member" } } end,
                } end },
                execution_identity = {
                    validate = execution_identity.validate,
                    actor_key = execution_identity.actor_key,
                    authorize = function() return nil, resolution_error end,
                },
                registry = {},
            })
            local allowed, err = authority.check(v2_identity("user-1"), "user-1", {})
            test.eq(allowed, false)
            test.eq(err, resolution_error)
            local forged = v2_identity("user-1")
            forged.authorized_by = { kind = "user", id = "admin" }
            local forged_allowed, forged_err = authority.check(forged, "user-1", {})
            test.eq(forged_allowed, false)
            test.eq(errors.is(forged_err, errors.PERMISSION_DENIED), true)
        end)

        for _, actor_groups in ipairs({ {}, { "forged-admin" } }) do
            test.it("EE2-2562 resolves declaration groups from Users with " .. #actor_groups .. " transport groups", function()
                local caller = { id = function() return "user-1" end,
                    meta = function() return { via = "mcp", security_groups = #actor_groups > 0 and actor_groups or nil } end }
                local security_stub = {
                    actor = function() return caller end,
                    scope = function() return {} end,
                    can = function() return false end,
                    new_actor = function() error("declaration checks do not construct actors") end,
                    named_scope = function() error("declaration checks do not construct scopes") end,
                }
                local live = execution_identity.new({ security = security_stub,
                    contract = { get = function() return resolver_contract("members", { "store-members" }), nil end } })
                local checked = 0
                local authority = declaration_authority.new({ security = security_stub, execution_identity = live, registry = {},
                    component = { ACCESS = { READ = 1 }, validate_principal_access = function(id, mask, principal, groups)
                        checked = checked + 1
                        test.eq(principal.id, "user-1")
                        test.eq(mask, 1)
                        test.eq(#groups, 1)
                        test.eq(groups[1], "store-members")
                        return id == "accessible", nil
                    end } })
                local identity, capture_err = live.capture()
                test.is_nil(capture_err)
                local allowed, err = authority.check(identity, "user-1", { { kind = "component", id = "accessible", access = "READ" } })
                test.is_nil(err)
                test.eq(allowed, true)
                local denied, denied_err = authority.check(identity, "user-1", { { kind = "component", id = "inaccessible", access = "READ" } })
                test.is_nil(denied_err)
                test.eq(denied, false)
                test.eq(checked, 2)
            end)
        end
        test.it("classifies a failed reference lookup as retryable infrastructure", function()
            local authority = declaration_authority.new({
                component = {},
                execution_identity = {
                    actor_key = function() return "user-1" end,
                    authorize = function() return { meta = {} }, nil end,
                },
                registry = { get = function() return nil, "registry offline" end },
            })
            local allowed, err = authority.check({ principal = { kind = "user", id = "user-1" } },
                "user-1", { { kind = "trait", id = "ns:trait" } }, "kickside.automation:declaration_writer_create")
            test.eq(allowed, false)
            test.not_nil(err)
            test.eq(errors.is(err, errors.UNAVAILABLE), true)
            test.eq((err :: any):retryable(), true)
        end)

        test.it("RA-H16 rejects a registry reference visible only to the declaration worker", function()
            local evaluated: table? = nil
            local authority = declaration_authority.new({
                component = {},
                security = {},
                execution_identity = {
                    actor_key = function() return "selected-user" end,
                    authorize = function()
                        return {
                            principal = { kind = "user", id = "selected-user" },
                            actor_id = "selected-user",
                            scope_name = "selected-live-scope",
                            scope_groups = { "selected-members", "credential-restrictions" },
                            scope_policy_ids = { "credential:restricted" },
                            meta = { security_groups = { "selected-members" } },
                        }, nil
                    end,
                    evaluate_live_scope = function(authorized, action, resources)
                        evaluated = { authorized = authorized, action = action, resources = resources }
                        return "undefined", nil
                    end,
                },
                registry = { get = function()
                    return { meta = { type = "agent.trait" } }, nil
                end },
            })
            local allowed, err = authority.check({ principal = { kind = "user", id = "selected-user" } },
                "selected-user", { { kind = "trait", id = "private:trait" } },
                "kickside.automation:declaration_writer_create")
            test.is_nil(err)
            test.eq(allowed, false)
            test.not_nil(evaluated)
            test.eq((evaluated :: table).authorized.principal.id, "selected-user")
            test.eq((evaluated :: table).authorized.scope_name, "selected-live-scope")
            test.eq((evaluated :: table).authorized.scope_groups[2], "credential-restrictions")
            test.eq((evaluated :: table).authorized.scope_policy_ids[1], "credential:restricted")
            test.eq((evaluated :: table).action, "registry.get")
            test.eq((evaluated :: table).resources[1], "private:trait")
        end)

        test.it("RA-H16 checks declared functions under the selected principal's live registry scope", function()
            local evaluated: table? = nil
            local authority = declaration_authority.new({
                component = {}, security = {},
                execution_identity = {
                    actor_key = function() return "selected-user" end,
                    authorize = function()
                        return { principal = { kind = "user", id = "selected-user" }, meta = {} }, nil
                    end,
                    evaluate_live_scope = function(authorized, action, resources)
                        evaluated = { authorized = authorized, action = action, resources = resources }
                        return "undefined", nil
                    end,
                },
                registry = { get = function()
                    return { kind = "function.lua", meta = {} }, nil
                end },
            })
            local allowed, err = authority.check({ principal = { kind = "user", id = "selected-user" } },
                "selected-user", { { kind = "function", id = "private:handler", access = "READ" } },
                "kickside.automation:declaration_writer_create")
            test.is_nil(err)
            test.eq(allowed, false)
            test.not_nil(evaluated)
            test.eq((evaluated :: table).action, "registry.get")
            test.eq((evaluated :: table).resources[1], "private:handler")
        end)

        -- ─── happy path / return shape ─────────────────────────────

        test.describe("happy path", function()
            test.it("returns state, metadata, and rollback array", function()
                local data, err = automations_lib.install(function(t)
                    return {
                        state = { schedule_id = "abc-123" },
                        metadata = { title = "Daily summary", icon = "tabler:clock" },
                    }
                end)
                test.is_nil(err)
                test.not_nil(data)
                test.eq(data.state.schedule_id, "abc-123")
                test.eq(data.metadata.title, "Daily summary")
                test.eq(data.metadata.icon, "tabler:clock")
                test.eq(type(data.rollback), "table")
                test.eq(#data.rollback, 0, "no rollback entries when none registered")
            end)

            test.it("defaults metadata to empty table when omitted", function()
                local data, err = automations_lib.install(function(t)
                    return { state = { ok = true } }
                end)
                test.is_nil(err)
                test.eq(type(data.metadata), "table")
                test.eq(next(data.metadata), nil)
            end)

            test.it("accepts state = empty table", function()
                local data, err = automations_lib.install(function(t)
                    return { state = {} }
                end)
                test.is_nil(err)
                test.eq(type(data.state), "table")
            end)

            test.it("preserves nested state structures", function()
                local data, err = automations_lib.install(function(t)
                    return {
                        state = {
                            outer = { inner = { deep = { v = 42 } }, list = { 1, 2, 3 } },
                            flag = true,
                            count = 0,
                        },
                    }
                end)
                test.is_nil(err)
                test.eq(data.state.outer.inner.deep.v, 42)
                test.eq(data.state.outer.list[2], 2)
                test.eq(data.state.flag, true)
                test.eq(data.state.count, 0)
            end)

            test.it("preserves all metadata fields verbatim", function()
                local data, err = automations_lib.install(function(t)
                    return {
                        state = { id = "x" },
                        metadata = {
                            title = "T",
                            icon = "tabler:bolt",
                            comment = "Long description.",
                            extra_field = "passes through",
                        },
                    }
                end)
                test.is_nil(err)
                test.eq(data.metadata.title, "T")
                test.eq(data.metadata.icon, "tabler:bolt")
                test.eq(data.metadata.comment, "Long description.")
                test.eq(data.metadata.extra_field, "passes through")
            end)

            test.it("preserves created resource records", function()
                local data, err = automations_lib.install(function(t)
                    return {
                        state = { id = "x" },
                        created = {
                            { kind = "thread", id = "thread-1" },
                            { kind = "kb", id = "kb-1" },
                        },
                    }
                end)
                test.is_nil(err)
                test.eq(#data.created, 2)
                test.eq(data.created[1].kind, "thread")
                test.eq(data.created[2].id, "kb-1")
            end)

            test.it("preserves public_state and records rollback (scheduling is the body's own contract work)", function()
                local data, err = automations_lib.install(function(t)
                    t.rollback("provider.module:delete_schedule", { schedule_id = "sched-1" })
                    return {
                        state = { source_id = "src-1", schedule_id = "sched-1" },
                        public_state = { enabled = true, last_status = "idle" },
                    }
                end)
                test.is_nil(err)
                test.eq(data.public_state.enabled, true)
                test.eq(data.public_state.last_status, "idle")
                test.eq(data.state.schedule_id, "sched-1")
                test.eq(#data.rollback, 1)
                test.eq(data.rollback[1].target, "provider.module:delete_schedule")
            end)

            test.it("ignores extra top-level keys in body return", function()
                local data, err = automations_lib.install(function(t)
                    return {
                        state = { id = "x" },
                        metadata = { title = "T" },
                        extra = "ignored",
                        warnings = { "not used" },
                    }
                end)
                test.is_nil(err)
                test.eq(data.state.id, "x")
                test.eq(data.metadata.title, "T")
                test.is_nil((data :: any).extra)
                test.is_nil((data :: any).warnings)
            end)
        end)

        -- ─── rollback chain construction ───────────────────────────

        test.describe("rollback chain construction", function()
            test.it("records (target, args) entries from t.rollback calls", function()
                local data, err = automations_lib.install(function(t)
                    t.rollback("ns:func_a", { x = 1 })
                    t.rollback("ns:func_b", { y = 2 })
                    return { state = { ok = true } }
                end)
                test.is_nil(err)
                test.eq(#data.rollback, 2)
                test.eq(data.rollback[1].target, "ns:func_a")
                test.eq(data.rollback[1].args.x, 1)
                test.eq(data.rollback[2].target, "ns:func_b")
                test.eq(data.rollback[2].args.y, 2)
            end)

            test.it("records args = empty table when nil passed", function()
                local data, err = automations_lib.install(function(t)
                    t.rollback("ns:func_a")
                    return { state = { ok = true } }
                end)
                test.is_nil(err)
                test.eq(#data.rollback, 1)
                test.eq(type(data.rollback[1].args), "table")
                test.eq(next(data.rollback[1].args), nil)
            end)

            test.it("records args = empty table when non-table passed", function()
                local data, err = automations_lib.install(function(t)
                    t.rollback("ns:func_a", "not-a-table")
                    return { state = { ok = true } }
                end)
                test.is_nil(err)
                test.eq(type(data.rollback[1].args), "table")
                test.eq(next(data.rollback[1].args), nil)
            end)

            test.it("ignores rollback with nil target", function()
                local data, err = automations_lib.install(function(t)
                    t.rollback(nil, { x = 1 })
                    return { state = { ok = true } }
                end)
                test.is_nil(err)
                test.eq(#data.rollback, 0)
            end)

            test.it("ignores rollback with empty target", function()
                local data, err = automations_lib.install(function(t)
                    t.rollback("", { x = 1 })
                    return { state = { ok = true } }
                end)
                test.is_nil(err)
                test.eq(#data.rollback, 0)
            end)

            test.it("ignores rollback with non-string target", function()
                local data, err = automations_lib.install(function(t)
                    t.rollback(42, {})
                    t.rollback({}, {})
                    t.rollback(true, {})
                    return { state = { ok = true } }
                end)
                test.is_nil(err)
                test.eq(#data.rollback, 0)
            end)

            test.it("preserves order of registration", function()
                local data, err = automations_lib.install(function(t)
                    for i = 1, 5 do t.rollback("ns:f" .. i, { i = i }) end
                    return { state = { ok = true } }
                end)
                test.is_nil(err)
                test.eq(#data.rollback, 5)
                for i = 1, 5 do
                    test.eq(data.rollback[i].target, "ns:f" .. i)
                    test.eq(data.rollback[i].args.i, i)
                end
            end)

            test.it("records 100 rollback entries correctly", function()
                local data, err = automations_lib.install(function(t)
                    for i = 1, 100 do t.rollback("ns:f", { i = i }) end
                    return { state = { ok = true } }
                end)
                test.is_nil(err)
                test.eq(#data.rollback, 100)
                test.eq(data.rollback[1].args.i, 1)
                test.eq(data.rollback[100].args.i, 100)
            end)
        end)

        -- ─── rollback chain replay on install failure ────────────────

    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
