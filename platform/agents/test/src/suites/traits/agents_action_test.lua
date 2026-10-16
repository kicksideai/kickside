local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid_v4 = require("uuid").v4
local funcs = require("funcs")
local security = require("security")

local TOOL = "kickside.agents.traits:agents_action"
local USER_AGENT_IMPL = "kickside.agents:user_agent"
local PROC_SCOPE = "wippy.security:process"
local APP_DB = "app:db"

local function executor(user_id: string, context: any): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope(PROC_SCOPE)
    local e = funcs.new():with_actor(actor):with_scope(scope)
    if context then e = e:with_context(context) end
    return e
end

local function insert_agent(db: any, user_id: string, title: string): string
    local component_id = uuid_v4()
    local private_context, enc_err = json.encode({
        prompt = "Fixture prompt.",
        model = "class:fast",
    })
    test.is_nil(enc_err)

    db:execute(
        [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
        { component_id, USER_AGENT_IMPL, private_context })
    db:execute(
        [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
          VALUES ($1, $2, 'title', $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
        { uuid_v4(), component_id, title })
    db:execute(
        [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
          VALUES ($1, $2, 'description', $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
        { uuid_v4(), component_id, "Roster test agent" })
    db:execute(
        [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
          VALUES ($1, $2, 'public', 'true', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
        { uuid_v4(), component_id })
    db:execute(
        [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
          VALUES ($1, $2, $3, $4, 'user', 15, CURRENT_TIMESTAMP)]],
        { uuid_v4(), user_id, component_id, component_id })
    return component_id
end

local function delete_agent(db: any, component_id: string): ()
    db:execute("DELETE FROM kickside_components WHERE component_id = $1", { component_id })
end

local function assert_roster_output(result: any, component_id: string): ()
    test.eq(type(result), "table")
    test.is_true(result.success)
    test.eq(result.scope ~= nil, true)
    local found: any = nil
    for _, agent in ipairs(result.agents) do
        if agent.agent_id == "user_agent:" .. component_id then found = agent end
    end
    test.not_nil(found, "fixture agent missing from the roster page")
    test.eq(found.title, "Roster Tool Fixture")
    test.is_nil(found.description)
end

local function define_tests()
    test.describe("Agents roster tool", function()
        local db: any
        local owner = "agents_roster_tool_owner"
        local component_id: string?

        test.before_all(function()
            db = sql.get(APP_DB)
            test.not_nil(db)
            component_id = insert_agent(db, owner, "Roster Tool Fixture")
        end)

        test.after_all(function()
            if db and component_id then
                delete_agent(db, component_id :: string)
            end
            if db then db:release() end
        end)

        test.it("lists reachable user agents with real actor, scope and trait context", function()
            local result, err = executor(owner, {
                namespaces = { "user_agent" },
                self_id = "user_agent:not-this-agent",
            }):call(TOOL, { action = "list" })

            test.is_nil(err, "Agents list returned error: " .. tostring(err))
            assert_roster_output(result, component_id :: string)

            local detailed, detailed_err = executor(owner, {
                namespaces = { "user_agent" },
                self_id = "user_agent:not-this-agent",
            }):call(TOOL, { action = "list", fields = { "description" } })
            test.is_nil(detailed_err)
            for _, agent in ipairs(detailed.agents) do
                if agent.agent_id == "user_agent:" .. tostring(component_id) then
                    test.eq(type(agent.description), "string")
                end
            end
        end)

        test.it("lists reachable user agents through async tool execution", function()
            local command = executor(owner, {
                namespaces = { "user_agent" },
                self_id = "user_agent:not-this-agent",
            }):async(TOOL, { action = "list" })
            local response_channel = command:response()
            local _, ok = response_channel:receive()
            test.is_true(ok)

            local payload, err = command:result()
            test.is_nil(err, "Agents async list returned error: " .. tostring(err))
            local result = payload and payload:data() or nil
            assert_roster_output(result, component_id :: string)
        end)

        test.it("pages reachable agents in agent_id order with a cursor", function()
            local second_id = insert_agent(db, owner, "Roster Tool Second")
            local seen: { string } = {}
            local cursor: string? = nil
            repeat
                local page, err = executor(owner, {
                    namespaces = { "user_agent" },
                    self_id = "user_agent:not-this-agent",
                }):call(TOOL, { action = "list", limit = 1, cursor = cursor })
                test.is_nil(err, tostring(err))
                test.is_true(#page.agents <= 1)
                for _, agent in ipairs(page.agents) do seen[#seen + 1] = agent.agent_id end
                cursor = page.next_cursor
            until cursor == nil
            delete_agent(db, second_id)
            test.eq(#seen, 2)
            test.is_true(seen[2] > seen[1])
        end)

        test.it("Redirect lists reachable agents as records", function()
            local page, err = executor(owner, nil):call("kickside.agents.traits:redirect_action", { action = "list", limit = 100 })
            test.is_nil(err, tostring(err))
            local found: any = nil
            for _, agent in ipairs(page.agents) do
                if agent.agent_id == "user_agent:" .. tostring(component_id) then found = agent end
            end
            test.not_nil(found, "fixture agent missing from the redirect list")
            test.eq(found.name, "Roster Tool Fixture")
            test.is_nil(found.description)
            test.is_true(page.success)
            test.eq(page.count, #page.agents)

            local detailed, detailed_err = executor(owner, nil):call("kickside.agents.traits:redirect_action", {
                action = "list", limit = 100, fields = { "description" },
            })
            test.is_nil(detailed_err)
            for _, agent in ipairs(detailed.agents) do
                if agent.agent_id == "user_agent:" .. tostring(component_id) then
                    test.eq(type(agent.description), "string")
                end
            end
        end)

        test.it("delegates under the same actor and routed session context", function()
            local target = "user_agent:" .. tostring(component_id)
            local result, err = executor(owner, {
                namespaces = { "user_agent" },
                self_id = "user_agent:not-this-agent",
            }):call(TOOL, {
                action = "delegate",
                agent_id = target,
                task = "summarize the fixture",
            })

            test.is_nil(err, "Agents delegate returned error: " .. tostring(err))
            test.eq(type(result), "table")
            test.eq((result :: any).actor_id, owner)
            test.eq((result :: any).to_agent_id, target)
            test.eq((result :: any).from_agent_id, "user_agent:not-this-agent")
            test.eq((result :: any).message, "summarize the fixture")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
