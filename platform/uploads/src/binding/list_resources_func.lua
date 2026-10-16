local security = require("security")
local json = require("json")
local upload_query_repo = require("upload_query_repo")
local metadata_sanitizer = require("metadata_sanitizer")

local function handle(args)
    args = args or {}

    local actor = security.actor()
    if not actor then
        return nil, "No authenticated actor found"
    end

    local actor_id = actor:id()
    local can_view_all = security.can("view_all", "uploads")

    if not can_view_all and not actor_id then
        return nil, "Access denied"
    end

    local after_upload_id = args.after_upload_id
    local limit = args.limit or 20
    local filters = args.filters or {}
    local sort = args.sort or "created_at"
    local sort_order = args.sort_order or "desc"

    if limit < 1 or limit > 100 then
        return nil, "Limit must be between 1 and 100"
    end

    local repo_options = {
        actor_id = can_view_all and nil or actor_id,
        after_id = after_upload_id,
        limit = limit + 1,
        sort = sort,
        sort_order = sort_order,
        filters = filters
    }

    local uploads, err = upload_query_repo.list_with_filters(repo_options)
    if err then
        return nil, "Failed to list uploads: " .. err
    end

    local has_more = #uploads > limit
    if has_more then
        table.remove(uploads, #uploads)
    end

    local items = {}
    for _, upload in ipairs(uploads) do
        local metadata = metadata_sanitizer.public(upload.metadata)

        local filename = metadata.filename or
                        metadata.original_filename or
                        metadata.name or
                        "unknown"

        table.insert(items, {
            id = upload.uuid,
            filename = filename,
            content_type = upload.mime_type,
            size = upload.size,
            created_at = upload.created_at,
        })
    end

    return {
        items = items,
        has_more = has_more
    }
end

return { handle = handle }
