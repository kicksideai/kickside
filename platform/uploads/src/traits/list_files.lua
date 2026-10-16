local security = require("security")
local contract = require("contract")

local function handle(args)
    args = args or {}

    -- Validate user authentication
    local actor = security.actor()
    if not actor or tostring(actor:id() or "") == "" then
        return nil, errors.new({ message = "Authentication required to list files", kind = errors.PERMISSION_DENIED })
    end

    -- Validate limit
    local limit = args.limit or 20
    if limit < 1 or limit > 50 then
        return nil, errors.new({ message = "Limit must be between 1 and 50", kind = errors.INVALID })
    end

    -- Build filters object
    local filters = {}
    if args.content_types and #args.content_types > 0 then
        filters.content_types = args.content_types
    end
    if args.created_after then
        filters.created_after = args.created_after
    end
    if args.created_before then
        filters.created_before = args.created_before
    end

    -- Build request parameters
    local request = {
        limit = limit,
        sort = args.sort or "created_at",
        sort_order = args.sort_order or "desc"
    }

    if args.after_file_id then
        request.after_upload_id = args.after_file_id
    end

    if next(filters) then
        request.filters = filters
    end

    -- Get resource registry contract and open instance
    local resource_contract, err = contract.get("kickside.contract:resource_registry")
    if err then
        return nil, errors.new({ message = tostring("Failed to get resource registry contract: " .. err), kind = errors.INTERNAL })
    end

    local instance, err = resource_contract:open("kickside.uploads:content_provider")
    if err then
        return nil, errors.new({ message = tostring("Failed to open uploads resource registry: " .. err), kind = errors.INTERNAL })
    end

    -- Call list_resources method
    local result, err = instance:list(request)
    if err then
        return nil, errors.new({ message = tostring("Failed to list files: " .. err), kind = errors.INTERNAL })
    end

    local items = result.items or {}
    return {
        success = true,
        files = items,
        count = #items,
        has_more = result.has_more == true,
        next_after_file_id = result.has_more and #items > 0 and items[#items].id or nil,
    }
end

return { handle = handle }
