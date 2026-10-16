-- kickside.contract:directory:resolve — binding method over the directory adapter.
local directory = require("directory")

local function handler(input)
    return directory.resolve(input or {})
end

return { handler = handler }
