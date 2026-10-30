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


        test.describe("initiating actor capability authority", function()
            local keeper_tool = "keeper.hub.tools:administrator_probe"

            test.it("lets an administrator create an agent with a public Keeper capability", function()
                local admin_exec = scoped_executor("agents_admin", "app:capability_admin")
                local created, err = call(admin_exec, "a_create", {
                    name = prefix .. "admin_keeper_capability",
                    model = "class:fast",
                    tools = { keeper_tool },
                })
                test.is_nil(err, tostring(err))
                test.not_nil(created)
                test.not_nil(created.component_id)
                local _, delete_err = call(admin_exec, "a_delete", { component_id = created.component_id })
                test.is_nil(delete_err, tostring(delete_err))
            end)

            test.it("rejects the same explicit Keeper capability for a normal user", function()
                local user_exec = scoped_executor("agents_user", "app:capability_user")
                local created, err = call(user_exec, "a_create", {
                    name = prefix .. "user_keeper_capability",
                    model = "class:fast",
                    traits = {},
                    tools = { keeper_tool },
                })
                test.is_nil(created)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
                test.contains(tostring(err), keeper_tool)
            end)

            test.it("uses the initiating scope when attaching to an existing agent", function()
                local admin_exec = scoped_executor("agents_admin", "app:capability_admin")
                local user_exec = scoped_executor("agents_user", "app:capability_user")
                local created, create_err = call(admin_exec, "a_create", {
                    name = prefix .. "keeper_attach_scope",
                    model = "class:fast",
                })
                test.is_nil(create_err, tostring(create_err))
                test.not_nil(created)

                local denied, denied_err = call(user_exec, "a_attach_tool", {
                    component_id = created.component_id,
                    tool_id = keeper_tool,
                })
                test.is_nil(denied)
                test.not_nil(denied_err)
                test.is_true(errors.is(denied_err, errors.PERMISSION_DENIED), tostring(denied_err))
                test.contains(tostring(denied_err), keeper_tool)

                local attached, attach_err = call(admin_exec, "a_attach_tool", {
                    component_id = created.component_id,
                    tool_id = keeper_tool,
                })
                test.is_nil(attach_err, tostring(attach_err))
                test.is_true(attached.attached)

                local _, delete_err = call(admin_exec, "a_delete", { component_id = created.component_id })
                test.is_nil(delete_err, tostring(delete_err))
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
