-- Tests for kickside.agents:agents binding.
--
-- Binding methods called via the contract's :open():method() dispatcher run
-- inside a funcs runtime that requires an actor in scope. The test harness
-- itself is not invoked through funcs, so we drive the binding by calling
-- registered functions directly with funcs.new():with_actor():with_scope().

local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid_v4 = require("uuid").v4
local funcs = require("funcs")
local security = require("security")

local NS = "kickside.agents.registry"

local function new_executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope("wippy.security:process")
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function scoped_executor(user_id: string, scope_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope(scope_id)
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function call(exec: any, fn: string, args: any): (any, any)
    return exec:call(NS .. ":" .. fn, args)
end

local function cleanup(db: any, prefix: string): ()
    db:execute(
        [[DELETE FROM kickside_components WHERE component_id IN (
            SELECT cm.component_id FROM kickside_component_meta cm
            WHERE cm.key = 'title' AND cm.value LIKE ?
          )]],
        { prefix .. "%" }
    )
end

local function define_tests()
    test.describe("kickside.agents:agents binding", function()
        local db: any
        local exec: any
        local prefix = "agtest_" .. uuid_v4():sub(1, 8) .. "_"
        local component_id: string?

        test.before_all(function()
            exec = new_executor("agents_test_user")
            db = sql.get("app:db")
            test.not_nil(db)
            cleanup(db, prefix)
        end)

        test.after_all(function()
            cleanup(db, prefix)
            if db then db:release() end
        end)



        test.describe("create + find + update + delete cycle", function()
            local agent_name = prefix .. "alice"

            test.it("creates an agent", function()
                local result, err = call(exec, "a_create", {
                    name = agent_name,
                    prompt = "You are alice.",
                    model = "class:fast",
                })
                test.is_nil(err, "create: " .. tostring(err))
                test.not_nil(result)
                test.not_nil(result.component_id)
                component_id = result.component_id
            end)

            test.it("finds by name", function()
                local found, err = call(exec, "a_find", { name = agent_name })
                test.is_nil(err)
                test.not_nil(found)
                test.eq(found.component_id, component_id)
                test.eq(((found :: any).meta or {}).public, "false")
            end)

            test.it("requires an explicit boolean to make an agent public", function()
                local _, malformed_err = call(exec, "a_update", {
                    component_id = component_id,
                    public = "true",
                })
                test.is_nil(malformed_err)
                local still_private, private_err = call(exec, "a_find", { component_id = component_id })
                test.is_nil(private_err)
                test.eq(((still_private :: any).meta or {}).public, "false")

                local _, public_err = call(exec, "a_update", {
                    component_id = component_id,
                    public = true,
                })
                test.is_nil(public_err)
                local now_public, find_err = call(exec, "a_find", { component_id = component_id })
                test.is_nil(find_err)
                test.eq(((now_public :: any).meta or {}).public, "true")
            end)

            test.it("upsert is idempotent", function()
                local result, err = call(exec, "a_upsert", { name = agent_name })
                test.is_nil(err)
                test.eq(result.created, false)
            end)

            -- model is a required field of the persisted AgentConfig, so a create
            -- that omits it fills the field with the canonical create-time default
            -- (agent_types.DEFAULT_MODEL = class:fast). This guarantees a stored agent
            -- always carries a model, so the read sites never need to substitute one.
            test.it("defaults missing model to class:fast (create-time default)", function()
                local nomodel_name = prefix .. "nomodel"
                local result, err = call(exec, "a_create", {
                    name = nomodel_name,
                    prompt = "You have no explicit model.",
                })
                test.is_nil(err, "create: " .. tostring(err))
                test.not_nil(result)

                local found, ferr = call(exec, "a_find", { name = nomodel_name })
                test.is_nil(ferr)
                test.not_nil(found)
                local meta: any = (found :: any).meta or {}
                test.eq(meta.model, "class:fast")

                call(exec, "a_delete", { component_id = (found :: any).component_id })
            end)

            test.it("defaults new agents to artifacts and files while preserving explicit opt-out", function()
                local defaulted, default_err = call(exec, "a_create", {
                    name = prefix .. "artifact_default",
                    model = "class:fast",
                })
                test.is_nil(default_err, tostring(default_err))
                test.not_nil(defaulted)

                local opted_out, opt_out_err = call(exec, "a_create", {
                    name = prefix .. "artifact_opt_out",
                    model = "class:fast",
                    traits = {},
                })
                test.is_nil(opt_out_err, tostring(opt_out_err))
                test.not_nil(opted_out)

                local rows = db:query(
                    "SELECT component_id, private_context FROM kickside_components WHERE component_id IN ($1, $2)",
                    { defaulted.component_id, opted_out.component_id }
                )
                test.eq(#rows, 2)
                local contexts = {}
                for _, row in ipairs(rows) do
                    contexts[row.component_id] = json.decode(tostring(row.private_context))
                end
                test.eq(contexts[defaulted.component_id].traits[1], "kickside.agents.traits:artifacts")
                test.eq(contexts[defaulted.component_id].traits[2], "kickside.uploads.traits:file_manager")
                test.eq(#contexts[opted_out.component_id].traits, 0)

                call(exec, "a_delete", { component_id = defaulted.component_id })
                call(exec, "a_delete", { component_id = opted_out.component_id })
            end)

            test.it("update changes prompt", function()
                local result, err = call(exec, "a_update", {
                    component_id = component_id,
                    prompt = "You are alice v2.",
                })
                test.is_nil(err, "update: " .. tostring(err))
                test.not_nil(result)
            end)

            test.it("update rejects invalid trait context", function()
                local bad_name = prefix .. "bad_update_should_not_write"
                local _, err = call(exec, "a_update", {
                    component_id = component_id,
                    name = bad_name,
                    traits = { "kickside.agents.traits:agent_roster" },
                    trait_contexts = {
                        ["kickside.agents.traits:agent_roster"] = { namespaces = "not-a-list" },
                    },
                })
                test.not_nil(err)
                test.ok((tostring(err):find("capability context invalid", 1, true)))
                test.ok((tostring(err):find("agent_roster.namespaces expected array", 1, true)))
                local found, find_err = call(exec, "a_find", { name = bad_name })
                test.is_nil(find_err)
                test.is_nil(found)
            end)

            test.it("update rejects an explicit internal tool without changing metadata", function()
                local bad_name = prefix .. "internal_tool_update_should_not_write"
                local _, err = call(exec, "a_update", {
                    component_id = component_id,
                    name = bad_name,
                    tools = { "keeper.hub.tools:dependencies" },
                })
                test.not_nil(err)
                test.ok(tostring(err):find("not found", 1, true), tostring(err))
                local found, find_err = call(exec, "a_find", { name = bad_name })
                test.is_nil(find_err)
                test.is_nil(found)
            end)

            test.it("attach_kb sets memory_target_id", function()
                local result, err = call(exec, "a_attach_kb", {
                    component_id = component_id,
                    kb_id = "kb_test",
                })
                test.is_nil(err, "attach_kb: " .. tostring(err))
                test.not_nil(result)
                test.eq(result.attached, true)
            end)

            test.it("detach_kb unbinds only the agent's named memory KB", function()
                local _, attach_err = call(exec, "a_attach_kb", { component_id = component_id, kb_id = "kb_memory" })
                test.is_nil(attach_err)
                local function context(): any
                    local rows, query_err = db:query("SELECT private_context FROM kickside_components WHERE component_id = $1", { component_id })
                    test.is_nil(query_err)
                    test.eq(#rows, 1)
                    local value, decode_err = json.decode(tostring(rows[1].private_context))
                    test.is_nil(decode_err)
                    return value
                end
                local before = context()
                for _, args in ipairs({
                    { component_id = component_id },
                    { component_id = component_id, kb_id = "kb_other" },
                }) do
                    local _, detach_err = call(exec, "a_detach_kb", args)
                    test.not_nil(detach_err)
                    test.eq(context().memory_target_id, "kb_memory")
                    test.eq(context().model, before.model)
                end
                local detached, detach_err = call(exec, "a_detach_kb", { component_id = component_id, kb_id = "kb_memory" })
                test.is_nil(detach_err, "detach_kb: " .. tostring(detach_err))
                test.eq(detached.detached, true)
                test.eq(context().memory_target_id, "")
                test.eq(context().model, before.model)
            end)

            test.it("attach_tool appends tool", function()
                local result, err = call(exec, "a_attach_tool", {
                    component_id = component_id,
                    tool_id = "app:public_tool_probe",
                })
                test.is_nil(err, "attach_tool: " .. tostring(err))
                test.not_nil(result)
                test.eq(result.attached, true)
            end)

            test.it("detach_tool removes tool", function()
                local result, err = call(exec, "a_detach_tool", {
                    component_id = component_id,
                    tool_id = "app:public_tool_probe",
                })
                test.is_nil(err)
                test.eq(result.detached, true)
            end)

            test.it("attach_tool rejects an internal Keeper tool", function()
                local _, err = call(exec, "a_attach_tool", {
                    component_id = component_id,
                    tool_id = "keeper.hub.tools:dependencies",
                })
                test.not_nil(err)
                test.ok(tostring(err):find("not found", 1, true), tostring(err))
            end)

            test.it("delete removes the agent", function()
                local result, err = call(exec, "a_delete", { component_id = component_id })
                test.is_nil(err, "delete: " .. tostring(err))
                test.not_nil(result)
                component_id = nil
            end)
        end)

        -- Two writers each patch a DIFFERENT private_context key. The write path
        -- goes through PATCH_CONTEXT, which writes only the named keys server-side;
        -- a read-modify-write that rewrote the whole blob would let one writer drop
        -- the other's field (the lost update). Both fields plus the untouched model
        -- must survive.

        -- An agent created through the HTTP API path (user_agents.create) must be
        -- discoverable by the registry list/find path. Both write/read the same
        -- meta.class discriminator (agent_types.AGENT_CLASS); a divergent class on
        -- either side makes API-created agents invisible to find/list.

        test.describe("paged list", function()
            test.it("pages every agent through the component service", function()
                local owner = new_executor("agents_list_all_" .. uuid_v4():sub(1, 8))
                for index = 1, 55 do
                    local _, err = call(owner, "a_create", {
                        name = prefix .. "all_" .. tostring(index),
                        prompt = "List coverage agent.",
                        model = "class:fast",
                    })
                    test.is_nil(err, "create: " .. tostring(err))
                end
                local first, err = call(owner, "a_list", { pagination = { limit = 50, offset = 0 } })
                test.is_nil(err)
                test.eq(#(first.agents :: any), 50)
                test.eq(first.total_count, 55)
                test.is_true(first.has_more)
                local rest, rest_err = call(owner, "a_list", { pagination = { limit = 50, offset = 50 } })
                test.is_nil(rest_err)
                test.eq(#(rest.agents :: any), 5)
                test.is_false(rest.has_more)
            end)

            test.it("refuses an invalid page with a typed error", function()
                local _, err = call(exec, "a_list", { pagination = { limit = 0 } })
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
