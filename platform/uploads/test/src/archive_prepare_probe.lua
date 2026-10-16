local M = {}

function M.prepare(params)
    if params.metadata.archive_prepare_error then
        return nil, errors.new({ message = "archive preparation unavailable", kind = errors.UNAVAILABLE })
    end
    local members = {}
    for _, path in ipairs(params.archive_members) do
        members[path] = { archive_prepare_path = path, archive_prepare_upload_id = params.upload_id,
            archive_prepare_count = #params.archive_members }
    end
    return { success = true, members = members }
end

return M
