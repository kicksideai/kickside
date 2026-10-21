local M = {}
function M.resolve(field)
    if field == "id" then return "protocol-client" end
    return "protocol-secret"
end
function M.token()
    local http, json, form = require("http"), require("json"), require("form")
    local req, res = http.request(), http.response()
    local raw, err = req:body()
    if err then return nil, err end
    local is_json = req:header("Content-Type") == "application/json"
    local basic = req:header("Authorization") == "Basic cHJvdG9jb2wtY2xpZW50OnByb3RvY29sLXNlY3JldA=="
    local parsed = is_json and json.decode(raw) or nil
    local valid = false
    if is_json then
        valid = basic and parsed.grant_type == "authorization_code" and parsed.code == "demo-code"
            and parsed.client_id == nil and parsed.client_secret == nil
    else
        valid = raw:find("grant_type=", 1, true) ~= nil
            and ((basic and not raw:find("client_secret=", 1, true))
                or (raw:find("client_id=protocol-client", 1, true) and raw:find("client_secret=protocol-secret", 1, true)))
    end
    if not valid then res:set_status(400); return res:write_json({error = "invalid_request"}) end
    return res:write_json({access_token = "protocol-access", refresh_token = "protocol-refresh", expires_in = 3600, token_type = "Bearer"})
end
return M
