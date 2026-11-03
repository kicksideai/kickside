-- In-memory override cache (store.memory). The whole override set lives under one
-- key with the revision it was read at, so a read is a single store hit + decode
-- and never touches the DB. The canonical writer and the change keeper are the
-- only things that replace it.

local store = require("store")
local json = require("json")
local settings_types = require("settings_types")

local STORE_ID = "kickside.settings:cache"
local SNAPSHOT_KEY = "snapshot"

local M = {}

type Snapshot = { revision: number, overrides: settings_types.OverrideMap }

local function snapshot(): Snapshot?
    local s, err = store.get(STORE_ID)
    if err or not s then return nil end
    local raw = s:get(SNAPSHOT_KEY)
    s:release()
    if raw == nil then return nil end
    local decoded, derr = json.decode(tostring(raw))
    if derr or type(decoded) ~= "table" or type(decoded.revision) ~= "number"
        or type(decoded.overrides) ~= "table" then
        return nil
    end
    return decoded :: Snapshot
end

-- read returns the override map, or nil when the cache is cold (never warmed or
-- evicted). Callers warm from the DB on nil.
function M.read(): settings_types.OverrideMap?
    local current = snapshot()
    return current and current.overrides or nil
end

-- revision returns the override revision the cache holds, or nil when cold.
function M.revision(): number?
    local current = snapshot()
    return current and current.revision or nil
end

-- replace overwrites the whole map and the revision it reflects.
function M.replace(map: any, revision: number): ()
    local s, err = store.get(STORE_ID)
    if err or not s then return end
    -- ttl 0 = never expire; settings persist until the next write.
    s:set(SNAPSHOT_KEY, json.encode({ revision = revision, overrides = map }), 0)
    s:release()
end

return M
