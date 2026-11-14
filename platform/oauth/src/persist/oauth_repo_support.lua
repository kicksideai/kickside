-- Shared OAuth persistence, encryption, and timestamp support.
local sql = require("sql")
local json = require("json")
local time = require("time")
local secret_cipher = require("secret_cipher")
local oauth_types = require("oauth_types")
local M = {}

local OAUTH_TABLE = "kickside_oauth_connections"

-- Validation constants
local VALIDATION_ERRORS = {
    COMPONENT_ID_REQUIRED = "Component ID is required",
    CONNECTION_DATA_REQUIRED = "Connection data is required",
    PROVIDER_REQUIRED = "Provider is required",
    CONNECTION_NAME_REQUIRED = "Connection name is required",
    TOKENS_REQUIRED = "Tokens are required",
    ENCRYPTION_KEY_MISSING = "ENCRYPTION_KEY environment variable not set",
    INVALID_EXPIRES_AT = "expires_at must be a number"
}

---------------------------
-- Helper Functions
---------------------------

local function get_db(): (sql.DB?, string?)
    local db, err = sql.get(oauth_types.db_id())
    if err then
        return nil, "Failed to connect to database: " .. tostring(err)
    end
    return db
end

local function get_encryption_key(): (string?, string?)
    local key, err = secret_cipher.load_key("kickside.oauth.env:encryption_key")
    if err then return nil, tostring(err) end
    return key
end

local function encrypt_oauth_data(oauth_data: oauth_types.SecretPayload, key: string): (string?, string?)
    if not oauth_data or type(oauth_data) ~= "table" then
        return nil, "OAuth data must be a table"
    end

    -- JSON encode first
    local json_data, err = json.encode(oauth_data)
    if err then
        return nil, "Failed to encode OAuth data to JSON: " .. tostring(err)
    end

    -- Then encrypt
    local encrypted, err = secret_cipher.seal(json_data, key)
    if err then
        return nil, "Failed to encrypt OAuth data: " .. tostring(err)
    end

    return encrypted
end

local function decrypt_oauth_data(encrypted_data: string?, key: string): (oauth_types.SecretPayload?, string?)
    if not encrypted_data or encrypted_data == "" then
        return ({
            tokens = {},
            client_credentials = {},
            user_profile = {},
            provider_specific = {},
            oauth_flow = {},
        }) :: oauth_types.SecretPayload, nil
    end

    local decrypted, err = secret_cipher.open(encrypted_data, key)
    if err then
        return nil, "Failed to decrypt OAuth data: " .. tostring(err)
    end

    -- Then JSON decode
    local data, err = json.decode(decrypted :: string)
    if err then
        return nil, "Failed to decode decrypted JSON: " .. tostring(err)
    end

    if type(data) ~= "table" then
        return nil, "Decrypted OAuth data must be a table"
    end

    return data :: oauth_types.SecretPayload, nil
end

-- Encrypt just the access token for optimized storage
local function encrypt_access_token(access_token: string?, key: string): (string?, string?)
    if not access_token or access_token == "" then
        return nil, nil -- No token to encrypt
    end

    local encrypted, err = secret_cipher.seal(access_token, key)
    if err then
        return nil, "Failed to encrypt access token: " .. tostring(err)
    end

    return encrypted
end

-- Decrypt just the access token
local function decrypt_access_token(encrypted_token: string?, key: string): (string?, string?)
    if not encrypted_token or encrypted_token == "" then
        return nil, nil -- No token to decrypt
    end

    local decrypted, err = secret_cipher.open(encrypted_token, key)
    if err then
        return nil, "Failed to decrypt access token: " .. tostring(err)
    end

    return decrypted
end

-- Canonical timestamp for the connection table's created_at / updated_at /
-- last_token_refresh columns: an RFC3339 string forced to UTC, byte-identical on
-- SQLite and Postgres. This is the only writer of those three columns.
local function get_current_timestamp(): string
    return time.now():utc():format_rfc3339()
end

---------------------------
-- Repository Interface
---------------------------

-- Create new OAuth connection
-- @param component_id string UUID
-- @param connection_data table {provider, connection_name, connection_description?, schedule_id?, scopes_granted?, tokens, user_profile?, client_credentials?, provider_specific?, oauth_flow?}

M.OAUTH_TABLE = OAUTH_TABLE
M.VALIDATION_ERRORS = VALIDATION_ERRORS
M.get_db = get_db
M.get_encryption_key = get_encryption_key
M.encrypt_oauth_data = encrypt_oauth_data
M.decrypt_oauth_data = decrypt_oauth_data
M.encrypt_access_token = encrypt_access_token
M.decrypt_access_token = decrypt_access_token
M.get_current_timestamp = get_current_timestamp

-- OAuth writes and refresh wake demand share one owner transaction.
function M.write(fn: (any) -> (any?, string?)): (any?, string?)
    local db, db_err = get_db()
    if db_err or not db then return nil, tostring(db_err) end
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); return nil, tostring(begin_err) end
    local value, write_err = fn(tx)
    if write_err then
        local _, rollback_err = tx:rollback()
        db:release()
        return nil, rollback_err and tostring(rollback_err) or write_err
    end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then return nil, tostring(commit_err) end
    return value, nil
end

return M
