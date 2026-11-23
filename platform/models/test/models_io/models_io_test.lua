-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Contract: GET /models/export and POST /models/import.
--
-- The export document carries provider profiles (env pointers, never secret
-- values) and the stored model cards. Importing it upserts through the module's
-- own cleaning and persistence in one transaction and reports what changed.
local test = require("test")
local json = require("json")
local sql = require("sql")
local registry = require("registry")
local security = require("security")
local fake_http = require("fake_http")
local export_handler = require("export_handler")
local import_handler = require("import_handler")
local models_repo = require("models_repo")
local discovery = require("discovery")
local model_catalog = require("model_catalog")
local policy = require("catalog_policy")

local COMPAT = "wippy.llm.openai_compat:provider"
local SECRET_VALUE = "synthetic-secret-value-0001"
local NESTED_SECRET = "synthetic-nested-secret-0002"
local PROFILES = { "io-env-gateway", "io-keyed-gateway", "io-paused-gateway" }

local function export_document(): (any, string)
    fake_http.prepare(nil)
    export_handler.handler()
    test.eq(fake_http.status(), 200, "export status")
    local payload = fake_http.payload()
    test.not_nil(payload, "export wrote no response")
    local raw, err = json.encode(payload)
    test.is_nil(err, "encode export")
    return payload, raw
end

local function post_import(body: any): (number, any)
    local raw = body
    if type(body) == "table" then
        local encoded, err = json.encode(body)
        test.is_nil(err, "encode import body")
        raw = encoded
    end
    fake_http.prepare(raw)
    import_handler.handler()
    return fake_http.status(), fake_http.payload()
end

local function find(list: any, key: string, value: string): any
    for _, item in ipairs(list or {}) do
        if item[key] == value then return item end
    end
    return nil
end

local function has(list: any, value: string): boolean
    for _, item in ipairs(list or {}) do
        if item == value then return true end
    end
    return false
end

local function count_rows(): (integer, integer)
    local db, err = sql.get("app:db")
    test.is_nil(err)
    db = assert(db)
    local p = db:query("SELECT COUNT(*) AS n FROM kickside_model_provider_profiles", {})
    local c = db:query("SELECT COUNT(*) AS n FROM kickside_model_cards", {})
    db:release()
    return math.floor(tonumber(p[1].n) or 0), math.floor(tonumber(c[1].n) or 0)
end

local function updated_at(table_name: string, key: string, value: string): any
    local db, err = sql.get("app:db")
    test.is_nil(err)
    db = assert(db)
    local rows = db:query("SELECT updated_at FROM " .. table_name .. " WHERE " .. key .. " = $1", { value })
    db:release()
    return rows[1] and tonumber(rows[1].updated_at)
end

local function remove_fixtures(): ()
    for _, id in ipairs(PROFILES) do models_repo.delete_profile(id) end
    models_repo.delete_card("io-unbound-card")
    models_repo.delete_card("io-legacy-card")
end

local function seed(): ()
    local env_profile, env_err = models_repo.create_profile({
        id = "io-env-gateway", name = "IO Env Gateway", provider_id = COMPAT,
        config = {
            base_url = "https://gateway.example.invalid/v1", api_key_env = "IO_GATEWAY_API_KEY", timeout = 30,
            extra = { password = NESTED_SECRET, label = "edge" },
        },
        retry = { attempts = 2, backoff_ms = 100 },
    })
    test.is_nil(env_err, "seed env profile")
    test.eq(env_profile.id, "io-env-gateway")

    local keyed, keyed_err = models_repo.create_profile({
        id = "io-keyed-gateway", name = "IO Keyed Gateway", provider_id = COMPAT,
        base_url = "https://keyed.example.invalid/v1", api_key = SECRET_VALUE,
    })
    test.is_nil(keyed_err, "seed keyed profile")
    test.eq(keyed.has_api_key, true)

    local paused, paused_err = models_repo.create_profile({
        id = "io-paused-gateway", name = "IO Paused Gateway", provider_id = COMPAT,
        base_url = "https://paused.example.invalid/v1", api_key_env = "IO_PAUSED_API_KEY",
    })
    test.is_nil(paused_err, "seed paused profile")
    test.eq(paused.id, "io-paused-gateway")

    for _, card in ipairs({
        {
            name = "io-env-gateway/synthetic-chat", title = "Synthetic Chat", description = "Chat model.",
            provider_id = COMPAT, provider_profile_id = "io-env-gateway", provider_model = "synthetic-chat",
            capabilities = { "generate", "tool_use" }, classes = { "fast", "balanced" }, priority = 70,
            max_tokens = 64000, output_tokens = 8000, pricing = { input = 1, output = 2 },
            options = { temperature = 0 }, metadata = { family = "synthetic" }, source = "discovered", enabled = true,
        },
        {
            name = "io-env-gateway/synthetic-embed", provider_id = COMPAT, provider_profile_id = "io-env-gateway",
            provider_model = "synthetic-embed", capabilities = { "embed" }, classes = { "embed" },
            max_tokens = 8192, dimensions = 512, enabled = true,
        },
        {
            name = "io-keyed-gateway/synthetic-off", provider_id = COMPAT, provider_profile_id = "io-keyed-gateway",
            provider_model = "synthetic-off", capabilities = { "generate" }, enabled = false,
        },
        {
            name = "io-paused-gateway/synthetic-held", provider_id = COMPAT, provider_profile_id = "io-paused-gateway",
            provider_model = "synthetic-held", capabilities = { "generate" }, classes = { "premium" },
            max_tokens = 32000, output_tokens = 4000, enabled = true,
        },
        {
            name = "io-unbound-card", provider_id = COMPAT, provider_model = "synthetic-unbound",
            capabilities = { "generate" }, max_tokens = 16000, output_tokens = 2000, enabled = true,
        },
    }) do
        local saved, save_err = models_repo.upsert_card(card)
        test.is_nil(save_err, "seed card " .. card.name)
        test.not_nil(saved)
    end

    local _, disable_err = models_repo.update_profile("io-paused-gateway", { enabled = false })
    test.is_nil(disable_err, "disable paused profile")
end

-- An enabled card stored without token limits, as registry overlays and rows
-- saved before the limits rule can be.
local function seed_legacy_card(): ()
    local db, db_err = sql.get("app:db")
    test.is_nil(db_err)
    db = assert(db)
    local _, legacy_err = db:execute([[
        INSERT INTO kickside_model_cards (name, title, provider_id, provider_model, enabled, created_at, updated_at)
        VALUES ('io-legacy-card', 'Legacy', $1, 'synthetic-legacy', 1, 1, 1)
    ]], { COMPAT })
    db:release()
    test.is_nil(legacy_err, "seed legacy card")
    local _, reload_err = models_repo.reload()
    test.is_nil(reload_err)
end

local function scenario(fn: () -> ()): ()
    remove_fixtures()
    local ok, err = pcall(function()
        seed()
        fn()
    end)
    remove_fixtures()
    if not ok then error(err, 0) end
end

local function encoded(value: any): string
    local raw, err = json.encode(value)
    test.is_nil(err, "encode")
    return raw :: string
end

local function without_secret_fields(doc: any): any
    local text = encoded(doc)
    local copy, decode_err = json.decode(text)
    assert(copy, decode_err)
    for _, profile in ipairs(copy.profiles or {}) do profile.secret_fields = nil end
    return copy
end

local function define_tests()
    test.describe("Exporting the model setup", function()
        test.it("exports profiles with env pointers and stored cards with their settings", function()
            scenario(function()
                local doc = export_document()
                test.eq(doc.version, 1)

                local env_profile = find(doc.profiles, "id", "io-env-gateway")
                test.not_nil(env_profile, "env profile exported")
                test.eq(env_profile.name, "IO Env Gateway")
                test.eq(env_profile.provider_id, COMPAT)
                test.eq(env_profile.enabled, true)
                test.eq(env_profile.config.api_key_env, "IO_GATEWAY_API_KEY")
                test.eq(env_profile.config.base_url, "https://gateway.example.invalid/v1")
                test.eq(env_profile.config.retry.attempts, 2)
                test.eq(#env_profile.secret_fields, 1)
                test.eq(env_profile.secret_fields[1], "extra")
                test.is_nil(env_profile.status)
                test.is_nil(env_profile.created_at)

                local paused = find(doc.profiles, "id", "io-paused-gateway")
                test.eq(paused.enabled, false)

                local chat = find(doc.cards, "name", "io-env-gateway/synthetic-chat")
                test.not_nil(chat, "chat card exported")
                test.eq(chat.provider_profile_id, "io-env-gateway")
                test.eq(chat.provider_model, "synthetic-chat")
                test.is_true(has(chat.capabilities, "tool_use"))
                test.is_true(has(chat.class, "balanced"))
                test.eq(chat.priority, 70)
                test.eq(chat.max_tokens, 64000)
                test.eq(chat.output_tokens, 8000)
                test.eq(chat.options.temperature, 0)
                test.eq(chat.metadata.family, "synthetic")
                test.eq(chat.source, "discovered")
                test.eq(chat.enabled, true)
                test.is_nil(chat.error)

                test.eq(find(doc.cards, "name", "io-keyed-gateway/synthetic-off").enabled, false)
                test.eq(find(doc.cards, "name", "io-paused-gateway/synthetic-held").enabled, true,
                    "a card keeps its own flag when its profile is disabled")
                test.is_nil(model_catalog.get_by_name("io-paused-gateway/synthetic-held"))
                test.is_nil(find(models_repo.list_cards(), "name", "io-paused-gateway/synthetic-held"))
                test.not_nil(find(models_repo.list_cards(), "name", "io-env-gateway/synthetic-chat"))
            end)
        end)

        test.it("scrubs nested configuration stored by earlier releases using the shared credential rules", function()
            scenario(function()
                local nested = { label = "edge", token_budget = 4096, maxTokens = 8192,
                    password = NESTED_SECRET, vendorAPIKey = NESTED_SECRET, access_key = NESTED_SECRET,
                    token_budget_secret = NESTED_SECRET, api_key_env = "NESTED_API_KEY",
                    items = { { access_token = NESTED_SECRET, access_token_env = "NESTED_TOKEN", token_count = 7 } } }
                local db = assert(sql.get("app:db"))
                local _, err = db:execute("UPDATE kickside_model_provider_profiles SET config_json = $1 WHERE id = $2",
                    { encoded({ extra = nested }), "io-env-gateway" })
                local _, pricing_err = db:execute("UPDATE kickside_model_cards SET pricing_json = $1 WHERE name = $2",
                    { encoded({ prompt = 1, vendor = { api_key = NESTED_SECRET } }), "io-env-gateway/synthetic-chat" })
                db:release()
                test.is_nil(err)
                test.is_nil(pricing_err)
                local doc, raw = export_document()
                test.is_nil(raw:find(NESTED_SECRET, 1, true), "stored nested credential exported")
                test.eq(find(doc.cards, "name", "io-env-gateway/synthetic-chat").pricing.prompt, 1)
                local config = find(doc.profiles, "id", "io-env-gateway").config.extra
                test.eq(config.label, "edge")
                test.eq(config.token_budget, 4096)
                test.eq(config.maxTokens, 8192)
                test.eq(config.api_key_env, "NESTED_API_KEY")
                test.eq(config.items[1].access_token_env, "NESTED_TOKEN")
                test.eq(config.items[1].token_count, 7)
            end)
        end)

        test.it("uses reload availability without evaluating profile state during resolution", function()
            scenario(function()
                local snap = assert(models_repo.reload())
                test.eq(find(snap.cards, "name", "io-env-gateway/synthetic-chat").enabled, true)
                test.eq(find(snap.cards, "name", "io-keyed-gateway/synthetic-off").enabled, false)
                test.eq(find(snap.cards, "name", "io-paused-gateway/synthetic-held").enabled, false)
                local original = catalog_policy.provider_context
                local calls = 0
                catalog_policy.provider_context = function(profile)
                    calls = calls + 1
                    return original(profile)
                end
                local ok, err = pcall(function()
                    for _ = 1, 1000 do
                        test.not_nil(model_catalog.resolve("io-env-gateway/synthetic-chat"))
                        test.not_nil(model_catalog.resolve("class:balanced"))
                    end
                    test.eq(calls, 0, "resolution repeats effective availability checks")
                end)
                catalog_policy.provider_context = original
                if not ok then error(err, 0) end
            end)
        end)

        test.it("never exports a stored secret and names what it omitted", function()
            scenario(function()
                local doc, raw = export_document()
                test.is_nil(raw:find(SECRET_VALUE, 1, true), "secret value leaked into the export")
                test.is_nil(raw:find(NESTED_SECRET, 1, true), "nested secret config leaked into the export")
                test.eq(find(doc.profiles, "id", "io-env-gateway").config.extra.label, "edge")
                local stored = models_repo.get_profile("io-env-gateway")
                test.eq(stored.config.extra.label, "edge")
                test.is_nil(stored.config.extra.password, "a nested secret is never stored in plain config")
                local keyed = find(doc.profiles, "id", "io-keyed-gateway")
                test.not_nil(keyed)
                test.is_nil(keyed.config.api_key)
                test.is_nil(keyed.api_key)
                test.eq(#keyed.secret_fields, 1)
                test.eq(keyed.secret_fields[1], "api_key")
            end)
        end)
    end)

    test.describe("Importing the model setup", function()
        test.it("reproduces the exported profiles and cards in an emptied database", function()
            scenario(function()
                assert(models_repo.upsert_card({
                    name = "io-legacy-card", provider_id = COMPAT, capabilities = { "generate" },
                    enabled = true, metadata = { discovered = { context_length = 8192 } },
                }))
                local first = export_document()
                local unconfigured = find(first.cards, "name", "io-legacy-card")
                test.is_nil(unconfigured.max_tokens, "discovered limit is not a stored override")
                test.is_nil(unconfigured.output_tokens)
                remove_fixtures()
                test.is_nil(find(export_document().profiles, "id", "io-env-gateway"))

                local status, result = post_import(first)
                test.eq(status, 200, "import failed: " .. tostring(result and result.error))
                test.eq(result.success, true)
                for _, id in ipairs(PROFILES) do
                    test.is_true(has(result.profiles.created, id), "profile created: " .. id)
                end
                for _, name in ipairs({ "io-env-gateway/synthetic-chat", "io-paused-gateway/synthetic-held", "io-unbound-card", "io-legacy-card" }) do
                    test.is_true(has(result.cards.created, name), "card created: " .. name)
                end

                local second = export_document()
                test.eq(encoded(without_secret_fields(second)), encoded(without_secret_fields(first)))
                test.is_nil(find(second.profiles, "id", "io-keyed-gateway").secret_fields)

                local resolved, resolve_err = model_catalog.resolve("io-env-gateway/synthetic-chat")
                test.is_nil(resolve_err)
                test.eq(resolved.providers[1].context.api_key_env, "IO_GATEWAY_API_KEY")
                local held = model_catalog.resolve("io-paused-gateway/synthetic-held")
                test.is_nil(held, "a card of a disabled profile stays unresolvable")
                local derived = assert(model_catalog.resolve("io-legacy-card"))
                test.eq(derived.max_tokens, 8192, "the receiving catalog derives the context limit")
                test.is_nil(derived.output_tokens)
            end)
        end)

        test.it("changes nothing when the same document is imported again", function()
            scenario(function()
                seed_legacy_card()
                local doc = export_document()
                local profile_stamp = updated_at("kickside_model_provider_profiles", "id", "io-env-gateway")
                local card_stamp = updated_at("kickside_model_cards", "name", "io-env-gateway/synthetic-chat")
                local status, result = post_import(doc)
                test.eq(status, 200, "import failed: " .. tostring(result and result.error))
                test.eq(#result.profiles.created + #result.profiles.updated, 0)
                test.eq(#result.cards.created + #result.cards.updated, 0)
                test.is_true(has(result.profiles.unchanged, "io-keyed-gateway"))
                test.is_true(has(result.cards.unchanged, "io-paused-gateway/synthetic-held"))
                test.is_true(has(result.cards.unchanged, "io-legacy-card"), "a stored enabled card without limits re-imports unchanged")
                test.eq(updated_at("kickside_model_provider_profiles", "id", "io-env-gateway"), profile_stamp)
                test.eq(updated_at("kickside_model_cards", "name", "io-env-gateway/synthetic-chat"), card_stamp)
                test.eq(encoded(export_document()), encoded(doc))
            end)
        end)

        test.it("keeps a stored secret and reports changed items as updated", function()
            scenario(function()
                local doc = export_document()
                find(doc.profiles, "id", "io-keyed-gateway").config.timeout = 45
                find(doc.cards, "name", "io-env-gateway/synthetic-chat").class = { "premium" }
                local status, result = post_import(doc)
                test.eq(status, 200, "import failed: " .. tostring(result and result.error))
                test.eq(#result.profiles.updated, 1)
                test.eq(result.profiles.updated[1], "io-keyed-gateway")
                test.eq(#result.cards.updated, 1)
                test.eq(result.cards.updated[1], "io-env-gateway/synthetic-chat")
                local keyed = models_repo.get_profile("io-keyed-gateway")
                test.eq(keyed.secret_config.api_key, SECRET_VALUE)
                test.eq(keyed.config.timeout, 45)
            end)
        end)

        test.it("keeps every omitted setting when importing only a profile timeout", function()
            scenario(function()
                local before = assert(models_repo.get_profile("io-env-gateway"))
                local config_text = encoded(before.config)
                local expected, decode_err = json.decode(config_text)
                assert(expected, decode_err)
                expected.timeout = 47
                local reload = models_repo.reload
                local reloads = 0
                models_repo.reload = function()
                    reloads = reloads + 1
                    return reload()
                end
                local ok, err = pcall(function()
                    local status, result = post_import({ version = 1, profiles = {
                        { id = before.id, config = { timeout = 47 } },
                    } })
                    test.eq(status, 200, tostring(result and result.error))
                    test.eq(reloads, 1, "import reads a separate snapshot before its write transaction")
                    test.eq(#result.profiles.updated, 1)
                    local after = assert(models_repo.get_profile(before.id))
                    test.eq(after.name, before.name)
                    test.eq(after.provider_id, before.provider_id)
                    test.eq(after.enabled, before.enabled)
                    test.is_true(policy.same_value(after.config, expected), "import drops an omitted configuration setting")
                    test.is_true(policy.same_value(after.secret_config, before.secret_config), "import changes omitted credentials")
                    test.eq(after.status, before.status)
                    test.eq(after.message, before.message)
                    test.eq(after.last_discovered_at, before.last_discovered_at)
                    test.eq(after.created_at, before.created_at)
                end)
                models_repo.reload = reload
                if not ok then error(err, 0) end
            end)
        end)

        test.it("keeps nested credentials and their ciphertext while importing public configuration", function()
            scenario(function()
                local doc = export_document()
                local profile = find(doc.profiles, "id", "io-env-gateway")
                profile.config.extra.label = "updated edge"
                local db = assert(sql.get("app:db"))
                local before = assert(db:query("SELECT secret_json FROM kickside_model_provider_profiles WHERE id = $1",
                    { profile.id }))[1].secret_json
                db:release()
                local status, result = post_import(doc)
                test.eq(status, 200, tostring(result and result.error))
                test.is_true(has(result.profiles.updated, profile.id))
                local stored = assert(models_repo.get_profile(profile.id))
                test.eq(stored.config.extra.label, "updated edge")
                test.eq(stored.secret_config.extra.password, NESTED_SECRET)
                db = assert(sql.get("app:db"))
                local after = assert(db:query("SELECT secret_json FROM kickside_model_provider_profiles WHERE id = $1",
                    { profile.id }))[1].secret_json
                db:release()
                test.eq(after, before, "public import rewrites nested credential ciphertext")
                profile.config.extra.password = "synthetic-imported-password"
                local rejected = post_import(doc)
                test.eq(rejected, 400, "import accepts a nested credential")
                test.eq(assert(models_repo.get_profile(profile.id)).secret_config.extra.password, NESTED_SECRET)
            end)
        end)

        test.it("preserves rotated ciphertext even when the merge sees an older credential", function()
            scenario(function()
                local doc = export_document()
                find(doc.profiles, "id", "io-keyed-gateway").config.timeout = 46
                local rotated = assert(policy.encrypt_secret({ api_key = "test-test-test-0003" }))
                local db = assert(sql.get("app:db"))
                local _, write_err = db:execute("UPDATE kickside_model_provider_profiles SET secret_json = $1 WHERE id = $2",
                    { rotated, "io-keyed-gateway" })
                db:release()
                test.is_nil(write_err)
                local clean = policy.clean_profile_input
                local injected = false
                policy.clean_profile_input = function(input, existing, secret_config)
                    if input.id == "io-keyed-gateway" and secret_config.api_key == "test-test-test-0003" then
                        injected = true
                        secret_config = { api_key = SECRET_VALUE }
                    end
                    return clean(input, existing, secret_config)
                end
                local ok, err = pcall(function()
                    local status, result = post_import(doc)
                    test.eq(status, 200, tostring(result and result.error))
                    test.is_true(injected, "merge must see the older credential context")
                    local db = assert(sql.get("app:db"))
                    local rows, read_err = db:query("SELECT secret_json FROM kickside_model_provider_profiles WHERE id = $1",
                        { "io-keyed-gateway" })
                    db:release()
                    test.is_nil(read_err)
                    test.eq(rows[1].secret_json, rotated, "config import rewrites rotated ciphertext")
                    local profile = models_repo.get_profile("io-keyed-gateway")
                    test.eq(profile.secret_config.api_key, "test-test-test-0003")
                    test.eq(profile.config.timeout, 46)
                end)
                policy.clean_profile_input = clean
                if not ok then error(err, 0) end
            end)
        end)

        test.it("keeps a concurrent omitted setting and rolls back a stale import", function()
            scenario(function()
                local id = "io-env-gateway"
                local previous = assert(models_repo.get_profile(id))
                local config = previous.config
                local initial_timeout = config.timeout
                config.extra.label = "concurrent label"
                local handle = assert(sql.get("app:db"))
                local postgres = handle:type() == sql.type.POSTGRES
                handle:release()

                local function update_config()
                    local db = assert(sql.get("app:db"))
                    local _, err = db:execute("UPDATE kickside_model_provider_profiles SET config_json = $1 WHERE id = $2",
                        { encoded(config), id })
                    db:release()
                    test.is_nil(err)
                end

                local document = {
                    version = export_document().version,
                    profiles = {
                        { id = "io-import-concurrent", name = "Concurrent import", provider_id = previous.provider_id,
                            config = config },
                        { id = id, config = { timeout = 46 } },
                    },
                }
                local clean = policy.clean_profile_input
                if postgres then
                    -- Commit a configuration update after the importer reads
                    -- its snapshot, on a separate PostgreSQL connection.
                    policy.clean_profile_input = function(input, existing, secrets)
                        if input.id == id then update_config() end
                        return clean(input, existing, secrets)
                    end
                else
                    -- SQLite serializes access to the application connection.
                    update_config()
                end
                local ok, imported = pcall(function()
                    local status, result = post_import(document)
                    return { status = status, result = result }
                end)
                policy.clean_profile_input = clean
                if not ok then error(imported, 0) end
                local result = imported.result
                test.eq(imported.status, postgres and 400 or 200, tostring(result and result.error))

                assert(models_repo.reload())
                local after = assert(models_repo.get_profile(id))
                test.eq(after.config.extra.label, "concurrent label")
                test.eq(after.config.timeout, postgres and initial_timeout or 46)
                if postgres then
                    test.is_false(result.committed)
                    test.is_nil(models_repo.get_profile("io-import-concurrent"))
                else
                    test.not_nil(models_repo.get_profile("io-import-concurrent"))
                end
            end)
        end)

        test.it("keeps capability overrides through export, import and rediscovery", function()
            scenario(function()
                local original_adapter = discovery.adapter_for
                local inferred = { "generate", "vision" }
                discovery.adapter_for = function() return {
                    fetch = function() return { { id = "synthetic-owned", context_length = 8192,
                        max_output_tokens = 1024, pricing = { prompt = "0" } } }, nil end,
                    capabilities = function() return inferred end,
                } end
                local ok, err = pcall(function()
                    local function discover(capabilities: { string }): any
                        inferred = capabilities
                        local result, discovery_err = discovery.discover("io-env-gateway")
                        test.is_nil(discovery_err, "discover")
                        return find(result.models, "provider_model", "synthetic-owned")
                    end
                    local card = discover({ "generate", "vision" })
                    local _, save_err = models_repo.upsert_card({ name = card.name,
                        capabilities = { "generate", "structured_output" } })
                    test.is_nil(save_err, "override capabilities")

                    local doc = export_document()
                    remove_fixtures()
                    local status, result = post_import(doc)
                    test.eq(status, 200, "import failed: " .. tostring(result and result.error))
                    test.is_true(has(result.cards.created, card.name))

                    card = discover({ "generate", "vision", "tool_use" })
                    test.eq(table.concat(card.capabilities, ","), "generate,tool_use,structured_output",
                        "the removal of vision and the addition of structured_output survive the round trip")
                    local saved = models_repo.upsert_card({ name = card.name, reset_capabilities = { "vision" } })
                    test.eq(table.concat(saved.capabilities, ","), "generate,vision,tool_use,structured_output",
                        "an imported override resets to discovery")
                end)
                discovery.adapter_for = original_adapter
                if not ok then error(err, 0) end
            end)
        end)

        test.it("refuses an invalid document without writing any of it", function()
            scenario(function()
                local before_profiles, before_cards = count_rows()
                local valid_profile = {
                    id = "io-fresh-gateway", name = "IO Fresh Gateway", provider_id = COMPAT,
                    enabled = true, config = { base_url = "https://fresh.example.invalid/v1" },
                }
                local valid_card = {
                    name = "io-fresh-gateway/fresh", provider_id = COMPAT, provider_profile_id = "io-fresh-gateway",
                    provider_model = "fresh", capabilities = { "generate" }, max_tokens = 1000, output_tokens = 100, enabled = true,
                }
                local stamp = updated_at("kickside_model_provider_profiles", "id", "io-env-gateway")
                local changed_existing = {
                    id = "io-env-gateway", name = "IO Env Gateway Renamed", provider_id = COMPAT, enabled = true, config = {},
                }
                for label, body in pairs({
                    not_json = "{not json",
                    not_object = "[]",
                    wrong_version = { version = 2, profiles = { valid_profile }, cards = {} },
                    lists_required = { version = 1, profiles = "io-fresh-gateway" },
                    unknown_provider = { version = 1, profiles = { changed_existing, valid_profile, {
                        id = "io-bad-provider", name = "Bad", provider_id = "synthetic.unknown:provider", config = {},
                    } }, cards = { valid_card } },
                    unslugged_id = { version = 1, profiles = { valid_profile, {
                        id = "IO Bad Id", name = "Bad", provider_id = COMPAT, config = {},
                    } }, cards = {} },
                    carries_secret = { version = 1, profiles = { valid_profile, {
                        id = "io-env-gateway", name = "IO Env Gateway", provider_id = COMPAT, api_key = "synthetic-import-secret",
                    } }, cards = {} },
                    clears_secret = { version = 1, profiles = { {
                        id = "io-keyed-gateway", name = "IO Keyed Gateway", provider_id = COMPAT, clear_api_key = true,
                    } }, cards = {} },
                    clears_access_key = { version = 1, profiles = { {
                        id = "io-keyed-gateway", name = "IO Keyed Gateway", provider_id = COMPAT, clear_access_key = true,
                    } }, cards = {} },
                    card_carries_secret = { version = 1, profiles = { valid_profile }, cards = { {
                        name = "io-fresh-gateway/fresh", provider_profile_id = "io-fresh-gateway", provider_id = COMPAT,
                        pricing = { vendor = { access_key = NESTED_SECRET } },
                    } } },
                    card_credential_url = { version = 1, profiles = { valid_profile }, cards = { {
                        name = "io-fresh-gateway/fresh", provider_profile_id = "io-fresh-gateway", provider_id = COMPAT,
                        options = { route = { base_url = "https://url.example.invalid/v1?api_key=" .. NESTED_SECRET } },
                    } } },
                    provider_mismatch = { version = 1, profiles = { valid_profile }, cards = { {
                        name = "io-fresh-gateway/other", provider_id = "wippy.llm.openai:provider", provider_profile_id = "io-fresh-gateway",
                        provider_model = "other", capabilities = { "embed" }, max_tokens = 100, enabled = true,
                    } } },
                    credential_url = { version = 1, profiles = { valid_profile, {
                        id = "io-url-gateway", name = "IO URL Gateway", provider_id = COMPAT,
                        config = { base_url = "https://synthetic-user:synthetic-pass@url.example.invalid/v1" },
                    } }, cards = {} },
                    duplicate_profile = { version = 1, profiles = { valid_profile, valid_profile }, cards = {} },
                    duplicate_card = { version = 1, profiles = { valid_profile }, cards = { valid_card, valid_card } },
                    malformed_ownership = { version = 1, profiles = { changed_existing, valid_profile }, cards = { valid_card, {
                        name = "io-fresh-gateway/owned", provider_id = COMPAT, provider_profile_id = "io-fresh-gateway",
                        provider_model = "owned", capabilities = { "generate" }, max_tokens = 100, output_tokens = 10, enabled = true,
                        capability_ownership = { inferred = { "generate" }, overrides = { vision = "yes" } },
                    } } },
                    card_without_profile = { version = 1, profiles = { valid_profile }, cards = { valid_card, {
                        name = "io-ghost/model", provider_id = COMPAT, provider_profile_id = "io-ghost-gateway",
                        provider_model = "model", capabilities = { "embed" }, max_tokens = 100, enabled = true,
                    } } },
                }) do
                    local status, result = post_import(body)
                    test.eq(status, 400, label .. ": expected refusal")
                    test.eq(result.success, false, label)
                    test.eq(type(result.error), "string", label)
                    local after_profiles, after_cards = count_rows()
                    test.eq(after_profiles, before_profiles, label .. ": profile rows written")
                    test.eq(after_cards, before_cards, label .. ": card rows written")
                    test.eq(updated_at("kickside_model_provider_profiles", "id", "io-env-gateway"), stamp, label .. ": existing profile written")
                end
                test.is_nil(models_repo.get_profile("io-fresh-gateway"))
                test.eq(models_repo.get_profile("io-env-gateway").name, "IO Env Gateway")
            end)
        end)
    end)

    test.describe("Credentials in profile URLs", function()
        local URL_SECRET = "synthetic-url-secret-0003"

        local function remove_url_profiles(): ()
            models_repo.delete_profile("io-url-gateway")
            models_repo.delete_profile("io-url-legacy")
        end

        test.it("refuses to store a URL that carries credentials, at any config depth", function()
            remove_url_profiles()
            for label, config in pairs({
                userinfo = { base_url = "https://synthetic-user:" .. URL_SECRET .. "@url.example.invalid/v1" },
                user_only = { base_url = "https://" .. URL_SECRET .. "@url.example.invalid/v1" },
                api_key_query = { base_url = "https://url.example.invalid/v1?api_key=" .. URL_SECRET },
                key_query = { base_url = "https://url.example.invalid/v1?alt=json&key=" .. URL_SECRET },
                token_query = { model_list_url = "https://url.example.invalid/models?access_token=" .. URL_SECRET },
                nested = { extra = { endpoint = "https://url.example.invalid/v1?sig=1&password=" .. URL_SECRET } },
            }) do
                local profile, err = models_repo.create_profile({
                    id = "io-url-gateway", name = "IO URL Gateway", provider_id = COMPAT, config = config,
                })
                test.is_nil(profile, label .. ": stored")
                test.not_nil(err, label)
                test.not_nil(tostring(err):find("_env", 1, true), label .. ": error points to *_env: " .. tostring(err))
                test.is_nil(tostring(err):find(URL_SECRET, 1, true), label .. ": error echoes the secret")
            end
            test.is_nil(models_repo.get_profile("io-url-gateway"))

            local plain, plain_err = models_repo.create_profile({
                id = "io-url-gateway", name = "IO URL Gateway", provider_id = COMPAT,
                base_url = "https://url.example.invalid/v1?api-version=2024-01-01#top",
            })
            test.is_nil(plain_err, "a URL without credentials is stored")
            test.not_nil(plain)
            local updated, update_err = models_repo.update_profile("io-url-gateway", {
                base_url = "https://synthetic-user:" .. URL_SECRET .. "@url.example.invalid/v1",
            })
            test.is_nil(updated)
            test.not_nil(update_err)
            test.eq(models_repo.get_profile("io-url-gateway").config.base_url, "https://url.example.invalid/v1?api-version=2024-01-01#top")
            remove_url_profiles()
        end)

        test.it("refuses to export a stored profile whose URL carries credentials", function()
            remove_url_profiles()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            db = assert(db)
            local _, insert_err = db:execute([[
                INSERT INTO kickside_model_provider_profiles
                    (id, name, provider_id, config_json, secret_json, enabled, status, message, created_at, updated_at)
                VALUES ('io-url-legacy', 'IO URL Legacy', $1, $2, '', 1, 'unknown', '', 1, 1)
            ]], { COMPAT, encoded({ base_url = "https://synthetic-user:" .. URL_SECRET .. "@legacy.example.invalid/v1" }) })
            db:release()
            test.is_nil(insert_err)
            local ok, err = pcall(function()
                fake_http.prepare(nil)
                export_handler.handler()
                test.eq(fake_http.status(), 500)
                local payload = fake_http.payload()
                test.eq(payload.success, false)
                test.not_nil(tostring(payload.error):find("io-url-legacy", 1, true), "error names the profile")
                test.is_nil(encoded(payload):find(URL_SECRET, 1, true), "secret leaked into the refusal")
            end)
            remove_url_profiles()
            if not ok then error(err, 0) end
        end)
    end)

    test.describe("Import and export are administrator endpoints", function()
        test.it("declares both endpoints in the admin namespace and refuses them to members", function()
            local policy, err = security.policy("kickside.models.security:models_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local member = security.new_actor("module-member", {})
            for id, route in pairs({
                ["kickside.models.api.admin:export.endpoint"] = { "GET", "/models/export" },
                ["kickside.models.api.admin:import.endpoint"] = { "POST", "/models/import" },
            }) do
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err, id)
                test.not_nil(entry, id)
                test.eq(entry.kind, "http.endpoint", id)
                test.eq(entry.data.method, route[1], id)
                test.eq(entry.data.path, route[2], id)
                test.eq(entry.meta.router, "app:api", id .. " attaches to the host api router")
                test.eq(policy:evaluate(member, "access", id, nil), "undefined", id .. " must not be granted to members")
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
