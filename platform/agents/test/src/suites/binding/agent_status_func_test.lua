local test = require("test")
local funcs = require("funcs")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local contract = require("contract")

local STATUS_FUNC = "kickside.agents.binding:agent_status_func"
local USER_AGENT_IMPL = "kickside.agents:user_agent"
local COMPONENT_CONTRACT = "kickside.contract:component"

local function define_tests()
    test.describe("agent_status_func", function()
        local component_id = uuid.v7()

        local function db()
            local d, err = sql.get("app:db")
            if err then error(tostring(err)) end
            return d
        end

        local function cleanup()
            local d = db()
            d:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { component_id })
            d:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { component_id })
            d:execute("DELETE FROM kickside_components WHERE component_id = $1", { component_id })
            d:release()
        end

        local function insert_agent(meta: any, private_context: any)
            cleanup()
            local d = db()
            local ctx_json = json.encode(private_context or {})
            local _, err = d:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { component_id, USER_AGENT_IMPL, ctx_json }
            )
            test.is_nil(err, "insert component")
            for key, value in pairs(meta or {}) do
                _, err = d:execute(
                    [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
                      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                    { uuid.v7(), component_id, key, tostring(value) }
                )
                test.is_nil(err, "insert meta " .. tostring(key))
            end
            d:release()
        end

        test.before_each(function()
            cleanup()
        end)

        test.after_all(function()
            cleanup()
        end)

        test.it("reports the public meta status when present", function()
            local result, err = funcs.call(STATUS_FUNC, {
                context = {
                    title = "Support Agent",
                    status = "paused",
                },
            })
            test.is_nil(err)
            test.eq(result.success, true)
            test.eq(result.title, "Support Agent")
            test.eq(result.status, "paused")
        end)

        test.it("uses active as the default when status meta is absent", function()
            local result, err = funcs.call(STATUS_FUNC, {
                context = {
                    title = "Agent without status",
                },
            })
            test.is_nil(err)
            test.eq(result.success, true)
            test.eq(result.status, "active")
        end)

        test.it("prefers component public meta over private context when opened as a component", function()
            insert_agent({
                title = "Public Agent",
                status = "paused",
            }, {
                title = "Private Agent",
                status = "active",
            })

            local component_contract, cerr = contract.get(COMPONENT_CONTRACT)
            test.is_nil(cerr)
            test.not_nil(component_contract)

            local instance, open_err = component_contract:open(USER_AGENT_IMPL, { component_id = component_id })
            test.is_nil(open_err, "open component contract")
            test.not_nil(instance)

            local result, err = instance:get_status()
            test.is_nil(err)
            test.eq(result.success, true)
            test.eq(result.title, "Public Agent")
            test.eq(result.status, "paused")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
