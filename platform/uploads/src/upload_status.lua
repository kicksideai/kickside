-- The lifecycle status agent tools report for an upload, read from the durable
-- projection read model and collapsed to processing / completed / failed.
local M = {}

function M.normalize(row_status: any): string
    if row_status == "completed" then return "completed" end
    if row_status == "error" or row_status == "deleted" then return "failed" end
    return "processing"
end

-- Returns the normalized status, the read-model row, and the read error when the
-- row is unavailable to the actor.
function M.read(read_model: any, actor_id: string, upload_id: string): (string, any?, string?)
    local row, err = read_model.get_for_actor(actor_id, upload_id)
    if err or not row then
        return "failed", nil, err and tostring(err) or "upload not found"
    end
    return M.normalize(row.status), row, nil
end

return M
