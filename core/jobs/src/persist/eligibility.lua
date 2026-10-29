-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local capacity = require("capacity")
local boundary = require("sql_boundary")

local M = {}

-- SQL grouping must use the target identity, just as dispatch does, without
-- rewriting stored worker references. Both supported schemes have seven bytes.
local function worker_target(row: string?, dbtype: string): string
    local prefix = row and row .. "." or ""
    local char = dbtype == sql.type.POSTGRES and "chr" or "char"
    local whitespace = char .. "(9)||" .. char .. "(10)||" .. char .. "(11)||" .. char .. "(12)||" .. char .. "(13)||' '"
    local trim = dbtype == sql.type.POSTGRES and "BTRIM" or "TRIM"
    local reference = trim .. "(COALESCE(" .. prefix .. "worker_ref," .. prefix .. "job_type)," .. whitespace .. ")"
    return "(CASE WHEN SUBSTR(" .. reference .. ",1,7) IN ('func://','proc://') THEN "
        .. trim .. "(SUBSTR(" .. reference .. ",8)," .. whitespace .. ") ELSE " .. reference .. " END)"
end

function M.legacy_key(running_status: string, row: string?): string
    local outer = row or "kickside_job"
    return "(" .. outer .. ".concurrency_key IS NULL OR NOT EXISTS (SELECT 1 FROM kickside_job running"
        .. " WHERE running.status=" .. running_status .. " AND running.concurrency_key=" .. outer .. ".concurrency_key))"
end

function M.available_key(running_status: string, row: string?): string
    local outer = row or "kickside_job"
    return "(" .. outer .. ".concurrency_key IS NULL OR (" .. outer .. ".capacity_group IS NULL AND NOT EXISTS"
        .. " (SELECT 1 FROM kickside_job running WHERE running.status=" .. running_status
        .. " AND running.concurrency_key=" .. outer .. ".concurrency_key)) OR (" .. outer .. ".capacity_group IS NOT NULL"
        .. " AND NOT EXISTS (SELECT 1 FROM kickside_job running WHERE running.status=" .. running_status
        .. " AND running.capacity_group IS NULL AND running.concurrency_key=" .. outer .. ".concurrency_key)))"
end

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "claim response is invalid",
        details = {code = "job_claim_response", field = field}})
end

-- Capacity is projected by SQL aggregates, never by fetching the pending queue.
-- The preliminary read is bounded by registered worker references. Settings are
-- read only for their currently due groups; a group arriving later is observed
-- on the next operation, just like a job arriving after the count statement.
function M.pending(db: sql.DB, dbtype: string, at: string?, snapshot: table): (table?, error?)
    local catalog, catalog_err = snapshot.catalog()
    if catalog_err or not catalog then return nil, catalog_err end
    local params: { any } = {}
    local function bind(value: any): string
        params[#params + 1] = value
        return "$" .. tostring(#params)
    end
    local prefix = ""
    local now = dbtype == sql.type.POSTGRES and "NOW()" or "datetime('now')"
    if at then
        local observed = dbtype == sql.type.POSTGRES and "CAST(" .. bind(at) .. " AS TIMESTAMPTZ)" or bind(at)
        prefix = "WITH capacity_clock(observed_at) AS (VALUES (" .. observed .. "))"
        now = "(SELECT observed_at FROM capacity_clock)"
    end
    local workers: { string } = {}
    for worker in pairs(catalog) do workers[#workers + 1] = worker end
    table.sort(workers)
    local values: { string } = {}
    for _, worker in ipairs(workers) do
        values[#values + 1] = "(CAST(" .. bind(worker) .. " AS TEXT), CAST(" .. bind(catalog[worker]) .. " AS TEXT))"
    end
    local joins = ""
    local allowed = M.legacy_key("'running'", "j")
    if #workers > 0 then
        local target = worker_target(nil, dbtype)
        prefix = (prefix ~= "" and prefix .. ", " or "WITH ")
            .. "capacity_workers(worker_ref,capacity_group) AS (VALUES " .. table.concat(values, ",") .. ")"
        local rows, read_err = db:query(prefix .. " SELECT " .. target .. [[ AS worker_ref,
                   MIN(capacity_group) AS admitted_min, MAX(capacity_group) AS admitted_max,
                   MAX(CASE WHEN concurrency_key IS NULL OR concurrency_key='' THEN 1 ELSE 0 END) AS invalid_key
            FROM kickside_job WHERE status='pending' AND scheduled_at <= ]] .. now .. [[
              AND ]] .. target .. " IN (SELECT worker_ref FROM capacity_workers) GROUP BY " .. target, params)
        rows, read_err = boundary.bounded_rows(rows, read_err, "backlog capacity lookup failed",
            "backlog.workers", 0, #workers, response_error)
        if read_err then return nil, read_err end
        local groups: { [string]: {global_limit: integer, concurrency_key_limit: integer} } = {}
        for _, row in ipairs(rows) do
            if type(row.worker_ref) ~= "string" or not catalog[row.worker_ref] then
                return nil, response_error("backlog.worker_ref")
            end
            local invalid_key, key_err = boundary.number_value(row.invalid_key, "backlog.invalid_key", 0, true, false, response_error)
            if key_err or invalid_key > 1 then return nil, key_err or response_error("backlog.invalid_key") end
            local descriptor, descriptor_err = snapshot.group({worker_ref = row.worker_ref,
                concurrency_key = invalid_key == 0 and "backlog" or nil, capacity_group = row.admitted_min})
            if descriptor_err or not descriptor then return nil, descriptor_err end
            if row.admitted_max ~= row.admitted_min then
                local _, maximum_err = snapshot.group({worker_ref = row.worker_ref,
                    concurrency_key = "backlog", capacity_group = row.admitted_max})
                if maximum_err then return nil, maximum_err end
            end
            if not groups[descriptor.group] then
                local limits, limits_err = snapshot.limits(descriptor)
                if limits_err or not limits then return nil, limits_err end
                groups[descriptor.group] = limits
            end
        end
        local names: { string } = {}
        for group in pairs(groups) do names[#names + 1] = group end
        table.sort(names)
        joins = " LEFT JOIN capacity_workers c ON c.worker_ref=" .. worker_target("j", dbtype)
        allowed = "(c.worker_ref IS NULL AND " .. allowed .. ")"
        if #names > 0 then
            local limits_values: { string } = {}
            for _, group in ipairs(names) do
                local limits = groups[group]
                limits_values[#limits_values + 1] = "(CAST(" .. bind(group) .. " AS TEXT), CAST("
                    .. bind(limits.global_limit) .. " AS INTEGER), CAST(" .. bind(limits.concurrency_key_limit) .. " AS INTEGER))"
            end
            prefix = prefix .. ", capacity_limits(capacity_group,global_limit,key_limit) AS (VALUES "
                .. table.concat(limits_values, ",") .. [[), capacity_running AS (
                    SELECT COALESCE(r.capacity_group,w.capacity_group) AS capacity_group, r.concurrency_key
                    FROM kickside_job r LEFT JOIN capacity_workers w ON w.worker_ref=]] .. worker_target("r", dbtype) .. [[
                    WHERE r.status='running'
                ), capacity_totals AS (
                    SELECT capacity_group,COUNT(*) AS n FROM capacity_running
                    WHERE capacity_group IS NOT NULL GROUP BY capacity_group
                ), capacity_keys AS (
                    SELECT capacity_group,concurrency_key,COUNT(*) AS n FROM capacity_running
                    WHERE capacity_group IS NOT NULL AND concurrency_key IS NOT NULL GROUP BY capacity_group,concurrency_key
                )]]
            joins = joins .. [[ LEFT JOIN capacity_limits l ON l.capacity_group=c.capacity_group
                LEFT JOIN capacity_totals g ON g.capacity_group=c.capacity_group
                LEFT JOIN capacity_keys k ON k.capacity_group=c.capacity_group AND k.concurrency_key=j.concurrency_key]]
            allowed = "(" .. allowed .. " OR (l.capacity_group IS NOT NULL"
                .. " AND (j.capacity_group IS NULL OR j.capacity_group=c.capacity_group) AND "
                .. M.available_key("'running'", "j")
                .. " AND COALESCE(g.n,0)<l.global_limit AND COALESCE(k.n,0)<l.key_limit))"
        end
    end
    if prefix ~= "" then prefix = prefix .. " " end
    return {prefix = prefix, joins = joins, allowed = allowed, params = params, now = now, workers = catalog}, nil
end

function M.due_backlog(db: sql.DB, dbtype: string, grace_seconds: integer, at: string?): (table?, error?)
    local pending, pending_err = M.pending(db, dbtype, at, capacity.snapshot())
    if pending_err or not pending then return nil, pending_err end
    local params, now = pending.params, pending.now
    params[#params + 1] = grace_seconds
    local grace = "$" .. tostring(#params)
    local age = dbtype == sql.type.POSTGRES
        and "EXTRACT(EPOCH FROM (" .. now .. " - MIN(j.scheduled_at))) * 1000"
        or "(julianday(" .. (at and now or "'now'") .. ") - julianday(MIN(j.scheduled_at))) * 86400000"
    if at and dbtype ~= sql.type.POSTGRES then age = "ROUND(" .. age .. ")" end
    local overdue = dbtype == sql.type.POSTGRES
        and "j.scheduled_at <= " .. now .. " - (" .. grace .. " * INTERVAL '1 second')"
        or "j.scheduled_at <= datetime(" .. now .. ", '-' || " .. grace .. " || ' seconds') || substr(" .. now .. ", 20)"
    local rows, err = db:query(pending.prefix .. "SELECT COUNT(*) AS n, " .. age .. " AS age_ms,"
        .. " COALESCE(SUM(CASE WHEN " .. overdue .. " THEN 1 ELSE 0 END),0) AS overdue"
        .. " FROM kickside_job j" .. pending.joins .. " WHERE j.status='pending' AND j.scheduled_at <= " .. now .. " AND " .. pending.allowed, params)
    rows, err = boundary.bounded_rows(rows, err, "due backlog query failed", "backlog", 1, 1, response_error)
    if err then return nil, err end
    local row = rows[1]
    local count, count_err = boundary.number_value(row.n, "backlog.n", 0, true, false, response_error)
    if count_err then return nil, count_err end
    local overdue_count, overdue_err = boundary.number_value(row.overdue, "backlog.overdue", 0, true, false, response_error)
    if overdue_err then return nil, overdue_err end
    local oldest, age_err = boundary.number_value(row.age_ms, "backlog.age_ms", nil, false, true, response_error)
    if age_err then return nil, age_err end
    return {count = count, overdue = overdue_count, oldest_age_ms = math.max(0, math.floor(oldest))}, nil
end

return M
