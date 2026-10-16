local sql = require("sql")
local security = require("security")
local oauth_token_repo = require("oauth_token_repo")
local time = require("time")
local M = {}
function M.refresh(request: any): any
    local db, err = sql.get("app:db")
    if err then error(tostring(err)) end
    local _, write_err = db:execute("INSERT INTO oauth_refresh_effect (connection_id,actor_id) VALUES ($1,$2)",
        { request.refresh_token, security.actor():id() })
    local rows, read_err = db:query("SELECT behavior FROM oauth_refresh_behavior WHERE connection_id=$1", { request.refresh_token })
    db:release()
    if write_err then error(tostring(write_err)) end
    if read_err then error(tostring(read_err)) end
    local behavior = rows[1] and rows[1].behavior
    if behavior == "invalid_grant" then
        return { success = false, error = "invalid_grant", response_received = true, requires_reauth = true }
    end
    if behavior == "temporarily_unavailable" then
        return { success = false, error = "Failed to refresh access token: HTTP 503 (temporarily_unavailable)",
            response_received = true, requires_reauth = false }
    end
    if behavior == "reauthorize_then_reject" then
        local _, update_err = oauth_token_repo.update_tokens(request.refresh_token, { access_token = "reauthorized" }, time.now():unix()+7201)
        if update_err then error(tostring(update_err)) end
        return { success = false, error = "old refresh token rejected", response_received = true, requires_reauth = true }
    end
    return { success = true, access_token = "refreshed", expires_in = 3601 }
end
function M.unused(): any error("unused OAuth connector method") end
return M
