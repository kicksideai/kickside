-- In-memory override snapshots. A snapshot holds the complete override map and
-- its stored revision; a missing or unreadable snapshot is cold. Readers reload
-- cold snapshots through the canonical writer, which also replaces them after
-- writes and change propagation.

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

-- replace publishes the complete map and revision, or returns (false, error).
-- Callers must report a failed replacement instead of claiming the cache is warm.
function M.replace(map: any, revision: number): (boolean, any?)
    local encoded, eerr = json.encode({ revision = revision, overrides = map })
    if eerr then return false, eerr end
    local s, err = store.get(STORE_ID)
    if err or not s then return false, err or "settings cache unavailable" end
    -- ttl 0 = never expire; settings persist until the next replacement.
    local _, serr = s:set(SNAPSHOT_KEY, encoded, 0)
    s:release()
    if serr then return false, serr end
    return true, nil
end

return M
