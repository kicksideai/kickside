local json = require("json")
local time = require("time")
local sql = require("sql")

local resources = require("uploads_resources")
local upload_types = require("types")
local upload_type = require("upload_type")
local persisted_json = require("persisted_json")
local read_model_owner_delete = require("read_model_owner_delete")

local M = {}
type ReadError = string | error

local STATUS = {
    PROCESSING = "processing",
    ENQUEUE_FAILED = "enqueue_failed",
    COMPLETED = "completed",
    ERROR = "error",
    DELETED = "deleted",
}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function encode_json_object(value: any): string?
    if type(value) ~= "table" then return nil end
    local encoded, err = json.encode(value)
    if err then return nil end
    return encoded
end

local function event_upload_id(body: any): string
    if type(body) ~= "table" then return "" end
    return trim(body.upload_id)
end

local function event_status(etype: any): string?
    if etype == upload_types.EVENT.QUEUED then return STATUS.PROCESSING end
    if etype == upload_types.EVENT.COMPLETED then return STATUS.COMPLETED end
    if etype == upload_types.EVENT.FAILED then return STATUS.ERROR end
    if etype == upload_types.EVENT.DELETED then return STATUS.DELETED end
    return nil
end

local function event_time(ev: any): any
    if type(ev) ~= "table" then return nil end
    return ev.created_at or ev.ts or ev.time
end

local function event_seq(ev: any): integer
    local n = tonumber(type(ev) == "table" and (ev.seq or ev.event_seq) or nil)
    if n and n >= 0 then return math.floor(n) end
    return 0
end

local function event_id(ev: any): string?
    local raw = type(ev) == "table" and ev.id or nil
    if type(raw) == "string" and raw ~= "" then return raw end
    return nil
end

local function materialized_row(component_id: string, ev: any): (any?, error?)
    local status = event_status(type(ev) == "table" and ev.type or nil)
    if not status then return nil end
    local body, body_err = persisted_json.decode_table(ev.body, "upload.event.body")
    if body_err then return nil, body_err end
    local upload_id = event_upload_id(body)
    if upload_id == "" then return nil end

    local ts = event_time(ev)
    local row = {
        component_id = component_id,
        upload_id = upload_id,
        status = status,
        filename = body.filename,
        mime_type = body.mime_type,
        type_id = body.type_id,
        size = tonumber(body.size) or 0,
        error = body.error,
        last_event_id = event_id(ev),
        last_event_seq = event_seq(ev),
        trace_context = encode_json_object(type(ev) == "table" and ev.trace_context or nil),
        queued_at = nil,
        completed_at = nil,
        failed_at = nil,
        deleted_at = nil,
    }
    if status == STATUS.PROCESSING then row.queued_at = ts end
    if status == STATUS.COMPLETED then row.completed_at = ts end
    if status == STATUS.ERROR then row.failed_at = ts end
    if status == STATUS.DELETED then row.deleted_at = ts end
    return row
end

local UPSERT_SQL = [[
    INSERT INTO kickside_upload_read_model (
        component_id, upload_id, status, filename, mime_type, type_id, size, error,
        queued_at, completed_at, failed_at, deleted_at,
        last_event_id, last_event_seq, trace_context, updated_at
    ) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      WHERE $3 = 'deleted' OR EXISTS (SELECT 1 FROM kickside_uploads u WHERE u.uuid = $2__OWNER_LOCK__)
    ON CONFLICT (upload_id) DO UPDATE SET
        component_id = excluded.component_id,
        status = excluded.status,
        filename = COALESCE(excluded.filename, kickside_upload_read_model.filename),
        mime_type = COALESCE(excluded.mime_type, kickside_upload_read_model.mime_type),
        type_id = COALESCE(excluded.type_id, kickside_upload_read_model.type_id),
        size = CASE WHEN excluded.size > 0 THEN excluded.size ELSE kickside_upload_read_model.size END,
        error = excluded.error,
        queued_at = COALESCE(excluded.queued_at, kickside_upload_read_model.queued_at),
        completed_at = COALESCE(excluded.completed_at, kickside_upload_read_model.completed_at),
        failed_at = COALESCE(excluded.failed_at, kickside_upload_read_model.failed_at),
        deleted_at = COALESCE(excluded.deleted_at, kickside_upload_read_model.deleted_at),
        last_event_id = COALESCE(excluded.last_event_id, kickside_upload_read_model.last_event_id),
        last_event_seq = excluded.last_event_seq,
        trace_context = COALESCE(excluded.trace_context, kickside_upload_read_model.trace_context),
        updated_at = excluded.updated_at
    WHERE excluded.last_event_seq >= kickside_upload_read_model.last_event_seq
]]

local function upsert_statement(db: any): (string?, string?)
    local dialect, err = db:type()
    if err then return nil, "failed to read upload database dialect: " .. tostring(err) end
    local lock: string
    if dialect == sql.type.POSTGRES then
        lock = " FOR KEY SHARE"
    elseif dialect == sql.type.SQLITE then
        lock = ""
    else
        return nil, "unsupported upload database dialect: " .. tostring(dialect)
    end
    return (UPSERT_SQL:gsub("__OWNER_LOCK__", lock)), nil
end

local function now_value(): string
    return time.now():utc():format_rfc3339()
end

-- Principal deletion removes the projection's materialized rows after every
-- upload has passed through its storage-owning delete path.
M.delete_for_actor = read_model_owner_delete.delete_for_actor

function M.mark_enqueue_failed(upload: any, error_message: any): (any?, string?)
    if type(upload) ~= "table" then return nil, "upload is required" end
    local upload_id = trim(upload.uuid)
    local actor_id = trim(upload.actor_id)
    if upload_id == "" then return nil, "upload_id is required" end
    if actor_id == "" then return nil, "actor_id is required" end
    local component_id = upload_types.component_id_for_owner(actor_id)
    if not component_id then return nil, "upload actor has no uploads component id" end

    local db, db_err = resources.get_db()
    if db_err or not db then return nil, tostring(db_err) end
    local statement, statement_err = upsert_statement(db)
    if statement_err or not statement then db:release(); return nil, statement_err end
    local _, err = db:execute(statement, {
        component_id,
        upload_id,
        STATUS.PROCESSING,
        type(upload.metadata) == "table" and upload.metadata.filename or nil,
        upload.mime_type,
        upload.type_id,
        tonumber(upload.size) or 0,
        "enqueue_failed: " .. tostring(error_message or "failed to submit upload processing job"),
        now_value(),
        nil,
        nil,
        nil,
        nil,
        0,
        encode_json_object(type(upload.trace_context) == "table" and upload.trace_context or nil),
        now_value(),
    })
    db:release()
    if err then return nil, "failed to mark upload enqueue failure: " .. tostring(err) end
    return { upload_id = upload_id, status = STATUS.ENQUEUE_FAILED }, nil
end

function M.mark_enqueue_queued(upload: any): (any?, string?)
    if type(upload) ~= "table" then return nil, "upload is required" end
    local upload_id = trim(upload.uuid)
    local actor_id = trim(upload.actor_id)
    if upload_id == "" then return nil, "upload_id is required" end
    if actor_id == "" then return nil, "actor_id is required" end
    local component_id = upload_types.component_id_for_owner(actor_id)
    if not component_id then return nil, "upload actor has no uploads component id" end

    local db, db_err = resources.get_db()
    if db_err or not db then return nil, tostring(db_err) end
    local statement, statement_err = upsert_statement(db)
    if statement_err or not statement then db:release(); return nil, statement_err end
    local _, err = db:execute(statement, {
        component_id,
        upload_id,
        STATUS.PROCESSING,
        type(upload.metadata) == "table" and upload.metadata.filename or nil,
        upload.mime_type,
        upload.type_id,
        tonumber(upload.size) or 0,
        nil,
        now_value(),
        nil,
        nil,
        nil,
        nil,
        0,
        encode_json_object(type(upload.trace_context) == "table" and upload.trace_context or nil),
        now_value(),
    })
    db:release()
    if err then return nil, "failed to mark upload queued: " .. tostring(err) end
    return { upload_id = upload_id, status = STATUS.PROCESSING }, nil
end

function M.apply_events(component_id: string, events: { any }): (any?, ReadError?, { any }?)
    component_id = trim(component_id)
    if component_id == "" then return nil, "component_id is required" end
    if type(events) ~= "table" then events = {} end

    local db, db_err = resources.get_db()
    if db_err or not db then return nil, tostring(db_err) end
    local statement, statement_err = upsert_statement(db)
    if statement_err or not statement then db:release(); return nil, statement_err end

    local notifications = {}
    for _, ev in ipairs(events) do
        local row, row_err = materialized_row(component_id, ev)
        if row_err then db:release(); return nil, row_err end
        if row then
            local _, err = db:execute(statement, {
                row.component_id,
                row.upload_id,
                row.status,
                row.filename,
                row.mime_type,
                row.type_id,
                row.size,
                row.error,
                row.queued_at,
                row.completed_at,
                row.failed_at,
                row.deleted_at,
                row.last_event_id,
                row.last_event_seq,
                row.trace_context,
                now_value(),
            })
            if err then
                db:release()
                return nil, "failed to materialize upload lifecycle event: " .. tostring(err)
            end
            if row.status ~= STATUS.DELETED then
                local rows, query_err = db:query([[
                    SELECT u.*, r.status, r.error
                    FROM kickside_uploads u
                    JOIN kickside_upload_read_model r ON r.upload_id = u.uuid
                    WHERE r.component_id = $1 AND r.upload_id = $2
                      AND r.last_event_seq = $3 AND r.status = $4
                ]], { component_id, row.upload_id, row.last_event_seq, row.status })
                if query_err then db:release(); return nil, query_err end
                for _, upload in ipairs(rows or {}) do
                    if upload_types.component_id_for_owner(upload.actor_id) ~= component_id then
                        db:release()
                        return nil, "upload notification owner does not match component"
                    end
                    local metadata, metadata_err = persisted_json.decode_table(upload.metadata, "kickside_uploads.metadata")
                    if metadata_err then db:release(); return nil, metadata_err end
                    upload.metadata = metadata
                    notifications[#notifications + 1] = upload
                end
            end
        end
    end

    local counts, count_err = M.counts_for_component(component_id, db)
    db:release()
    if count_err then return nil, count_err end
    return counts, nil, notifications
end

function M.counts_for_component(component_id: string, db: any?): (any?, string?)
    local own_db = false
    if not db then
        local db_err
        db, db_err = resources.get_db()
        if db_err or not db then return nil, tostring(db_err) end
        own_db = true
    end

    local rows, err = db:query([[
        SELECT
            COALESCE(SUM(CASE WHEN status IN ('completed', 'error') THEN 1 ELSE 0 END), 0) AS file_count,
            COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0) AS pending_count,
            COALESCE(SUM(CASE WHEN status IN ('completed', 'error') THEN size ELSE 0 END), 0) AS total_bytes
        FROM kickside_upload_read_model
        WHERE component_id = $1 AND status <> 'deleted'
    ]], { component_id })
    if err then
        if own_db then db:release() end
        return nil, "failed to count upload read model: " .. tostring(err)
    end

    local last_rows, last_err = db:query([[
        SELECT upload_id, completed_at
        FROM kickside_upload_read_model
        WHERE component_id = $1 AND status = 'completed' AND completed_at IS NOT NULL
        ORDER BY completed_at DESC, upload_id DESC
        LIMIT 1
    ]], { component_id })
    if own_db then db:release() end
    if last_err then return nil, "failed to read last completed upload: " .. tostring(last_err) end

    local row = rows and rows[1] or {}
    local counts = {
        file_count = tonumber(row.file_count) or 0,
        pending_count = tonumber(row.pending_count) or 0,
        total_bytes = tonumber(row.total_bytes) or 0,
    }
    local last = last_rows and last_rows[1] or nil
    if type(last) == "table" then
        counts.last_upload_id = last.upload_id
        counts.last_completed_at = last.completed_at
    end
    return counts, nil
end

local CURRENT_STATUS_SQL = [[
    CASE
        WHEN r.status = 'processing' AND r.error LIKE 'enqueue_failed:%' THEN 'enqueue_failed'
        ELSE COALESCE(r.status, CASE u.storage_state
            WHEN 'pending' THEN 'pending'
            WHEN 'completed' THEN 'completed'
            WHEN 'failed' THEN 'error'
            ELSE 'processing' END)
    END
]]

local function normalize_status_filter(status: any): string?
    status = trim(status)
    if status == "" or status == "all" then return nil end
    if status == "uploaded" then return "processing" end
    return status
end

-- Placeholder numbers derive from #args at append time; args already holds the
-- params bound by SQL that precedes the WHERE clause (the join predicate).
local function append_filters(sql_parts: { string }, args: { any }, actor_id: string, component_id: string, opts: any): string?
    opts = type(opts) == "table" and opts or {}
    args[#args + 1] = actor_id
    sql_parts[#sql_parts + 1] = "u.actor_id = $" .. tostring(#args)

    local declared, declared_err = upload_type.declared_ids()
    if declared_err or not declared then return declared_err or "upload types unavailable" end
    local slots: { string } = {}
    for _, type_id in ipairs(declared) do
        args[#args + 1] = type_id
        slots[#slots + 1] = "$" .. tostring(#args)
    end
    sql_parts[#sql_parts + 1] = #slots > 0 and ("u.type_id IN (" .. table.concat(slots, ", ") .. ")") or "1 = 0"


    local q = trim(opts.q)
    if q ~= "" then
        local like = "%" .. q .. "%"
        args[#args + 1] = like
        args[#args + 1] = like
        sql_parts[#sql_parts + 1] = "(u.mime_type LIKE $" .. tostring(#args - 1) .. " OR u.metadata LIKE $" .. tostring(#args) .. ")"
    end

    local status = normalize_status_filter(opts.status)
    if status == "pending" then
        sql_parts[#sql_parts + 1] = "u.storage_state = 'pending'"
        sql_parts[#sql_parts + 1] = "(r.status IS NULL OR r.status = 'processing')"
    elseif status == STATUS.ENQUEUE_FAILED then
        sql_parts[#sql_parts + 1] = "r.status = 'processing'"
        sql_parts[#sql_parts + 1] = "r.error LIKE 'enqueue_failed:%'"
    elseif status then
        args[#args + 1] = status
        sql_parts[#sql_parts + 1] = CURRENT_STATUS_SQL .. " = $" .. tostring(#args)
    end

    sql_parts[#sql_parts + 1] = "(r.status IS NULL OR r.status <> 'deleted')"
    return nil
end

local function select_sql(where_sql: string, limit_n: integer, offset_n: integer): string
    return [[
        SELECT
            u.uuid, u.actor_id, u.size, u.mime_type, u.storage_state,
            u.storage_id, u.storage_path, u.type_id, u.created_at, u.updated_at,
            u.metadata, u.trace_context, u.content_sha256,
            ]] .. CURRENT_STATUS_SQL .. [[ AS status,
            r.error AS error
        FROM kickside_uploads u
        LEFT JOIN kickside_upload_read_model r ON r.upload_id = u.uuid AND r.component_id = $1
        WHERE ]] .. where_sql .. [[
        ORDER BY u.created_at DESC
        LIMIT $]] .. tostring(limit_n) .. [[ OFFSET $]] .. tostring(offset_n) .. [[
    ]]
end

function M.list_for_actor(actor_id: string, limit: any, offset: any, opts: any): ({ any }?, ReadError?)
    actor_id = trim(actor_id)
    if actor_id == "" then return nil, "Actor ID is required" end
    local component_id = upload_types.component_id_for_owner(actor_id)
    if not component_id then return {}, nil end

    local where: { string } = {}
    local args: { any } = { component_id }
    local filter_err = append_filters(where, args, actor_id, component_id, opts)
    if filter_err then return nil, filter_err end
    args[#args + 1] = tonumber(limit) or 100
    local limit_n = #args
    args[#args + 1] = tonumber(offset) or 0
    local offset_n = #args

    local db, db_err = resources.get_db()
    if db_err or not db then return nil, tostring(db_err) end
    local rows, err = db:query(select_sql(table.concat(where, " AND "), limit_n, offset_n), args)
    db:release()
    if err then return nil, "failed to list upload read model: " .. tostring(err) end

    for _, row in ipairs(rows or {}) do
        local metadata, metadata_err = persisted_json.decode_table(row.metadata, "kickside_uploads.metadata")
        if metadata_err then return nil, metadata_err end
        local trace, trace_err = persisted_json.decode_table(row.trace_context,
            "kickside_uploads.trace_context", true)
        if trace_err then return nil, trace_err end
        row.metadata, row.trace_context = metadata, trace
    end
    return rows or {}, nil
end

function M.count_for_actor(actor_id: string, opts: any): (integer?, string?)
    actor_id = trim(actor_id)
    if actor_id == "" then return nil, "Actor ID is required" end
    local component_id = upload_types.component_id_for_owner(actor_id)
    if not component_id then return 0, nil end

    local where: { string } = {}
    local args: { any } = { component_id }
    local filter_err = append_filters(where, args, actor_id, component_id, opts)
    if filter_err then return nil, filter_err end

    local db, db_err = resources.get_db()
    if db_err or not db then return nil, tostring(db_err) end
    local rows, err = db:query([[
        SELECT COUNT(*) AS count
        FROM kickside_uploads u
        LEFT JOIN kickside_upload_read_model r ON r.upload_id = u.uuid AND r.component_id = $1
        WHERE ]] .. table.concat(where, " AND "), args)
    db:release()
    if err then return nil, "failed to count upload read model: " .. tostring(err) end
    return (math.floor(tonumber(rows and rows[1] and rows[1].count) or 0) :: integer), nil
end

function M.get_for_actor(actor_id: string, upload_id: string): (any?, ReadError?)
    actor_id = trim(actor_id)
    upload_id = trim(upload_id)
    if actor_id == "" then return nil, "Actor ID is required" end
    if upload_id == "" then return nil, "Upload ID is required" end
    local component_id = upload_types.component_id_for_owner(actor_id)
    if not component_id then return nil, "Upload not found" end

    local db, db_err = resources.get_db()
    if db_err or not db then return nil, tostring(db_err) end
    local rows, err = db:query([[
        SELECT
            u.uuid, u.actor_id, u.size, u.mime_type, u.storage_state,
            u.storage_id, u.storage_path, u.type_id, u.created_at, u.updated_at,
            u.metadata, u.trace_context, u.content_sha256,
            ]] .. CURRENT_STATUS_SQL .. [[ AS status,
            r.error AS error
        FROM kickside_uploads u
        LEFT JOIN kickside_upload_read_model r ON r.upload_id = u.uuid AND r.component_id = $1
        WHERE u.actor_id = $2 AND u.uuid = $3 AND (r.status IS NULL OR r.status <> 'deleted')
        LIMIT 1
    ]], { component_id, actor_id, upload_id })
    db:release()
    if err then return nil, "failed to get upload read model: " .. tostring(err) end
    if not rows or #rows == 0 then return nil, "Upload not found" end
    local row = rows[1]
    local metadata, metadata_err = persisted_json.decode_table(row.metadata, "kickside_uploads.metadata")
    if metadata_err then return nil, metadata_err end
    local trace, trace_err = persisted_json.decode_table(row.trace_context,
        "kickside_uploads.trace_context", true)
    if trace_err then return nil, trace_err end
    row.metadata, row.trace_context = metadata, trace
    return row, nil
end

return M
