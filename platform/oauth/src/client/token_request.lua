local form = require("form")
local json = require("json")
local base64 = require("base64")
local M = {}
type Params = { [string]: string }
type Request = { headers: { [string]: string }, body: string, timeout: string, max_response_body: integer }

-- Standard client_secret_post remains the default for existing providers.
-- Notion requires JSON + Basic; Airtable requires form + Basic.
function M.build(params: Params, auth_method: string?, encoding: string?): (Request?, error?)
    local method = auth_method or "client_secret_post"
    local format = encoding or "form"
    if method ~= "client_secret_basic" and method ~= "client_secret_post" and method ~= "none" then
        return nil, errors.new({kind = errors.INVALID, message = "Unsupported OAuth token authentication method"})
    end
    if format ~= "json" and format ~= "form" then
        return nil, errors.new({kind = errors.INVALID, message = "Unsupported OAuth token body encoding"})
    end
    local body: Params = {}
    for key, value in pairs(params) do body[key] = value end
    local headers = {Accept = "application/json", ["Content-Type"] = format == "json" and "application/json" or "application/x-www-form-urlencoded"}
    if method == "client_secret_basic" then
        if not body.client_id or not body.client_secret then
            return nil, errors.new({kind = errors.INVALID, message = "OAuth Basic authentication requires client credentials"})
        end
        headers.Authorization = "Basic " .. base64.encode(form.url_encode(body.client_id) .. ":" .. form.url_encode(body.client_secret))
        body.client_id, body.client_secret = nil, nil
    elseif method == "none" then body.client_secret = nil end
    local encoded = format == "json" and (json.encode(body) :: string) or form.encode(body)
    return {headers = headers, body = encoded, timeout = "15s", max_response_body = 1048576}, nil
end
return M
