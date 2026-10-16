-- Persistence for model provider profiles and DB-backed model cards. Owns the SQL
-- against kickside_model_provider_profiles / kickside_model_cards, the write-through
-- store.memory snapshot (reload/snapshot), and the profile.changed broadcast.
-- Input cleaning, scrubbing, and projections come from the catalog policy layer.

local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local models_types = require("models_types")
local models_cache = require("models_cache")
local policy = require("catalog_policy")
local card_policy = require("catalog_card_policy")

local M = {}

local function now(): integer
    return os.time() :: integer
end

local function db()
    local handle, err = sql.get(models_types.db_id())
    if err then return nil, err end
    if not handle then return nil, "models db unavailable" end
    return handle
end

function M.reload(): (any?, any?)
    local handle, derr = db()
    if not handle then return nil, derr end
    local dbh = handle :: sql.DB

    local profile_rows, perr = dbh:query([[
        SELECT id, name, provider_id, config_json, secret_json, enabled, status, message,
               last_discovered_at, created_at, updated_at
        FROM kickside_model_provider_profiles
        ORDER BY name ASC
    ]], {})
    if perr then dbh:release(); return nil, perr end

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

    local card_rows, cerr = dbh:query([[
        SELECT name, title, description, provider_id, provider_profile_id, provider_model,
               capabilities_json, classes_json, priority, max_tokens, output_tokens,
               dimensions, pricing_json, options_json, source, enabled, metadata_json,
               created_at, updated_at
        FROM kickside_model_cards
        ORDER BY name ASC
    ]], {})
    dbh:release()
    if cerr then return nil, cerr end

    local cards = {}
    for _, row in ipairs(card_rows or {}) do
        local r = row :: any
        local profile = r.provider_profile_id and profiles_by_id[tostring(r.provider_profile_id)] or nil
        local card, card_err = card_policy.build_card(r, profile)
        if card_err then return nil, card_err end
        table.insert(cards, card)
    end

    local snapshot = { profiles = profiles, cards = cards }
    models_cache.replace(snapshot)
    return snapshot
end

function M.snapshot(): (any?, any?)
    local cached = models_cache.read()
    if cached then return cached end
    return M.reload()
end

function M.list_profiles_public(): ({ any }?, any?)
    local snap, err = M.snapshot()
    if err then return nil, err end
    local out = {}
    for _, profile in ipairs(snap.profiles or {}) do
        table.insert(out, policy.public_profile(profile))
    end
    return out
end

function M.get_profile(id: string): (any?, any?)
    local snap, err = M.snapshot()
    if err then return nil, err end
    for _, profile in ipairs(snap.profiles or {}) do
        if profile.id == id then
            if profile.error then return nil, profile.error end
            return profile
        end
    end
    return nil
end

function M.get_profile_public(id: string): (any?, any?)
    local profile, err = M.get_profile(id)
    if err then return nil, err end
    return profile and policy.public_profile(profile) or nil
end

-- Announce a committed profile write on the profile.changed topic. Provider-owned
-- services subscribe and self-filter; the write path stays provider-agnostic.
-- Delivery runs in the profile_changed_signal function under the models
-- identity, so writing principals need no process messaging authority.
-- Overridable so tests can observe the emission. Returns whether a subscriber
-- was registered to receive it.
function M.emit_profile_changed(profile_id: any, provider_id: any, previous_provider_id: any?): (boolean, error?)
    local sent, call_err = funcs.call("kickside.models.persist:profile_changed_signal",
        { profile_id = profile_id, provider_id = provider_id, previous_provider_id = previous_provider_id })
    if call_err then return false, call_err end
    return sent == true, nil
end

function M.deliver_profile_changed(change: table): (boolean, error?)
    local pid, lookup_err = process.registry.lookup(models_types.VERTEX_TOKEN_SUPERVISOR_PROCESS, process.registry.LOCAL)
    if lookup_err then
        if errors.is(lookup_err, errors.NOT_FOUND) then return false, nil end
        return false, lookup_err
    end
    if not pid then return false, nil end
    local sent, send_err = process.send(tostring(pid), models_types.PROFILE_CHANGED_TOPIC, change)
    if send_err then return false, send_err end
    return sent == true, nil
end

function M.create_profile(input: any): (any?, any?)
    local cleaned, cerr = policy.clean_profile_input(input, nil)
    if not cleaned then return nil, cerr end

    local id = input.id
    if type(id) ~= "string" or id == "" then
        id = models_types.slug(cleaned.name)
    else
        id = models_types.slug(id)
    end

    local handle, derr = db()
    if not handle then return nil, derr end
    local dbh = handle :: sql.DB
    local existing = dbh:query("SELECT id FROM kickside_model_provider_profiles WHERE id = $1", { id })
    if existing and #existing > 0 then
        id = id .. "-" .. tostring(uuid.v4()):sub(1, 8)
    end
    local secret_json, serr = policy.encrypt_secret(cleaned.secret_config)
    if secret_json == nil then dbh:release(); return nil, serr end
    local ts = now()
    local _, err = dbh:execute([[
        INSERT INTO kickside_model_provider_profiles
            (id, name, provider_id, config_json, secret_json, enabled, status, message, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'unknown', '', $7, $8)
    ]], { id, cleaned.name, cleaned.provider_id, policy.encode_json(cleaned.config), secret_json, policy.bool_int(cleaned.enabled), ts, ts })
    dbh:release()
    if err then return nil, "profile create failed: " .. tostring(err) end
    local _, reload_err = M.reload()
    if reload_err then return nil, reload_err end
    local _, emit_err = M.emit_profile_changed(id, cleaned.provider_id, nil)
    if emit_err then return nil, "profile change notification failed: " .. tostring(emit_err) end
    return M.get_profile_public(id)
end

function M.update_profile(id: string, input: any): (any?, any?)
    local existing, read_err = M.get_profile(id)
    if read_err then return nil, read_err end
    if not existing then return nil, "profile not found" end
    local cleaned, cerr = policy.clean_profile_input(input, existing)
    if not cleaned then return nil, cerr end
    local secret_json, serr = policy.encrypt_secret(cleaned.secret_config)
    if secret_json == nil then return nil, serr end

    local handle, derr = db()
    if not handle then return nil, derr end
    local dbh = handle :: sql.DB
    local ts = now()
    local _, err = dbh:execute([[
        UPDATE kickside_model_provider_profiles
        SET name = $1, provider_id = $2, config_json = $3, secret_json = $4, enabled = $5, updated_at = $6
        WHERE id = $7
    ]], { cleaned.name, cleaned.provider_id, policy.encode_json(cleaned.config), secret_json, policy.bool_int(cleaned.enabled), ts, id })
    dbh:release()
    if err then return nil, "profile update failed: " .. tostring(err) end
    local _, reload_err = M.reload()
    if reload_err then return nil, reload_err end
    local _, emit_err = M.emit_profile_changed(id, cleaned.provider_id, existing.provider_id)
    if emit_err then return nil, "profile change notification failed: " .. tostring(emit_err) end
    return M.get_profile_public(id)
end

function M.delete_profile(id: string): (boolean, any?)
    local handle, derr = db()
    if not handle then return false, derr end
    local dbh = handle :: sql.DB
    local tx, txerr = dbh:begin()
    if txerr or not tx then
        dbh:release()
        return false, "profile delete transaction failed: " .. tostring(txerr)
    end

    local function fail(message: string): (boolean, any?)
        tx:rollback()
        dbh:release()
        return false, message
    end

    local profiles, profile_err = tx:query(
        "SELECT provider_id FROM kickside_model_provider_profiles WHERE id = $1", { id })
    if profile_err or type(profiles) ~= "table" then
        return fail("profile delete lookup failed: " .. tostring(profile_err or "missing result"))
    end
    local provider_id = profiles[1] and profiles[1].provider_id or nil

    local _, card_err = tx:execute("DELETE FROM kickside_model_cards WHERE provider_profile_id = $1", { id })
    if card_err then
        return fail("profile card delete failed: " .. tostring(card_err))
    end
    local _, err = tx:execute("DELETE FROM kickside_model_provider_profiles WHERE id = $1", { id })
    if err then return fail("profile delete failed: " .. tostring(err)) end
    local _, commit_err = tx:commit()
    dbh:release()
    if commit_err then return false, "profile delete commit failed: " .. tostring(commit_err) end
    local _, reload_err = M.reload()
    if reload_err then return false, reload_err end
    if provider_id ~= nil then
        local _, emit_err = M.emit_profile_changed(id, provider_id, provider_id)
        if emit_err then return false, "profile change notification failed: " .. tostring(emit_err) end
    end
    return true
end

function M.set_profile_status(id: string, status: string, message: string?, discovered_at: integer?, reload_cache: boolean?): (any?, any?)
    local handle, open_err = db()
    if open_err then return nil, open_err end
    local dbh = handle :: sql.DB
    local _, write_err = dbh:execute([[
        UPDATE kickside_model_provider_profiles
        SET status = $1, message = $2, last_discovered_at = COALESCE($3, last_discovered_at), updated_at = $4
        WHERE id = $5
    ]], { status, message or "", discovered_at, now(), id })
    dbh:release()
    if write_err then return nil, write_err end
    if reload_cache ~= false then
        local _, reload_err = M.reload()
        if reload_err then return nil, reload_err end
    end
end

function M.list_cards(): ({ any }?, any?)
    local snap, err = M.snapshot()
    if err then return nil, err end
    local out = {}
    for _, card in ipairs(snap.cards or {}) do
        if card.enabled ~= false then table.insert(out, card) end
    end
    return out
end

function M.list_card_overlays(): ({ any }?, any?)
    local snap, err = M.snapshot()
    if err then return nil, err end
    local out: { any } = {}
    for _, card in ipairs(snap.cards or {}) do
        table.insert(out, card)
    end
    return out
end

function M.list_cards_public(): ({ any }?, any?)
    local out = {}
    local cards, err = M.list_cards()
    if err then return nil, err end
    for _, card in ipairs(cards) do
        table.insert(out, card_policy.public_card(card))
    end
    return out
end

function M.upsert_card(input: any, base: any?): (any?, any?)
    -- Without a caller-supplied base, edit the saved copy when there is one so
    -- omitted fields (options included) keep their saved values.
    if base == nil and type(input) == "table" then
        local overlays, read_err = M.list_card_overlays()
        if read_err then return nil, read_err end
        for _, item in ipairs(overlays) do
            if item.name == input.name then
                base = item
                break
            end
        end
    end
    local card, cerr = card_policy.clean_card_input(input, base)
    if not card then return nil, cerr end
    local handle, derr = db()
    if not handle then return nil, derr end
    local dbh = handle :: sql.DB
    local ts = now()
    local _, err = dbh:execute([[
        INSERT INTO kickside_model_cards
            (name, title, description, provider_id, provider_profile_id, provider_model,
             capabilities_json, classes_json, priority, max_tokens, output_tokens,
             dimensions, pricing_json, options_json, source, enabled, metadata_json,
             created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (name) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            provider_id = excluded.provider_id,
            provider_profile_id = excluded.provider_profile_id,
            provider_model = excluded.provider_model,
            capabilities_json = excluded.capabilities_json,
            classes_json = excluded.classes_json,
            priority = excluded.priority,
            max_tokens = excluded.max_tokens,
            output_tokens = excluded.output_tokens,
            dimensions = excluded.dimensions,
            pricing_json = excluded.pricing_json,
            options_json = excluded.options_json,
            source = excluded.source,
            enabled = excluded.enabled,
            metadata_json = excluded.metadata_json,
            updated_at = excluded.updated_at
    ]], {
        card.name, card.title, card.description, card.provider_id, card.provider_profile_id, card.provider_model,
        policy.encode_json(card.capabilities), policy.encode_json(card.classes), card.priority, card.max_tokens, card.output_tokens,
        card.dimensions, policy.encode_json(card.pricing), policy.encode_json(card.options), card.source, policy.bool_int(card.enabled),
        policy.encode_json(card.metadata), ts, ts,
    })
    dbh:release()
    if err then return nil, "model save failed: " .. tostring(err) end
    local _, reload_err = M.reload()
    if reload_err then return nil, reload_err end

    local overlays, read_err = M.list_card_overlays()
    if read_err then return nil, read_err end
    for _, item in ipairs(overlays) do
        if item.name == card.name then return card_policy.public_card(item) end
    end
    return card_policy.public_card(card)
end

function M.delete_card(name: string): (boolean, any?)
    local handle, derr = db()
    if not handle then return false, derr end
    local dbh = handle :: sql.DB
    local _, err = dbh:execute("DELETE FROM kickside_model_cards WHERE name = $1", { name })
    dbh:release()
    if err then return false, "model delete failed: " .. tostring(err) end
    local _, reload_err = M.reload()
    if reload_err then return false, reload_err end
    return true
end

return M
