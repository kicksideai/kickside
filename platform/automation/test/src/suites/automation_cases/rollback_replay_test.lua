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
        test.describe("rollback replay on install failure", function()
            test.it("replays rollback entries in reverse on (nil, err) return", function()
                local runner, calls = make_recorder()
                local data, err = automations_lib.install(function(t)
                    t.rollback("ns:first", { i = 1 })
                    t.rollback("ns:second", { i = 2 })
                    t.rollback("ns:third", { i = 3 })
                    return nil, "intentional failure"
                end, { runner = runner })
                test.is_nil(data)
                test.not_nil(err)
                test.eq(#calls, 3)
                test.eq((calls[1] :: any).target, "ns:third")
                test.eq((calls[2] :: any).target, "ns:second")
                test.eq((calls[3] :: any).target, "ns:first")
            end)

            test.it("replays rollback entries in reverse on a returned error", function()
                local runner, calls = make_recorder()
                local data, err = automations_lib.install(function(t)
                    t.rollback("ns:a", { x = 1 })
                    t.rollback("ns:b", { x = 2 })
                    return nil, errors.new({ message = "boom", kind = errors.INTERNAL })
                end, { runner = runner })
                test.is_nil(data)
                test.not_nil(err)
                test.eq(#calls, 2)
                test.eq((calls[1] :: any).target, "ns:b")
                test.eq((calls[2] :: any).target, "ns:a")
            end)

            test.it("replays even on result shape failure", function()
                local runner, calls = make_recorder()
                local data, err = automations_lib.install(function(t)
                    t.rollback("ns:a", {})
                    t.rollback("ns:b", {})
                    return { metadata = { title = "no state" } }
                end, { runner = runner })
                test.is_nil(data)
                test.not_nil(err)
                test.eq(#calls, 2, "rollback ran on shape validation failure too")
            end)

            test.it("does not replay rollbacks when install succeeds", function()
                local runner, calls = make_recorder()
                local data, err = automations_lib.install(function(t)
                    t.rollback("ns:a", {})
                    t.rollback("ns:b", {})
                    return { state = { ok = true } }
                end, { runner = runner })
                test.is_nil(err)
                test.not_nil(data)
                test.eq(#calls, 0, "successful install does not run rollbacks")
                test.eq(#data.rollback, 2, "but the chain is preserved for later replay")
            end)

            test.it("passes args correctly to runner", function()
                local runner, calls = make_recorder()
                automations_lib.install(function(t)
                    t.rollback("ns:a", { id = "abc", count = 7 })
                    return nil, "fail"
                end, { runner = runner })
                test.eq((calls[1] :: any).args.id, "abc")
                test.eq((calls[1] :: any).args.count, 7)
            end)

            test.it("a failing rollback step does not stop the steps before it", function()
                local calls = {}
                local runner = function(target, args)
                    calls[#calls + 1] = target
                    if target == "ns:b" then return "runner failed" end
                    return nil
                end
                automations_lib.install(function(t)
                    t.rollback("ns:a", {})
                    t.rollback("ns:b", {})
                    t.rollback("ns:c", {})
                    return nil, "fail"
                end, { runner = runner })
                -- Reverse order: c, b, a; b fails, a still runs.
                test.eq(#calls, 3)
                test.eq(calls[1], "ns:c")
                test.eq(calls[3], "ns:a")
            end)
        end)

        -- ─── M.replay (post-install rollback) ───────────────────────

        test.describe("M.replay", function()
            test.it("replays a persisted chain in reverse", function()
                local runner, calls = make_recorder()
                local count, failed = automations_lib.replay({
                    { target = "ns:first", args = { i = 1 } },
                    { target = "ns:second", args = { i = 2 } },
                    { target = "ns:third", args = { i = 3 } },
                }, { runner = runner })
                test.eq(count, 3)
                test.eq(failed, 0)
                test.eq(#calls, 3)
                test.eq((calls[1] :: any).target, "ns:third")
                test.eq((calls[2] :: any).target, "ns:second")
                test.eq((calls[3] :: any).target, "ns:first")
            end)

            test.it("replay with empty chain returns 0", function()
                local runner, calls = make_recorder()
                local count, failed = automations_lib.replay({}, { runner = runner })
                test.eq(count, 0)
                test.eq(failed, 0)
                test.eq(#calls, 0)
            end)

            test.it("replay with nil chain returns 0 without error", function()
                local count, failed = automations_lib.replay(nil)
                test.eq(count, 0)
                test.eq(failed, 0)
            end)

            test.it("replay with non-table chain returns 0", function()
                local c1, f1 = automations_lib.replay("not a chain")
                test.eq(c1, 0); test.eq(f1, 0)
                local c2, f2 = automations_lib.replay(42)
                test.eq(c2, 0); test.eq(f2, 0)
            end)

            test.it("replay counts runner failures", function()
                local runner = function(target, args)
                    if target == "ns:b" then return "runner failed" end
                    return nil
                end
                local count, failed = automations_lib.replay({
                    { target = "ns:a", args = {} },
                    { target = "ns:b", args = {} },
                    { target = "ns:c", args = {} },
                }, { runner = runner })
                test.eq(count, 3, "all 3 attempted")
                test.eq(failed, 1, "ns:b returned an error so 1 failure recorded")
            end)

            test.it("replay skips entries with non-string target", function()
                local runner, calls = make_recorder()
                automations_lib.replay({
                    { target = "ns:valid", args = {} },
                    { target = nil, args = {} },
                    { target = 42, args = {} },
                    { target = "ns:another", args = {} },
                }, { runner = runner })
                test.eq(#calls, 2)
            end)

            test.it("replay defaults args to empty table when missing", function()
                local runner, calls = make_recorder()
                automations_lib.replay({
                    { target = "ns:a" },
                }, { runner = runner })
                test.eq(#calls, 1)
                test.eq(type((calls[1] :: any).args), "table")
            end)

            -- Regression: cleanup contracts signal failure by returning
            -- (nil, err), not by raising. A step whose runner returns a
            -- non-nil error must count as failed so M.uninstall's
            -- retain-for-retry guard (replay_failed > 0) stays live and the
            -- umbrella component is not deleted while child resources persist.
            test.it("replay counts a runner that RETURNS an error as failed", function()
                local runner = function(target, args)
                    if target == "ns:teardown_fails" then return "delete failed" end
                    return nil
                end
                local count, failed = automations_lib.replay({
                    { target = "ns:teardown_ok", args = {} },
                    { target = "ns:teardown_fails", args = {} },
                }, { runner = runner })
                test.eq(count, 2, "both steps attempted")
                test.eq(failed, 1, "the step that returned an error is counted failed")
            end)

            test.it("replay counts every step returning an error", function()
                local runner = function(target, args) return "boom" end
                local _, failed = automations_lib.replay({
                    { target = "ns:a", args = {} },
                    { target = "ns:b", args = {} },
                    { target = "ns:c", args = {} },
                }, { runner = runner })
                test.eq(failed, 3, "all three returned errors")
            end)

            test.it("replay does not count a runner returning nil as failed", function()
                local runner = function(target, args) return nil end
                local _, failed = automations_lib.replay({
                    { target = "ns:a", args = {} },
                    { target = "ns:b", args = {} },
                }, { runner = runner })
                test.eq(failed, 0, "clean teardown returns nil and counts as success")
            end)

            -- The retain-for-retry decision in M.uninstall is gated on
            -- replay_failed > 0; this proves replay reports a positive count
            -- when a teardown step fails, making that guard reachable.
            test.it("a failed teardown step yields replay_failed > 0 (retain guard reachable)", function()
                local runner = function(target, args)
                    if target == "ns:kb_delete" then return "kb still has children" end
                    return nil
                end
                local _, failed = automations_lib.replay({
                    { target = "ns:thread_delete", args = {} },
                    { target = "ns:kb_delete", args = {} },
                }, { runner = runner })
                test.ok(failed > 0, "uninstall would retain the component for retry")
            end)
        end)

        -- ─── list projection ────────────────────────────────────────

    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
