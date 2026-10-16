-- component_service:list_access — list the grants on a component for the share
-- UI. Gates ADMIN through the actor's effective access (the read port resolves
-- the actor's groups), then returns the raw stored grants via the persist layer.

local security = require("security")
local component_reader = require("component_reader")
local ops = require("component_ops")
local access_policy = require("access_policy")
local envelope = require("envelope")

local ADMIN = ops.ACCESS.ADMIN

local function handle(request_dto)
    if type(request_dto) ~= "table" or type(request_dto.component_id) ~= "string" or request_dto.component_id == "" then
        return envelope.fail("component_id is required", errors.INVALID)
    end

    local actor = security.actor()
    if not actor then
        return envelope.fail("no authenticated actor", errors.PERMISSION_DENIED)
    end
    local user_id = actor:id()
    if not user_id or user_id == "" then
        return envelope.fail("invalid actor", errors.PERMISSION_DENIED)
    end

    -- Resolve the actor's effective access on the component and require ADMIN. An
    -- absent component and a refused one answer alike, so existence stays hidden.
    local comp, read_err = component_reader.new()
        :with_user(user_id)
        :with_components(request_dto.component_id)
        :include_options({ meta = false, private_context = false, access_level = true })
        :one()
    if read_err then
        return envelope.from_error(read_err)
    end
    if not comp then
        return envelope.fail("component not found or access denied", errors.PERMISSION_DENIED)
    end
    if not access_policy.has_all(comp.access_level or 0, ADMIN) then
        return envelope.fail("admin access required", errors.PERMISSION_DENIED)
    end

    local access, err = ops.list_access(request_dto.component_id)
    if err then
        return envelope.from_error(err)
    end

    -- Mark the owner so the UI can protect them.
    local owner, owner_err = ops.component_owner(request_dto.component_id)
    if owner_err then
        return envelope.from_error(owner_err)
    end
    if owner then
        for _, row in ipairs(access) do
            row.owner = row.subject_id == owner
        end
    end

    return { success = true, access = access, owner = owner }
end

return { handle = handle }
