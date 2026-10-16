local store = require("store")
local json = require("json")
local models_types = require("models_types")

local M = {}

function M.read(): any?
    local s, err = store.get(models_types.CACHE_ID)
    if err or not s then return nil end
    local raw = s:get(models_types.CACHE_KEY)
    s:release()
    if raw == nil then return nil end
    local decoded, derr = json.decode(tostring(raw))
    if derr or type(decoded) ~= "table" then return nil end
    return decoded
end

function M.replace(snapshot: any): ()
    local s, err = store.get(models_types.CACHE_ID)
    if err or not s then return end
    s:set(models_types.CACHE_KEY, json.encode(snapshot or {}), 0)
    s:release()
end

function M.clear(): ()
    local s, err = store.get(models_types.CACHE_ID)
    if err or not s then return end
    s:delete(models_types.CACHE_KEY)
    s:release()
end

return M
