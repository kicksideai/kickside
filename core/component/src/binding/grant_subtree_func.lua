local sql = require("sql")
local security = require("security")
local errors = errors
local ops = require("component_ops")
local component_command = require("component_command")
local envelope = require("envelope")
local access_policy = require("access_policy")
local share_subject = require("share_subject")

local function handle(request_dto)
    if not request_dto or type(request_dto) ~= "table" then
        return envelope.fail("Invalid request: must be a table", errors.INVALID)
    end

    local root_id = request_dto.root_component_id
    if not root_id or type(root_id) ~= "string" or root_id == "" then
        return envelope.fail("root_component_id is required and must be a non-empty string", errors.INVALID)
    end

    local subject_id, subject_type, subject_err = share_subject.normalize(request_dto.subject)
    if subject_err or not subject_id then
        if subject_err ~= nil then return envelope.from_error(subject_err) end
        return envelope.fail("subject identity is required", errors.INVALID)
    end

    local access_mask = request_dto.access_mask
    local normalized_mask, mask_err = access_policy.normalize_access_mask(access_mask)
    if mask_err then
        return envelope.from_error(mask_err)
    end
    access_mask = normalized_mask

    local actor = security.actor()
    if not actor then
        return envelope.fail("No authenticated actor found", errors.PERMISSION_DENIED)
    end
    local user_id = actor:id()
    if not user_id or user_id == "" then
        return envelope.fail("Invalid actor ID", errors.PERMISSION_DENIED)
    end

    local result, err = component_command.with_component_tx(function(tx: sql.Transaction, db: sql.DB): (any?, error?)
        local has_access, access_err = ops.check_user_access(tx, user_id, root_id, ops.ACCESS.ADMIN)
        if access_err then return nil, errors.wrap(access_err, "Failed to check subtree access") end
        if not has_access then
            return nil, errors.new({kind = errors.PERMISSION_DENIED,
                message = "Insufficient access to grant on this subtree (ADMIN required)"})
        end
        return ops.apply_subtree_access(tx, db, root_id, subject_id :: string, access_mask :: integer, false, subject_type)
    end)
    if err then return envelope.from_error(err) end

    return {
        root_component_id = root_id,
        affected = result.affected,
        changes_made = result.changes_made,
        success = true
    }
end

return { handle = handle }
