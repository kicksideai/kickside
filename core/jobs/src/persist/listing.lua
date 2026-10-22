local sql = require("sql")
local uuid = require("uuid")

local listing = {}
type Executor = sql.DB | sql.Transaction

local function response_error(field: string): error
    return errors.new({message = "job listing response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_listing_response", field = field}})
end

local function rows_error(rows: any, err: error?, operation: string, field: string): error?
    if err then return errors.wrap(err, operation) end
    if type(rows) ~= "table" then return response_error(field) end
    return nil
end

local function invalid(): error
    return (errors.new({ message = "job history position is invalid or no longer available", kind = errors.INVALID }) :: error)
end

local function scoped_query(dbtype: string, collection: string, thread_ids: string[], filters: table?): any
    local runs = collection == "runs"
    local opts = filters or {}
    local columns = runs and {
        "id", "job_id", "owner_id AS thread_id", "job_type", "attempt_no", "worker_pid",
        "status", "started_at", "finished_at", "duration_ms", "error_text", "created_at",
    } or {
        "id", "owner_id AS thread_id", "owner_kind", "owner_id", "job_type", "status", "priority", "attempts",
        "max_attempts", "queue_tier", "idempotency_key", "last_error", "wake_enabled", "wake_control_pending", "execution_seq",
        "scheduled_at", "finished_at", "created_at", "updated_at",
    }
    if dbtype == sql.type.POSTGRES then
        for i, column in ipairs(columns) do
            if column == "created_at" or column == "started_at" then
                columns[i] = "to_char(" .. column .. " AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.US\"Z\"') AS " .. column
            end
        end
    end
    local marks: string[] = {}
    for i = 1, #thread_ids do marks[i] = "?" end
    local query = sql.builder.select(table.unpack(columns))
        :from(runs and "kickside_job_run" or "kickside_job")
        :where(sql.builder.eq({ owner_kind = "thread" }))
        :where(sql.builder.expr("owner_id IN (" .. table.concat(marks, ",") .. ")", table.unpack(thread_ids)))
    local keys = runs and { "job_id", "thread_id", "status" } or { "thread_id", "status", "job_type", "queue_tier" }
    for _, key in ipairs(keys) do
        local value = opts[key]
        if type(value) == "string" and value ~= "" then
            query = query:where(sql.builder.eq({ [key == "thread_id" and "owner_id" or key] = value }))
        end
    end
    return query
end

local function read(db: Executor, collection: string, thread_ids: string[], filters: table?,
        limit: integer, after: table?): (table[]?, error?, boolean?)
    if type(limit) ~= "number" or limit < 1 or limit ~= math.floor(limit) then
        return nil, (errors.new({ message = "job history limit must be a positive integer", kind = errors.INVALID }) :: error)
    end
    local dbtype, type_err
    if type((db :: any).db_type) == "function" then
        dbtype, type_err = (db :: sql.Transaction):db_type()
    else
        dbtype, type_err = (db :: sql.DB):type()
    end
    if type_err then return nil, type_err end
    if dbtype ~= sql.type.SQLITE and dbtype ~= sql.type.POSTGRES then
        return nil, response_error("database.type")
    end
    local timestamp = collection == "runs" and "started_at" or "created_at"
    local position: table? = nil
    if after ~= nil then
        if type(after) ~= "table" or type(after.id) ~= "string" or not uuid.validate(after.id)
            or type(after.owner_id) ~= "string" or after.owner_id == "" then return nil, invalid() end
        local authorized = false
        for _, id in ipairs(thread_ids) do if id == after.owner_id then authorized = true end end
        if not authorized then return nil, invalid() end
        local anchors, anchor_err = scoped_query(tostring(dbtype), collection, thread_ids, filters)
            :where(sql.builder.eq({ id = after.id, owner_id = after.owner_id })):limit(1):run_with(db):query()
        local position_err = rows_error(anchors, anchor_err, "job history position read failed", "position.rows")
        if position_err then return nil, position_err end
        if not anchors[1] then return nil, invalid() end
        position = anchors[1]
    end
    if #thread_ids == 0 then return {}, nil, false end
    local query = scoped_query(tostring(dbtype), collection, thread_ids, filters)
        :order_by(timestamp .. " DESC, id DESC"):limit(limit + 1)
    if position then
        local source = collection == "runs" and "kickside_job_run" or "kickside_job"
        local anchor = "(SELECT " .. timestamp .. " FROM " .. source .. " WHERE id=?)"
        query = query:where(sql.builder.expr("(" .. timestamp .. " < " .. anchor
            .. " OR (" .. timestamp .. " = " .. anchor .. " AND id < ?))", position.id, position.id, position.id))
    end
    local rows, err = query:run_with(db):query()
    local read_err = rows_error(rows, err, "failed to list job history", "history.rows")
    if read_err then return nil, read_err end
    local more = #rows > limit
    if more then table.remove(rows) end
    return rows, nil, more
end

function listing.list_jobs(db: Executor, thread_ids: string[], filters: table?, limit: integer,
        after: table?): (table[]?, error?, boolean?)
    return read(db, "jobs", thread_ids, filters, limit, after)
end

function listing.list_job_runs(db: Executor, thread_ids: string[], filters: table?, limit: integer,
        after: table?): (table[]?, error?, boolean?)
    return read(db, "runs", thread_ids, filters, limit, after)
end

function listing.get_job_statuses(db: Executor, ids: string[]): (table?, error?)
    if type(ids) ~= "table" then
        return nil, errors.new({ message = "job ids must be an array", kind = errors.INVALID })
    end
    local marks, values, seen = {}, {}, {}
    for _, id in ipairs(ids) do
        if type(id) ~= "string" or id == "" then
            return nil, errors.new({ message = "job id is required", kind = errors.INVALID })
        end
        if uuid.validate(id) and not seen[id] then
            seen[id] = true
            marks[#marks + 1], values[#values + 1] = "?", id
        end
    end
    if #values == 0 then return {}, nil end
    local rows, err = sql.builder.select("id", "status"):from("kickside_job")
        :where(sql.builder.expr("id IN (" .. table.concat(marks, ",") .. ")", table.unpack(values)))
        :run_with(db):query()
    local read_err = rows_error(rows, err, "failed to read job statuses", "statuses.rows")
    if read_err then return nil, read_err end
    local statuses = {}
    for _, row in ipairs(rows) do statuses[row.id] = row.status end
    return statuses, nil
end

function listing.get_job(db: Executor, id: string): (table?, error?)
    if type(id) ~= "string" or id == "" then
        return nil, (errors.new({ message = "job id is required", kind = errors.INVALID }) :: error)
    end
    if not uuid.validate(id) then return nil, nil end
    local rows, err = sql.builder.select(
        "id", "thread_id", "owner_kind", "owner_id", "job_type", "status", "priority", "attempts",
        "max_attempts", "queue_tier", "idempotency_key", "last_error", "wake_enabled", "wake_control_pending", "execution_seq",
        "scheduled_at", "finished_at", "created_at", "updated_at"
    ):from("kickside_job")
        :where(sql.builder.eq({ id = id })):limit(1):run_with(db):query()
    local read_err = rows_error(rows, err, "failed to read job", "job.rows")
    if read_err then return nil, read_err end
    return rows[1], nil
end

return listing
