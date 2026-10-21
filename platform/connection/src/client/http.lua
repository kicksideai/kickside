local component = require("component")
local capacity_http = require("capacity_http")
local http_client = require("http_client")
local json = require("json")
local time = require("time")
local base64 = require("base64")
local types = require("types")
local M = {}

local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, message = message})
end

-- Configured origins are operator-owned. Caller payloads never select URLs.
function M.valid_endpoint(url: string): boolean
    if url:find("[%c%s#@\\]") then return false end
    local scheme, authority = url:match("^(https?)://([^/]+)")
    if not scheme or not authority then return false end
    if scheme == "https" then return true end
    local host = authority:match("^([^:]+)")
    return host == "localhost" or host == "127.0.0.1"
end

local function safe_token(value: unknown): boolean
    return type(value) == "string" and value ~= "" and not value:find("[%c%s]")
end

function M.new(dependencies: types.Object?): types.Client
    local deps = dependencies or {}
    local components = (deps.component or component) :: typeof(component)
    local http = (deps.http or http_client) :: typeof(http_client)
    local capacity = (deps.capacity or capacity_http) :: typeof(capacity_http)
    local client = {}

    function client.connect(provider: string, selected: string?, write: boolean, deadline: string?, api_key_scheme: string?): (types.Connection?, error?)
        local mask = write and components.ACCESS.WRITE or components.ACCESS.READ
        local rows, err = components.query({component_ids = selected and {selected} or nil,
            meta = {provider = provider, class = "connection"}, access_mask = mask,
            include = {meta = true}, limit = 2})
        if err then return nil, err end
        if not rows or #rows ~= 1 then
            return nil, invalid("Select exactly one accessible " .. provider .. " connection")
        end
        local row = rows[1]
        if not row.meta or row.meta.provider ~= provider then return nil, invalid("Connection provider mismatch") end
        if row.meta.connection_state == "disabled" or row.meta.connection_state == "needs_reauth" then
            return nil, invalid("Connection requires authorization")
        end
        -- This second check is the effect gate; query alone is not authority to
        -- read private context or mutate an external service.
        local stored, context_err = components.get_context(row.component_id, mask)
        if context_err or not stored then return nil, context_err end
        local conn: types.Connection = {component_id = row.component_id, deadline = deadline, api_key_scheme = api_key_scheme}
        if safe_token(stored.api_key) then
            conn.access_token = stored.api_key :: string
        else
            local source, open_err = components.open(row.component_id, mask, "kickside.oauth:oauth_connection_contract")
            if open_err then return nil, open_err end
            conn.oauth = source :: types.TokenSource
        end
        return conn, nil
    end

    local function token(conn: types.Connection, rejected: string?): (string?, error?)
        if not conn.oauth then
            if not safe_token(conn.access_token) then return nil, invalid("Connection token is invalid") end
            return conn.access_token, nil
        end
        local result, err = conn.oauth:get_access_token(rejected and {rejected_access_token = rejected} or nil)
        if err then return nil, err end
        if not result or not result.success or not safe_token(result.access_token) then
            return nil, invalid("OAuth connection requires authorization")
        end
        return result.access_token, nil
    end

    function client.request(conn: types.Connection, request: types.Request): (types.Result?, error?)
        if not M.valid_endpoint(request.url) then return nil, invalid("Provider endpoint must use HTTPS or loopback HTTP") end
        local credential, token_err = token(conn)
        if not credential then return nil, token_err end
        local function send(): (types.Result?, error?)
            for attempt = 1, 2 do
                local timeout = 30
                if conn.deadline then
                    local deadline, parse_err = time.parse(time.RFC3339, conn.deadline)
                    if parse_err or not deadline then return nil, invalid("Invalid caller deadline") end
                    timeout = math.min(timeout, math.floor(deadline:sub(time.now()):seconds()))
                    if timeout < 1 then return nil, errors.new({kind = errors.TIMEOUT, message = "Provider request deadline elapsed"}) end
                end
                local headers: { [string]: string } = {}
                for key, value in pairs(request.headers) do headers[key] = value end
                headers.Authorization = (not conn.oauth and conn.api_key_scheme == "raw" and "" or "Bearer ") .. credential
                local options: {headers: { [string]: string }, body: string?, timeout: string, max_response_body: number} = {
                    headers = headers, body = request.body, timeout = tostring(timeout) .. "s", max_response_body = 10485760}
                local response, err = http.request(request.method, request.url, options)
                -- A network error on a write has an unknown outcome. Never replay it.
                if err then return nil, errors.new({kind = errors.UNAVAILABLE, retryable = false,
                    message = "Provider request failed; its outcome may be unknown"}) end
                if not response or type(response.status_code) ~= "number" then
                    return nil, errors.new({kind = errors.INTERNAL, message = "Malformed provider HTTP response"})
                end
                local status = response.status_code
                if status == 401 and attempt == 1 and conn.oauth then
                    local refreshed, refresh_err = token(conn, credential)
                    if not refreshed then return nil, refresh_err end
                    credential = refreshed
                else
                    if status >= 200 and status < 300 then
                        if request.raw then
                            return {success = true, status_code = status,
                                data = {content_base64 = base64.encode(response.body or ""), headers = response.headers}}
                        end
                        local data: unknown = nil
                        if response.body and response.body ~= "" then
                            local decoded, decode_err = json.decode(response.body)
                            if decode_err then return nil, errors.new({kind = errors.INTERNAL, message = "Invalid provider JSON response"}) end
                            data = decoded
                        end
                        return {success = true, status_code = status, data = data,
                            retry_after_ms = status == 202 and response.headers
                                and (response.headers["Retry-After"] or response.headers["retry-after"])
                                and capacity.retry_after(response) or nil}
                    end
                    -- Avoid returning raw errors: providers sometimes echo request
                    -- headers or tokens. Keep classification and Retry-After.
                    return {success = false, status_code = status, error = "Provider rejected request (HTTP " .. tostring(status) .. ")",
                        retry_after_ms = status == 429 and capacity.retry_after(response) or nil}
                end
            end
            return nil, errors.new({kind = errors.INTERNAL, message = "Provider authentication retry exhausted"})
        end
        return capacity.new().invoke(conn.component_id, send)
    end
    return client :: types.Client
end
return M
