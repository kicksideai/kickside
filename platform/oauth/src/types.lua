-- Public type surface for kickside.oauth. Provider-specific payloads remain
-- extension-owned maps, but repository inputs/outputs use stable envelopes so
-- callers do not depend on raw SQL rows or encrypted storage details.

local registry = require("registry")

local M = {}

M.CONTRACT = {
    SETTINGS = "kickside.settings:settings",
    COMPONENT_SERVICE = "kickside.component:component_service",
}

-- Registry entry whose meta.db_id holds the configured oauth database resource.
-- The target_db ns.requirement rewrites that field per deployment.
M.DB_CONFIG = "kickside.oauth:db_config"

type Map = { [string]: any }

type TokenSet = {
    access_token: string?,
    refresh_token: string?,
    id_token: string?,
    scope: string?,
    token_type: string?,
}

type SecretPayload = {
    tokens: TokenSet,
    client_credentials: Map,
    user_profile: Map,
    provider_specific: Map,
    oauth_flow: Map,
}

type ConnectionData = {
    provider: string?,
    connection_name: string?,
    connection_description: string?,
    schedule_id: string?,
    scopes_granted: string?,
    connection_state: string?,
    token_type: string?,
    expires_at: number?,
    refresh_expires_at: number?,
    tokens: TokenSet?,
    user_profile: Map?,
    client_credentials: Map?,
    provider_specific: Map?,
    oauth_flow: Map?,
}

type ConnectionMetadata = {
    id: string,
    component_id: string,
    provider: string,
    connection_name: string,
    connection_description: string?,
    schedule_id: string?,
    scopes_granted: string?,
    connection_state: string?,
    token_type: string?,
    expires_at: any?,
    refresh_expires_at: any?,
    created_at: string?,
    updated_at: string?,
    last_token_refresh: string?,
}

type Connection = {
    id: string,
    component_id: string,
    provider: string,
    connection_name: string,
    connection_description: string?,
    schedule_id: string?,
    scopes_granted: string?,
    connection_state: string?,
    token_type: string?,
    expires_at: any?,
    refresh_expires_at: any?,
    created_at: string?,
    updated_at: string?,
    last_token_refresh: string?,
    refresh_wake_generation: integer?,
    tokens: TokenSet,
    client_credentials: Map,
    user_profile: Map,
    provider_specific: Map,
    oauth_flow: Map,
}

type AccessTokenResult = {
    access_token: string,
    expires_at: any?,
}

type WriteResult = {
    success: boolean,
    stale: boolean?,
    component_id: string?,
    created_at: string?,
    updated_at: string?,
}

type DeleteResult = {
    success: boolean,
    deleted: boolean,
}

type DbRow = { [string]: any }

type PublicUserProfile = {
    provider_user_id: string,
    email: string,
    display_name: string,
    username: string,
    avatar_url: string,
}

type PublicConnectionInfo = {
    component_id: string?,
    provider: string,
    connection_name: string,
    connection_description: string,
    scopes_granted: string,
    connection_state: string,
    expires_at: any?,
    refresh_expires_at: any?,
    created_at: any?,
    updated_at: any?,
    last_token_refresh: any?,
    user_profile: PublicUserProfile,
}

type PublicConnectionDetails = {
    component_id: string?,
    provider: string?,
    connection_name: string?,
    connection_description: string?,
    connection_state: string?,
    token_type: string?,
    expires_at: any?,
    refresh_expires_at: any?,
    created_at: any?,
    updated_at: any?,
    last_token_refresh: any?,
    scopes_granted: string?,
    user_profile: PublicUserProfile,
    user_display_name: string,
    user_email: string,
    provider_title: string?,
    provider_icon: string?,
    provider_description: string?,
}

-- Resolve the configured DB id the repo binds to. Reads db_config's meta.db_id
-- so a target_db rebind reaches the persist layer.
function M.db_id(): string
    local entry = select(1, registry.get(M.DB_CONFIG)) :: any
    return entry.meta.db_id :: string
end

local function string_or_empty(value: any): string
    if type(value) == "string" then
        return value :: string
    end
    return ""
end

local function timestamp(value: any): number?
    if type(value) == "number" then return value end
    if type(value) ~= "string" or value == "" or not value:match("^%d+$") then
        return nil
    end
    return tonumber(value)
end

local function table_or_empty(value: any): any
    if type(value) == "table" then
        return value
    end
    return {}
end

function M.timestamp(value: any): number?
    return timestamp(value)
end

-- Project the stored connection_state into its display state. The state is
-- canonical (connected / needs_reauth / disabled); the only derivation is a
-- connected token past expiry, which reads as expired.
function M.public_connection_state(metadata: any, now_unix: number?): string
    local row = table_or_empty(metadata)
    local state = string_or_empty(row.connection_state)
    if state == "" then state = "connected" end
    local expires_at = timestamp(row.expires_at)
    if state == "connected" and expires_at ~= nil and now_unix ~= nil and expires_at <= now_unix then
        return "expired"
    end
    return state
end

function M.public_user_profile(user_profile: any): PublicUserProfile
    local profile = table_or_empty(user_profile)
    return {
        provider_user_id = string_or_empty(profile.provider_user_id),
        email = string_or_empty(profile.email),
        display_name = string_or_empty(profile.display_name),
        username = string_or_empty(profile.username),
        avatar_url = string_or_empty(profile.avatar_url),
    }
end

function M.public_info_from_metadata(metadata: any, user_profile: any?, now_unix: number?): PublicConnectionInfo
    local row = table_or_empty(metadata)
    return {
        component_id = row.component_id,
        provider = string_or_empty(row.provider),
        connection_name = string_or_empty(row.connection_name),
        connection_description = string_or_empty(row.connection_description),
        scopes_granted = string_or_empty(row.scopes_granted),
        connection_state = M.public_connection_state(row, now_unix),
        expires_at = row.expires_at,
        refresh_expires_at = row.refresh_expires_at,
        created_at = row.created_at,
        updated_at = row.updated_at,
        last_token_refresh = row.last_token_refresh,
        user_profile = M.public_user_profile(user_profile),
    }
end

function M.public_details_from_metadata(metadata: any, provider_info: any?, now_unix: number?): PublicConnectionDetails
    local row = table_or_empty(metadata)
    local provider = table_or_empty(provider_info)
    return ({
        component_id = row.component_id,
        provider = row.provider,
        connection_name = row.connection_name,
        connection_description = row.connection_description,
        connection_state = M.public_connection_state(row, now_unix),
        token_type = row.token_type,
        expires_at = row.expires_at,
        refresh_expires_at = row.refresh_expires_at,
        created_at = row.created_at,
        updated_at = row.updated_at,
        last_token_refresh = row.last_token_refresh,
        scopes_granted = row.scopes_granted,
        user_profile = M.public_user_profile(nil),
        user_display_name = "",
        user_email = "",
        provider_title = provider.title,
        provider_icon = provider.icon,
        provider_description = provider.description,
    }) :: PublicConnectionDetails
end

function M.public_provider_info(provider_info: any): any
    local provider = table_or_empty(provider_info)
    return {
        id = provider.id,
        name = provider.name,
        title = provider.title,
        description = provider.description,
        icon = provider.icon,
        oauth_provider = provider.oauth_provider,
        available_scopes = table_or_empty(provider.available_scopes),
        default_scopes = table_or_empty(provider.default_scopes),
    }
end

M.Map = Map
M.TokenSet = TokenSet
M.SecretPayload = SecretPayload
M.ConnectionData = ConnectionData
M.ConnectionMetadata = ConnectionMetadata
M.Connection = Connection
M.AccessTokenResult = AccessTokenResult
M.WriteResult = WriteResult
M.DeleteResult = DeleteResult
M.DbRow = DbRow
M.PublicUserProfile = PublicUserProfile
M.PublicConnectionInfo = PublicConnectionInfo
M.PublicConnectionDetails = PublicConnectionDetails

return M
