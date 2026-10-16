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
        test.describe("private_context partial writes (lost-update guard)", function()
            test.it("independent field writers do not clobber each other", function()
                local created, cerr = call(exec, "a_create", {
                    name = prefix .. "patchsafe",
                    prompt = "p0",
                    model = "class:fast",
                    tools = {},
                })
                test.is_nil(cerr, "a_create: " .. tostring(cerr))
                test.not_nil(created)
                local cid = (created :: any).component_id :: string

                local _, aerr = call(exec, "a_update", { component_id = cid, prompt = "pA" })
                test.is_nil(aerr, "a_update: " .. tostring(aerr))
                local _, berr = call(exec, "a_attach_tool", {
                    component_id = cid,
                    tool_id = "app:public_tool_probe",
                })
                test.is_nil(berr, "a_attach_tool: " .. tostring(berr))

                local rows = db:query(
                    "SELECT private_context FROM kickside_components WHERE component_id = $1", { cid })
                test.not_nil(rows and rows[1])
                local ctx: any = json.decode(tostring((rows[1] :: any).private_context))
                test.eq(ctx.prompt, "pA")
                test.eq(ctx.model, "class:fast")
                test.eq((ctx.tools or {})[1], "app:public_tool_probe")

                call(exec, "a_delete", { component_id = cid })
            end)
        end)

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
