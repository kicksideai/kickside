-- GET /security/scopes — the merged scope/role catalog (built-in groups,
-- registry security.scope entries, DB custom scopes) for the admin UI. Internal
-- scopes are excluded unless ?include_internal=true. Admin-only via firewall and
-- an explicit endpoint access check.

local http = require("http")
local api_errors = require("api_errors")
local security = require("security")
local catalog = require("scope_catalog")

local GATE = "kickside.security.api:list_scopes.endpoint"

local function handler()
    local res, req, context_err = api_errors.context()
    if context_err then return nil, context_err end
    local header_err = api_errors.prepare(res)
    if header_err then return nil, header_err end

    if not security.actor() or not security.can("access", GATE) then
        return api_errors.write(res, http.STATUS.FORBIDDEN, api_errors.denied())
    end

    local include_internal = req:query("include_internal") == "true"
    local scopes, err = catalog.scopes({ include_internal = include_internal })
    if err then
        return api_errors.write(res, http.STATUS.INTERNAL_ERROR, err)
    end
    return api_errors.respond(res, http.STATUS.OK, {success = true, scopes = scopes})
end

return { handler = handler }
