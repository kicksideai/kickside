-- Guarded mapping acquisition. An idle-retention detach or concurrent rotation
-- must never be undone by a reader that observed the old mapping beforehand.
local sql = require("sql")
local row_size = require("row_size")
local uuid = require("uuid")
local time = require("time")
local json = require("json")
local conversation = require("channel_conversation")
local policy = require("channel_retention_policy")

local M = {}

local function now(): string
    return time.now():utc():format_rfc3339()
end

local function open_db(db_id: string): (sql.DB?, string?)
    local db, err = sql.get(db_id)
    if err or not db then return nil, "session db unavailable: " .. tostring(err) end
    return db :: sql.DB, nil
end

-- admission_row validates a session admission and encodes the row binding it
-- to session_id. An admission owned by "channel.session" names the session
-- itself as its record.
function M.admission_row(session_id: string, provider: string, external_id: string,
    admission: any): (any?, string?)
    if type(admission) ~= "table" or type(admission.owner_id) ~= "string" or admission.owner_id == ""
        or type(admission.generation) ~= "number" or admission.generation < 0
        or admission.generation % 1 ~= 0 or type(admission.link_id) ~= "string"
        or type(admission.identity) ~= "table" then
        return nil, "session admission reference is invalid"
    end
    local record_id = admission.owner_id == "channel.session" and session_id or admission.record_id
    if type(record_id) ~= "string" or record_id == "" then
        return nil, "session admission reference is invalid"
    end
    local encoded, encode_err = json.encode(admission.identity)
    if encode_err or not encoded then return nil, "identity encode failed: " .. tostring(encode_err) end
    return {
        params = { session_id, provider, external_id, admission.owner_id, record_id,
            admission.link_id, encoded, admission.generation },
        bytes = #session_id + #provider + #external_id + #admission.owner_id + #record_id
            + #admission.link_id + #encoded,
    }, nil
end

-- check_admission refuses an oversized admission before its session id is
-- claimed, so a refused admission publishes no session.
function M.check_admission(provider: string, external_id: string, row: any?, max_row_bytes: integer): any?
    if row == nil then return nil end
    return row_size.check(provider .. ":" .. external_id, row.bytes, max_row_bytes, "admission_row")
end

-- insert_admission_tx stores the admission in the transaction that publishes
-- its session id, so no reader observes the mapping without its admission.
function M.insert_admission_tx(tx: any, row: any?): string?
    if row == nil then return nil end
    local result, write_err = tx:execute("INSERT INTO kickside_channel_admissions"
        .. " (session_id, provider, external_id, owner_id, record_id, link_id, identity_json, generation)"
        .. " VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", row.params)
    if write_err or not result or tonumber(result.rows_affected) ~= 1 then
        return "admission write failed: " .. tostring(write_err or "affected no row")
    end
    return nil
end

-- Explicit mapping changes keep the old identity as an archive pointer. A
-- supplied admission commits with the new mapping.
function M.set(db_id: string, table_name: string, provider: string,
    external_id: string, session_id: string, admission: any?): any?
    local settings, policy_err = policy.policy()
    if policy_err or not settings then return policy_err end
    local admission_row: any? = nil
    if admission ~= nil then
        local row_err: string?
        admission_row, row_err = M.admission_row(session_id, provider, external_id, admission)
        if row_err then return row_err end
    end
    local db, db_err = open_db(db_id)
    if not db then return db_err end
    local dbtype, type_err = db:type()
    if type_err then db:release(); return type_err end
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); return begin_err end
    local _, lock_err = conversation.lock_tx(tx, dbtype, provider, external_id)
    if lock_err then tx:rollback(); db:release(); return lock_err end
    local rows, read_err = tx:query("SELECT session_id FROM " .. table_name
        .. " WHERE provider=$1 AND external_id=$2", { provider, external_id })
    if read_err or type(rows) ~= "table" then
        tx:rollback(); db:release(); return read_err or "session mapping read returned no result"
    end
    local old_id = rows[1] and rows[1].session_id or nil
    if old_id ~= session_id then
        local size_err = row_size.check(provider .. ":" .. external_id,
            #provider + #external_id + #session_id + #(old_id or ""), settings.max_row_bytes, "session_row")
        if size_err then
            tx:rollback()
            db:release(); return size_err
        end
    end
    local admission_size_err = M.check_admission(provider, external_id, admission_row,
        settings.max_row_bytes)
    if admission_size_err then
        tx:rollback(); db:release(); return admission_size_err
    end
    local _, reserve_err = conversation.claim_session_tx(tx, dbtype, provider, external_id, session_id)
    if reserve_err then
        tx:rollback()
        db:release(); return reserve_err
    end
    local result, update_err = tx:execute("INSERT INTO " .. table_name
        .. " (provider,external_id,session_id,updated_at) VALUES ($1,$2,$3,$4)"
        .. " ON CONFLICT (provider,external_id) DO UPDATE SET session_id=excluded.session_id,"
        .. " updated_at=excluded.updated_at", { provider, external_id, session_id, now() })
    if update_err or not result or tonumber(result.rows_affected) ~= 1 then
        tx:rollback(); db:release(); return update_err or "session upsert affected no row"
    end
    if old_id and old_id ~= session_id then
        local archived, archive_err = tx:execute([[INSERT INTO kickside_channel_session_archives
            (old_session_id,new_session_id,provider,external_id,reason,rotated_at)
            VALUES ($1,$2,$3,$4,'explicit_rotation',$5)]],
            { old_id, session_id, provider, external_id, now() })
        if archive_err or not archived or tonumber(archived.rows_affected) ~= 1 then
            tx:rollback(); db:release(); return archive_err or "session archive affected no row"
        end
    end
    local admit_err = M.insert_admission_tx(tx, admission_row)
    if admit_err then tx:rollback(); db:release(); return admit_err end
    local _, commit_err = tx:commit()
    db:release()
    return commit_err
end

function M.touch_existing(db_id: string, table_name: string, provider: string, external_id: string,
    session_id: string, observed_at: string): (boolean?, string?)
    local db, db_err = open_db(db_id)
    if not db then return nil, db_err end
    local result, update_err = db:execute("UPDATE " .. table_name .. " SET updated_at=$1"
        .. " WHERE provider=$2 AND external_id=$3 AND session_id=$4 AND updated_at=$5",
        { now(), provider, external_id, session_id, observed_at })
    db:release()
    if update_err then return nil, "session touch failed: " .. tostring(update_err) end
    local count = result and tonumber(result.rows_affected)
    if count == nil then return nil, "session touch returned no affected-row count" end
    return count == 1, nil
end

-- insert_new publishes a first mapping together with its admission, when one
-- is supplied, in one transaction.
function M.insert_new(db_id: string, table_name: string, provider: string,
    external_id: string, session_id: string, admission: any?): (boolean?, any?)
    local settings, policy_err = policy.policy()
    if policy_err or not settings then return nil, policy_err end
    local admission_row: any? = nil
    if admission ~= nil then
        local row_err: string?
        admission_row, row_err = M.admission_row(session_id, provider, external_id, admission)
        if row_err then return nil, row_err end
    end
    local db, db_err = open_db(db_id)
    if not db then return nil, db_err end
    local dbtype, type_err = db:type()
    if type_err then db:release(); return nil, type_err end
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); return nil, begin_err end
    local _, lock_err = conversation.lock_tx(tx, dbtype, provider, external_id)
    if lock_err then tx:rollback(); db:release(); return nil, lock_err end
    -- Another first ingress may have committed after our outer lookup. Its
    -- mapping wins; the caller will read it on its next acquisition attempt.
    local existing, read_err = tx:query("SELECT session_id FROM " .. table_name
        .. " WHERE provider=$1 AND external_id=$2", { provider, external_id })
    if read_err or type(existing) ~= "table" then
        tx:rollback(); db:release()
        return nil, read_err or "session mapping recheck returned no result"
    end
    if existing[1] then
        tx:rollback(); db:release()
        if type(existing[1].session_id) ~= "string" or existing[1].session_id == "" then
            return nil, "session mapping recheck found an invalid identity"
        end
        return false, nil
    end
    local size_err = row_size.check(provider .. ":" .. external_id,
        #provider + #external_id + #session_id, settings.max_row_bytes, "session_row")
    if size_err then
        tx:rollback()
        db:release()
        return nil, size_err
    end
    local admission_size_err = M.check_admission(provider, external_id, admission_row,
        settings.max_row_bytes)
    if admission_size_err then
        tx:rollback(); db:release()
        return nil, admission_size_err
    end
    local _, reserve_err = conversation.claim_session_tx(tx, dbtype, provider, external_id, session_id)
    if reserve_err then
        tx:rollback()
        db:release()
        return nil, reserve_err
    end
    local result, insert_err = tx:execute("INSERT INTO " .. table_name
        .. " (provider,external_id,session_id,updated_at) VALUES ($1,$2,$3,$4)"
        .. " ON CONFLICT (provider,external_id) DO NOTHING",
        { provider, external_id, session_id, now() })
    if insert_err then tx:rollback(); db:release(); return nil, "session create failed: " .. tostring(insert_err) end
    local count = result and tonumber(result.rows_affected)
    if count == nil then tx:rollback(); db:release(); return nil, "session create returned no affected-row count" end
    if count == 0 then tx:rollback(); db:release(); return false, nil end
    local admit_err = M.insert_admission_tx(tx, admission_row)
    if admit_err then tx:rollback(); db:release(); return nil, admit_err end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then return nil, "session create commit failed: " .. tostring(commit_err) end
    return count == 1, nil
end

local function stale_by(updated_at: any, max_idle_seconds: integer?): (boolean?, string?)
    if max_idle_seconds == nil or max_idle_seconds <= 0 then return false, nil end
    if type(updated_at) ~= "string" or updated_at == "" then return nil, "session updated_at is required" end
    local parsed, parse_err = time.parse(time.RFC3339, updated_at)
    if parse_err or not parsed then return nil, "invalid session updated_at: " .. tostring(parse_err or updated_at) end
    return time.now():utc():sub(parsed):seconds() >= max_idle_seconds, nil
end

function M.get_or_create(db_id: string, table_name: string, provider: string, external_id: string,
    max_idle_seconds: integer?, admission: any?,
    rotate: (string, string, string, string, string, string, any?) -> (string?, any?)): (string?, boolean, any?)
    if type(db_id) ~= "string" or db_id == "" or type(table_name) ~= "string" or table_name == ""
        or provider == "" or external_id == "" then
        return nil, false, "conversation key is required"
    end
    if max_idle_seconds ~= nil and (type(max_idle_seconds) ~= "number"
        or max_idle_seconds ~= math.floor(max_idle_seconds) or max_idle_seconds < 0) then
        return nil, false, "max_idle_seconds must be a nonnegative integer"
    end
    for _ = 1, 3 do
        local db, db_err = open_db(db_id)
        if not db then return nil, false, db_err end
        local rows, read_err = db:query("SELECT session_id,updated_at FROM " .. table_name
            .. " WHERE provider=$1 AND external_id=$2 LIMIT 1", { provider, external_id })
        db:release()
        if read_err then return nil, false, "session lookup failed: " .. tostring(read_err) end
        if type(rows) ~= "table" then return nil, false, "session lookup returned no rows result" end
        local row = rows[1]
        if row and type(row.session_id) == "string" and row.session_id ~= "" then
            local stale, stale_err = stale_by(row.updated_at, max_idle_seconds)
            if stale_err then return nil, false, stale_err end
            if stale then
                local next_id, rotate_err = rotate(db_id, table_name, provider, external_id,
                    row.session_id, "idle_timeout", admission)
                if rotate_err then return nil, false, rotate_err end
                return next_id, true, nil
            end
            local touched, touch_err = M.touch_existing(db_id, table_name, provider, external_id,
                row.session_id, row.updated_at :: string)
            if touch_err then return nil, false, touch_err end
            if touched then return row.session_id, false, nil end
        else
            local new_id = uuid.v7()
            local inserted, insert_err = M.insert_new(db_id, table_name, provider, external_id, new_id, admission)
            if insert_err then return nil, false, insert_err end
            if inserted then return new_id, true, nil end
        end
    end
    return nil, false, "session mapping changed during acquisition"
end

return M
