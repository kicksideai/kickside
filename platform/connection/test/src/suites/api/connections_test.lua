local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid_v4 = require("uuid").v4
local contract = require("contract")
local ctx = require("ctx")
local conn_types = require("conn_types")

local DISCORD_IMPL = "kickside.plugins.discord:discord_connection"

local function define_tests()
    test.describe("connection contract via component.open pattern", function()
        local db: any
        local test_component_id = uuid_v4()
        local test_user_id = "test_conn_owner_" .. uuid_v4()

        test.before_all(function()
            db = sql.get("app:db")
            test.not_nil(db)
            local d = db :: any

            d:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { test_component_id })
            d:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { test_component_id })
            d:execute("DELETE FROM kickside_components WHERE component_id = $1", { test_component_id })

            local private_ctx, enc_err = json.encode({ bot_token = "test_token_fake" })
            test.is_nil(enc_err)

            local _, err = d:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { test_component_id, DISCORD_IMPL, private_ctx }
            )
            test.is_nil(err, "insert component")

            _, err = d:execute(
                [[INSERT INTO kickside_component_access (access_id, subject_type, subject_id, component_id, source_component_id, access_mask, created_at)
                  VALUES ($1, 'user', $2, $3, $4, 15, CURRENT_TIMESTAMP)]],
                { uuid_v4(), test_user_id, test_component_id, test_component_id }
            )
            test.is_nil(err, "insert access")

            _, err = d:execute(
                [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
                  VALUES ($1, $2, 'class', $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { uuid_v4(), test_component_id, conn_types.CONNECTION_CLASS }
            )
            test.is_nil(err, "insert meta")
        end)

        test.after_all(function()
            if db then
                local d = db :: any
                d:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { test_component_id })
                d:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { test_component_id })
                d:execute("DELETE FROM kickside_components WHERE component_id = $1", { test_component_id })
                d:release()
            end
        end)

        test.describe("contract open and method dispatch", function()
            test.it("gets the connection contract definition", function()
                local conn_contract, err = contract.get(conn_types.CONNECTION_CONTRACT)
                test.is_nil(err)
                test.not_nil(conn_contract)
            end)

            test.it("opens a binding with scope", function()
                local conn_contract = contract.get(conn_types.CONNECTION_CONTRACT)
                local instance, err = conn_contract:open(DISCORD_IMPL, { component_id = test_component_id })
                test.is_nil(err, "open: " .. tostring(err))
                test.not_nil(instance)
            end)

            test.it("scope is available via ctx.get inside method handler", function()
                local conn_contract = contract.get(conn_types.CONNECTION_CONTRACT)
                local instance = conn_contract:open(DISCORD_IMPL, { component_id = test_component_id })
                test.not_nil(instance)

                -- get_status handler uses ctx.get("component_id"), so this
                -- still verifies contract.open scope delivery without relying
                -- on provider-owned feed config methods.
                local result, err = instance:get_status()
                test.is_nil(err, "get_status: " .. tostring(err))
                test.not_nil(result)
                test.eq(result.status, "connected")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
