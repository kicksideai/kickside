-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Persist an actionable, owner-review disposition before acknowledging the
-- source event. Queue progress and ordinary event retention remain independent.
local sql = require("sql")
local time = require("time")
local uuid = require("uuid")
local core_db = require("core_db")
local consts = require("lifecycle_consts")
local envelope = require("error_envelope")

local M = {}

local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, retryable = false, message = message})
end

local function sequence_of(event: any): (number?, error?)
    local sequence = tonumber(event.seq)
    if type(event.id) ~= "string" or not uuid.validate(event.id) or not sequence or sequence < 1 or sequence % 1 ~= 0 then
        return nil, invalid("custody disposition requires a durably addressed report")
    end
    return sequence, nil
end

local function inspect(db: sql.DB, sequence: number): (any?, error?)
    local rows, err = db:query([[SELECT event_id FROM kickside_lifecycle_custody_disposition
        WHERE thread_id=$1 AND event_seq=$2]], {consts.thread_id(), sequence})
    if err then return nil, err end
    return rows[1], nil
end

function M.exists(event: any): (boolean?, error?)
    local sequence, address_err = sequence_of(event)
    if address_err then return nil, address_err end
    local db, open_err = sql.get(core_db.id())
    if open_err then return nil, open_err end
    local prior, err = inspect(db, sequence :: number)
    if prior and prior.event_id ~= event.id then err = invalid("custody disposition belongs to another report") end
    err = envelope.cleanup(function(): (any, error?) return db:release() end, err, "release lifecycle disposition read")
    if err then return nil, err end
    return prior ~= nil, nil
end

function M.record(event: any, subject_id: string, principal_kind: string?, reason: string, witness: any?): error?
    local sequence, address_err = sequence_of(event)
    if address_err then return address_err end
    local component_report = reason == "missing_component_incarnation"
    local event_type = component_report and consts.EVENT.COMPONENT_DELETED or consts.EVENT.PRINCIPAL_DELETED
    if event.type ~= event_type then return invalid("custody disposition reason does not match the report type") end
    local qualification = component_report and "(e.body ->> 'incarnation') IS NULL"
        or "COALESCE(e.body ->> 'principal_kind','')=COALESCE(CAST($2 AS TEXT),'')"
    local db, open_err = sql.get(core_db.id())
    if open_err then return open_err end
    local _, write_err = db:execute([[INSERT INTO kickside_lifecycle_custody_disposition
        (thread_id,event_seq,event_id,subject_id,principal_kind,reason,witness_id,witness_incarnation,recorded_at)
        SELECT CAST(e.thread_id AS TEXT),e.seq,CAST(e.id AS TEXT),$1,$2,$3,$4,$5,$6 FROM kickside_event e
        WHERE e.thread_id=$7 AND e.seq=$8 AND e.id=$9 AND e.type=$10 AND e.role='system'
          AND e.external_source='lifecycle' AND (e.body ->> 'subject_id')=$1
          AND ]] .. qualification .. [[
        ON CONFLICT (thread_id,event_seq) DO NOTHING]], {subject_id, principal_kind or sql.as.null(), reason,
        witness and witness.component_id or sql.as.null(), witness and witness.secrets_incarnation or sql.as.null(),
        time.now():utc():format_rfc3339(), consts.thread_id(), sequence, event.id, event_type})
    local confirmed, read_err
    if not write_err then confirmed, read_err = inspect(db, sequence :: number) end
    local err = write_err or read_err
    if not err and (not confirmed or confirmed.event_id ~= event.id) then
        err = invalid("custody disposition requires the original lifecycle report")
    end
    return envelope.cleanup(function(): (any, error?) return db:release() end, err, "release lifecycle disposition write")
end

return M
