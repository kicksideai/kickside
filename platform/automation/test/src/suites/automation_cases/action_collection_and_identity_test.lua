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
        test.describe("collect_actions", function()
            local entry: any = {
                meta = {
                    actions = {
                        "pause",
                        { name = "resume" },
                        "trigger",
                        "install",
                        "missing",
                    },
                },
                data = {
                    contracts = {
                        {
                            contract = "kickside.contract:installable",
                            methods = { install = "ns:install_fn", delete = "ns:delete_fn" },
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

            test.it("excludes lifecycle methods (install, delete)", function()
                local actions = automations_lib.collect_actions(entry)
                for _, a in ipairs(actions) do
                    test.eq(a.name == "install" or a.name == "delete", false,
                        "lifecycle method must not appear: " .. tostring(a.name))
                end
            end)

            test.it("keeps generic pause and resume out of kind actions", function()
                local actions = automations_lib.collect_actions(entry)
                local seen: any = {}
                for _, a in ipairs(actions) do seen[a.name] = a end
                test.is_nil(seen.pause)
                test.is_nil(seen.resume)
                test.not_nil(seen.trigger)
            end)

            test.it("does not expose contract methods missing from meta.actions", function()
                local reflected_only: any = {
                    meta = { actions = { "configure" } },
                    data = {
                        contracts = {
                            {
                                contract = "ns:controls",
                                methods = { configure = "ns:configure", internal = "ns:internal" },
                            },
                        },
                    },
                }
                local actions = automations_lib.collect_actions(reflected_only)
                test.eq(#actions, 1)
                test.eq(actions[1].name, "configure")
            end)

            test.it("returns sorted by method name", function()
                local actions = automations_lib.collect_actions(entry)
                for i = 2, #actions do
                    test.eq(actions[i - 1].name <= actions[i].name, true,
                        "actions[" .. (i - 1) .. "] name must be <= actions[" .. i .. "]")
                end
            end)

            test.it("returns empty array on entry with no contracts", function()
                test.eq(#automations_lib.collect_actions({ data = {} }), 0)
            end)

            test.it("returns empty array on nil-shape entry", function()
                test.eq(#automations_lib.collect_actions(nil), 0)
            end)
        end)

        -- ─── engine-owned execution identity + runtime reader ──────────
        test.describe("execution identity", function()
            local function installable_entry(id)
                return {
                    id = id,
                    kind = "contract.binding",
                    meta = { type = "kickside.automation" },
                    data = { contracts = { { contract = "kickside.contract:installable", methods = { install = "ns:install" } } } },
                }
            end

            test.it("denies an unowned annotated reference before the install body runs", function()
                local body_calls = 0
                local type_entry = installable_entry("ns:automation")
                type_entry.meta.inputs = { type = "object", properties = {
                    target_id = { type = "string", ["x-reference"] = { kind = "component", access = "READ" } },
                } }
                with_loaded_modules({
                    registry = { get = function(): (any, any) return type_entry, nil end },
                    funcs = install_funcs(function(): (any?, any)
                        body_calls = body_calls + 1
                        return { state = {} }, nil
                    end, declared_writer({})),
                }, function()
                    local result, err = automations_lib.install_type("ns:automation", { target_id = tostring(uuid.v7()) })
                    test.is_nil(result)
                    test.not_nil(err)
                    test.eq(body_calls, 0)
                end)
            end)

            test.it("install_type names the installer as the install command's operator and subject", function()
                local writes: { any } = {}
                with_loaded_modules({
                    security = {
                        actor = function(): any
                            return { id = function(): any return "user-7" end, meta = function(): any return { security_groups = { "team" } } end }
                        end,
                        scope = function(): any return {} end,
                    },
                    scope_name = "app:member",
                    registry = { get = function(id): any return installable_entry(id), nil end },
                    funcs = install_funcs(function(): (any?, any)
                        return { source = { source_kind = "none" }, state = { source_id = "src-1" }, metadata = { title = "X" } }, nil
                    end, declared_writer(writes)),
                }, function()
                    local result, err = automations_lib.install_type("ns:automation", { source_id = "src-1" })
                    test.is_nil(err, tostring(err))
                    test.eq(#writes, 1)
                    local write = writes[1]
                    test.eq(result.id, write.args.component_id)
                    test.eq(write.pending.kind, "install")
                    test.eq(write.pending.input.operator_id, "user-7")
                    test.eq(write.pending.input.subject_id, "user-7")
                    test.eq(write.pending.input.declaration.source_id, "src-1")
                    test.is_nil(write.context._execution_identity)
                end)
            end)

            test.it("install_type rejects an anonymous (actor-less) install", function()
                with_loaded_modules({
                    security = { actor = function(): any return nil end, scope = function(): any return {} end },
                    registry = { get = function(id): any return installable_entry(id), nil end },
                }, function()
                    local _, err = automations_lib.install_type("ns:automation", {})
                    test.not_nil(err)
                    test.is_true(tostring(err):find("authenticated actor", 1, true) ~= nil, tostring(err))
                end)
            end)

            test.it("list_runtime returns automations with identity and state, reserved keys stripped", function()
                with_loaded_modules({
                    registry = {
                        find = function(query): any
                            -- binding_ids_by_meta resolves the discord responder type
                            test.eq(query["meta.provider"], "discord")
                            return { { id = "kickside.discord.responder:discord_responder" } }, nil
                        end,
                    },
                    component = {
                        list_system = function(req): any
                            test.eq(req.impl_ids[1], "kickside.discord.responder:discord_responder")
                            return { { component_id = "auto-1", impl_id = "kickside.discord.responder:discord_responder", meta = { class = "automation" } } }
                        end,
                        get_private_context = function(id): any
                            test.eq(id, "auto-1")
                            return {
                                connection_id = "conn-1", agent_id = "agent.support",
                                public_state = { status = "active" },
                                _rollback = { { target = "x" } },
                                _execution_identity = { actor_id = "user-7", actor_context = { version = 1, scope_id = "app:member", claims = {} } },
                            }
                        end,
                    },
                }, function()
                    local list, err = automations_lib.list_runtime({ type_meta = { provider = "discord" }, include_state = true })
                    test.is_nil(err)
                    test.eq(#list, 1)
                    test.eq(list[1].id, "auto-1")
                    test.eq(list[1].execution_identity.actor_id, "user-7")
                    test.eq(list[1].state.connection_id, "conn-1")
                    test.eq(list[1].state.agent_id, "agent.support")
                    test.is_nil(list[1].state._execution_identity)
                    test.is_nil(list[1].state._rollback)
                    test.is_nil(list[1].state.public_state)
                end)
            end)

            test.it("get_runtime returns one automation's identity by id", function()
                with_loaded_modules({
                    component = {
                        list_system = function(req): any
                            test.eq(req.component_ids[1], "auto-9")
                            return { { component_id = "auto-9", impl_id = "ns:automation", meta = { title = "Runtime" } } }
                        end,
                        get_private_context = function(id): any
                            test.eq(id, "auto-9")
                            return { agent_id = "a", _execution_identity = { actor_id = "u9", actor_context = { version = 1, scope_id = "app:member", claims = {} } } }
                        end,
                    },
                }, function()
                    local item, err = automations_lib.get_runtime({ id = "auto-9", include_state = true })
                    test.is_nil(err)
                    test.eq(item.type, "ns:automation")
                    test.eq(item.metadata.title, "Runtime")
                    test.eq(item.execution_identity.actor_id, "u9")
                    test.eq(item.state.agent_id, "a")
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
