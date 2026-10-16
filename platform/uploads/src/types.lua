local autoinit = require("autoinit")

local M = {}

M.CLASS = "kickside.uploads"
M.IMPL = "kickside.uploads:uploads_component"
M.EVENT_SOURCE = "uploads"

-- Default lifetime of a presigned S3 upload URL (15 minutes).
M.DEFAULT_PRESIGN_EXPIRES_SECONDS = 900

M.EVENT = {
    QUEUED = "kickside.uploads.events:upload.queued",
    COMPLETED = "kickside.uploads.events:upload.completed",
    FAILED = "kickside.uploads.events:upload.failed",
    DELETED = "kickside.uploads.events:upload.deleted",
}

function M.component_id_for_owner(actor_id: string?): string?
    if not actor_id or actor_id == "" then return nil end
    return autoinit.component_id(actor_id, M.CLASS) :: string
end

function M.component_topic(component_id: string): string
    return "component." .. tostring(component_id)
end

return M
