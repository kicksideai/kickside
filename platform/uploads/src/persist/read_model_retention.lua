-- A deleted upload's materialized row is a replay fence until the Core threads
-- contract proves that its delete event is below the durable prune boundary.
local resources = require("uploads_resources")

local M = {}
local CANDIDATE_SCAN_LIMIT = 500

local function failure(message: string, cause: any, kind: string): error
    return (errors.new({ message = message .. ": " .. tostring(cause), kind = kind,
        retryable = kind ~= errors.INVALID }) :: error)
end

function M.new(dependencies: any): any
    local core_threads = type(dependencies) == "table" and dependencies.core_threads or nil
    local retention = {}

    function retention.prune_deleted(cutoff: string, limit: integer): (integer?, error?)
        if type(cutoff) ~= "string" or cutoff == "" or type(limit) ~= "number"
            or limit ~= math.floor(limit) or limit < 1 or limit > 500 then
            return nil, failure("upload tombstone retention arguments invalid",
                "cutoff and limit 1..500 required", errors.INVALID)
        end
        if core_threads == nil or type((core_threads :: any).prune_boundary) ~= "function" then
            return nil, failure("Core threads contract unavailable", "prune_boundary is required", errors.INTERNAL)
        end

        local db, open_err = resources.get_db()
        if open_err or not db then
            return nil, failure("upload retention database unavailable", open_err, errors.UNAVAILABLE)
        end
        local candidates, read_err = db:query([[SELECT r.upload_id,r.component_id,r.last_event_seq
            FROM kickside_upload_read_model r
            WHERE r.status='deleted' AND r.deleted_at IS NOT NULL AND r.deleted_at<=$1
              AND r.last_event_seq>0
              AND NOT EXISTS (SELECT 1 FROM kickside_uploads u WHERE u.uuid=r.upload_id)
            ORDER BY r.deleted_at,r.upload_id LIMIT $2]], { cutoff, CANDIDATE_SCAN_LIMIT })
        db:release()
        if read_err then return nil, failure("upload tombstone candidate read failed", read_err, errors.INTERNAL) end

        local safe: { any } = {}
        for _, row in ipairs(candidates or {}) do
            if #safe >= limit then break end
            local boundary, boundary_err = core_threads:prune_boundary({ thread_id = tostring(row.component_id) })
            if boundary_err then
                if not errors.is(boundary_err, errors.NOT_FOUND) then
                    return nil, failure("Core thread prune boundary read failed", boundary_err, errors.INTERNAL)
                end
                safe[#safe + 1] = row
            elseif type(boundary) ~= "table" or tonumber(boundary.max_pruned_seq) == nil then
                return nil, failure("Core thread prune boundary response invalid", boundary, errors.INTERNAL)
            elseif tonumber(boundary.max_pruned_seq) >= tonumber(row.last_event_seq) then
                safe[#safe + 1] = row
            end
        end

        if #safe == 0 then return 0, nil end
        db, open_err = resources.get_db()
        if open_err or not db then
            return nil, failure("upload retention database unavailable after Core reads", open_err, errors.UNAVAILABLE)
        end
        local deleted = 0
        for _, row in ipairs(safe) do
            local result, delete_err = db:execute([[DELETE FROM kickside_upload_read_model
                WHERE upload_id=$1 AND component_id=$2 AND last_event_seq=$3
                  AND status='deleted' AND deleted_at IS NOT NULL AND deleted_at<=$4
                  AND NOT EXISTS (SELECT 1 FROM kickside_uploads u WHERE u.uuid=$1)]],
                { row.upload_id, row.component_id, row.last_event_seq, cutoff })
            if delete_err then
                db:release()
                return nil, failure("upload tombstone prune failed", delete_err, errors.INTERNAL)
            end
            local affected = result and tonumber(result.rows_affected)
            local count = affected and math.tointeger(affected)
            if count == nil then
                db:release()
                return nil, failure("upload tombstone prune returned no affected-row count", result, errors.INTERNAL)
            end
            deleted = deleted + count
        end
        db:release()
        return deleted, nil
    end

    return retention
end

return M
