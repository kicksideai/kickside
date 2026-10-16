-- POST /component-access/share/{id} — grant / change / revoke a subject's access on a
-- component, for the share popup. ADMIN-gated; the grant/revoke cascades through
-- the component service subtree path. The last-admin invariant is enforced at
-- the domain layer (ops.apply_subtree_access) so every caller is covered.
--   body: { subject_id, subject_type, access_mask } to grant/change,
--         { subject_id, subject_type, action: "revoke" } to remove.
-- subject_type is required (one of user, group, service): a body that omits it
-- or spells an unsupported kind is refused with 400 and changes nothing.

local http = require("http")
local json = require("json")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local access_policy = require("access_policy")
local http_context = require("http_context")
local error_envelope = require("error_envelope")
local envelope = require("envelope")

local ADMIN = component.ACCESS.ADMIN

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local json = deps.json or json
    local security = deps.security or security
    local component = deps.component or component
    local access_policy = deps.access_policy or access_policy

    local function handler()
        local res, req, context_err = http_context.require(http, true)
        if context_err then return nil, context_err end
        res:set_content_type(http.CONTENT.JSON)

        local actor = security.actor()
        if not actor then
            res:set_status(http.STATUS.UNAUTHORIZED)
            res:write_json({ success = false, error = "authentication required" })
            return
        end

        local component_id = req:param("id")
        if not component_id or component_id == "" then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "id is required" })
            return
        end

        local raw, raw_err = req:body()
        if raw_err or type(raw) ~= "string" then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "invalid request body" })
            return
        end
        local body, body_err = json.decode(raw)
        if body_err or type(body) ~= "table" then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "invalid json" })
            return
        end

        local subject, subject_err = access_policy.normalize_share_subject(body)
        if subject_err then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = subject_err:message(), kind = subject_err:kind(),
                retryable = subject_err:retryable(), details = subject_err:details() })
            return
        end
        local subject_id = subject.id
        local revoke = body.action == "revoke"
        local mask = component.ACCESS.READ
        if not revoke then
            local normalized_mask, mask_err = access_policy.normalize_access_mask(body.access_mask, 1)
            if mask_err then
                res:set_status(http.STATUS.BAD_REQUEST)
                res:write_json({ success = false, error = mask_err:message(), kind = mask_err:kind(),
                retryable = mask_err:retryable(), details = mask_err:details() })
                return
            end
            mask = normalized_mask
        end

        -- Gate: only an admin of the component may change its sharing.
        local _, gate_err = component.validate_access(component_id, ADMIN)
        if gate_err then
            local status = http_errors.classify(gate_err)
            local payload = http_errors.response(gate_err)
            payload.error = tostring(gate_err)
            res:set_status(status)
            res:write_json(payload)
            return
        end

        local _, owner, list_err = component.list_access(component_id)
        if list_err then
            local payload = http_errors.response(list_err)
            payload.error = tostring(list_err)
            res:set_status((http_errors.classify(list_err)))
            res:write_json(payload)
            return
        end

        -- The owner's access is fixed — they always retain full control of their
        -- component. Sharing changes can never touch the owner's grant.
        if owner and subject_id == owner then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "the owner's access can't be changed" })
            return
        end

        local service, service_err = component.get_service()
        if not service_err then service, service_err = error_envelope.binding(service, nil, revoke and "revoke_subtree" or "grant_subtree", "open component sharing service", "component_http_operation_response") end
        if service_err then
            local payload = http_errors.response(service_err)
            payload.error = "component service unavailable"
            res:set_status((http_errors.classify(service_err)))
            res:write_json(payload)
            return
        end

        -- A grant/revoke is the source of inheritance for the whole subtree, so every
        -- share cascades through the subtree path (a direct grant on a node always
        -- reaches its descendants).
        local subtree_subject, subtree_err = access_policy.subtree_subject(subject)
        if subtree_err then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = subtree_err:message(), kind = subtree_err:kind(),
                retryable = subtree_err:retryable(), details = subtree_err:details() })
            return
        end
        local result, apply_err
        if revoke then
            result, apply_err = service:revoke_subtree({ root_component_id = component_id, subject = subtree_subject })
        else
            result, apply_err = service:grant_subtree({ root_component_id = component_id, subject = subtree_subject, access_mask = mask })
        end
        if not apply_err then
            result, apply_err = error_envelope.binding(result, nil, nil, "share component", "component_http_operation_response")
            if not apply_err then apply_err = envelope.error_of(result, "share component") end
        end
        if apply_err then
            local payload = http_errors.response(apply_err)
            payload.error = (result and result.error) or tostring(apply_err)
            res:set_status((http_errors.classify(apply_err)))
            res:write_json(payload)
            return
        end

        res:set_status(http.STATUS.OK)
        res:write_json({ success = true, result = { component_id = component_id, subject_id = subject_id, subject_type = subject.subject_type, action = revoke and "revoke" or "grant" } })
    end

    return { handler = handler }
end

local default = new()
default.new = new
return default
