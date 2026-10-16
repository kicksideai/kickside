-- DELETE /security/scopes?slug=<slug> — remove a DB-backed custom scope, then
-- signal the scope projection service to remove the projected security.scope registry
-- entry. Admin-only via firewall and an explicit endpoint access check.

local http = require("http")
local api_errors = require("api_errors")
local security = require("security")
local store = require("scope_store")
local trigger_reconcile = require("trigger_reconcile")

local GATE = "kickside.security.api:delete_scope.endpoint"

local function handler()
    local res, req, context_err = api_errors.context()
    if context_err then return nil, context_err end
    local header_err = api_errors.prepare(res)
    if header_err then return nil, header_err end

    if not security.actor() or not security.can("access", GATE) then
        return api_errors.write(res, http.STATUS.FORBIDDEN, api_errors.denied())
    end

    local slug = req:query("slug")
    if not slug or slug == "" then
        return api_errors.write(res, http.STATUS.BAD_REQUEST, api_errors.invalid("slug is required", "slug"))
    end

    local _, err = store.delete(slug)
    if err then
        return api_errors.write(res, http.STATUS.BAD_REQUEST, err)
    end

    local _, reconcile_err = trigger_reconcile.trigger({ slug = slug })
    if reconcile_err then
        return api_errors.write(res, http.STATUS.INTERNAL_ERROR,
            (errors.wrap(reconcile_err, "scope deleted but projection failed") :: error), {slug = slug}, true)
    end

    return api_errors.respond(res, http.STATUS.OK, { success = true, slug = slug }, true)
end

return { handler = handler }
