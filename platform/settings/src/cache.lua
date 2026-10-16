-- In-memory override cache (store.memory). The whole override set lives under one
-- key as a { "ns\0key" = record } map, so a read is a single store hit + decode
-- and never touches the DB. The canonical writer and the boot warmer are the only
-- things that replace it.

local store = require("store")
local json = require("json")
local settings_types = require("settings_types")

local STORE_ID = "kickside.settings:cache"
local MAP_KEY = "overrides"

local M = {}

-- read returns the override map, or nil when the cache is cold (never warmed or
-- evicted). Callers warm from the DB on nil.
function M.read(): settings_types.OverrideMap?
    local s, err = store.get(STORE_ID)
    if err or not s then return nil end
    local raw = s:get(MAP_KEY)
    s:release()
    if raw == nil then return nil end
    local map, derr = json.decode(tostring(raw))
    if derr or type(map) ~= "table" then return nil end
    return map :: settings_types.OverrideMap
end

-- replace overwrites the whole map. Used by warm() and write-through.
function M.replace(map: any): ()
    local s, err = store.get(STORE_ID)
    if err or not s then return end
    -- ttl 0 = never expire; settings persist until the next write.
    s:set(MAP_KEY, json.encode(map), 0)
    s:release()
end

return M
