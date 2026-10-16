local native = require("native")
local fixture = require("fixture")
return {combine = native.combine, has_all = native.has_all, normalize_access_mask = function(value, default)
    fixture.normalizations = fixture.normalizations + 1
    if fixture.source then return nil, fixture.source end
    if fixture.missing then return nil, nil end
    return native.normalize_access_mask(value, default)
end}
