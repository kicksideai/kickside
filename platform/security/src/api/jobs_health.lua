local http = require("http")
local security = require("security")
local logger = require("logger")
local api_errors = require("api_errors")
local jobs = require("jobs")

local function handler()
    local res, _, context_err = api_errors.context()
    if context_err then return nil, context_err end
    local header_err = api_errors.prepare(res)
    if header_err then return nil, header_err end

    if not security.actor() or not security.can("access", "kickside.security.api:jobs_health.endpoint") then
        return api_errors.write(res, http.STATUS.FORBIDDEN, api_errors.denied())
    end

    local health, read_err = jobs.health()
    if read_err then
        logger:error("Jobs health read failed", {error = tostring(read_err), kind = read_err:kind(), details = read_err:details()})
        return api_errors.write(res, http.STATUS.INTERNAL_ERROR, errors.new({
            kind = errors.INTERNAL, message = "Jobs health is unavailable", retryable = false,
        }))
    end
    return api_errors.respond(res, http.STATUS.OK, {success = true, health = health})
end

return {handler = handler}
