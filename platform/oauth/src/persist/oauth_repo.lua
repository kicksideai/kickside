-- OAuth connection create, update, schedule, and delete persistence.
local sql = require("sql")
local uuid = require("uuid")
local oauth_types = require("oauth_types")
local support = require("oauth_repo_support")
local refresh_schedule = require("refresh_schedule")
local OAUTH_TABLE = support.OAUTH_TABLE
local VALIDATION_ERRORS = support.VALIDATION_ERRORS
local get_db = support.get_db
local get_encryption_key = support.get_encryption_key
local encrypt_oauth_data = support.encrypt_oauth_data
local decrypt_oauth_data = support.decrypt_oauth_data
local encrypt_access_token = support.encrypt_access_token
local get_current_timestamp = support.get_current_timestamp
local oauth_repo = {}

function oauth_repo.create_connection(component_id: string?, connection_data: any): (oauth_types.WriteResult?, string?)
    -- Validate inputs
    if not component_id or component_id == "" then
        return nil, VALIDATION_ERRORS.COMPONENT_ID_REQUIRED
    end
    if not connection_data or type(connection_data) ~= "table" then
        return nil, VALIDATION_ERRORS.CONNECTION_DATA_REQUIRED
    end
    if not connection_data.provider or connection_data.provider == "" then
        return nil, VALIDATION_ERRORS.PROVIDER_REQUIRED
    end
    if not connection_data.connection_name or connection_data.connection_name == "" then
        return nil, VALIDATION_ERRORS.CONNECTION_NAME_REQUIRED
    end
    if not connection_data.tokens or type(connection_data.tokens) ~= "table" then
        return nil, VALIDATION_ERRORS.TOKENS_REQUIRED
    end

    -- Get encryption key
    local encryption_key, err = get_encryption_key()
    if err then
        return nil, err
    end

    -- Prepare sensitive data (encrypted)
    local oauth_data = ({
        tokens = connection_data.tokens or {},
        client_credentials = connection_data.client_credentials or {},
        user_profile = connection_data.user_profile or {},
        provider_specific = connection_data.provider_specific or {},
        oauth_flow = connection_data.oauth_flow or {}
    }) :: oauth_types.SecretPayload

    -- Encrypt sensitive data
    local encrypted_data, err = encrypt_oauth_data(oauth_data, encryption_key)
    if err then
        return nil, "Failed to encrypt OAuth data: " .. err
    end

    -- Encrypt access token separately for optimized access
    local create_tokens = connection_data.tokens :: oauth_types.TokenSet
    local access_token_encrypted, err = encrypt_access_token(create_tokens.access_token, encryption_key)
    if err then
        return nil, "Failed to encrypt access token: " .. err
    end

    -- Get database
    return support.write(function(db: any): (any?, string?)

    local timestamp = get_current_timestamp()
    local record_id = uuid.v4()

    -- Insert connection
    local query = sql.builder.insert(OAUTH_TABLE)
        :set_map({
            id = record_id,
            component_id = component_id,
            provider = connection_data.provider,
            connection_name = connection_data.connection_name,
            connection_description = connection_data.connection_description or sql.as.null(),
            schedule_id = connection_data.schedule_id or sql.as.null(),
            scopes_granted = connection_data.scopes_granted or sql.as.null(),
            connection_state = connection_data.connection_state or "connected",
            token_type = connection_data.token_type or "Bearer",
            expires_at = connection_data.expires_at or sql.as.null(),
            refresh_expires_at = connection_data.refresh_expires_at or sql.as.null(),
            access_token_encrypted = access_token_encrypted or sql.as.null(),
            oauth_data_encrypted = encrypted_data,
            created_at = timestamp,
            refresh_issued_at = timestamp,
            refresh_enabled = connection_data.expires_at ~= nil and (connection_data.connection_state or "connected") == "connected",
            refresh_wake_generation = 1,
            updated_at = timestamp
        })

    local executor = query:run_with(db)
    local result, err = executor:exec()

    if err then
        return nil, "Failed to insert OAuth connection: " .. err
    end

    return ({
        success = true,
        component_id = component_id,
        created_at = timestamp
    }) :: oauth_types.WriteResult, nil
    end)
end

-- Get complete OAuth connection with decrypted data
-- @param component_id string UUID
-- @return table {id, component_id, provider, connection_name, schedule_id, tokens, user_profile, ...} | nil, error_string

function oauth_repo.update_connection(component_id: string?, connection_data: any, expected_generation: integer?): (oauth_types.WriteResult?, string?)
    if not component_id or component_id == "" then
        return nil, VALIDATION_ERRORS.COMPONENT_ID_REQUIRED
    end
    if not connection_data or type(connection_data) ~= "table" then
        return nil, VALIDATION_ERRORS.CONNECTION_DATA_REQUIRED
    end

    -- Get database
    return support.write(function(db: any): (any?, string?)

    -- Get current connection in a transaction-safe way
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

    -- Decrypt current OAuth data
    local oauth_data, err = decrypt_oauth_data(connection.oauth_data_encrypted :: string, encryption_key)
    if err then
        return nil, "Failed to decrypt OAuth data: " .. err
    end
    if not oauth_data then
        return nil, "Failed to decrypt OAuth data"
    end

    -- Update nested encrypted data fields (merge with existing)
    if connection_data.tokens then
        oauth_data.tokens = oauth_data.tokens or {}
        for key, value in pairs(connection_data.tokens :: oauth_types.Map) do
            oauth_data.tokens[key] = value
        end
    end

    if connection_data.user_profile then
        oauth_data.user_profile = connection_data.user_profile
    end

    if connection_data.client_credentials then
        oauth_data.client_credentials = connection_data.client_credentials
    end

    if connection_data.provider_specific then
        oauth_data.provider_specific = connection_data.provider_specific
    end

    if connection_data.oauth_flow then
        oauth_data.oauth_flow = connection_data.oauth_flow
    end

    -- Re-encrypt OAuth data
    local encrypted_data, err = encrypt_oauth_data(oauth_data :: oauth_types.SecretPayload, encryption_key)
    if err then
        return nil, "Failed to encrypt updated OAuth data: " .. err
    end

    -- Encrypt access token separately if provided
    local access_token_encrypted = nil
    if connection_data.tokens and connection_data.tokens.access_token then
        local update_tokens = connection_data.tokens :: oauth_types.TokenSet
        access_token_encrypted, err = encrypt_access_token(update_tokens.access_token, encryption_key)
        if err then
                return nil, "Failed to encrypt access token: " .. err
        end
    end

    -- Prepare update fields
    local timestamp = get_current_timestamp()
    local updates: oauth_types.Map = {
        oauth_data_encrypted = encrypted_data,
        last_token_refresh = timestamp,
        updated_at = timestamp
    }

    -- Update metadata fields if provided (these are stored unencrypted for querying)
    if connection_data.provider and connection_data.provider ~= "" then
        updates.provider = connection_data.provider
    end

    if connection_data.connection_name and connection_data.connection_name ~= "" then
        updates.connection_name = connection_data.connection_name
    end

    if connection_data.connection_description ~= nil then
        updates.connection_description = connection_data.connection_description ~= "" and connection_data.connection_description or sql.as.null()
    end

    if connection_data.scopes_granted then
        updates.scopes_granted = connection_data.scopes_granted
    end

    if connection_data.connection_state then
        updates.connection_state = connection_data.connection_state
    end

    if connection_data.token_type then
        updates.token_type = connection_data.token_type
    end

    if connection_data.expires_at then
        updates.expires_at = connection_data.expires_at
    end

    if connection_data.refresh_expires_at then
        updates.refresh_expires_at = connection_data.refresh_expires_at
    end

    if connection_data.schedule_id ~= nil then
        updates.schedule_id = connection_data.schedule_id ~= "" and connection_data.schedule_id or sql.as.null()
    end

    if access_token_encrypted then
        updates.access_token_encrypted = access_token_encrypted
    end

    -- Execute update in single transaction
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

    local refreshable: boolean? = nil
    if connection_data.tokens ~= nil then refreshable = connection_data.expires_at ~= nil end
    local changed_err = refresh_schedule.changed_tx(db, component_id :: string, connection_data.tokens ~= nil and timestamp or nil, refreshable)
    if changed_err then return nil, tostring(changed_err) end

    return ({
        success = true,
        updated_at = timestamp
    }) :: oauth_types.WriteResult, nil
    end)
end

-- Update schedule_id for a connection
-- @param component_id string UUID
-- @param schedule_id string UUID or nil
-- @return table {success, updated_at} | nil, error_string
function oauth_repo.update_schedule_id(component_id: string?, schedule_id: any): (oauth_types.WriteResult?, string?)
    if not component_id or component_id == "" then
        return nil, VALIDATION_ERRORS.COMPONENT_ID_REQUIRED
    end

    -- Get database
    local db, err = get_db()
    if err then
        return nil, err
    end

    local timestamp = get_current_timestamp()

    -- Update schedule_id
    local query = sql.builder.update(OAUTH_TABLE)
        :set_map({
            schedule_id = schedule_id or sql.as.null(),
            updated_at = timestamp
        })
        :where("component_id = ?", component_id)

    local executor = query:run_with(db)
    local result, err = executor:exec()
    db:release()

    if err then
        return nil, "Failed to update schedule_id: " .. err
    end

    if result.rows_affected == 0 then
        return nil, "OAuth connection not found"
    end

    return ({
        success = true,
        updated_at = timestamp
    }) :: oauth_types.WriteResult, nil
end

-- List connections by provider (metadata only)
-- @param provider_name string
-- @return table[] array_of_connection_metadata | nil, error_string
-- Clamp pagination so list queries never return unbounded rows. Default page is
-- 100; callers page through larger sets with offset.

function oauth_repo.delete_connection(component_id: string?): (oauth_types.DeleteResult?, string?)
    if not component_id or component_id == "" then
        return nil, VALIDATION_ERRORS.COMPONENT_ID_REQUIRED
    end

    -- Get database
    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Delete connection
    local query = sql.builder.delete(OAUTH_TABLE)
        :where("component_id = ?", component_id)

    local executor = query:run_with(db)
    local result, err = executor:exec()
    db:release()

    if err then
        return nil, "Failed to delete OAuth connection: " .. err
    end

    if result.rows_affected == 0 then
        return nil, "OAuth connection not found"
    end

    return ({
        success = true,
        deleted = true
    }) :: oauth_types.DeleteResult, nil
end

return oauth_repo
