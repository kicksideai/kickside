local ctx = require("ctx")
local time = require("time")
local component = require("component")
local oauth_types = require("oauth_types")

local function read_public_meta(component_id: string): (any?, any?, string?)
    local rows, err = component.list_system({
        component_ids = { component_id },
        include = { meta = true },
        limit = 1,
    })
    if err then return nil, nil, tostring(err) end
    local row = rows and rows[1]
    if not row then return nil, nil, "component not found" end
    return row.meta or {}, row, nil
end

local function handle(request_dto)
    -- Get component ID from context
    local component_id, err = ctx.get("component_id")
    if err then
        return {
            description = "Error: No component context",
            updated_at = time.now():utc():format_rfc3339()
        }
    end

    local meta, row, meta_err = read_public_meta(component_id :: string)
    if meta_err then
        return {
            description = "Error: Failed to get connection status - " .. meta_err,
            updated_at = time.now():utc():format_rfc3339()
        }
    end

    local now = time.now()
    local current_time = now:unix()
    local state = oauth_types.public_connection_state(meta, current_time)

    local provider = (meta and meta.provider) or "unknown provider"
    local status_parts = {}
    table.insert(status_parts, "OAuth connection to " .. provider)
    table.insert(status_parts, "State: " .. state)
    if state == "needs_reauth" and type(meta.reauth_reason) == "string" and meta.reauth_reason ~= "" then
        table.insert(status_parts, "Reconnect reason: " .. meta.reauth_reason)
    end

    local expires_at = oauth_types.timestamp(meta and meta.expires_at)
    if expires_at then
        local expires_at_unix = expires_at :: number
        local is_expired = current_time >= expires_at_unix

        if is_expired then
            table.insert(status_parts, "Token: EXPIRED")
        else
            local expires_in_hours = math.floor((expires_at_unix - current_time) / 3600)
            if expires_in_hours > 24 then
                local expires_in_days = math.floor(expires_in_hours / 24)
                table.insert(status_parts, "Token: Valid for " .. expires_in_days .. " days")
            elseif expires_in_hours > 0 then
                table.insert(status_parts, "Token: Valid for " .. expires_in_hours .. " hours")
            else
                local expires_in_minutes = math.floor((expires_at_unix - current_time) / 60)
                table.insert(status_parts, "Token: Valid for " .. expires_in_minutes .. " minutes")
            end
        end
    elseif meta and meta.expires_at ~= nil and meta.expires_at ~= "" then
        table.insert(status_parts, "Token: Invalid expiration")
    else
        table.insert(status_parts, "Token: No expiration")
    end

    local scopes_granted = meta and meta.scopes_granted
    if type(scopes_granted) == "string" and scopes_granted ~= "" then
        local scope_count = 0
        for _ in scopes_granted:gmatch("%S+") do
            scope_count = scope_count + 1
        end
        table.insert(status_parts, "Scopes: " .. scope_count .. " granted")
    end

    return {
        status = state,
        description = table.concat(status_parts, " | "),
        updated_at = (meta and meta.updated_at) or (row and row.updated_at) or now:utc():format_rfc3339()
    }
end

return { handle = handle }
