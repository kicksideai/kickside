-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local http_client = require("http_client")
local json = require("json")
local system = require("system")
local contract = require("contract")
local security = require("security")

local NS = "kickside.settings.test"

local function admin_token(): string
    local store = assert(security.token_store("app:tokens"))
    local policy = assert(security.policy("app:settings_admin_policy"))
    local token, err = store:create(security.new_actor("admin", {}), assert(security.new_scope({ policy })), { expiration = "1h" })
    if err or not token then error("token: " .. tostring(err)) end
    return token
end

local function put(body: any): (number, any)
    local gateway = assert(system.supervisor.state("app:gateway"))
    local port = assert(tostring(gateway.details):match(":(%d+)$"))
    local response = assert(http_client.put("http://127.0.0.1:" .. port .. "/api/settings", {
        body = assert(json.encode(body)),
        headers = { ["Content-Type"] = "application/json", Authorization = "Bearer " .. admin_token() },
    }))
    return response.status_code, json.decode(assert(response.body))
end

local function settings(): any
    local def = assert(contract.get("kickside.settings:settings"))
    local policy = assert(security.policy("app:settings_admin_policy"))
    return assert((def :: any):with_actor(security.new_actor("admin", {})):with_scope(security.new_scope({ policy })):open())
end

local function define_tests()
    test.describe("PUT /settings expected_revision", function()
        test.it("applies a write at the expected revision and reports the new revision", function()
            local status, body = put({ namespace = NS, key = "max_items", value = 71, expected_revision = 0 })
            test.eq(status, 200, json.encode(body))
            test.eq(body.success, true)
            local revision = body.updated[1].revision
            test.is_true(revision > 0)
            test.eq(settings():get({ namespace = NS, key = "max_items" }).revision, revision)
            settings():unset({ namespace = NS, key = "max_items" })
        end)

        test.it("answers 409 with the current revision for a stale write", function()
            local s = settings()
            local seen = s:set({ namespace = NS, key = "max_items", value = 81 })
            local other = s:set({ namespace = NS, key = "max_items", value = 82 })
            local status, body = put({ namespace = NS, key = "max_items", value = 83, expected_revision = seen.revision })
            test.eq(status, 409)
            test.eq(body.success, false)
            test.eq(body.conflict, true)
            test.eq(body.revision, other.revision)
            test.eq(s:get({ namespace = NS, key = "max_items" }).value, 82)
            s:unset({ namespace = NS, key = "max_items" })
        end)

        test.it("answers 409 for a stale clear", function()
            local s = settings()
            local seen = s:set({ namespace = NS, key = "max_items", value = 91 })
            local other = s:set({ namespace = NS, key = "max_items", value = 92 })
            local status, body = put({ namespace = NS, key = "max_items", value = json.null, expected_revision = seen.revision })
            test.eq(status, 409)
            test.eq(body.revision, other.revision)
            test.eq(s:get({ namespace = NS, key = "max_items" }).value, 92)
            s:unset({ namespace = NS, key = "max_items" })
        end)
    end)
end

return { run = test.run_cases(define_tests) }
