-- kickside.contract:directory:exists — binding method over the directory adapter.
local directory = require("directory")

local function handler(input)
    return directory.exists(input or {})
end

return { handler = handler }
