local test = require("test")
local sql = require("sql")
local catalog_policy = require("catalog_policy")
local models_secrets = require("models_secrets")
local models_repo = require("models_repo")
local models_cache = require("models_cache")
local fake_http = require("fake_http")
local admin_handler = require("admin_handler")
local model_catalog = require("model_catalog")
local funcs = require("funcs")

local function with_corrupt_profile(fn, stored_secret, stored_config)
    local db, err = sql.get("app:db")
    test.is_nil(err)
    db = assert(db)
    local _, write_err = db:execute([[
        INSERT INTO kickside_model_provider_profiles
            (id, name, provider_id, config_json, secret_json, enabled, status, message, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 1, 'unknown', '', 1, 1)
    ]], { "secret-decode-fixture", "Unreadable secret", "wippy.llm.openai:provider", stored_config or "{}", stored_secret or "not-a-valid-encrypted-secret" })
    local good_secret, encrypt_err = catalog_policy.encrypt_secret({ api_key = "good-profile-key" })
    test.is_nil(encrypt_err)
    local _, good_err = db:execute([[
        INSERT INTO kickside_model_provider_profiles
            (id, name, provider_id, config_json, secret_json, enabled, status, message, created_at, updated_at)
        VALUES ('valid-profile-fixture', 'Valid profile', 'wippy.llm.openai:provider', '{}', $1, 1, 'healthy', '', 1, 1)
    ]], { good_secret })
    test.is_nil(good_err)
    for _, profile_id in ipairs({ "secret-decode-fixture", "valid-profile-fixture" }) do
        local _, card_err = db:execute([[
            INSERT INTO kickside_model_cards
                (name, title, provider_id, provider_profile_id, provider_model, created_at, updated_at)
            VALUES ($1, 'Profile fixture', 'wippy.llm.openai:provider', $2, 'fixture', 1, 1)
        ]], { profile_id .. "-card", profile_id })
        test.is_nil(card_err)
    end
    db:release()
    test.is_nil(write_err)
    local ok, call_err = pcall(fn)
    db, err = sql.get("app:db")
    test.is_nil(err)
    db = assert(db)
    local _, card_err = db:execute("DELETE FROM kickside_model_cards WHERE provider_profile_id IN ($1, $2)", { "secret-decode-fixture", "valid-profile-fixture" })
    test.is_nil(card_err)
    local _, delete_err = db:execute("DELETE FROM kickside_model_provider_profiles WHERE id IN ($1, $2)", { "secret-decode-fixture", "valid-profile-fixture" })
    db:release()
    test.is_nil(delete_err)
    local _, reload_err = models_repo.reload()
    test.is_nil(reload_err)
    if not ok then error(call_err, 0) end
end

local function define_tests()
    test.describe("model provider-profile secrets", function()
        test.it("returns an error for an undecryptable stored secret", function()
            local secret, err = catalog_policy.decrypt_secret("not-a-valid-encrypted-secret")
            test.is_nil(secret)
            test.not_nil(err)
        end)
        test.it("returns an error for malformed or non-object decrypted secrets", function()
            for _, plain in ipairs({ "not-json", "false" }) do
                local encrypted, encrypt_err = models_secrets.encrypt(plain)
                test.is_nil(encrypt_err)
                local secret, err = catalog_policy.decrypt_secret(encrypted)
                test.is_nil(secret)
                test.not_nil(err)
            end
        end)
        test.it("isolates unreadable profiles from valid profiles and model resolution", function()
            with_corrupt_profile(function()
                models_cache.clear()
                local snapshot, err = models_repo.reload()
                test.is_nil(err)
                test.not_nil(snapshot)
                local profile, expected = models_repo.get_profile("secret-decode-fixture")
                test.is_nil(profile)
                test.not_nil(expected)
                local good, good_err = models_repo.get_profile("valid-profile-fixture")
                test.is_nil(good_err)
                test.eq(good.secret_config.api_key, "good-profile-key")
                local public, public_err = models_repo.list_profiles_public()
                test.is_nil(public_err)
                local found = false
                for _, item in ipairs(public) do
                    if item.id == "secret-decode-fixture" then
                        found = true
                        test.eq(item.error, expected)
                    end
                end
                test.eq(found, true)
                local card, card_err = model_catalog.resolve("valid-profile-fixture-card")
                test.is_nil(card_err)
                test.eq(card.providers[1].context.api_key, "good-profile-key")
                for _, read in ipairs({
                    function() return model_catalog.resolve("secret-decode-fixture-card") end,
                    function() return model_catalog.get_by_name("secret-decode-fixture-card") end,
                    function() return funcs.call("kickside.models.catalog:model_resolver_func", { model = "secret-decode-fixture-card" }) end,
                }) do
                    local value, read_err = read()
                    test.is_nil(value)
                    test.eq(tostring(read_err), tostring(expected))
                end
                for _, read in ipairs({ model_catalog.get_all, models_repo.list_cards }) do
                    local cards, list_err = read()
                    test.is_nil(list_err)
                    for _, item in ipairs(cards) do test.eq(item.name == "secret-decode-fixture-card", false) end
                end
                test.eq(models_repo.set_profile_status("valid-profile-fixture", "healthy", "fixture"), nil)
                local updated, update_err = models_repo.get_profile("valid-profile-fixture")
                test.is_nil(update_err)
                test.eq(updated.message, "fixture")
            end)
        end)
        test.it("isolates malformed stored profile configuration", function()
            with_corrupt_profile(function()
                local snapshot, err = models_repo.reload()
                test.is_nil(err)
                test.not_nil(snapshot)
                local bad, bad_err = models_repo.get_profile("secret-decode-fixture")
                test.is_nil(bad)
                test.not_nil(bad_err)
                local good, good_err = models_repo.get_profile("valid-profile-fixture")
                test.is_nil(good_err)
                test.not_nil(good)
            end, "", "not-json")
        end)
        test.it("rejects malformed JSON in every stored card field", function()
            for _, field in ipairs({ "capabilities_json", "classes_json", "pricing_json", "options_json", "metadata_json" }) do
                local db, err = sql.get("app:db")
                test.is_nil(err)
                db = assert(db)
                local _, insert_err = db:execute([[
                    INSERT INTO kickside_model_cards
                        (name, title, provider_id, provider_model, created_at, updated_at)
                    VALUES ('json-card-fixture', 'Malformed JSON', 'wippy.llm.openai:provider', 'fixture', 1, 1)
                ]], {})
                test.is_nil(insert_err)
                local _, update_err = db:execute("UPDATE kickside_model_cards SET " .. field .. "=$1 WHERE name=$2", { "not-json", "json-card-fixture" })
                test.is_nil(update_err)
                db:release()
                local ok, call_err = pcall(function()
                    local snapshot, reload_err = models_repo.reload()
                    test.is_nil(snapshot)
                    test.not_nil(reload_err)
                end)
                db, err = sql.get("app:db")
                test.is_nil(err)
                db = assert(db)
                local _, delete_err = db:execute("DELETE FROM kickside_model_cards WHERE name=$1", { "json-card-fixture" })
                db:release()
                test.is_nil(delete_err)
                local _, reload_err = models_repo.reload()
                test.is_nil(reload_err)
                if not ok then error(call_err, 0) end
            end
        end)
        test.it("reports a profile load error without failing the admin catalog", function()
            with_corrupt_profile(function()
                fake_http.prepare(nil)
                local _, err = admin_handler.handler()
                test.is_nil(err)
                local payload = fake_http.payload()
                test.eq(payload.success, true)
                local found = false
                for _, item in ipairs(payload.profiles) do
                    if item.id == "secret-decode-fixture" then
                        found = true
                        test.not_nil(item.error)
                    end
                end
                test.eq(found, true)
            end)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
