local security = require("security")
local component_reader = require("component_reader")
local envelope = require("envelope")

local PAGINATION = {
    MIN_LIMIT = 1,
    MAX_LIMIT = 100,
    DEFAULT_LIMIT = 50,
    DEFAULT_OFFSET = 0
}

local function handle(request_dto)
    if request_dto == nil then
        request_dto = {}
    end

    if type(request_dto) ~= "table" then
        return envelope.fail("Invalid request: must be a table or nil", errors.INVALID)
    end

    -- parent_id optional; nil scopes to root-level components.
    local parent_id = request_dto.parent_id
    if parent_id ~= nil and (type(parent_id) ~= "string" or parent_id == "") then
        return envelope.fail("parent_id must be a non-empty string if provided", errors.INVALID)
    end

    local pagination = request_dto.pagination or {}
    if type(pagination) ~= "table" then
        return envelope.fail("pagination must be a table", errors.INVALID)
    end

    local limit = pagination.limit or PAGINATION.DEFAULT_LIMIT
    local offset = pagination.offset or PAGINATION.DEFAULT_OFFSET
    if type(limit) ~= "number" or limit < PAGINATION.MIN_LIMIT or limit > PAGINATION.MAX_LIMIT then
        return envelope.fail("pagination.limit must be between 1 and 100", errors.INVALID)
    end
    if type(offset) ~= "number" or offset < 0 then
        return envelope.fail("pagination.offset must be >= 0", errors.INVALID)
    end

    local actor = security.actor()
    if not actor then
        return envelope.fail("No authenticated actor found", errors.PERMISSION_DENIED)
    end
    local user_id = actor:id()
    if not user_id or user_id == "" then
        return envelope.fail("Invalid actor ID", errors.PERMISSION_DENIED)
    end

    -- Access-filtered via the reader's access join; ordered by position then created_at.
    local reader = component_reader.new()
        :with_user(user_id)
        :with_parent(parent_id)
        :include_options({ meta = true, access_level = true, private_context = false, placement = true })
        :order_by_position()
        :limit(limit, offset)

    local children, list_err = reader:all()
    if list_err then
        return envelope.from_error(list_err)
    end
    children = children or {}

    local total_count, count_err = reader:count()
    if count_err then
        return envelope.from_error(count_err)
    end
    total_count = total_count or 0

    local has_more = ((offset :: number) + #children) < total_count

    return {
        components = children,
        total_count = total_count,
        has_more = has_more,
        parent_id = parent_id,
        success = true
    }
end

return { handle = handle }
