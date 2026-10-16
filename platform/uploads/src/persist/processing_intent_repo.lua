local time = require("time")
local sql = require("sql")
local errors = require("errors")
local resources = require("uploads_resources")

local M = {}
type OperationError = string | error

local function typed(kind: any, message: string): error
    return errors.new({ message = message, kind = kind })
end

local function acknowledge_on(db: any, uuid: string, job_id: string): (any?, OperationError?)
    if type(uuid) ~= "string" or uuid == "" or type(job_id) ~= "string" or job_id == "" then
        return nil, typed(errors.INVALID, "upload id and job id are required")
    end
    local result, update_err = sql.builder.update("kickside_uploads")
        :set("processing_intent_state", "acknowledged")
        :set("processing_job_id", job_id)
        :set("updated_at", time.now():utc():format_rfc3339())
        :where("uuid = ? AND processing_intent_state = 'pending'", uuid)
        :run_with(db):exec()
    if update_err then return nil, typed(errors.INTERNAL, "enqueue acknowledgement failed: " .. tostring(update_err)) end
    if result.rows_affected == 0 then
        local rows, read_err = db:query(
            "SELECT processing_intent_state, processing_job_id FROM kickside_uploads WHERE uuid = $1", { uuid })
        if read_err then return nil, typed(errors.INTERNAL, "enqueue acknowledgement lookup failed: " .. tostring(read_err)) end
        if not rows or not rows[1] then return nil, typed(errors.NOT_FOUND, "upload no longer exists") end
        if rows[1].processing_intent_state ~= "acknowledged" or rows[1].processing_job_id ~= job_id then
            return nil, typed(errors.CONFLICT, "upload enqueue intent changed")
        end
    end
    return { upload_id = uuid, job_id = job_id, state = "acknowledged" }, nil
end

function M.acknowledge_enqueue(uuid: string, job_id: string): (any?, OperationError?)
    local db, err = resources.get_db()
    if err then return nil, err end
    local result, ack_err = acknowledge_on(db, uuid, job_id)
    db:release()
    return result, ack_err
end

function M.acknowledge_enqueue_tx(tx: sql.Transaction, uuid: string, job_id: string): (any?, OperationError?)
    return acknowledge_on(tx, uuid, job_id)
end

return M
