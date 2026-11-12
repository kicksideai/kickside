-- A configuration write announces nav.changed through the UI's own broadcast
-- authority: an administrator scope without realtime or process messaging
-- authority still reaches every connected client.

local test = require("test")
local security = require("security")
local principal_fixture = require("principal_fixture")
local http_client = require("http_client")
local json = require("json")
local sql = require("sql")
local registry = require("registry")

local function base_url(): string
    local entry = registry.get("app:gateway") :: any
    local port = tostring(entry.data.addr):match(":(%d+)$")
    assert(port, "gateway port unavailable")
    return "http://127.0.0.1:" .. port
end

local function constrained_admin_token(): string
    return principal_fixture.token("app:ui_test_admin_without_broadcast")
end

local function define_tests()
    test.describe("nav configuration broadcast", function()
        test.it("broadcasts nav.changed from an administrator without realtime or process messaging authority", function()
            local db = assert(sql.get("app:db"))
            assert(db:execute("CREATE TABLE IF NOT EXISTS ui_nav_broadcasts (topic TEXT NOT NULL, authorized TEXT NOT NULL)"))
            assert(db:execute("DELETE FROM ui_nav_broadcasts"))
            db:release()
            local token = constrained_admin_token()
            local store = assert(security.token_store("kickside.users.security:tokens"))
            local actor, scope, validate_err = store:validate(token)
            store:close()
            test.is_nil(validate_err)
            test.not_nil(actor)
            test.not_nil(scope)
            test.neq(scope:evaluate(actor, "realtime.broadcast", "kickside.realtime:nav.changed"), "allow")
            test.neq(scope:evaluate(actor, "process.send", "app:processes"), "allow")
            local response, err = http_client.put(base_url() .. "/api/auth/nav/config", {
                timeout = 10,
                headers = { Authorization = "Bearer " .. token, ["Content-Type"] = "application/json" },
                body = json.encode({ title = "KickSide" }),
            })
            test.is_nil(err)
            test.eq(response.status_code, 200, tostring(response.body))
            db = assert(sql.get("app:db"))
            local seen = assert(db:query("SELECT topic, authorized FROM ui_nav_broadcasts"))
            db:release()
            test.eq(#seen, 1)
            test.eq(seen[1].topic, "nav.changed")
            test.eq(seen[1].authorized, "yes", "the nav.changed broadcast was refused")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
