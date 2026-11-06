local cache = require("settings_cache")
local writer = require("settings_writer")

local function replace(): any
    local ok, err = cache.replace({}, 0)
    return { success = ok, error = err and tostring(err) or nil }
end

local function reload(): any
    local map, err = writer.reload()
    return { success = map ~= nil, error = err and tostring(err) or nil }
end

local function write(): any
    local ok, err = writer.set("kickside.settings.test", "max_items", 19, "admin")
    return { success = ok, error = err and tostring(err) or nil }
end

return { replace = replace, reload = reload, write = write }
