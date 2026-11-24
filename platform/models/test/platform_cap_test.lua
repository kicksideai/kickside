-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local time = require("time")
local cap = require("platform_cap")
local models_types = require("models_types")
local models_repo = require("models_repo")
local driver = require("driver")
local context = require("context")

local KEY_ENV = "KICKSIDE_PLATFORM_LLM_API_KEY"

local function platform(config)
    local out = {api_key_env = KEY_ENV}
    for key, value in pairs(config or {}) do out[key] = value end
    return {provider_id = "wippy.llm.claude:provider", config = out}
end

local function used(value)
    return function() return value end
end

local function define_tests()
    test.describe("platform model key cap", function()
        test.it("treats only profiles that read the platform key as platform-managed", function()
            test.is_true(cap.is_platform(platform()))
            test.is_true(cap.is_platform({config = {api_key_env = " " .. KEY_ENV .. " "}}))
            test.is_false(cap.is_platform({config = {api_key_env = "ANTHROPIC_API_KEY"}}))
            test.is_false(cap.is_platform({config = {}, secret_config = {api_key = "own"}}))
            test.is_nil(cap.check({config = {api_key_env = "ANTHROPIC_API_KEY"}}, {cap = "", used = used(10 ^ 9)}))
        end)

        test.it("disables the platform profile without a valid cap", function()
            for _, raw in ipairs({"", "0", "-5", "abc", "1.5"}) do
                local err = cap.check(platform(), {cap = raw, used = used(0)})
                test.not_nil(err)
                test.eq(err:details().error_type, "payment_required")
                test.eq(err:kind(), errors.PERMISSION_DENIED)
                test.contains(err:message(), "own API key")
            end
        end)

        test.it("allows calls under the cap and stops them at the cap", function()
            test.is_nil(cap.check(platform(), {cap = "1000", used = used(999)}))
            local err = cap.check(platform(), {cap = "1000", used = used(1000)})
            test.not_nil(err)
            test.eq(err:details().error_type, "payment_required")
            test.eq(err:details().cap, 1000)
            test.eq(err:details().used, 1000)
            test.contains(err:message(), "own API key")
        end)

        test.it("refuses a custom endpoint for the platform key", function()
            test.is_nil(cap.check(platform({base_url = "https://api.anthropic.com"}), {cap = "1000", used = used(0)}))
            for _, config in ipairs({{base_url = "https://attacker.example"}, {model_list_url = "https://x.example"},
                {base_url = "http://api.anthropic.com"}, {base_url = "https://api.anthropic.com@attacker.example"},
                {base_url = "https://api.anthropic.com.attacker.example"}, {headers = {["x-extra"] = "1"}}}) do
                local err = cap.check(platform(config), {cap = "1000", used = used(0)})
                test.not_nil(err)
                test.eq(err:details().error_type, "payment_required")
            end
        end)

        test.it("reports an unavailable usage total as a retryable error", function()
            local err = cap.check(platform(), {cap = "1000", used = function() return nil, "down" end})
            test.not_nil(err)
            test.eq(err:kind(), errors.UNAVAILABLE)
        end)

        test.it("counts the current UTC calendar month", function()
            local now = assert(time.parse(time.RFC3339, "2026-11-24T23:59:00-03:00"))
            test.eq(cap.month_start(now), "2026-11-01T00:00:00Z")
            local december = assert(time.parse(time.RFC3339, "2026-11-30T22:00:00-03:00"))
            test.eq(cap.month_start(december), "2026-12-01T00:00:00Z")
            local seen
            cap.check(platform(), {cap = "10", now = now, used = function(since) seen = since; return 0 end})
            test.eq(seen, "2026-11-01T00:00:00Z")
        end)

        test.it("sums the month's usage with one aggregate query", function()
            local db_id = models_types.db_id()
            local db = assert(sql.get(db_id))
            local _, create_err = db:execute([[CREATE TABLE IF NOT EXISTS token_usage (
                usage_id TEXT PRIMARY KEY, user_id TEXT NOT NULL, model_id TEXT NOT NULL,
                prompt_tokens INTEGER NOT NULL, completion_tokens INTEGER NOT NULL, timestamp TEXT NOT NULL)]])
            test.is_nil(create_err)
            local rows = {
                {"cap-test-1", 100, 50, "2026-10-31T23:59:59Z"},
                {"cap-test-2", 200, 20, "2026-11-01T00:00:00Z"},
                {"cap-test-3", 300, 30, "2026-11-20T10:00:00Z"},
            }
            for _, row in ipairs(rows) do
                local _, insert_err = db:execute("INSERT INTO token_usage (usage_id, user_id, model_id, prompt_tokens, completion_tokens, timestamp) VALUES ($1, 'u', 'm', $2, $3, $4)",
                    {row[1], row[2], row[3], row[4]})
                test.is_nil(insert_err)
            end
            local total, err = cap.used_tokens(db_id, "2026-11-01T00:00:00Z")
            db:execute("DELETE FROM token_usage WHERE usage_id LIKE 'cap-test-%'")
            db:release()
            test.is_nil(err)
            test.eq(total, 550)
        end)

        test.it("maps the provider of the platform key from its prefix", function()
            test.eq(cap.provider_for_key("sk-ant-api03-x"), "wippy.llm.claude:provider")
            test.eq(cap.provider_for_key("sk-proj-x"), "wippy.llm.openai:provider")
            test.eq(cap.provider_for_key("AIzaSyX"), "wippy.llm.google.generative_ai:provider")
            test.is_nil(cap.provider_for_key("other"))
        end)

        test.it("stops a driver call through a platform profile when no cap is configured", function()
            local profile = assert(models_repo.create_profile({id = "platform-cap-profile", name = "Platform cap",
                provider_id = "wippy.llm.openai_compat:provider", api_key_env = KEY_ENV}))
            assert(models_repo.upsert_card({name = "platform-cap-model", provider_profile_id = profile.id,
                provider_id = profile.provider_id, provider_model = "wire-model", capabilities = {"generate"},
                max_tokens = 8192, output_tokens = 1024, enabled = true}))
            local original = context.context
            context.context = {card = "platform-cap-model"}
            local ok, failure = pcall(function()
                local response, err = driver.generate({})
                test.is_nil(response)
                test.not_nil(err)
                test.eq(err:details().error_type, "payment_required")
            end)
            context.context = original
            models_repo.delete_card("platform-cap-model")
            models_repo.delete_profile(profile.id)
            if not ok then error(failure, 0) end
        end)
    end)
end

return {run = test.run_cases(define_tests)}
