local http = require("http")
local http_errors = require("http_errors")
local job_health = require("threads_contract")

local function handler(): ()
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)
    local health, read_err = job_health.read()
    if read_err then
        res:set_status((http_errors.classify(read_err :: error)))
        res:write_json(http_errors.response(read_err))
        return
    end
    res:write_json({ success = true, health = health })
end

return { handler = handler }
