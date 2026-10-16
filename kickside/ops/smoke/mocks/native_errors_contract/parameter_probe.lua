local http = require("http")
local http_params = require("http_params")

local function handler(): ()
    local req, res = http.request(), http.response()
    res:set_content_type(http.CONTENT.JSON)
    local limit, err = http_params.query_int(req, "limit", nil, { min = 1, max = 100 })
    if err then
        http_params.bad_request(res, err:message(), err)
        return
    end
    res:write_json({ success = true, limit = limit })
end

return { handler = handler }
