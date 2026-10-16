local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local contract = require("contract")

local OAUTH_IMPL = "kickside.oauth:oauth_connection"
local COMPONENT_CONTRACT = "kickside.contract:component"

local function define_tests()
    test.describe("OAuth get_status public meta projection", function()
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
            d:execute("DELETE FROM kickside_oauth_connections WHERE component_id = $1", { component_id })
            d:execute("DELETE FROM kickside_components WHERE component_id = $1", { component_id })
            d:release()
        end

        local function insert_component(meta: any)
            cleanup()
            local d = db()
            local private_context = json.encode({ component_id = component_id })
            local _, err = d:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { component_id, OAUTH_IMPL, private_context }
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

        local function status()
            local component_contract, err = contract.get(COMPONENT_CONTRACT)
            test.is_nil(err)
            test.not_nil(component_contract)

            local instance, open_err = component_contract:open(OAUTH_IMPL, { component_id = component_id })
            test.is_nil(open_err, "open component contract")
            test.not_nil(instance)

            local result, status_err = instance:get_status()
            test.is_nil(status_err, "get_status")
            test.not_nil(result)
            return result
        end

        test.before_each(function()
            cleanup()
        end)

        test.after_all(function()
            cleanup()
        end)

        test.it("summarizes OAuth status from component public meta without an OAuth row", function()
            insert_component({
                provider = "google",
                connection_state = "connected",
                expires_at = "4102444800",
                scopes_granted = "openid email profile",
            })

            local result = status()

            test.eq(result.status, "connected")
            test.contains(result.description, "OAuth connection to google")
            test.contains(result.description, "State: connected")
            test.contains(result.description, "Scopes: 3 granted")
        end)

        test.it("uses public meta expiry for expired status", function()
            insert_component({
                provider = "google",
                connection_state = "connected",
                expires_at = "100",
            })

            local result = status()

            test.eq(result.status, "expired")
            test.contains(result.description, "State: expired")
            test.contains(result.description, "Token: EXPIRED")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
