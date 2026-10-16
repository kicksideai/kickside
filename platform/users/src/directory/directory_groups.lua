-- kickside.contract:directory:groups — binding method over the directory adapter.
local directory = require("directory")

local function handler(input)
    return directory.groups(input or {})
end

return { handler = handler }
