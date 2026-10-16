local M = {}

M.SESSION_MAP_TABLE = "kickside_channel_sessions"

function M.db_id(): (string?, string?)
    return "app:db", nil
end

function M.external_ref(provider: string, component_id: string, channel_id: string): string
    return provider .. ":" .. component_id .. ":" .. channel_id
end

return M
