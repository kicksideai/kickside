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

    function retention.prune_deleted(cutoff: string, limit: integer): (integer?, error?, any?)
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
        local safe: { any } = {}
        local after_at, after_id = "", ""
        while #safe < limit do
            local candidates, read_err = db:query([[SELECT r.upload_id,r.component_id,r.last_event_seq,r.deleted_at
                FROM kickside_upload_read_model r
                WHERE r.status='deleted' AND r.deleted_at IS NOT NULL AND r.deleted_at<=$1
                  AND (r.deleted_at,r.upload_id)>($2,$3) AND r.last_event_seq>0
                  AND NOT EXISTS (SELECT 1 FROM kickside_uploads u WHERE u.uuid=r.upload_id)
                ORDER BY r.deleted_at,r.upload_id LIMIT $4]],
                { cutoff, after_at, after_id, CANDIDATE_SCAN_LIMIT })
            if read_err or type(candidates) ~= "table" then
                db:release()
                return nil, failure("upload tombstone candidate read failed", read_err, errors.INTERNAL)
            end
            for _, row in ipairs(candidates) do
                if #safe >= limit then break end
                local boundary, boundary_err = core_threads:prune_boundary({ thread_id = tostring(row.component_id) })
                if boundary_err then
                    if not errors.is(boundary_err, errors.NOT_FOUND) then
                        db:release()
                        return nil, failure("Core thread prune boundary read failed", boundary_err, errors.INTERNAL)
                    end
                    safe[#safe + 1] = row
                elseif type(boundary) ~= "table" or tonumber(boundary.max_pruned_seq) == nil then
                    db:release()
                    return nil, failure("Core thread prune boundary response invalid", boundary, errors.INTERNAL)
                elseif tonumber(boundary.max_pruned_seq) >= tonumber(row.last_event_seq) then
                    safe[#safe + 1] = row
                end
            end
            if #candidates < CANDIDATE_SCAN_LIMIT then break end
            local last = candidates[#candidates]
            after_at, after_id = tostring(last.deleted_at), tostring(last.upload_id)
        end
        local tx, begin_err = db:begin()
        if begin_err or not tx then
            db:release()
            return nil, failure("upload tombstone transaction failed", begin_err, errors.UNAVAILABLE)
        end
        local deleted = 0
        if #safe > 0 then
            local params: {any} = {cutoff}
            local tuples: {string} = {}
            local ids: {string} = {}
            for _, row in ipairs(safe) do
                local offset = #params
                params[#params+1], params[#params+2], params[#params+3] = row.upload_id,row.component_id,row.last_event_seq
                ids[#ids+1] = "$" .. tostring(offset+1)
                tuples[#tuples+1] = "($" .. tostring(offset+1) .. ",$" .. tostring(offset+2) .. ",$" .. tostring(offset+3) .. ")"
            end
            local result, delete_err = tx:execute([[DELETE FROM kickside_upload_read_model
                WHERE status='deleted' AND deleted_at IS NOT NULL AND deleted_at<=$1
                  AND (upload_id,component_id,last_event_seq) IN (]] .. table.concat(tuples,",") .. [[)
                  AND upload_id IN (]] .. table.concat(ids,",") .. [[)
                  AND NOT EXISTS (SELECT 1 FROM kickside_uploads u WHERE u.uuid=kickside_upload_read_model.upload_id)]], params)
            local affected = result and tonumber(result.rows_affected)
            local count = affected and math.tointeger(affected)
            if delete_err or count == nil or count < 0 or count > #safe then
                tx:rollback(); db:release()
                return nil, failure("upload tombstone prune failed", delete_err or "invalid affected-row count", errors.INTERNAL)
            end
            deleted = count
        end
        local _, commit_err = tx:commit()
        if commit_err then
            db:release()
            return nil, failure("upload tombstone commit failed", commit_err, errors.UNAVAILABLE)
        end
        local remaining, remaining_err = db:query([[SELECT r.deleted_at FROM kickside_upload_read_model r
            WHERE r.status='deleted' AND r.deleted_at IS NOT NULL AND r.deleted_at>$1 AND r.last_event_seq>0
              AND NOT EXISTS (SELECT 1 FROM kickside_uploads u WHERE u.uuid=r.upload_id)
            ORDER BY r.deleted_at,r.upload_id LIMIT 1]], {cutoff})
        db:release()
        if remaining_err or type(remaining) ~= "table" then
            return nil, failure("upload tombstone deadline read failed", remaining_err, errors.INTERNAL)
        end
        return deleted, nil, {needs_continue = #safe >= limit,
            next_at = remaining[1] and remaining[1].deleted_at or nil}
    end

    return retention
end

return M
