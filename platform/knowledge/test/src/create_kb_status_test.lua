-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local http_client = require("http_client")
local system = require("system")
local session = require("session")
local groups = require("groups")
local fixture = require("fixture")

local users: { string } = {}

local function execute(statement: string, params: any?)
    local db = assert(sql.get("app:db"))
    local _, err = db:execute(statement, params or {})
    db:release()
    if err then error(tostring(err)) end
end

local function user(): string
    local id = "create-status-" .. uuid.v7()
    users[#users + 1] = id
    local db = assert(sql.get("app:db"))
    local sqlite = db:type() == sql.type.SQLITE
    db:release()
    local now = sqlite and "strftime('%s', 'now')" or "now()"
    execute("INSERT INTO app_users (user_id, email, full_name, password_hash, status, created_at, updated_at) VALUES ($1, $2, 'Test user', '!test', 'active', " .. now .. ", " .. now .. ")", { id, id .. "@knowledge.test" })
    execute("INSERT INTO app_user_groups (user_id, group_id, created_at) VALUES ($1, 'app:user', " .. now .. ")", { id })
    return id
end

local function create(owner: string, body: any): any
    local token = assert(session.mint(assert(groups.get_user_with_groups(owner)))).token
    local gateway, gateway_err = system.supervisor.state("app:gateway")
    test.is_nil(gateway_err, tostring(gateway_err))
    local port = assert(gateway.details:match(":(%d+)$"))
    local response, err = http_client.request("POST", "http://127.0.0.1:" .. port .. "/api/knowledge/create", {
        headers = { Authorization = "Bearer " .. token, ["Content-Type"] = "application/json" },
        body = assert(json.encode(body)),
    })
    test.is_nil(err, tostring(err))
    return response
end

local function define_tests()
    test.describe("knowledge base create over HTTP", function()
        test.after_each(function()
            for _, id in ipairs(users) do
                execute("DELETE FROM app_user_groups WHERE user_id = $1", { id })
                execute("DELETE FROM app_users WHERE user_id = $1", { id })
            end
            users = {}
        end)

        test.it("answers 400 with the engine's validation error for an invalid config", function()
            local response = create(user(), {
                name = "Refused config", kb_type = "config_refused", embedding_model = "fixture-embedding",
                config = { extraction_model = "fixture-small-output" },
            })
            test.eq(response.status_code, 400, response.body)
            local body = assert(json.decode(response.body))
            test.is_false(body.success)
            test.contains(body.error, fixture.REFUSAL)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
