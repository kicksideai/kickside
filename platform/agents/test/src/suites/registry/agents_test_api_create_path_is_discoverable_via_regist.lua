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




        -- Two writers each patch a DIFFERENT private_context key. The write path
        -- goes through PATCH_CONTEXT, which writes only the named keys server-side;
        -- a read-modify-write that rewrote the whole blob would let one writer drop
        -- the other's field (the lost update). Both fields plus the untouched model
        -- must survive.

        -- An agent created through the HTTP API path (user_agents.create) must be
        -- discoverable by the registry list/find path. Both write/read the same
        -- meta.class discriminator (agent_types.AGENT_CLASS); a divergent class on
        -- either side makes API-created agents invisible to find/list.
        test.describe("API create path is discoverable via registry list/find", function()
            local api_name = prefix .. "api_agent"
            local api_id: string?

            test.it("creates an agent through the HTTP create path", function()
                local result, err = exec:call("app:create_via_api", {
                    title = api_name,
                    model = "claude-4-5-sonnet",
                    prompt = "You are an API-created agent.",
                })
                test.is_nil(err, "create_via_api: " .. tostring(err))
                test.not_nil(result)
                test.is_true(result.success, "create failed: " .. tostring(result and result.error))
                api_id = result.component_id
                test.not_nil(api_id)

                local rows = db:query(
                    "SELECT private_context FROM kickside_components WHERE component_id = $1", { api_id })
                test.not_nil(rows and rows[1])
                local ctx: any = json.decode(tostring((rows[1] :: any).private_context))
                test.eq((ctx.traits or {})[1], "kickside.agents.traits:artifacts")
            end)

            test.it("HTTP create path rejects invalid trait context", function()
                local result, err = exec:call("app:create_via_api", {
                    title = prefix .. "api_bad_trait_context",
                    model = "class:fast",
                    traits = { "kickside.agents.traits:agent_roster" },
                    trait_contexts = {
                        ["kickside.agents.traits:agent_roster"] = { namespaces = "not-a-list" },
                    },
                })
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.INVALID))
                test.ok((tostring(err):find("capability context invalid", 1, true)))
                test.ok((tostring(err):find("agent_roster.namespaces expected array", 1, true)))
            end)

            test.it("HTTP create path rejects an explicit internal Keeper tool", function()
                local result, err = exec:call("app:create_via_api", {
                    title = prefix .. "api_internal_keeper_tool",
                    model = "class:fast",
                    tools = { "keeper.hub.tools:dependencies" },
                })
                test.is_nil(result)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.INVALID))
                test.ok(tostring(err):find("not found", 1, true), tostring(err))
            end)

            test.it("registry find returns the API-created agent", function()
                local found, err = call(exec, "a_find", { name = api_name })
                test.is_nil(err)
                test.not_nil(found, "API-created agent is invisible to registry find")
                test.eq(found.component_id, api_id)
            end)

            test.it("registry list includes the API-created agent", function()
                local list, err = call(exec, "a_list", { text = api_name })
                test.is_nil(err)
                test.not_nil(list)
                local seen = false
                for _, c in ipairs(list.agents :: any) do
                    if (c :: any).component_id == api_id then seen = true break end
                end
                test.is_true(seen, "API-created agent is missing from registry list")
            end)

            -- The chosen model must surface, not the "fast" fallback. The create
            -- path writes meta.model; the read must use the same field.
            test.it("surfaces the agent's chosen model from meta.model", function()
                local found, err = call(exec, "a_find", { name = api_name })
                test.is_nil(err)
                test.not_nil(found)
                local meta: any = (found :: any).meta or {}
                test.eq(meta.model, "claude-4-5-sonnet")
                test.eq(meta.status, "active")
            end)

            test.after_all(function()
                if api_id then
                    call(exec, "a_delete", { component_id = api_id })
                end
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
