-- Public webhook ingress logic, transport-free so it unit-tests without HTTP. The
-- handler hands it the path id, the presented secret, and the decoded body; this
-- resolves the webhook, verifies the secret against the stored hash, validates the
-- body against the webhook's declared schema, and appends the validated payload as
-- an inbound event on the webhook's thread (the durable queue the poller drains).
--
-- Returns (status, body) so the handler is a thin shell. An unknown id and a revoked
-- webhook both return 404 so the endpoint never reveals which ids exist.

local hash = require("hash")
local consts = require("webhook_consts")
local validator = require("webhook_validator")

local M = {}

type Map = { [string]: any }

type Deps = {
    repo: any?,
    validator: any?,
    hash: any?,
}

local function repo_of(deps: Deps?): any
    if deps and deps.repo then return deps.repo end
    return require("webhook_repo")
end

local function hash_of(deps: Deps?): any
    return (deps and deps.hash) or hash
end

local function validate_of(deps: Deps?): any
    return ((deps and deps.validator) or validator).validate
end

-- process(webhook_id, secret, payload, deps) -> (status: integer, body: Map)
function M.process(webhook_id: any, secret: any, payload: any, deps: Deps?, idempotency_key: string?): (integer, Map)
    if type(webhook_id) ~= "string" or webhook_id == "" then
        return 404, { success = false, error = "webhook not found" }
    end

    local repo = repo_of(deps)
    local rec, rerr = repo.resolve(webhook_id)
    if not rec or rerr then
        return 404, { success = false, error = "webhook not found" }
    end
    local r = rec :: Map
    if tostring(r.status) ~= consts.STATUS.ACTIVE then
        return 404, { success = false, error = "webhook not found" }
    end

    if type(secret) ~= "string" or secret == "" then
        return 401, { success = false, error = "secret required" }
    end
    if hash_of(deps).sha256(secret :: string) ~= tostring(r.secret_hash) then
        return 401, { success = false, error = "invalid secret" }
    end

    if type(payload) ~= "table" then
        return 400, { success = false, error = "request body must be a JSON object" }
    end
    local ok, verr = validate_of(deps)(r.schema, payload)
    if not ok then
        return 400, { success = false, error = tostring(verr) }
    end

    local _, aerr = repo.append_event(r, payload, idempotency_key)
    if aerr then
        if errors.is(aerr, errors.PERMISSION_DENIED) then
            return 403, { success = false, error = tostring(aerr) }
        end
        return 500, { success = false, error = tostring(aerr) }
    end

    repo.touch_last_used(webhook_id)

    return 202, { success = true, accepted = true }
end

return M
