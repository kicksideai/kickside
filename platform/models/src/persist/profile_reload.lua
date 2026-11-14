-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local models_repo = require("models_repo")
local models_cache = require("models_cache")
local policy = require("catalog_policy")
local card_policy = require("catalog_card_policy")

local function reload(): (any?, any?)
    local handle, derr = models_repo.open_db()
    if not handle then return nil, derr end
    local dbh = handle :: sql.DB

    -- SPEC: Reloads serialize their SQL reads through cache publication. A later
    -- publication cannot contain rows read before the preceding publication.
    -- SQLite owns one application connection for the transaction's lifetime;
    -- PostgreSQL takes a transaction-scoped reload lock before either read.
    local tx, txerr = dbh:begin()
    if txerr or not tx then dbh:release(); return nil, txerr end
    local function fail(err: any): (any?, any?)
        tx:rollback()
        dbh:release()
        return nil, err
    end
    if dbh:type() == sql.type.POSTGRES then
        local _, lock_err = tx:query(
            "SELECT pg_advisory_xact_lock(hashtextextended('kickside.models.reload', 0))", {})
        if lock_err then return fail(lock_err) end
    end

    local profile_rows, perr = tx:query([[
        SELECT id, name, provider_id, config_json, secret_json, enabled, status, message,
               last_discovered_at, created_at, updated_at
        FROM kickside_model_provider_profiles
        ORDER BY name ASC
    ]], {})
    if perr then return fail(perr) end

    local profiles = {}
    local profiles_by_id = {}
    for _, row in ipairs(profile_rows or {}) do
        local r = row :: any
        local secret, secret_err = policy.decrypt_secret(r.secret_json)
        local config, config_err = policy.decode_json(r.config_json, {})
        local load_err = secret_err or config_err
        local profile = {
            id = r.id,
            name = r.name,
            provider_id = r.provider_id,
            config = config,
            secret_config = secret,
            enabled = tonumber(r.enabled) ~= 0 and load_err == nil,
            error = load_err and tostring(load_err) or nil,
            status = r.status,
            message = r.message,
            last_discovered_at = tonumber(r.last_discovered_at),
            created_at = tonumber(r.created_at),
            updated_at = tonumber(r.updated_at),
        }
        table.insert(profiles, profile)
        profiles_by_id[tostring(profile.id)] = profile
    end

    local card_rows, cerr = tx:query([[
        SELECT name, title, description, provider_id, provider_profile_id, provider_model,
               capabilities_json, classes_json, priority, max_tokens, output_tokens,
               dimensions, pricing_json, options_json, source, enabled, metadata_json,
               created_at, updated_at
        FROM kickside_model_cards
        ORDER BY name ASC
    ]], {})
    if cerr then return fail(cerr) end

    local cards = {}
    for _, row in ipairs(card_rows or {}) do
        local r = row :: any
        local profile = r.provider_profile_id and profiles_by_id[tostring(r.provider_profile_id)] or nil
        local card, card_err = card_policy.build_card(r, profile)
        if card_err then return fail(card_err) end
        table.insert(cards, card)
    end

    local snapshot = { profiles = profiles, cards = cards }
    models_cache.replace(snapshot)
    local _, commit_err = tx:commit()
    dbh:release()
    if commit_err then return nil, commit_err end
    return snapshot
end

local function run()
    local snapshot, err = reload()
    return { snapshot = snapshot, error = err }
end

return { run = run }
