-- A declaration-fed pullable used only by local end-to-end tests. Changing
-- config.items through the automation HTTP reconfigure API changes the source.
local M = {}
local time = require("time")
local logger = require("logger")

type Map = { [string]: any }

local function page(request: any, keys_only: boolean): Map
    local r = type(request) == "table" and (request :: Map) or {}
    local config = type(r.config) == "table" and (r.config :: Map) or {}
    local all = type(config.items) == "table" and (config.items :: { Map }) or {}
    local from = math.max(0, math.floor(tonumber(r.cursor) or 0))
    local limit = math.max(1, math.floor(tonumber(r.limit) or 1))
    if not keys_only and type(config.delay_ms) == "number" and config.delay_ms > 0 then
        logger:named("app.test.e2e.collection"):info("collection pull entered", { cursor = from, delay_ms = config.delay_ms })
        time.sleep(tostring(math.floor(config.delay_ms)) .. "ms")
    end
    local items: { Map } = {}
    local keys: { string } = {}
    for i = from + 1, math.min(#all, from + limit) do
        local item = (all[i] or {}) :: Map
        local key = tostring(item.key)
        keys[#keys + 1] = key
        items[#items + 1] = { item_key = key, dedup_key = key, op = "upsert",
            payload = { content = tostring(item.content) } }
    end
    local next_cursor = from + #keys
    if keys_only then
        return { success = true, keys = keys, next_cursor = next_cursor, has_more = next_cursor < #all }
    end
    return { success = true, items = items, next_cursor = next_cursor, has_more = next_cursor < #all }
end

function M.pull(request: any): (Map, nil)
    return page(request, false), nil
end

function M.pull_keys(request: any): (Map, nil)
    return page(request, true), nil
end

return M
