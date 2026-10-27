local M = {}

function M.relocate(params)
    local metadata = type(params) == "table" and params.metadata or {}
    return {
        success = true,
        relocation = {
            storage_path = metadata.relocation_storage_path,
            blobs = { {
                blob_id = metadata.relocation_blob_id,
                storage_path = metadata.relocation_blob_path,
            } },
        },
    }
end

function M.observe(params)
    return { success = true, metadata = { observed_storage_path = params.storage_path } }
end

return M
