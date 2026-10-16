local fixture = require("fixture")
local function normalize_access_mask(value: integer?, default: integer?): (integer?, error?)
    return fixture.normalize_access_mask(value, default)
end
return {normalize_access_mask = normalize_access_mask, has_all = function(actual, required) return actual >= required end}
