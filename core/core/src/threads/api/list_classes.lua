-- GET /thread-classes — the distinct thread_class vocabulary in use. Response:
-- { success, classes }.

local http = require("http")
local http_errors = require("http_errors")
local http_params = require("http_params")
local contract = require("threads_contract")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local contract = deps.threads_contract or contract

local function handler(): ()
    local req = http.request()
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)

    local limit, limit_err = http_params.query_int(req, "limit", nil, { min = 1, max = 1000 })
    if limit_err then
        http_params.bad_request(res, limit_err:message(), limit_err)
        return
    end
    local result, read_err = contract.list_classes({limit = limit, cursor = req:query("cursor")})
    if read_err or not result then
        res:set_status((http_errors.classify(read_err :: error)))
        if not read_err then
            read_err = errors.new({kind = errors.INTERNAL, retryable = false,
                message = "class listing returns no result", details = {code = "core_http_classes_response"}})
        end
        res:write_json(http_errors.response(read_err))
        return
    end

    res:write_json({ success = true, classes = (result :: any).classes, next_cursor = (result :: any).next_cursor })
end

return { handler = handler }
end

local default = new()
default.new = new
return default
