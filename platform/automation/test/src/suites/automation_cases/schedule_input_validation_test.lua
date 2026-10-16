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
        test.describe("install_type declaration validation", function()
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

            test.it("rejects undeclared install input fields unless explicitly allowed", function()
                local called = false
                with_loaded_modules({
                    registry = {
                        get = function(id)
                            return {
                                id = id,
                                kind = "contract.binding",
                                meta = {
                                    type = "kickside.automation",
                                    inputs = {
                                        properties = {
                                            url = { type = "string" },
                                        },
                                        required = { "url" },
                                    },
                                },
                                data = {
                                    contracts = {
                                        {
                                            contract = "kickside.contract:installable",
                                            methods = { install = "ns:install" },
                                        },
                                    },
                                },
                            }, nil
                        end,
                    },
                    funcs = {
                        new = function()
                            return {
                                with_context = function(self) return self end,
                                call = function()
                                    called = true
                                    return { source = { source_kind = "none" }, state = {}, rollback = {} }, nil
                                end,
                            }, nil
                        end,
                    },
                    component = {
                        get_service = function()
                            error("component should not be registered when input has undeclared fields")
                        end,
                    },
                }, function()
                    local result, err = automations_lib.install_type("ns:automation", {
                        url = "https://example.test",
                        unexpected = "x",
                    })
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INVALID))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "automation_input_invalid")
                    test.eq(err:details().field, "unexpected")
                    test.eq(called, false)
                end)
            end)

            -- Declared input schemas bind recursively: a nested object's
            -- required/enum/additionalProperties constraints reject an install
            -- exactly like top-level ones. The fixture kind mirrors the trigger
            -- spec shape: a nested object with an enum-constrained field,
            -- nested required keys, a strict property set, an untyped
            -- composite (oneOf), and a free-form object.
            local function nested_entry(id: string): any
                return {
                    id = id,
                    kind = "contract.binding",
                    meta = {
                        type = "kickside.automation",
                        inputs = {
                            type = "object",
                            additionalProperties = false,
                            required = { "trigger" },
                            properties = {
                                title = { type = "string" },
                                trigger = {
                                    type = "object",
                                    additionalProperties = false,
                                    required = { "v" },
                                    properties = {
                                        v = { const = 1 },
                                        config = { type = "object" },
                                        backfill = {
                                            oneOf = {
                                                { enum = { "all", "none" } },
                                                { type = "object" },
                                            },
                                        },
                                        schedule = {
                                            type = "object",
                                            additionalProperties = false,
                                            required = { "type", "expression" },
                                            properties = {
                                                type = { enum = { "interval", "ticker", "cron" } },
                                                expression = { type = "string" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    data = {
                        contracts = {
                            {
                                contract = "kickside.contract:installable",
                                methods = { install = "ns:install" },
                            },
                        },
                    },
                }
            end

            local function install_nested(input: any): (any, any, boolean)
                local called = false
                local result: any = nil
                local err: any = nil
                with_loaded_modules({
                    registry = {
                        get = function(id) return nested_entry(id), nil end,
                    },
                    funcs = {
                        new = function()
                            return {
                                with_context = function(self) return self end,
                                call = function()
                                    called = true
                                    return { source = { source_kind = "none" }, state = {}, rollback = {} }, nil
                                end,
                            }, nil
                        end,
                    },
                    component = {
                        get_service = function()
                            return {
                                register = function(_self, _req)
                                    return { component_id = "auto-nested" }, nil
                                end,
                            }, nil
                        end,
                    },
                }, function()
                    result, err = automations_lib.install_type("ns:automation", input)
                end)
                return result, err, called
            end

            test.it("rejects a nested enum value outside the declared options", function()
                local result, err, called = install_nested({
                    title = "Once",
                    trigger = { v = 1, schedule = { type = "once", expression = "2026-01-01T00:00:00Z" } },
                })
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "automation_input_invalid")
                test.eq(err:details().field, "trigger.schedule.type")
                test.eq(called, false)
            end)

            test.it("rejects a missing nested required field", function()
                local result, err, called = install_nested({
                    trigger = { v = 1, schedule = { type = "interval" } },
                })
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "automation_input_invalid")
                test.eq(err:details().field, "trigger.schedule.expression")
                test.eq(called, false)
            end)

            test.it("rejects an undeclared nested field", function()
                local result, err, called = install_nested({
                    trigger = { v = 1, mode = "poll" },
                })
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "automation_input_invalid")
                test.eq(err:details().field, "trigger.mode")
                test.eq(called, false)
            end)

            test.it("accepts a conforming nested input", function()
                local result, err, called = install_nested({
                    title = "Every hour",
                    trigger = {
                        v = 1,
                        backfill = "all",
                        schedule = { type = "interval", expression = "1h" },
                    },
                })
                test.is_nil(err)
                test.not_nil(result)
                test.eq(called, true)
            end)

            test.it("leaves untyped composites and free-form objects unconstrained", function()
                -- backfill declares no type (oneOf composite) so an object
                -- value passes; trigger.config declares no properties so
                -- arbitrary keys pass.
                local result, err, called = install_nested({
                    trigger = {
                        v = 1,
                        backfill = { last_days = 7 },
                        config = { anything = { nested = true } },
                        schedule = { type = "cron", expression = "0 * * * *" },
                    },
                })
                test.is_nil(err)
                test.not_nil(result)
                test.eq(called, true)
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
