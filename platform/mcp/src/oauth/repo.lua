-- Persistence for the MCP OAuth authorization server: dynamically registered
-- public clients and single-use authorization codes. The raw code is never
-- stored — only its sha256 hash — and consume marks it used inside the lookup
-- so a replayed code fails closed.

local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local time = require("time")
local hash = require("hash")
local crypto = require("crypto")
local base64 = require("base64")
local mcp_types = require("mcp_types")
local persisted_json = require("persisted_json")
local quota = require("credential_quota")
local limits = require("mcp_consts").OAUTH_LIMITS

local M = {}
local CLIENT_IDLE_SECONDS = 90 * 86400
local CLIENT_METADATA_SCHEMA = {
    type = "object",
    properties = {
        client_name = { type = { "string", "null" }, maxLength = limits.CLIENT_NAME_CHARS },
        redirect_uris = { type = "array", minItems = 1, maxItems = limits.REDIRECT_COUNT,
            items = { type = "string", minLength = 1, maxLength = limits.REDIRECT_URI_CHARS } },
    },
    required = { "redirect_uris" },
}

function M.decode_registration(raw: string): (any?, any?)
    if #raw > limits.REGISTRATION_BODY_BYTES then return nil, "registration body exceeds the limit" end
    local valid, validation_err = json.validate_string(CLIENT_METADATA_SCHEMA, raw)
    if not valid then return nil, validation_err end
    return json.decode(raw)
end

M.TABLES = {
    CLIENTS = "kickside_mcp_oauth_clients",
    CODES = "kickside_mcp_oauth_codes",
}

local function now_unix(): integer
    return time.now():unix() :: integer
end

local function db_open(): (any?, string?)
    local db, err = sql.get(mcp_types.db_id())
    if err or not db then
        return nil, "mcp db unavailable: " .. tostring(err)
    end
    return db, nil
end

function M.code_hash(raw: string): string
    return select(1, hash.sha256(raw)) :: string
end

function M.safe_redirect(uri: any): boolean
    if type(uri) ~= "string" or uri == "" then return false end
    if uri:find("[%s\\#*]") then return false end
    local scheme, authority = uri:match("^([%a][%w+.-]*)://([^/?#]+)")
    if not scheme or not authority or authority:find("[@%%]") then return false end
    scheme = scheme:lower()
    local host, port = authority:match("^([%w.-]+):(%d+)$")
    if not host then host = authority:match("^([%w.-]+)$") end
    if not host then
        host, port = authority:match("^(%[[%x:]+%]):(%d+)$")
        if not host then host = authority:match("^(%[[%x:]+%])$") end
    end
    if not host or (port and (tonumber(port) < 1 or tonumber(port) > 65535)) then return false end
    if host:find("..", 1, true) or host:sub(1, 1) == "." then return false end
    host = host:lower()
    if scheme == "https" then return true end
    if scheme == "http" then return host == "localhost" or host == "127.0.0.1" or host == "[::1]" end
    -- Private-use native schemes retain exact registration. Browser execution,
    -- file and network schemes cannot serve as native OAuth callbacks.
    return scheme ~= "javascript" and scheme ~= "vbscript" and scheme ~= "data" and scheme ~= "file"
        and scheme ~= "ftp" and scheme ~= "ftps" and scheme ~= "ws" and scheme ~= "wss"
end

-- register_client stores a public client (no secret; PKCE is enforced at
-- exchange). redirect_uris must be a non-empty list of absolute https/native
-- URIs; they are matched exactly at authorize and exchange time.
function M.register_client(args: any): (any?, any?)
    args = type(args) == "table" and args or {}
    local uris = args.redirect_uris
    if type(uris) ~= "table" or #(uris :: { any }) == 0 then
        return nil, "redirect_uris is required"
    end
    local encoded, encode_err = json.encode(args)
    if encode_err then return nil, encode_err end
    local valid, validation_err = json.validate_string(CLIENT_METADATA_SCHEMA, encoded)
    if not valid then return nil, validation_err end
    local clean: { string } = {}
    for _, u in ipairs(uris :: { any }) do
        if type(u) ~= "string" or u == "" then return nil, "redirect_uris must be strings" end
        local s = u :: string
        if not M.safe_redirect(s) then
            return nil, "redirect_uri must use HTTPS, HTTP loopback, or a native callback without fragments, userinfo or wildcards"
        end
        clean[#clean + 1] = s
    end

    local client_id = uuid.v4()
    local name = type(args.client_name) == "string" and (args.client_name :: string) or ""

    local db, db_err = db_open()
    if not db then return nil, errors.new({ message = tostring(db_err), kind = errors.UNAVAILABLE, retryable = true }) end
    local ts = now_unix()
    local inserted, ins_err = quota.insert_limited(db, M.TABLES.CLIENTS, {
        client_id = client_id, client_name = name, redirect_uris_json = json.encode(clean),
        created_at = ts, last_used_at = ts,
    }, {
        { query = "SELECT COUNT(*) AS n FROM kickside_mcp_oauth_clients", args = {}, maximum = limits.STORED_CLIENTS,
            message = "stored client registration limit reached", kind = errors.RATE_LIMITED, retryable = true },
        { query = "SELECT COUNT(*) AS n FROM kickside_mcp_oauth_clients WHERE created_at >= $1",
            args = { ts - 60 }, maximum = limits.REGISTRATIONS_PER_MINUTE,
            message = "client registration rate limit reached", kind = errors.RATE_LIMITED, retryable = true },
    })
    db:release()
    if ins_err or not inserted then return nil, ins_err end

    return {
        client_id = client_id,
        client_name = name,
        redirect_uris = clean,
        token_endpoint_auth_method = "none",
        grant_types = { "authorization_code" },
        response_types = { "code" },
    }, nil
end

function M.get_client(client_id: string): (any?, any?)
    if type(client_id) ~= "string" or client_id == "" then return nil, "client_id is required" end
    local db, db_err = db_open()
    if not db then return nil, db_err end
    -- Renew only a client still within its idle lifetime. This write serializes
    -- with the retention DELETE, so a stale registration cannot be resurrected.
    local ts = now_unix()
    local renewed, renew_err = sql.builder.update(M.TABLES.CLIENTS)
        :set("last_used_at", ts)
        :where("client_id = ?", client_id)
        :where("last_used_at > ?", ts - CLIENT_IDLE_SECONDS)
        :run_with(db):exec()
    if renew_err then db:release(); return nil, tostring(renew_err) end
    if not renewed or tonumber(renewed.rows_affected) ~= 1 then
        db:release()
        return nil, "unknown client"
    end
    local rows, err = sql.builder.select("client_id", "client_name", "redirect_uris_json")
        :from(M.TABLES.CLIENTS)
        :where("client_id = ?", client_id)
        :run_with(db):query()
    db:release()
    if err then return nil, tostring(err) end
    local row = rows and rows[1]
    if not row then return nil, "unknown client" end
    local redirect_uris, decode_err = persisted_json.decode_table(row.redirect_uris_json,
        "kickside_mcp_oauth_clients.redirect_uris_json")
    if decode_err then return nil, decode_err end
    return {
        client_id = row.client_id,
        client_name = row.client_name,
        redirect_uris = redirect_uris,
    }, nil
end

function M.prune_idle_clients(limit: integer): (integer?, error?)
    if type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > 500 then
        return nil, (errors.new({ message = "OAuth client prune limit must be in [1,500]",
            kind = errors.INVALID, retryable = false }) :: error)
    end
    local db, db_err = db_open()
    if not db then
        return nil, (errors.new({ message = tostring(db_err), kind = errors.UNAVAILABLE,
            retryable = true }) :: error)
    end
    local cutoff = now_unix() - CLIENT_IDLE_SECONDS
    local result, err = db:execute([[WITH idle AS (
        SELECT client_id FROM kickside_mcp_oauth_clients WHERE last_used_at <= $1
        ORDER BY last_used_at,client_id LIMIT $2
    ) DELETE FROM kickside_mcp_oauth_clients
      WHERE client_id IN (SELECT client_id FROM idle) AND last_used_at <= $1]],
        { cutoff, limit })
    db:release()
    if err then
        return nil, (errors.new({ message = "OAuth client prune failed: " .. tostring(err),
            kind = errors.INTERNAL, retryable = true }) :: error)
    end
    local deleted = result and tonumber(result.rows_affected)
    if not deleted then
        return nil, (errors.new({ message = "OAuth client prune returned no affected-row count",
            kind = errors.INTERNAL, retryable = true }) :: error)
    end
    return deleted, nil
end

local function grant_key(raw_code: string): (string?, any?)
    -- The lookup hash is public to a database reader; a distinct domain keeps
    -- that hash from serving as the encryption key.
    return hash.sha256("kickside.mcp.oauth:grant:v1:" .. raw_code, true)
end

local function grant_failure(): error
    return (errors.new({ message = "OAuth grant envelope is invalid", kind = errors.INTERNAL,
        retryable = false, details = { error_kind = "persisted_data" } }) :: error)
end

-- put_code stores an authorization grant: the consenting actor plus the exact
-- credential-mint arguments the token exchange will replay.
function M.put_code(raw_code: string, args: any): string?
    args = type(args) == "table" and args or {}
    local encoded, encode_err = json.encode(type(args.grant) == "table" and args.grant or {})
    if encode_err then return tostring(encode_err) end
    local key, key_err = grant_key(raw_code)
    if key_err or not key then return "OAuth grant key derivation failed" end
    local ciphertext, seal_err = crypto.encrypt.aes(encoded, key, M.code_hash(raw_code))
    if seal_err or not ciphertext then return "OAuth grant encryption failed" end
    local sealed, base_err = base64.encode(ciphertext)
    if base_err then return tostring(base_err) end
    local envelope, envelope_err = json.encode({ sealed = sealed })
    if envelope_err then return tostring(envelope_err) end
    local db, db_err = db_open()
    if not db then return db_err end
    local ts = now_unix()
    local _, err = sql.builder.insert(M.TABLES.CODES)
        :set_map({
            code_hash = M.code_hash(raw_code),
            client_id = tostring(args.client_id),
            actor_id = tostring(args.actor_id),
            redirect_uri = tostring(args.redirect_uri),
            code_challenge = tostring(args.code_challenge),
            grant_json = envelope,
            resource = type(args.resource) == "string" and (args.resource :: string) or "",
            used = 0,
            expires_at = ts + (tonumber(args.ttl) or 300),
            created_at = ts,
        })
        :run_with(db):exec()
    db:release()
    if err then return tostring(err) end
    return nil
end

-- consume_code atomically marks the code used and returns its grant. A second
-- consume, an expired code, or an unknown code all return an error.
function M.consume_code(raw_code: string): (any?, any?)
    if type(raw_code) ~= "string" or raw_code == "" then return nil, "code is required" end
    local db, db_err = db_open()
    if not db then return nil, db_err end
    local h = M.code_hash(raw_code)
    local ts = now_unix()

    local res, upd_err = sql.builder.update(M.TABLES.CODES)
        :where("code_hash = ?", h)
        :where("used = ?", 0)
        :where("expires_at > ?", ts)
        :set("used", 1)
        :run_with(db):exec()
    if upd_err then
        db:release()
        return nil, tostring(upd_err)
    end
    local affected = tonumber(res and (res :: any).rows_affected) or 0
    if affected == 0 then
        db:release()
        return nil, "invalid, expired, or already used code"
    end

    local rows, sel_err = sql.builder.select("client_id", "actor_id", "redirect_uri", "code_challenge", "grant_json", "resource")
        :from(M.TABLES.CODES)
        :where("code_hash = ?", h)
        :run_with(db):query()
    if sel_err then
        db:release()
        return nil, tostring(sel_err)
    end
    local row = rows and rows[1]
    if not row then
        db:release()
        return nil, "code row vanished"
    end
    -- Erase the single-use grant envelope immediately after reading it.
    local _, zero_err = sql.builder.update(M.TABLES.CODES)
        :where("code_hash = ?", h)
        :set("grant_json", "{}")
        :run_with(db):exec()
    db:release()
    if zero_err then return nil, zero_err end
    local grant, grant_err = persisted_json.decode_table(row.grant_json,
        "kickside_mcp_oauth_codes.grant_json")
    if grant_err then return nil, grant_err end
    if grant.sealed ~= nil then
        if type(grant.sealed) ~= "string" then return nil, grant_failure() end
        local ciphertext, decode_err = base64.decode(grant.sealed)
        local key, key_err = grant_key(raw_code)
        if decode_err or key_err or not ciphertext or not key then return nil, grant_failure() end
        local plaintext, open_err = crypto.decrypt.aes(ciphertext, key, h)
        if open_err or not plaintext then return nil, grant_failure() end
        grant, grant_err = persisted_json.decode_table(plaintext, "kickside_mcp_oauth_codes.grant_json.sealed")
        if grant_err then return nil, grant_err end
    end
    return {
        client_id = row.client_id,
        actor_id = row.actor_id,
        redirect_uri = row.redirect_uri,
        code_challenge = row.code_challenge,
        grant = grant,
        resource = row.resource,
    }, nil
end

-- Called by the existing retention process through MCP's owner callback.
-- Selection uses the expiry index and is bounded so one tick cannot monopolize
-- the shared database. Unexpired grants remain available for exchange.
function M.prune_expired_codes(limit: integer): (integer?, error?)
    if type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > 500 then
        return nil, (errors.new({ message = "OAuth code prune limit must be in [1,500]",
            kind = errors.INVALID, retryable = false }) :: error)
    end
    local db, db_err = db_open()
    if not db then
        return nil, (errors.new({ message = tostring(db_err), kind = errors.UNAVAILABLE,
            retryable = true }) :: error)
    end
    local expired_at = now_unix()
    local result, err = db:execute([[WITH expired AS (
        SELECT code_hash FROM kickside_mcp_oauth_codes WHERE expires_at <= $1
        ORDER BY expires_at,code_hash LIMIT $2
    ) DELETE FROM kickside_mcp_oauth_codes
      WHERE code_hash IN (SELECT code_hash FROM expired) AND expires_at <= $1]],
        { expired_at, limit })
    db:release()
    if err then
        return nil, (errors.new({ message = "OAuth code prune failed: " .. tostring(err),
            kind = errors.INTERNAL, retryable = true }) :: error)
    end
    local deleted = result and tonumber(result.rows_affected)
    if not deleted then
        return nil, (errors.new({ message = "OAuth code prune returned no affected-row count",
            kind = errors.INTERNAL, retryable = true }) :: error)
    end
    return deleted, nil
end

return M
