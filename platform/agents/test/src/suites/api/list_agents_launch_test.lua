local test = require("test")
local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local funcs = require("funcs")
local security = require("security")

local PROBE = "app:list_agents_probe"
local AGENTS_NS = "kickside.agents.registry"
local USER_AGENT_IMPL = "kickside.agents:user_agent"
local PROC_SCOPE = "wippy.security:process"
local APP_DB = "app:db"

local function uuid(): string
    local id, err = crypto.random.uuid()
    if err then return "uuid_error" end
    return id
end

local function new_executor(user_id: string): any
    local actor: any = security.new_actor(user_id, {})
    local scope: any = security.named_scope(PROC_SCOPE)
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function find_by_name(list: any, name: string): any
    for _, agent in ipairs(list or {}) do
        if agent.name == name then return agent end
    end
    return nil
end

local function define_tests()
    test.describe("agent launch list", function()
        local db: any
        local owner = "launch_list_owner_" .. uuid()
        local stranger = "launch_list_stranger_" .. uuid()
        local created: {string} = {}

        test.before_all(function()
            db = sql.get(APP_DB)
            test.not_nil(db)
        end)

        test.after_all(function()
            if db then
                for _, cid in ipairs(created) do
                    db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { cid })
                    db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { cid })
                    db:execute("DELETE FROM kickside_components WHERE component_id = $1", { cid })
                end
                db:release()
            end
        end)

        local function register_agent(user_id: string, title: string): string
            local reg, err = new_executor(user_id):call(AGENTS_NS .. ":a_create", {
                name = title,
                prompt = "You are a test agent.",
                model = "class:fast",
            })
            test.is_nil(err, "a_create: " .. tostring(err))
            test.not_nil(reg)
            local component_id = reg.component_id :: string
            created[#created + 1] = component_id
            return component_id
        end

        -- A stored agent whose saved configuration the resolver rejects: it has
        -- no model, so resolving it returns the typed agent_model_required error.
        local function insert_modelless_agent(user_id: string, title: string): string
            local cid = uuid()
            created[#created + 1] = cid
            local enc, _ = json.encode({ prompt = "Modelless prompt." })
            db:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { cid, USER_AGENT_IMPL, enc })
            for key, value in pairs({ title = title, class = "agent", status = "active" }) do
                db:execute(
                    [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
                      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                    { uuid(), cid, key, value })
            end
            db:execute(
                [[INSERT INTO kickside_component_access (access_id, subject_id, component_id, source_component_id, subject_type, access_mask, created_at)
                  VALUES ($1, $2, $3, $4, 'user', 15, CURRENT_TIMESTAMP)]],
                { uuid(), user_id, cid, cid })
            return cid
        end

        local function launch_list(user_id: string): any
            local result, err = new_executor(user_id):call(PROBE, { launch = true })
            test.is_nil(err, "probe: " .. tostring(err))
            test.not_nil(result)
            test.eq(result.status, 200, json.encode(result.payload or {}))
            test.eq(result.payload.success, true)
            return result.payload
        end

        test.it("lists a startable owned agent with a start token", function()
            local cid = register_agent(owner, "Launch Startable Agent")
            local payload = launch_list(owner)

            local agent = find_by_name(payload.agents, "user_agent:" .. cid)
            test.not_nil(agent, "startable agent missing from the launch list")
            test.eq(agent.can_start, true)
            test.not_nil(agent.start_token)
            test.is_nil(agent.start_error)
            test.is_nil(find_by_name(payload.unavailable, "user_agent:" .. cid))
        end)

        test.it("lists an owned agent that fails to resolve as unavailable with the reason", function()
            local cid = insert_modelless_agent(owner, "Launch Modelless Agent")
            local payload = launch_list(owner)

            test.is_nil(find_by_name(payload.agents, "user_agent:" .. cid),
                "an unstartable agent must not be offered for launch")
            local agent = find_by_name(payload.unavailable, "user_agent:" .. cid)
            test.not_nil(agent, "owned agent that fails to resolve is missing from the launch list")
            test.eq(agent.title, "Launch Modelless Agent")
            test.eq(agent.source, "user")
            test.eq(agent.can_start, false)
            test.is_nil(agent.start_token)
            test.not_nil(agent.start_error)
            test.eq(agent.start_error.code, "agent_model_required")
            test.eq(agent.start_error.kind, errors.INVALID)
            test.eq(agent.start_error.message, "Configure a model for this agent before starting it.")
        end)

        test.it("keeps agents the caller cannot access out of the launch list", function()
            local foreign_broken = insert_modelless_agent(stranger, "Foreign Modelless Agent")
            local foreign_startable = register_agent(stranger, "Foreign Startable Agent")
            local owned_broken = insert_modelless_agent(owner, "Owned Hidden From Stranger Agent")
            local payload = launch_list(owner)

            for _, cid in ipairs({ foreign_broken, foreign_startable }) do
                test.is_nil(find_by_name(payload.agents, "user_agent:" .. cid))
                test.is_nil(find_by_name(payload.unavailable, "user_agent:" .. cid))
            end

            local stranger_payload = launch_list(stranger)
            test.is_nil(find_by_name(stranger_payload.agents, "user_agent:" .. owned_broken))
            test.is_nil(find_by_name(stranger_payload.unavailable, "user_agent:" .. owned_broken))
            test.not_nil(find_by_name(stranger_payload.unavailable, "user_agent:" .. foreign_broken))
        end)

        test.it("keeps the agents count to startable agents", function()
            local payload = launch_list(owner)
            test.eq(payload.count, #payload.agents)
            for _, agent in ipairs(payload.agents) do
                test.eq(agent.can_start, true, agent.name)
                test.not_nil(agent.start_token, agent.name)
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
