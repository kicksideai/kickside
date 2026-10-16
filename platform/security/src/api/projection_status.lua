-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local security = require("security")
local api_errors = require("api_errors")
local projection = require("scope_projection")

local function handler()
    local res, _, context_err = api_errors.context()
    if context_err then return nil, context_err end
    local header_err = api_errors.prepare(res)
    if header_err then return nil, header_err end

    local actor = security.actor()
    if not actor or not security.can("access", "kickside.security.api:projection_status.endpoint") then
        return api_errors.write(res, http.STATUS.FORBIDDEN, api_errors.denied())
    end
    local status, err = projection.group_set(actor:meta().security_groups)
    if err then return api_errors.write(res, http.STATUS.INTERNAL_ERROR, err) end
    return api_errors.respond(res, http.STATUS.OK, status)
end

return {handler = handler}
