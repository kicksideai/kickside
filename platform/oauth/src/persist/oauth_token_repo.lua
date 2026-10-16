-- OAuth access-token reads and refresh-token writes.
local sql = require("sql")
local oauth_types = require("oauth_types")
local support = require("oauth_repo_support")
local refresh_schedule = require("refresh_schedule")
local OAUTH_TABLE = support.OAUTH_TABLE
local VALIDATION_ERRORS = support.VALIDATION_ERRORS
local get_db = support.get_db
local get_encryption_key = support.get_encryption_key
local decrypt_oauth_data = support.decrypt_oauth_data
local encrypt_oauth_data = support.encrypt_oauth_data
local encrypt_access_token = support.encrypt_access_token
local decrypt_access_token = support.decrypt_access_token
local get_current_timestamp = support.get_current_timestamp
local M = {}

function M.get_access_token(component_id: string?): (oauth_types.AccessTokenResult?, string?)
    if not component_id or component_id == "" then
        return nil, VALIDATION_ERRORS.COMPONENT_ID_REQUIRED
    end

    -- Get database
    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Query connection with optimized access token field only
    local query = sql.builder.select("access_token_encrypted", "expires_at")
        :from(OAUTH_TABLE)
        :where("component_id = ?", component_id)

    local executor = query:run_with(db)
    local results, err = executor:query()
    db:release()

    if err then
        return nil, "Failed to query OAuth connection: " .. err
    end

    if #results == 0 then
        return nil, "OAuth connection not found"
    end

    local connection = results[1] :: oauth_types.DbRow

    -- Get encryption key
    local encryption_key, err = get_encryption_key()
    if err then
        return nil, err
    end

    -- Decrypt optimized access token
    if not connection.access_token_encrypted or connection.access_token_encrypted == "" then
        return nil, "No access token available"
    end

    local access_token, err = decrypt_access_token(connection.access_token_encrypted :: string, encryption_key)
    if err then
        return nil, "Failed to decrypt access token: " .. err
    end

    if not access_token or access_token == "" then
        return nil, "No access token available"
    end

    return ({
        access_token = access_token,
        expires_at = connection.expires_at
    }) :: oauth_types.AccessTokenResult, nil
end

-- Update tokens after refresh
-- @param component_id string UUID
-- @param tokens table {access_token, refresh_token?, id_token?, scope?}
-- @param expires_at number? unix_timestamp
-- @return table {success, updated_at} | nil, error_string
function M.update_tokens(component_id: string?, tokens: any, expires_at: any?, expected_generation: integer?): (oauth_types.WriteResult?, string?)
    if not component_id or component_id == "" then
        return nil, VALIDATION_ERRORS.COMPONENT_ID_REQUIRED
    end
    if not tokens or type(tokens) ~= "table" then
        return nil, VALIDATION_ERRORS.TOKENS_REQUIRED
    end
    if expires_at and type(expires_at) ~= "number" then
        return nil, VALIDATION_ERRORS.INVALID_EXPIRES_AT
    end

    -- Get database
    return support.write(function(db: any): (any?, string?)

    -- Get current connection
    local query = sql.builder.select("oauth_data_encrypted")
        :from(OAUTH_TABLE)
        :where("component_id = ?", component_id)

    if db:db_type() == sql.type.POSTGRES then query = query:suffix("FOR UPDATE") end
    local executor = query:run_with(db)
    local results, err = executor:query()
    if err then
        return nil, "Failed to query OAuth connection: " .. err
    end

    if #results == 0 then
        return nil, "OAuth connection not found"
    end

    local connection = results[1]

    -- Get encryption key
    local encryption_key, err = get_encryption_key()
    if err then
        return nil, err
    end

    -- Decrypt current data
    local oauth_data, err = decrypt_oauth_data(connection.oauth_data_encrypted :: string, encryption_key)
    if err then
        return nil, "Failed to decrypt OAuth data: " .. err
    end
    if not oauth_data then
        return nil, "Failed to decrypt OAuth data"
    end

    -- Update tokens
    oauth_data.tokens = oauth_data.tokens or {}
    local token_set = tokens :: oauth_types.TokenSet
    for key, value in pairs(tokens :: oauth_types.Map) do
        oauth_data.tokens[key] = value
    end

    -- Re-encrypt data
    local encrypted_data, err = encrypt_oauth_data(oauth_data :: oauth_types.SecretPayload, encryption_key)
    if err then
        return nil, "Failed to encrypt updated OAuth data: " .. err
    end

    -- Encrypt the access token separately for optimized access
    local access_token_encrypted, err = encrypt_access_token(token_set.access_token, encryption_key)
    if err then
        return nil, "Failed to encrypt access token: " .. err
    end

    -- Update database
    local timestamp = get_current_timestamp()
    local updates: oauth_types.Map = {
        oauth_data_encrypted = encrypted_data,
        access_token_encrypted = access_token_encrypted or sql.as.null(),
        last_token_refresh = timestamp,
        updated_at = timestamp
    }

    if expires_at then
        updates.expires_at = expires_at
    end

    local update_query = sql.builder.update(OAUTH_TABLE)
        :set_map(updates)
        :where("component_id = ?", component_id)

    if expected_generation ~= nil then update_query = update_query:where("refresh_wake_generation = ?", expected_generation) end
    local update_executor = update_query:run_with(db)
    local result, err = update_executor:exec()

    if err then
        return nil, "Failed to update OAuth connection: " .. err
    end

    if result.rows_affected == 0 then
        if expected_generation ~= nil then return { success = true, stale = true }, nil end
        return nil, "OAuth connection not found"
    end

    local changed_err = refresh_schedule.changed_tx(db, component_id :: string, timestamp, expires_at ~= nil)
    if changed_err then return nil, tostring(changed_err) end

    return ({
        success = true,
        updated_at = timestamp
    }) :: oauth_types.WriteResult, nil
    end)
end

-- Update complete OAuth connection (for re-authorization and comprehensive updates)
-- @param component_id string UUID
-- @param connection_data table {provider?, connection_name?, connection_description?, scopes_granted?, connection_state?, token_type?, expires_at?, refresh_expires_at?, tokens?, user_profile?, client_credentials?, provider_specific?, oauth_flow?}
-- @return table {success, updated_at} | nil, error_string

return M
