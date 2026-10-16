local security = require("security")
local contract = require("contract")

local function handle(args)
    args = args or {}

    -- Validate user authentication
    local actor = security.actor()
    if not actor or tostring(actor:id() or "") == "" then
        return nil, errors.new({ message = "Authentication required to count files", kind = errors.PERMISSION_DENIED })
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
    local request = {}
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

    -- Call count_resources method
    local result, err = instance:count(request)
    if err then
        return nil, errors.new({ message = tostring("Failed to count files: " .. err), kind = errors.INTERNAL })
    end

    return { success = true, count = result.total_count or 0, filters = filters }
end

return { handle = handle }
