local http = require("http")
local security = require("security")
local automations_lib = require("automations_lib")
local api_errors = require("api_errors")

local function handler()
    local res, req = http.response(), http.request()
    if not res or not req then return nil, errors.new({kind = errors.INTERNAL, message = "no http context"}) end
    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({success = false, error = api_errors.error("authentication_required", "authentication required")})
        return
    end
    local body, parse_err = req:body_json()
    if parse_err or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({success = false, error = api_errors.error("invalid_json", "source sample request must be an object")})
        return
    end
    local result, err = automations_lib.source_samples(body.source, body.config, body.limit)
    if err then
        local status, payload = api_errors.status(err, "source_samples_failed", "could not read source samples")
        res:set_status(status)
        res:write_json({success = false, error = payload})
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({success = true, samples = result.samples, output_schema = result.output_schema})
end
return {handler = handler}
