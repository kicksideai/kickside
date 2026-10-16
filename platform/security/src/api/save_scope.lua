-- POST /security/scopes — create or update a DB-backed custom scope. Body:
-- { slug, label?, description?, policies: [policy_id...], internal?, enabled? }.
-- Writes the DB row (authoritative), then signals the scope projection service to
-- project it into a security.scope registry entry. Admin-only via firewall and an
-- explicit endpoint access check.

local http = require("http")
local api_errors = require("api_errors")
local json = require("json")
local security = require("security")
local store = require("scope_store")
local trigger_reconcile = require("trigger_reconcile")

local GATE = "kickside.security.api:save_scope.endpoint"

local function bad_request(res: any, err: error): (nil, error?)
    return api_errors.write(res, http.STATUS.BAD_REQUEST, err)
end

local function normalize_body(body: any): (any?, error?)
    if type(body.slug) ~= "string" or body.slug == "" then return nil, api_errors.invalid("slug is required", "slug") end
    if body.label ~= nil and type(body.label) ~= "string" then return nil, api_errors.invalid("label must be a string", "label") end
    if body.description ~= nil and type(body.description) ~= "string" then return nil, api_errors.invalid("description must be a string", "description") end
    if body.target ~= nil and type(body.target) ~= "string" then return nil, api_errors.invalid("target must be a string", "target") end
    if body.internal ~= nil and type(body.internal) ~= "boolean" then return nil, api_errors.invalid("internal must be a boolean", "internal") end
    if body.enabled ~= nil and type(body.enabled) ~= "boolean" then return nil, api_errors.invalid("enabled must be a boolean", "enabled") end
    if body.policies ~= nil and type(body.policies) ~= "table" then return nil, api_errors.invalid("policies must be an array", "policies") end
    local policies = {}
    for _, policy_id in ipairs(body.policies or {}) do
        if type(policy_id) ~= "string" or policy_id == "" then return nil, api_errors.invalid("policies must be non-empty strings", "policies") end
        policies[#policies + 1] = policy_id
    end
    return {
        slug = body.slug,
        label = body.label,
        description = body.description,
        policies = policies,
        target = body.target,
        internal = body.internal,
        enabled = body.enabled,
    }, nil
end

local function handler()
    local res, req, context_err = api_errors.context()
    if context_err then return nil, context_err end
    local header_err = api_errors.prepare(res)
    if header_err then return nil, header_err end

    local actor = security.actor()
    if not actor or not security.can("access", GATE) then
        return api_errors.write(res, http.STATUS.FORBIDDEN, api_errors.denied())
    end

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        return bad_request(res, api_errors.invalid("invalid request body", "body", raw_err))
    end
    local body, perr = json.decode(raw)
    if perr or type(body) ~= "table" then
        return bad_request(res, api_errors.invalid("invalid json", "body", perr))
    end

    local dto, derr = normalize_body(body)
    if not dto then
        return bad_request(res, derr :: error)
    end

    local actor_id = actor:id()
    local row, err, committed = store.upsert(dto, actor_id)
    if err then
        return api_errors.write(res, http.STATUS.BAD_REQUEST, err, nil, committed)
    end

    local _, reconcile_err = trigger_reconcile.trigger({ slug = (row :: any).slug })
    if reconcile_err then
        return api_errors.write(res, http.STATUS.INTERNAL_ERROR,
            (errors.wrap(reconcile_err, "scope saved but projection failed") :: error), {scope = row}, true)
    end

    return api_errors.respond(res, http.STATUS.OK, { success = true, scope = row }, true)
end

return { handler = handler }
