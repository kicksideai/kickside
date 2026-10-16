local security = require("security")
local component_reader = require("component_reader")
local ops = require("component_ops")
local envelope = require("envelope")

-- Constants
local VALIDATION_ERRORS = {
    INVALID_REQUEST = "Invalid request: must be a table",
    MISSING_COMPONENT_ID = "component_id is required and must be a non-empty string",
    NO_ACTOR = "No authenticated actor found",
    INVALID_ACTOR = "Invalid actor ID"
}

local BUSINESS_ERRORS = {
    NOT_FOUND = "Component not found or access denied"
}

local function handle(request_dto)
    if not request_dto or type(request_dto) ~= "table" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_REQUEST, errors.INVALID)
    end

    if not request_dto.component_id or type(request_dto.component_id) ~= "string" or request_dto.component_id == "" then
        return envelope.fail(VALIDATION_ERRORS.MISSING_COMPONENT_ID, errors.INVALID)
    end

    local actor = security.actor()
    if not actor then
        return envelope.fail(VALIDATION_ERRORS.NO_ACTOR, errors.PERMISSION_DENIED)
    end

    local user_id = actor:id()
    if not user_id or user_id == "" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_ACTOR, errors.PERMISSION_DENIED)
    end

    -- Query component with READ access requirement.
    local reader = component_reader.new():with_user(user_id)
    reader = reader
        :with_components(request_dto.component_id)
        :with_access_mask(ops.ACCESS.READ)
        :include_options({
            meta = true,
            private_context = false, -- Never expose private context in get_component
            placement = true
        })

    local component, read_err = reader:one()
    if read_err then
        return envelope.from_error(read_err)
    end
    -- An absent component and a refused one answer alike, so existence stays hidden.
    if not component then
        return envelope.fail(BUSINESS_ERRORS.NOT_FOUND, errors.PERMISSION_DENIED)
    end

    return {
        component_id = component.component_id,
        impl_id = component.impl_id,
        meta = component.meta or {},
        parent_id = component.parent_id,
        position = component.position,
        created_at = component.created_at,
        updated_at = component.updated_at,
        success = true
    }
end

return { handle = handle }
