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

        test.describe("argument validation", function()
            test.it("create requires name", function()
                local _, err = call(exec, "a_create", {})
                test.not_nil(err)
                test.eq(tostring(err):find("name") ~= nil, true)
            end)

            test.it("create rejects invalid trait context", function()
                local _, err = call(exec, "a_create", {
                    name = prefix .. "bad_trait_context",
                    model = "class:fast",
                    traits = { "kickside.agents.traits:agent_roster" },
                    trait_contexts = {
                        ["kickside.agents.traits:agent_roster"] = { namespaces = "not-a-list" },
                    },
                })
                test.not_nil(err)
                test.ok((tostring(err):find("capability context invalid", 1, true)))
                test.ok((tostring(err):find("agent_roster.namespaces expected array", 1, true)))
            end)

            test.it("create rejects internal, wrong-shaped, and hidden capabilities", function()
                local cases = {
                    { traits = { "app:internal_trait_probe" }, expected = "not public" },
                    { traits = { "app:public_tool_probe" }, expected = "invalid registry shape" },
                    { tools = { "app:private_tool_probe" }, expected = "not public" },
                    { tools = { "app:wrong_kind_tool_probe" }, expected = "invalid registry shape" },
                    { tools = { "keeper.hub.tools:dependencies" }, expected = "not found" },
                }
                for i, case in ipairs(cases) do
                    local _, err = call(exec, "a_create", {
                        name = prefix .. "rejected_capability_" .. tostring(i),
                        model = "class:fast",
                        traits = case.traits,
                        tools = case.tools,
                    })
                    test.not_nil(err)
                    test.ok(tostring(err):find(case.expected, 1, true), tostring(err))
                end
            end)

            test.it("find requires component_id or name", function()
                local _, err = call(exec, "a_find", {})
                test.not_nil(err)
            end)

            test.it("update requires component_id", function()
                local _, err = call(exec, "a_update", {})
                test.not_nil(err)
            end)

            test.it("delete requires component_id", function()
                local _, err = call(exec, "a_delete", {})
                test.not_nil(err)
            end)

            test.it("attach_kb requires component_id and kb_id", function()
                local _, e1 = call(exec, "a_attach_kb", {})
                test.not_nil(e1)
                local _, e2 = call(exec, "a_attach_kb", { component_id = "x" })
                test.not_nil(e2)
            end)

            test.it("attach_tool requires component_id and tool_id", function()
                local _, e1 = call(exec, "a_attach_tool", {})
                test.not_nil(e1)
                local _, e2 = call(exec, "a_attach_tool", { component_id = "x" })
                test.not_nil(e2)
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
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
