local security = require("security")
local component_reader = require("component_reader")
local envelope = require("envelope")

-- Constants
local VALIDATION_ERRORS = {
    INVALID_REQUEST = "Invalid request: must be a table or nil",
    NO_ACTOR = "No authenticated actor found",
    INVALID_ACTOR = "Invalid actor ID",
    INVALID_FILTERS = "filters must be a table",
    INVALID_PAGINATION = "pagination must be a table",
    INVALID_ORDERING = "ordering must be a table"
}

local PAGINATION_LIMITS = {
    MIN_LIMIT = 1,
    MAX_LIMIT = 100,
    DEFAULT_LIMIT = 50,
    MIN_OFFSET = 0,
    DEFAULT_OFFSET = 0
}

local ORDERING_OPTIONS = {
    VALID_FIELDS = { "created_at", "updated_at" },
    VALID_DIRECTIONS = { "ASC", "DESC" },
    DEFAULT_FIELD = "created_at",
    DEFAULT_DIRECTION = "DESC"
}

local function validation_error(message: string, field: string, kind: string?): error
    return errors.new({message = message, kind = kind or errors.INVALID, retryable = false,
        details = {code = "component_list_invalid", field = field}})
end

local function validate_pagination(pagination)
    local limit = pagination.limit or PAGINATION_LIMITS.DEFAULT_LIMIT
    local offset = pagination.offset or PAGINATION_LIMITS.DEFAULT_OFFSET

    if type(limit) ~= "number" or limit < PAGINATION_LIMITS.MIN_LIMIT or limit > PAGINATION_LIMITS.MAX_LIMIT then
        return nil, nil, validation_error("pagination.limit must be between " .. PAGINATION_LIMITS.MIN_LIMIT .. " and " .. PAGINATION_LIMITS.MAX_LIMIT, "pagination.limit")
    end

    if type(offset) ~= "number" or offset < PAGINATION_LIMITS.MIN_OFFSET then
        return nil, nil, validation_error("pagination.offset must be >= " .. PAGINATION_LIMITS.MIN_OFFSET, "pagination.offset")
    end

    return limit, offset, nil
end

local function validate_ordering(ordering)
    local field = ordering.field or ORDERING_OPTIONS.DEFAULT_FIELD
    local direction = ordering.direction or ORDERING_OPTIONS.DEFAULT_DIRECTION

    local valid_field = false
    for _, valid in ipairs(ORDERING_OPTIONS.VALID_FIELDS) do
        if field == valid then
            valid_field = true
            break
        end
    end
    if not valid_field then
        return nil, nil, validation_error("ordering.field must be one of: " .. table.concat(ORDERING_OPTIONS.VALID_FIELDS, ", "), "ordering.field")
    end

    local valid_direction = false
    for _, valid in ipairs(ORDERING_OPTIONS.VALID_DIRECTIONS) do
        if direction == valid then
            valid_direction = true
            break
        end
    end
    if not valid_direction then
        return nil, nil, validation_error("ordering.direction must be one of: " .. table.concat(ORDERING_OPTIONS.VALID_DIRECTIONS, ", "), "ordering.direction")
    end

    return field, direction, nil
end

local function validate_impl_ids(impl_ids)
    for i, impl_id in ipairs(impl_ids) do
        if type(impl_id) ~= "string" or impl_id == "" then
            return validation_error("filters.impl_ids[" .. i .. "] must be a non-empty string", "filters.impl_ids[" .. i .. "]")
        end
    end
    return nil
end

local function handle(request_dto)
    if request_dto == nil then
        request_dto = {}
    end

    if type(request_dto) ~= "table" then
        return envelope.from_error(validation_error(VALIDATION_ERRORS.INVALID_REQUEST, "request", errors.INVALID))
    end

    local actor = security.actor()
    if not actor then
        return envelope.from_error(validation_error(VALIDATION_ERRORS.NO_ACTOR, "actor", errors.PERMISSION_DENIED))
    end

    local user_id = actor:id()
    if not user_id or user_id == "" then
        return envelope.from_error(validation_error(VALIDATION_ERRORS.INVALID_ACTOR, "actor.id", errors.PERMISSION_DENIED))
    end

    local filters = request_dto.filters or {}
    local pagination = request_dto.pagination or {}
    local ordering = request_dto.ordering or {}

    if type(filters) ~= "table" then
        return envelope.from_error(validation_error(VALIDATION_ERRORS.INVALID_FILTERS, "filters", errors.INVALID))
    end

    if type(pagination) ~= "table" then
        return envelope.from_error(validation_error(VALIDATION_ERRORS.INVALID_PAGINATION, "pagination", errors.INVALID))
    end

    if type(ordering) ~= "table" then
        return envelope.from_error(validation_error(VALIDATION_ERRORS.INVALID_ORDERING, "ordering", errors.INVALID))
    end

    local limit, offset, pagination_error = validate_pagination(pagination)
    if pagination_error then
        return envelope.from_error(pagination_error)
    end

    local order_field, order_direction, ordering_error = validate_ordering(ordering)
    if ordering_error then
        return envelope.from_error(ordering_error)
    end

    local reader = component_reader.new()
        :with_user(user_id)
        :include_options({
            meta = true,
            access_level = true,
            private_context = false -- Never expose private context in listings
        })
        :limit(limit, offset)
        :order_by(order_field, order_direction)

    if filters.impl_ids and type(filters.impl_ids) == "table" and #filters.impl_ids > 0 then
        local impl_ids_error = validate_impl_ids(filters.impl_ids)
        if impl_ids_error then
            return envelope.from_error(impl_ids_error)
        end
        reader = reader:with_impl_ids(filters.impl_ids)
    end

    if filters.meta and type(filters.meta) == "table" then
        reader = reader:with_meta(filters.meta)
    end

    if filters.text ~= nil then
        if type(filters.text) ~= "string" then
            return envelope.from_error(validation_error("filters.text must be a string", "filters.text"))
        end
        if filters.text ~= "" then reader = reader:with_text(filters.text) end
    end

    if filters.access_mask and type(filters.access_mask) == "number" then
        local access_mask = math.tointeger(filters.access_mask)
        if not access_mask then
            return envelope.from_error(validation_error("filters.access_mask must be an integer", "filters.access_mask"))
        end
        if access_mask > 0 then
            reader = reader:with_access_mask(access_mask)
        end
    end

    local components, list_err = reader:all()
    if list_err then
        return envelope.from_error(list_err)
    end
    components = components or {}

    local total_count, count_err = reader:count()
    if count_err then
        return envelope.from_error(count_err)
    end
    total_count = total_count or 0

    local has_more = ((offset or 0) + #components) < total_count

    return {
        components = components,
        total_count = total_count,
        has_more = has_more,
        success = true
    }
end

return { handle = handle }
