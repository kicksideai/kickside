local sql = require("sql")
local persisted_json = require("persisted_json")
local component_types = require("component_types")
local access_policy = require("access_policy")
local access_ops = require("access_ops")
local error_envelope = require("error_envelope")

local ACCESS = component_types.ACCESS
local M = {}

local function dependency_error(source: error, message: string, classify: boolean?): error
    local wrapped = errors.wrap(source, message)
    if not classify then return wrapped end
    local encoded = error_envelope.encode(wrapped)
    local details = encoded.details or {}
    if details.error_kind == nil then details.error_kind = "infrastructure" end
    encoded.details = details
    return (errors.new(encoded) :: error)
end

local function release_db(db: any, primary: error?): error?
    return error_envelope.cleanup(function(): (any, error?) return db:release() end,
        primary, "failed to release identity access database")
end

-- The Users resolver supplies a live directory snapshot for the recorded
-- authorizer. Check that typed snapshot through the component owner's one ACL
-- query; the worker's own actor/grants must never stand in for the authorizer.
local function validate_identity_authorizer_admin(component_id: string, principal: any, groups: any): (boolean, error?)
    if type(component_id) ~= "string" or component_id == ""
        or type(principal) ~= "table" or type(principal.id) ~= "string" or principal.id == ""
        or (principal.kind ~= "user" and principal.kind ~= "service") then
        return false, (errors.new({ message = "invalid identity authorizer or root", kind = errors.INVALID }) :: error)
    end
    local subjects = { { subject_type = principal.kind, subject_id = principal.id } }
    if principal.kind == "user" then
        if type(groups) ~= "table" then
            return false, (errors.new({ message = "live authorizer groups are required", kind = errors.UNAVAILABLE }) :: error)
        end
        for _, group_id in ipairs(groups) do
            if type(group_id) ~= "string" or group_id == "" then
                return false, (errors.new({ message = "invalid live authorizer group", kind = errors.UNAVAILABLE }) :: error)
            end
            subjects[#subjects + 1] = { subject_type = "group", subject_id = group_id }
        end
    end
    local db, db_err = sql.get(component_types.db_id())
    if db_err then return false, dependency_error(db_err, "component database unavailable", false) end
    if not db then
        return false, (errors.new({ message = "component database unavailable", kind = errors.UNAVAILABLE }) :: error)
    end
    local allowed, access_err = access_ops.check_user_access(db, principal.id, component_id,
        ACCESS.ADMIN, subjects, nil, true)
    local final_err = release_db(db, access_err)
    if final_err then return false, final_err end
    return allowed, nil
end

-- Check a resolved execution principal against the component owner's live ACL.
-- Callers supply only the typed principal and live groups/access filter returned
-- by kickside.execution; an ambient maintenance actor never stands in for it.
local function validate_principal_access(component_id: string, required_mask: integer, principal: any,
    groups: any, access_filter: any): (boolean, error?)
    if type(component_id) ~= "string" or component_id == ""
        or type(principal) ~= "table" or type(principal.id) ~= "string" or principal.id == ""
        or (principal.kind ~= "user" and principal.kind ~= "group" and principal.kind ~= "service") then
        return false, (errors.new({ message = "invalid component reference principal", kind = errors.INVALID,
            details = { error_kind = "declaration" } }) :: error)
    end
    local p1, p2, p3, p4, p5 = component_id:match("^(%x+)%-(%x+)%-(%x+)%-(%x+)%-(%x+)$")
    if not p1 or #p1 ~= 8 or #p2 ~= 4 or #p3 ~= 4 or #p4 ~= 4 or #p5 ~= 12 then
        return false, (errors.new({ message = "component reference id must be a UUID", kind = errors.INVALID,
            details = { error_kind = "declaration" } }) :: error)
    end
    local normalized, mask_err = access_policy.normalize_access_mask(required_mask, nil)
    if mask_err or not normalized or normalized == 0 then
        return false, (errors.new({ message = "invalid component reference access", kind = errors.INVALID,
            details = { error_kind = "declaration" } }) :: error)
    end
    local subjects = { { subject_type = principal.kind, subject_id = principal.id } }
    if principal.kind == "user" then
        if type(groups) ~= "table" then
            return false, (errors.new({ message = "live principal groups are required", kind = errors.UNAVAILABLE,
                details = { error_kind = "infrastructure" } }) :: error)
        end
        for _, group_id in ipairs(groups) do
            if type(group_id) ~= "string" or group_id == "" then
                return false, (errors.new({ message = "invalid live principal group", kind = errors.UNAVAILABLE,
                    details = { error_kind = "infrastructure" } }) :: error)
            end
            subjects[#subjects + 1] = { subject_type = "group", subject_id = group_id }
        end
    end
    local prefixes: any = nil
    if access_filter ~= nil then
        if type(access_filter) ~= "table" or type(access_filter.prefixes) ~= "table" then
            return false, (errors.new({ message = "invalid principal access filter", kind = errors.INVALID,
                details = { error_kind = "declaration" } }) :: error)
        end
        prefixes = access_filter.prefixes
    end
    local db, db_err = sql.get(component_types.db_id())
    if db_err then return false, dependency_error(db_err, "component database unavailable", true) end
    if not db then
        return false, (errors.new({ message = "component database unavailable", kind = errors.UNAVAILABLE,
            details = { error_kind = "infrastructure" } }) :: error)
    end
    local allowed, access_err = access_ops.check_user_access(db, principal.id, component_id,
        normalized :: integer, subjects, prefixes, true)
    local final_err = release_db(db, access_err)
    if final_err then return false, final_err end
    return allowed, nil
end

-- One component-store snapshot for cross-store identity finalization. The
-- automation owner compares this durable fence with its pending command before
-- acknowledging any drive.
local function get_identity_receipt(component_id: string): (any?, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return nil, (errors.new({ message = "component ID is required", kind = errors.INVALID,
            details = { error_kind = "declaration" } }) :: error)
    end
    local db, db_err = sql.get(component_types.db_id())
    if db_err then return nil, dependency_error(db_err, "component database unavailable", true) end
    if not db then
        return nil, (errors.new({ message = "component database unavailable",
            kind = errors.UNAVAILABLE, retryable = true, details = { error_kind = "infrastructure" } }) :: error)
    end
    local rows, read_err = db:query("SELECT c.identity_generation, c.identity_hash, c.private_context,"
        .. " f.declaration_hash, f.command_id AS declaration_command_id,"
        .. " f.applied_command_generation AS declaration_command_generation, a.created_at AS identity_selected_at FROM " .. component_types.TABLES.COMPONENTS .. " c"
        .. " LEFT JOIN kickside_component_declaration_fence f ON f.component_id = c.component_id"
        .. " AND f.automation_id = $1"
        .. " LEFT JOIN kickside_execution_identity_audit a ON a.component_id = c.component_id"
        .. " AND a.identity_generation = c.identity_generation WHERE c.component_id = $2", { component_id, component_id })
    local final_err = release_db(db, read_err)
    if final_err then
        return nil, dependency_error(final_err, "identity receipt read failed", true)
    end
    local row = rows and rows[1]
    if not row then
        return nil, (errors.new({ message = "component not found", kind = errors.PERMISSION_DENIED,
            details = { error_kind = "subject" } }) :: error)
    end
    local context, decode_err = persisted_json.decode_table(row.private_context, "component.private_context")
    if decode_err then return nil, errors.wrap(decode_err, "failed to decode identity receipt context") end
    if type(context) ~= "table" or type(context._execution_identity) ~= "table" then
        return nil, (errors.new({ message = "stored execution identity is invalid", kind = errors.INVALID,
            details = { error_kind = "declaration" } }) :: error)
    end
    return { component_id = component_id, principal = context._execution_identity.principal,
        execution_identity = context._execution_identity,
        identity_generation = tonumber(row.identity_generation), identity_hash = row.identity_hash,
        declaration_hash = row.declaration_hash, identity_selected_at = row.identity_selected_at,
        declaration_command_id = row.declaration_command_id,
        declaration_command_generation = tonumber(row.declaration_command_generation) }, nil
end

M.dependency_error = dependency_error
M.validate_identity_authorizer_admin = validate_identity_authorizer_admin
M.validate_principal_access = validate_principal_access
M.get_identity_receipt = get_identity_receipt

return M
