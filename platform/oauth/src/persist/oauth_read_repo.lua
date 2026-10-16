-- OAuth connection reads and filtered metadata lists.
local sql = require("sql")
local oauth_types = require("oauth_types")
local support = require("oauth_repo_support")
local OAUTH_TABLE = support.OAUTH_TABLE
local VALIDATION_ERRORS = support.VALIDATION_ERRORS
local get_db = support.get_db
local get_encryption_key = support.get_encryption_key
local decrypt_oauth_data = support.decrypt_oauth_data
local M = {}

function M.get_connection(component_id: string?): (oauth_types.Connection?, string?)
    if not component_id or component_id == "" then
        return nil, VALIDATION_ERRORS.COMPONENT_ID_REQUIRED
    end

    -- Get database
    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Query connection
    local query = sql.builder.select("*")
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

    -- Decrypt sensitive data
    local oauth_data, err = decrypt_oauth_data(connection.oauth_data_encrypted :: string, encryption_key)
    if err then
        return nil, "Failed to decrypt OAuth data: " .. err
    end
    if not oauth_data then return nil, "Failed to decrypt OAuth data" end

    -- Return complete connection
    return ({
        id = connection.id,
        component_id = connection.component_id,
        provider = connection.provider,
        connection_name = connection.connection_name,
        connection_description = connection.connection_description,
        schedule_id = connection.schedule_id,
        scopes_granted = connection.scopes_granted,
        connection_state = connection.connection_state,
        token_type = connection.token_type,
        expires_at = connection.expires_at,
        refresh_expires_at = connection.refresh_expires_at,
        created_at = connection.created_at,
        updated_at = connection.updated_at,
        last_token_refresh = connection.last_token_refresh,
        refresh_wake_generation = connection.refresh_wake_generation,
        -- Decrypted data
        tokens = oauth_data.tokens,
        client_credentials = oauth_data.client_credentials,
        user_profile = oauth_data.user_profile,
        provider_specific = oauth_data.provider_specific,
        oauth_flow = oauth_data.oauth_flow,
    }) :: oauth_types.Connection, nil
end

-- Get connection metadata with raw token expiration (no decryption)
-- @param component_id string UUID
-- @return table {id, provider, connection_name, schedule_id, scopes_granted, expires_at, connection_state, ...} | nil, error_string
function M.get_connection_metadata(component_id: string?): (oauth_types.ConnectionMetadata?, string?)
    if not component_id or component_id == "" then
        return nil, VALIDATION_ERRORS.COMPONENT_ID_REQUIRED
    end

    -- Get database
    local db, err = get_db()
    if err then
        return nil, err
    end

    -- Query only metadata fields (no encrypted data)
    local query = sql.builder.select(
        "id", "component_id", "provider", "connection_name", "connection_description",
        "schedule_id", "scopes_granted", "connection_state", "token_type",
        "expires_at", "refresh_expires_at", "created_at", "updated_at", "last_token_refresh"
    )
        :from(OAUTH_TABLE)
        :where("component_id = ?", component_id)

    local executor = query:run_with(db)
    local results, err = executor:query()
    db:release()

    if err then
        return nil, "Failed to query OAuth connection metadata: " .. err
    end

    if #results == 0 then
        return nil, "OAuth connection not found"
    end

    return results[1] :: oauth_types.ConnectionMetadata, nil
end

-- Get access token with raw expiration data (optimized operation)
-- @param component_id string UUID
-- @return table {access_token, expires_at} | nil, error_string
local PAGE_LIMIT = 100
local function page_args(opts: any): (integer, integer)
    opts = type(opts) == "table" and opts or {}
    local limit = tonumber(opts.limit) or PAGE_LIMIT
    if limit < 1 then limit = 1 elseif limit > PAGE_LIMIT then limit = PAGE_LIMIT end
    local offset = tonumber(opts.offset) or 0
    if offset < 0 then offset = 0 end
    return limit :: integer, offset :: integer
end

function M.list_by_provider(provider_name: any, opts: any?): ({ oauth_types.ConnectionMetadata }?, string?)
    if not provider_name or provider_name == "" then
        return nil, "Provider name is required"
    end

    -- Get database
    local db, err = get_db()
    if err then
        return nil, err
    end

    local limit, offset = page_args(opts)
    -- Query only metadata, no encrypted data
    local query = sql.builder.select(
        "id", "component_id", "provider", "connection_name", "connection_description",
        "schedule_id", "scopes_granted", "connection_state", "token_type",
        "expires_at", "refresh_expires_at", "created_at", "updated_at"
    )
        :from(OAUTH_TABLE)
        :where("provider = ?", provider_name)
        :order_by("created_at DESC")
        :limit(limit)
        :offset(offset)

    local executor = query:run_with(db)
    local results, err = executor:query()
    db:release()

    if err then
        return nil, "Failed to list OAuth connections: " .. err
    end

    return results :: { oauth_types.ConnectionMetadata }, nil
end

-- List connections by schedule_id (metadata only)
-- @param schedule_id string UUID
-- @return table[] array_of_connection_metadata | nil, error_string
function M.list_by_schedule_id(schedule_id: any, opts: any?): ({ oauth_types.ConnectionMetadata }?, string?)
    if not schedule_id or schedule_id == "" then
        return nil, "Schedule ID is required"
    end

    -- Get database
    local db, err = get_db()
    if err then
        return nil, err
    end

    local limit, offset = page_args(opts)
    -- Query only metadata, no encrypted data
    local query = sql.builder.select(
        "id", "component_id", "provider", "connection_name", "connection_description",
        "schedule_id", "scopes_granted", "connection_state", "token_type",
        "expires_at", "refresh_expires_at", "created_at", "updated_at"
    )
        :from(OAUTH_TABLE)
        :where("schedule_id = ?", schedule_id)
        :order_by("created_at DESC")
        :limit(limit)
        :offset(offset)

    local executor = query:run_with(db)
    local results, err = executor:query()
    db:release()

    if err then
        return nil, "Failed to list OAuth connections by schedule: " .. err
    end

    return results :: { oauth_types.ConnectionMetadata }, nil
end

-- Delete OAuth connection
-- @param component_id string UUID
-- @return table {success, deleted} | nil, error_string

return M
