-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {}

function M.relocate(params)
    local metadata = type(params) == "table" and params.metadata or {}
    if metadata.stage_failure_kind then
        return nil, errors.new({ kind = metadata.stage_failure_kind, retryable = metadata.stage_failure_retryable,
            message = "native stage failure", details = { code = "stage_failure" } })
    end
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
