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
local model_catalog = require("model_catalog")

local COMPAT = "wippy.llm.openai_compat:provider"
local SECRET_VALUE = "synthetic-secret-value-0001"
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
end

local function seed(): ()
    local env_profile, env_err = models_repo.create_profile({
        id = "io-env-gateway", name = "IO Env Gateway", provider_id = COMPAT,
        config = {
            base_url = "https://gateway.example.invalid/v1", api_key_env = "IO_GATEWAY_API_KEY", timeout = 30,
            extra = { label = "edge" },
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
    local copy = json.decode(encoded(doc))
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
                test.is_nil(env_profile.secret_fields)
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

        test.it("never exports a stored secret and names what it omitted", function()
            scenario(function()
                local doc, raw = export_document()
                test.is_nil(raw:find(SECRET_VALUE, 1, true), "secret value leaked into the export")
                test.eq(find(doc.profiles, "id", "io-env-gateway").config.extra.label, "edge")
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
                local first = export_document()
                remove_fixtures()
                test.is_nil(find(export_document().profiles, "id", "io-env-gateway"))

                local status, result = post_import(first)
                test.eq(status, 200, "import failed: " .. tostring(result and result.error))
                test.eq(result.success, true)
                for _, id in ipairs(PROFILES) do
                    test.is_true(has(result.profiles.created, id), "profile created: " .. id)
                end
                for _, name in ipairs({ "io-env-gateway/synthetic-chat", "io-paused-gateway/synthetic-held", "io-unbound-card" }) do
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
                local _, enable_err = models_repo.update_profile("io-paused-gateway", { enabled = true })
                test.is_nil(enable_err, "enable imported paused profile")
                local resumed, resumed_err = model_catalog.resolve("io-paused-gateway/synthetic-held")
                test.is_nil(resumed_err)
                test.not_nil(resumed, "an imported card serves once its profile is enabled, as on the source")
            end)
        end)

        test.it("changes nothing when the same document is imported again", function()
            scenario(function()
                local doc = export_document()
                local profile_stamp = updated_at("kickside_model_provider_profiles", "id", "io-env-gateway")
                local card_stamp = updated_at("kickside_model_cards", "name", "io-env-gateway/synthetic-chat")
                local status, result = post_import(doc)
                test.eq(status, 200, "import failed: " .. tostring(result and result.error))
                test.eq(#result.profiles.created + #result.profiles.updated, 0)
                test.eq(#result.cards.created + #result.cards.updated, 0)
                test.is_true(has(result.profiles.unchanged, "io-keyed-gateway"))
                test.is_true(has(result.cards.unchanged, "io-paused-gateway/synthetic-held"))
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
                    provider_mismatch = { version = 1, profiles = { valid_profile }, cards = { {
                        name = "io-fresh-gateway/other", provider_id = "wippy.llm.openai:provider", provider_profile_id = "io-fresh-gateway",
                        provider_model = "other", capabilities = { "embed" }, max_tokens = 100, enabled = true,
                    } } },
                    duplicate_profile = { version = 1, profiles = { valid_profile, valid_profile }, cards = {} },
                    duplicate_card = { version = 1, profiles = { valid_profile }, cards = { valid_card, valid_card } },
                    card_without_limits = { version = 1, profiles = { changed_existing, valid_profile }, cards = { valid_card, {
                        name = "io-fresh-gateway/limitless", provider_id = COMPAT, provider_profile_id = "io-fresh-gateway",
                        provider_model = "limitless", capabilities = { "generate" }, enabled = true,
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
