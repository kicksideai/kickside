local http = require("http")
local authorization = require("authorization")

local function handler()
    local req, res = http.request(), http.response()
    if not req or not res then return nil, "Failed to get HTTP context" end
    res:set_content_type(http.CONTENT.JSON)
    if req:method() ~= "POST" then
        res:set_status(http.STATUS.METHOD_NOT_ALLOWED)
        res:write_json({success = false, error = "Method not allowed. Use POST."})
        return
    end
    local body, parse_err = req:body_json()
    if parse_err or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({success = false, error = "Invalid JSON request body: " .. tostring(parse_err or "expected a JSON object")})
        return
    end
    local result, status = authorization.start(req:param("provider_name"), body)
    res:set_status(status :: integer)
    res:write_json(result)
end

return {handler = handler}
