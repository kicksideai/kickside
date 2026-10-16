local real = require("real")
local fixture = require("fixture")
return {trim = real.trim, to_int = real.to_int, normalize_created_at = fixture.created_at,
    normalize_content = real.normalize_content, normalize_external = real.normalize_external}
