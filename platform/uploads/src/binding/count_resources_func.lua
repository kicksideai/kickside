local binding_errors = require("binding_errors")
local security = require("security")
local upload_query_repo = require("upload_query_repo")

local function handle(args)
    args = args or {}

    -- Get current actor
    local actor = security.actor()
    if not actor then
        return nil, binding_errors.new(errors.PERMISSION_DENIED, "No authenticated actor found", "actor_required")
    end

    local actor_id = actor:id()
    local can_view_all = security.can("view_all", "uploads")

    if not can_view_all and not actor_id then
        return nil, binding_errors.new(errors.PERMISSION_DENIED, "Access denied", "access_denied")
    end

    -- Extract filters
    local filters = args.filters or {}

    -- Build filter options for upload_query_repo
    local repo_options = {
        actor_id = can_view_all and nil or actor_id,
        filters = filters
    }

    -- Get count from repo
    local count, err = upload_query_repo.count_with_filters(repo_options)
    if err then
        return nil, binding_errors.from(err, errors.UNAVAILABLE, "upload_count_failed", "Failed to count uploads")
    end

    return {
        total_count = count
    }
end

return { handle = handle }
