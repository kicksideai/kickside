local http = require("http")
local json = require("json")
local registry = require("registry")
local execution_identity = require("execution_identity")
local component = require("component")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")

local M = {}

local OWNER = "smoke.identity_authority:deferred_owner"
local PROBE = "smoke.identity_authority:identity_probe"

local function response(status, body)
    local res = assert(http.response())
    res:set_content_type(http.CONTENT.JSON)
    res:set_status(status)
    res:write_json(body)
end

local function body()
    local request = assert(http.request())
    local raw, read_err = request:body()
    if read_err or type(raw) ~= "string" then return nil, "invalid request body" end
    local decoded, decode_err = json.decode(raw)
    if decode_err or type(decoded) ~= "table" then return nil, "invalid json" end
    return decoded, nil
end

local function identity(input)
    if type(input) ~= "table" or type(input.target_id) ~= "string" or input.target_id == ""
        or type(input.authorizer_id) ~= "string" or input.authorizer_id == "" then
        return nil, "target_id and authorizer_id are required"
    end
    local value = {
        version = 2,
        principal = { kind = "user", id = input.target_id },
        authorized_by = { kind = "user", id = input.authorizer_id },
        captured_at = "2026-10-07T00:00:00Z",
    }
    if type(input.component_id) == "string" and input.component_id ~= "" then
        value.component_id = input.component_id
    end
    if type(input.credential_id) == "string" and input.credential_id ~= "" then
        value.credential_id = input.credential_id
    end
    if type(input.link_id) == "string" and input.link_id ~= "" then
        value.link_id = input.link_id
    end
    return value
end

-- This fixture writes the same durable native declaration that production
-- delegation uses. It deliberately stores no grant-shaped Lua object: the
-- resolver must recover this policy through security.policy and evaluate it
-- in the authorizer's materialized Users scope.
function M.install_delegation()
    local input, input_err = body()
    if input_err then return response(http.STATUS.BAD_REQUEST, { success = false, error = input_err }) end
    if type(input.group) ~= "string" or input.group == "" then
        return response(http.STATUS.BAD_REQUEST, { success = false, error = "group is required" })
    end
    local value, identity_err = identity(input)
    if identity_err then return response(http.STATUS.BAD_REQUEST, { success = false, error = identity_err }) end
    local root = type(input.root) == "string" and input.root ~= "" and input.root or "*"
    local effect = input.effect == "deny" and "deny" or "allow"
    local bytes = execution_identity.delegation_bytes("user", value.principal.id, root)
    local policy_id = execution_identity.delegation_policy_id("user", value.principal.id, root)
    if type(input.policy_name) == "string" and input.policy_name ~= "" then
        policy_id = "smoke.identity_authority:policy:" .. input.policy_name
    end
    local snapshot, snapshot_err = registry.snapshot()
    if snapshot_err or not snapshot then return response(http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(snapshot_err) }) end
    local current = snapshot:get(policy_id)
    if current ~= nil then
        return response(http.STATUS.OK, { success = true, policy_id = policy_id, resource = bytes })
    end
    local changes = snapshot:changes()
    changes:create({
        id = policy_id,
        kind = "security.policy",
        data = {
            groups = { input.group },
            policy = {
                actions = execution_identity.DELEGATE_ACTION,
                resources = { bytes },
                effect = effect,
                conditions = {{ field = "resource", operator = "eq", value = bytes }},
            },
        },
    })
    local _, apply_err = changes:apply()
    if apply_err then return response(http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(apply_err) }) end
    return response(http.STATUS.OK, { success = true, policy_id = policy_id, resource = bytes })
end

function M.deferred()
    local input, input_err = body()
    if input_err then return response(http.STATUS.BAD_REQUEST, { success = false, error = input_err }) end
    local value, identity_err = identity(input)
    if identity_err then return response(http.STATUS.BAD_REQUEST, { success = false, error = identity_err }) end
    local result, run_err = execution_identity.run_as(value, PROBE, {}, { deferred_owner = OWNER })
    if run_err then return response(http.STATUS.FORBIDDEN, { success = false, error = tostring(run_err) }) end
    return response(http.STATUS.OK, { success = true, result = result })
end

-- Materializes a principal's group set through Security's binding, the path
-- Users takes at login: the scope projection service answers the request.
function M.projection()
    local input, input_err = body()
    if input_err then return response(http.STATUS.BAD_REQUEST, { success = false, error = input_err }) end
    if type(input.groups) ~= "table" or #input.groups == 0 then
        return response(http.STATUS.BAD_REQUEST, { success = false, error = "groups are required" })
    end
    local result, materialize_err = funcs.call("kickside.security.binding:materialize_group_set", { groups = input.groups })
    if materialize_err then return response(http.STATUS.CONFLICT, { success = false, error = tostring(materialize_err) }) end
    return response(http.STATUS.OK, { success = true, result = result })
end

function M.adopt_restricted()
    local input, input_err = body()
    if input_err then return response(http.STATUS.BAD_REQUEST, { success = false, error = input_err }) end
    if type(input.credential_id) ~= "string" or input.credential_id == "" then
        return response(http.STATUS.BAD_REQUEST, { success = false, error = "credential_id is required" })
    end
    local actor = security.actor()
    local actor_id = actor and actor:id() or nil
    if type(actor_id) ~= "string" or actor_id == "" then
        return response(http.STATUS.FORBIDDEN, { success = false, error = "authenticated actor is required" })
    end
    local db, db_err = sql.get("app:db")
    if db_err or not db then return response(http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(db_err) }) end
    local component_id = uuid.v7()
    local now = time.now():utc():format_rfc3339()
    local stored, encode_err = json.encode({
        _execution_identity = {
            version = 2,
            principal = { kind = "user", id = actor_id },
            authorized_by = { kind = "user", id = actor_id },
            component_id = component_id,
            credential_id = input.credential_id,
            captured_at = now,
        },
    })
    if encode_err then db:release(); return response(http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(encode_err) }) end
    local _, insert_err = sql.builder.insert("kickside_components"):set_map({
        component_id = component_id, impl_id = "smoke.identity_authority:restricted_component",
        private_context = stored, position = "identity-authority", created_at = now, updated_at = now,
    }):run_with(db):exec()
    if insert_err then db:release(); return response(http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(insert_err) }) end
    local _, access_err = sql.builder.insert("kickside_component_access"):set_map({
        access_id = uuid.v7(), subject_id = actor_id, subject_type = "user", component_id = component_id,
        source_component_id = component_id, access_mask = 15, inherited = 0,
    }):run_with(db):exec()
    db:release()
    if access_err then return response(http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(access_err) }) end
    local adopted, adopt_err = component.set_execution_identity(component_id, { kind = "user", id = actor_id },
        "smoke-adopt-" .. component_id, 0)
    if adopt_err or not adopted then return response(http.STATUS.FORBIDDEN, { success = false, error = tostring(adopt_err) }) end
    local builder, builder_err = funcs.new()
    if builder_err or not builder then return response(http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(builder_err) }) end
    local receipt, receipt_err = builder:call("smoke.identity_authority:component_identity", { component_id = component_id })
    if receipt_err or type(receipt) ~= "table" then
        return response(http.STATUS.INTERNAL_ERROR, { success = false, error = tostring(receipt_err) })
    end
    return response(http.STATUS.OK, { success = true, adopted = adopted, receipt = receipt })
end

return M
