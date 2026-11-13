-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local json = require("json")
local sql = require("sql")
local policy = require("catalog_policy")
local repo = require("models_repo")

local secret_keys = {
    "api_key", "access_key", "secret_key", "session_token", "google_credentials", "access_token",
    "headers", "authorization", "password", "api_token", "auth_token", "credential_blob",
    "api-key", "apikey", "secret", "token", "credential", "credentials",
}

local function payload()
    local fields = { max_tokens = 8192, output_tokens = 1024, token_budget = 4096,
        secret_count = 2, credential_type = "reference", authorization_mode = "header" }
    for _, key in ipairs(secret_keys) do
        fields[key] = "credential-sentinel"
        fields[key:upper()] = "credential-sentinel"
    end
    return fields
end

local function assert_scrubbed(fields)
    for _, key in ipairs(secret_keys) do
        test.is_nil(fields[key], key)
        test.is_nil(fields[key:upper()], key:upper())
    end
end

local function assert_metadata(fields)
    test.eq(fields.max_tokens, 8192)
    test.eq(fields.output_tokens, 1024)
    test.eq(fields.token_budget, 4096)
    test.eq(fields.secret_count, 2)
    test.eq(fields.credential_type, "reference")
    test.eq(fields.authorization_mode, "header")
end

local function define_tests()
    test.describe("declared credential keys", function()
        test.it("scrubs exact credential fields recursively while retaining ordinary metadata", function()
            local result = policy.scrub_sensitive({ nested = payload(), items = { payload() } })
            assert_scrubbed(result.nested)
            assert_scrubbed(result.items[1])
            assert_metadata(result.nested)
            assert_metadata(result.items[1])
        end)

        test.it("keeps environment references in profile config and credentials out of public views", function()
            local config = payload()
            for _, key in ipairs({ "api_key", "access_key", "secret_key", "session_token", "google_credentials", "access_token" }) do
                config[key .. "_env"] = "CREDENTIAL_REFERENCE"
            end
            local public = policy.public_profile({ id = "profile-policy", config = config, secret_config = payload() })
            assert_scrubbed(public.config)
            assert_metadata(public.config)
            for _, key in ipairs({ "api_key", "access_key", "secret_key", "session_token", "google_credentials", "access_token" }) do
                test.eq(public.config[key .. "_env"], "CREDENTIAL_REFERENCE")
                test.is_nil(policy.scrub_sensitive(config)[key .. "_env"])
            end
        end)

        test.it("persists token metadata and never stores credential fields in card options or metadata", function()
            local ok, err = pcall(function()
                local card, save_err = repo.upsert_card({ name = "metadata-policy-card",
                    provider_id = "wippy.llm.openai_compat:provider", provider_model = "metadata-model",
                    capabilities = { "generate" }, max_tokens = 8192, output_tokens = 1024,
                    metadata = { nested = payload() }, options = { nested = payload() } })
                test.is_nil(save_err)
                assert_metadata(card.metadata.nested)
                assert_metadata(card.options.nested)
                assert_scrubbed(card.metadata.nested)
                assert_scrubbed(card.options.nested)
                local _, reload_err = repo.reload()
                test.is_nil(reload_err)
                local cards, list_err = repo.list_cards_public()
                test.is_nil(list_err)
                local found = false
                for _, row in ipairs(cards) do
                    if row.name == card.name then
                        found = true
                        assert_metadata(row.metadata.nested)
                        assert_metadata(row.options.nested)
                        assert_scrubbed(row.metadata.nested)
                        assert_scrubbed(row.options.nested)
                    end
                end
                test.is_true(found)
                local db, db_err = sql.get("app:db")
                test.is_nil(db_err)
                local rows, read_err = db:query("SELECT metadata_json, options_json FROM kickside_model_cards WHERE name = $1", { card.name })
                db:release()
                test.is_nil(read_err)
                test.is_nil(json.encode(rows):find("credential-sentinel", 1, true))
            end)
            local _, delete_err = repo.delete_card("metadata-policy-card")
            test.is_nil(delete_err)
            if not ok then error(err, 0) end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
