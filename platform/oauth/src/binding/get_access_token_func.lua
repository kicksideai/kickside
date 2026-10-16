local ctx = require("ctx")
local time = require("time")
local oauth_token_repo = require("oauth_token_repo")
local token_refresh_core = require("token_refresh_core")

local function timestamp(value: any): number?
    if type(value) == "number" then return value end
    if type(value) == "string" and value:match("^%d+$") then return tonumber(value) end
    return nil
end

local function read_token(component_id: string)
    local token_data, err = oauth_token_repo.get_access_token(component_id)
    if err then
        return nil, "Failed to get access token: " .. err
    end
    return token_data, nil
end

local function is_expired(token_data: any, now_unix: number): boolean
    local expires_at = token_data and timestamp(token_data.expires_at)
    return expires_at ~= nil and now_unix >= (expires_at :: number)
end

local function handle(request_dto)
    -- Get component ID from context
    local component_id, err = ctx.get("component_id")
    if err then
        return {
            success = false,
            error = "No component context: " .. err
        }
    end

    -- Get token data from repository
    local token_data, err = read_token(component_id :: string)
    if err then
        return {
            success = false,
            error = err
        }
    end

    local current_time = time.now():unix()

    -- If the scheduled refresh was missed while the app was down, recover on
    -- the first real token read. This keeps provider tools generic: they all
    -- depend on this OAuth contract instead of provider-specific refresh code.
    local expired = is_expired(token_data, current_time)
    local rejected = type(request_dto) == "table" and request_dto.rejected_access_token
    if expired or (type(rejected) == "string" and rejected == token_data.access_token) then
        local refresh_result = token_refresh_core.handle({
            schedule_id = "on-demand",
            args = {
                component_id = component_id,
                reason = expired and "get_access_token" or "api_401"
            }
        })
        if not refresh_result or refresh_result.success ~= true then
            return {
                success = false,
                error = (expired and "Token expired and refresh failed: " or "Rejected token refresh failed: ") ..
                    tostring(refresh_result and refresh_result.error or "unknown error"),
                expires_at = token_data.expires_at,
                is_expired = expired
            }
        end

        token_data, err = read_token(component_id :: string)
        if err then
            return {
                success = false,
                error = err
            }
        end
        current_time = time.now():unix()

        if is_expired(token_data, current_time) then
            return {
                success = false,
                error = "Token refresh completed but token remains expired",
                expires_at = token_data.expires_at,
                is_expired = true
            }
        end
    end

    -- Return token information
    return {
        success = true,
        access_token = token_data.access_token,
        token_type = "Bearer",
        expires_at = token_data.expires_at,
        is_expired = is_expired(token_data, current_time)
    }
end

return { handle = handle }
