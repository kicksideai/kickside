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
        test.describe("find_owner_by_resource", function()
            test.it("resolves owners through declared owned_resources metadata", function()
                with_loaded_modules({
                    registry = {
                        find = function(query)
                            test.eq(query["meta.type"], "kickside.automation")
                            return {
                                {
                                    id = "ns:kb_automation",
                                    kind = "contract.binding",
                                    meta = {
                                        type = "kickside.automation",
                                        owned_resources = {
                                            { kind = "knowledge", state_key = "kb_id" },
                                        },
                                    },
                                    data = { contracts = {} },
                                },
                                {
                                    id = "ns:other_automation",
                                    kind = "contract.binding",
                                    meta = {
                                        type = "kickside.automation",
                                        owned_resources = {
                                            { kind = "connection", state_key = "connection_id" },
                                        },
                                    },
                                    data = { contracts = {} },
                                },
                            }, nil
                        end,
                    },
                    component = {
                        list_system = function(filter)
                            test.eq(filter.impl_ids[1], "ns:kb_automation")
                            test.eq(#filter.impl_ids, 1)
                            test.eq(filter.include.private_context, true)
                            return {
                                {
                                    component_id = "auto-1",
                                    impl_id = "ns:kb_automation",
                                    private_context = { kb_id = "kb-1", token = "secret" },
                                },
                            }
                        end,
                    },
                }, function()
                    local owner_id, err = automations_lib.find_owner_by_resource("knowledge", "kb-1")
                    test.is_nil(err)
                    test.eq(owner_id, "auto-1")
                end)
            end)

            test.it("does not let callers choose arbitrary private state keys", function()
                with_loaded_modules({
                    registry = {
                        find = function()
                            return {
                                {
                                    id = "ns:kb_automation",
                                    kind = "contract.binding",
                                    meta = {
                                        type = "kickside.automation",
                                        owned_resources = {
                                            { kind = "knowledge", state_key = "kb_id" },
                                        },
                                    },
                                    data = { contracts = {} },
                                },
                            }, nil
                        end,
                    },
                    component = {
                        list_system = function()
                            return {
                                {
                                    component_id = "auto-1",
                                    impl_id = "ns:kb_automation",
                                    private_context = { hidden_child_id = "kb-1" },
                                },
                            }
                        end,
                    },
                }, function()
                    local owner_id, err = automations_lib.find_owner_by_resource("knowledge", "kb-1")
                    test.is_nil(err)
                    test.is_nil(owner_id)
                end)
            end)

        end)

        -- ─── contract metadata helpers ─────────────────────────────

        test.describe("class_matches", function()
            test.it("matches when class is a string equal to wanted", function()
                test.eq(automations_lib.class_matches("automation", "automation"), true)
            end)

            test.it("rejects when class is a string not equal to wanted", function()
                test.eq(automations_lib.class_matches("automation", "knowledge"), false)
            end)

            test.it("matches when class array contains wanted", function()
                test.eq(automations_lib.class_matches({ "automation", "knowledge" }, "knowledge"), true)
            end)

            test.it("rejects when class array does not contain wanted", function()
                test.eq(automations_lib.class_matches({ "automation" }, "knowledge"), false)
            end)

            test.it("returns true on empty filter (nil)", function()
                test.eq(automations_lib.class_matches({ "automation" }, nil), true)
            end)

            test.it("returns true on empty filter (empty string)", function()
                test.eq(automations_lib.class_matches({ "automation" }, ""), true)
            end)

            test.it("returns false when meta_class is nil and a filter is set", function()
                test.eq(automations_lib.class_matches(nil, "automation"), false)
            end)
        end)

        test.describe("is_lifecycle", function()
            test.it("install is lifecycle", function()
                test.eq(automations_lib.is_lifecycle("install"), true)
            end)

            test.it("delete is lifecycle", function()
                test.eq(automations_lib.is_lifecycle("delete"), true)
            end)

            test.it("pause is not lifecycle", function()
                test.eq(automations_lib.is_lifecycle("pause"), false)
            end)

            test.it("trigger is not lifecycle", function()
                test.eq(automations_lib.is_lifecycle("trigger"), false)
            end)
        end)

        test.describe("find_method / contract_for_method", function()
            local entry: any = {
                id = "ns:binding",
                kind = "contract.binding",
                meta = {},
                data = {
                    contracts = {
                        {
                            contract = "kickside.contract:installable",
                            methods = { install = "ns:install_fn" },
                        },
                        {
                            contract = "kickside.automation:pausable",
                            methods = { pause = "ns:pause_fn", resume = "ns:resume_fn" },
                        },
                        {
                            contract = "kickside.automation:triggerable",
                            methods = { trigger = "ns:trigger_fn" },
                        },
                    },
                },
            }

            test.it("returns target id and contract for declared method", function()
                local target, contract_id = automations_lib.find_method(entry, "pause")
                test.eq(target, "ns:pause_fn")
                test.eq(contract_id, "kickside.automation:pausable")
            end)

            test.it("returns nil for undeclared method", function()
                local target, contract_id = automations_lib.find_method(entry, "explode")
                test.is_nil(target)
                test.is_nil(contract_id)
            end)

            test.it("contract_for_method returns just the contract id", function()
                test.eq(
                    automations_lib.contract_for_method(entry, "trigger"),
                    "kickside.automation:triggerable"
                )
            end)

            test.it("returns nil on entry with no data", function()
                test.is_nil(automations_lib.find_method({ id = "x", kind = "contract.binding" }, "install"))
            end)

            test.it("returns nil on entry with no contracts list", function()
                test.is_nil(automations_lib.find_method({ data = {} }, "install"))
            end)

            test.it("returns nil when contracts is not a table", function()
                test.is_nil(automations_lib.find_method({ data = { contracts = "bogus" } }, "install"))
            end)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
