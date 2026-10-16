local security = require("security")
local json = require("json")
local upload_query_repo = require("upload_query_repo")

local function handle(args)
    args = args or {}

    -- Get current actor
    local actor = security.actor()
    if not actor then
        return nil, "No authenticated actor found"
    end

    local actor_id = actor:id()
    local can_view_all = security.can("view_all", "uploads")

    if not can_view_all and not actor_id then
        return nil, "Access denied"
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
        return nil, "Failed to count uploads: " .. err
    end

    return {
        total_count = count
    }
end

return { handle = handle }
