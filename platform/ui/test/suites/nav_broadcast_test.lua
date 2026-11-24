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
local funcs = require("funcs")

local function base_url(): string
    local entry = registry.get("app:gateway") :: any
    local port = tostring(entry.data.addr):match(":(%d+)$")
    assert(port, "gateway port unavailable")
    return "http://127.0.0.1:" .. port
end

local function constrained_admin_token(): string
    return principal_fixture.token("app:ui_test_admin_without_broadcast")
end

local function stored_chat_appearance(): any
    local db = assert(sql.get("app:db"))
    local rows, err = db:query("SELECT value FROM kickside_settings WHERE namespace = $1 AND key = $2",
        { "kickside.ui", "chat_appearance" })
    db:release()
    assert(rows, tostring(err))
    return rows[1]
end

local function define_tests()
    test.describe("nav configuration broadcast", function()
        test.it("round-trips navigation configuration and broadcasts nav.changed for a constrained administrator", function()
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
            local nav_url = base_url() .. "/api/auth/nav"
            local headers = { Authorization = "Bearer " .. token, ["Content-Type"] = "application/json" }
            local function put(raw: string, status: number): string
                local response = assert(http_client.put(nav_url .. "/config", {
                    timeout = 10, headers = headers, body = raw,
                }))
                test.eq(response.status_code, status, tostring(response.body))
                return tostring(response.body)
            end
            local function list(): any
                local response = assert(http_client.get(nav_url .. "/list?manage=1", {
                    timeout = 10, headers = headers,
                }))
                test.eq(response.status_code, 200, tostring(response.body))
                return assert(json.decode(response.body))
            end

            local original = list()
            test.eq(json.encode(original.config.chat_appearance), "{}")
            test.is_nil(stored_chat_appearance())
            local original_categories = original.config.categories
            original.config.categories = { { key = "ui_test", label = "Renamed UI tests" } }
            put(assert(json.encode(original.config)), 200)
            original.config.categories = original_categories
            test.eq(list().config.categories[1].label, "Renamed UI tests")
            test.is_nil(stored_chat_appearance())

            local appearance = {
                navigation = { visible = true, placement = "last" },
                sessions = { intro = "default", markdown = "", show_message = true, show_agent_picker = true },
                sidebar = { intro = "markdown", markdown = "[Help](/help)", show_message = false, show_agent_picker = false },
            }
            local denied = put(assert(json.encode({ chat_appearance = appearance })), 400)
            test.is_true(string.find(denied, "default agent", 1, true) ~= nil)
            local sidebar: any = appearance.sidebar
            sidebar.default_agent = "fixtures:researcher"
            sidebar.allowed_agents = { "fixtures:researcher" }
            sidebar.markdown_alignment = "justify"
            local invalid_alignment = put(assert(json.encode({ chat_appearance = appearance })), 400)
            test.is_true(string.find(invalid_alignment, "Markdown alignment", 1, true) ~= nil)
            sidebar.markdown_alignment = "right"
            put(assert(json.encode({ chat_appearance = appearance })), 200)
            test.not_nil(stored_chat_appearance())

            put('{"chat_appearance":[]}', 400)
            put('{"chat_appearance":{"unknown":null}}', 400)
            put('{"chat_appearance":{"navigation":{}}}', 400)
            put('{"layout":"horizontal"}', 200)
            local customized = list()
            test.eq(customized.layout, "horizontal")
            test.eq(customized.new_chat.placement, "last")
            test.eq(customized.config.chat_appearance.sessions.show_message, true)
            test.eq(customized.config.chat_appearance.sidebar.show_message, false)
            test.eq(customized.config.chat_appearance.sidebar.default_agent, "fixtures:researcher")
            test.eq(customized.config.chat_appearance.sidebar.markdown_alignment, "right")

            put(assert(json.encode(original.config)), 200)
            local restored = list()
            test.eq(restored.layout, original.layout)
            test.eq(#restored.config.categories, #original_categories)
            test.eq(json.encode(restored.config.chat_appearance), "{}")
            test.is_nil(restored.new_chat)
            test.is_nil(stored_chat_appearance())

            -- Load an inherited value already present in storage, as on an upgraded instance.
            db = assert(sql.get("app:db"))
            assert(db:execute([[
                INSERT INTO kickside_settings (namespace, key, value, value_type, updated_by)
                VALUES ($1, $2, $3, $4, $5)
            ]], { "kickside.ui", "chat_appearance", "{}", "json", "legacy-fixture" }))
            db:release()
            local warmed = assert(funcs.call("kickside.settings:cache_bootloader"))
            test.eq(warmed.status, "success", warmed.message)
            local legacy = list()
            test.eq(json.encode(legacy.config.chat_appearance), "{}")
            put(assert(json.encode(legacy.config)), 200)
            test.is_nil(stored_chat_appearance())

            db = assert(sql.get("app:db"))
            local seen = assert(db:query("SELECT topic, authorized FROM ui_nav_broadcasts"))
            db:release()
            test.eq(#seen, 5)
            for _, row in ipairs(seen) do
                test.eq(row.topic, "nav.changed")
                test.eq(row.authorized, "yes", "the nav.changed broadcast was refused")
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
