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
        test.describe("state helpers", function()
            test.it("returns a typed invalid request for config on a non-reconfigurable type", function()
                with_loaded_modules({
                    registry = { get = function()
                        return { kind = "contract.binding", meta = { type = "kickside.automation" } }, nil
                    end },
                    component = { ACCESS = { READ = 1 }, query = function(args)
                        test.eq(args.access_mask, 1)
                        return { { component_id = "auto-1", impl_id = "ns:read-only-type" } }, nil
                    end, get_context = function() error("unsupported config must not expose private state") end },
                }, function()
                    local config, err = automations_lib.read_config("auto-1")
                    test.is_nil(config)
                    test.is_true(errors.is(err, errors.INVALID))
                end)
            end)

            test.it("read_public_state exposes only the public projection", function()
                local seen_access = nil
                with_loaded_modules({
                    registry = {
                        get = function(id)
                            test.eq(id, "ns:automation")
                            return {
                                id = id,
                                kind = "contract.binding",
                                meta = {
                                    type = "kickside.automation",
                                    public_state_schema = {
                                        fields = {
                                            { key = "enabled", type = "checkbox" },
                                            { key = "last_status", type = "text" },
                                        },
                                    },
                                },
                            }, nil
                        end,
                    },
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        query = function(args)
                            test.eq(args.component_ids[1], "auto-1")
                            test.eq(args.access_mask, 1)
                            return {
                                {
                                    component_id = "auto-1",
                                    impl_id = "ns:automation",
                                    meta = {
                                        source_id = "source-1",
                                        token = "secret",
                                        schedule_ids = { "sched-1" },
                                        component_id = "meta-auto-1",
                                        _rollback = { { target = "undo" } },
                                        leaked = "nope",
                                        enabled = true,
                                        last_status = "idle",
                                    },
                                },
                            }, nil
                        end,
                        get_context = function(_component_id, access)
                            seen_access = access
                            return {
                                public_state = {
                                    enabled = true,
                                    last_status = "idle",
                                },
                            }, nil
                        end,
                    },
                }, function()
                    local state, err = automations_lib.read_public_state("auto-1")
                    test.is_nil(err)
                    test.eq(seen_access, nil)
                    test.eq(state.enabled, true)
                    test.eq(state.last_status, "idle")
                    test.eq(state.source_id, nil)
                    test.eq(state.token, nil)
                    test.eq(state.schedule_ids, nil)
                    test.eq(state.component_id, nil)
                    test.eq(state._rollback, nil)
                    test.eq(state.leaked, nil)
                end)
            end)

            test.it("read_public_state coerces typed component meta from storage strings", function()
                with_loaded_modules({
                    registry = {
                        get = function(id)
                            test.eq(id, "ns:automation")
                            return {
                                id = id,
                                kind = "contract.binding",
                                meta = {
                                    type = "kickside.automation",
                                    public_state_schema = {
                                        fields = {
                                            { key = "enabled", type = "boolean" },
                                            { key = "accepted_count", type = "integer" },
                                            { key = "ratio", type = "number" },
                                            { key = "details", type = "object" },
                                            { key = "tags", type = "array" },
                                        },
                                    },
                                },
                            }, nil
                        end,
                    },
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        query = function(args)
                            test.eq(args.component_ids[1], "auto-1")
                            test.eq(args.access_mask, 1)
                            return {
                                {
                                    component_id = "auto-1",
                                    impl_id = "ns:automation",
                                    meta = {
                                        enabled = "true",
                                        accepted_count = "9",
                                        ratio = "3.5",
                                        details = '{"page":2}',
                                        tags = '["a","b"]',
                                    },
                                },
                            }, nil
                        end,
                    },
                }, function()
                    local state, err = automations_lib.read_public_state("auto-1")
                    test.is_nil(err)
                    test.eq(state.enabled, true)
                    test.eq(state.accepted_count, 9)
                    test.eq(state.ratio, 3.5)
                    test.eq(state.details.page, 2)
                    test.eq(state.tags[1], "a")
                    test.eq(state.tags[2], "b")
                end)
            end)

            test.it("read_public_state returns an empty projection when no schema is declared", function()
                with_loaded_modules({
                    registry = {
                        get = function(id)
                            return {
                                id = id,
                                kind = "contract.binding",
                                meta = { type = "kickside.automation" },
                            }, nil
                        end,
                    },
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        query = function(args)
                            return {
                                {
                                    component_id = args.component_ids[1],
                                    impl_id = "ns:automation",
                                    meta = { unsafe = "ignored" },
                                },
                            }, nil
                        end,
                    },
                }, function()
                    local state, err = automations_lib.read_public_state("auto-1")
                    test.is_nil(err)
                    test.eq(next(state), nil)
                end)
            end)

            test.it("read_state reads component context with READ access and strips runtime fields", function()
                local seen_access = nil
                with_loaded_modules({
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        get_context = function(component_id, access)
                            seen_access = access
                            return {
                                component_id = component_id,
                                source_id = "source-1",
                                _rollback = { { target = "undo" } },
                                _execution_identity = { actor_id = "owner-1", actor_context = "{}" },
                            }, nil
                        end,
                    },
                }, function()
                    local state, err = automations_lib.read_state("auto-1")
                    test.is_nil(err)
                    test.eq(seen_access, 1)
                    test.eq(state.component_id, nil)
                    test.eq(state.source_id, "source-1")
                    test.eq(state._rollback, nil)
                    test.eq(state._execution_identity, nil)
                end)
            end)

            test.it("patch_state merges the product patch through PATCH_CONTEXT and returns the state without engine-owned keys", function()
                local update_request: any = nil
                with_loaded_modules({
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        get_context = function(component_id, access)
                            test.eq(component_id, "auto-1")
                            test.eq(access, 2)
                            return {
                                component_id = component_id,
                                enabled = true,
                                kept = "stored",
                                _rollback = { { target = "undo", args = { id = "child" } } },
                                _execution_identity = { actor_id = "owner-1", actor_context = "{}" },
                                _portable_input = { title = "Declared" },
                            }, nil
                        end,
                        get_service = function()
                            return {
                                update = function(_self, req)
                                    update_request = req
                                    return { success = true }, nil
                                end,
                            }, nil
                        end,
                    },
                }, function()
                    local result, err = automations_lib.patch_state("auto-1", { enabled = false, schedule_id = "sched-1" })
                    test.is_nil(err)
                    test.is_true(result.success)
                    test.eq(update_request.component_id, "auto-1")
                    test.eq(#update_request.commands, 1)
                    test.eq(update_request.commands[1].type, "PATCH_CONTEXT")
                    local payload = update_request.commands[1].payload
                    test.eq(payload.patch.enabled, false)
                    test.eq(payload.patch.schedule_id, "sched-1")
                    test.is_nil(payload.delete_keys)
                    test.eq(result.state.enabled, false)
                    test.eq(result.state.kept, "stored")
                    test.is_nil(result.state.component_id)
                    test.is_nil(result.state._rollback)
                    test.is_nil(result.state._execution_identity)
                    test.is_nil(result.state._portable_input)
                end)
            end)

            -- The component service classifies a storage failure as INTERNAL;
            -- patch_state hands that kind to its caller unchanged.
            test.it("patch_state surfaces a component storage failure as INTERNAL", function()
                with_loaded_modules({
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        get_context = function() return { enabled = true }, nil end,
                        get_service = function()
                            return {
                                update = function(_self, _req)
                                    return { success = false, error = "Failed to commit transaction: disk I/O error", kind = errors.INTERNAL }, nil
                                end,
                            }, nil
                        end,
                    },
                }, function()
                    local result, err = automations_lib.patch_state("auto-1", { enabled = false })
                    test.is_nil(result)
                    test.contains(tostring(err), "Failed to commit transaction")
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.is_false(errors.is(err, errors.PERMISSION_DENIED))
                end)
            end)

            test.it("patch_state batches public metadata with a transactional private patch", function()
                local update_request: any = nil
                with_loaded_modules({
                    component = {
                        ACCESS = { READ = 1, WRITE = 2 },
                        get_context = function() return { enabled = true }, nil end,
                        get_service = function()
                            return {
                                update = function(_self, req)
                                    update_request = req
                                    return { success = true }, nil
                                end,
                            }, nil
                        end,
                    },
                }, function()
                    local result, err = automations_lib.patch_state("auto-1", { enabled = false }, {
                        public_meta = { title = "Renamed", status = "active" },
                    })
                    test.is_nil(err)
                    test.is_true(result.success)
                    test.eq(#update_request.commands, 2)
                    test.eq(update_request.commands[1].type, "PATCH_CONTEXT")
                    test.eq(update_request.commands[1].payload.patch.enabled, false)
                    test.eq(update_request.commands[2].type, "SET_META")
                    test.eq(update_request.commands[2].payload.fields.title, "Renamed")
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
