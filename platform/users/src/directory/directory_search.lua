-- kickside.contract:directory:search — binding method over the directory adapter.
local directory = require("directory")

local function handler(input)
    return directory.search(input or {})
end

return { handler = handler }
