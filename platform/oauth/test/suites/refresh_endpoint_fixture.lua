local http = require("http")
local sql = require("sql")
local oauth_repo = require("oauth_repo")
local time = require("time")
local M = {}
function M.handle(): (any?, any?)
    local req, res = http.request(), http.response()
    local body, body_err = req:body()
    if body_err then return nil, body_err end
    local token = body:match("refresh_token=([^&]+)")
    if not token or not body:find("grant_type=refresh_token", 1, true) then
        res:set_status(400)
        return res:write_json({ error = "invalid_request" })
    end
    local db, err = sql.get("app:db")
    if err then return nil, err end
    local _, write_err = db:execute("INSERT INTO oauth_http_refresh_requests (token) VALUES ($1)", { token })
    db:release()
    if write_err then return nil, write_err end
    local connection_id = token:match("^reauthorize%-%a+%-(.+)$")
    if connection_id then
        local _, update_err = oauth_repo.update_connection(connection_id, {
            connection_state = "connected",
            tokens = { access_token = "reauthorized-" .. connection_id, refresh_token = "new-grant-" .. connection_id },
            expires_at = time.now():unix() + 7200,
        })
        if update_err then return nil, update_err end
        if token:find("reauthorize-reject-", 1, true) then
            res:set_status(400)
            return res:write_json({ error = "invalid_grant" })
        end
    end
    if token:find("revoked", 1, true) then
        res:set_status(400)
        return res:write_json({ error = "invalid_grant", error_description = "private provider detail" })
    end
    if token:find("unavailable", 1, true) then
        res:set_status(503)
        return res:write_json({ error = "temporarily_unavailable" })
    end
    return res:write_json({ access_token = "renewed-" .. token, expires_in = 3600, token_type = "Bearer" })
end
return M
