-- Accepted turns remain recoverable until Channel records their first durable
-- thread append. Failed writers store an exact retry deadline here.
local sql = require("sql")
local time = require("time")
local conversation = require("channel_conversation")

local M = {}

local function open_db(db_id: string): (sql.DB?, string?)
    if type(db_id) ~= "string" or db_id == "" then return nil, "db_id is required" end
    local db, db_err = sql.get(db_id)
    if db_err or not db then return nil, "turn recovery database unavailable: " .. tostring(db_err) end
    return db :: sql.DB, nil
end

function M.mark_appended(db_id: string, turn_id: string): (boolean, string?)
    if type(turn_id) ~= "string" or turn_id == "" then return false, "turn_id is required" end
    local db, db_err = open_db(db_id)
    if not db then return false, db_err end
    local result, write_err = conversation.update_turn(db, turn_id, [[UPDATE kickside_channel_turns
        SET appended_at=$1,retry_at=NULL WHERE turn_id=$2 AND appended_at IS NULL]],
        { time.now():utc():format_rfc3339(), turn_id })
    db:release()
    if write_err then return false, "turn append marker failed: " .. tostring(write_err) end
    if not result or tonumber(result.rows_affected) == nil then
        return false, "turn append marker returned no affected-row count"
    end
    return true, nil
end

function M.schedule_retry(db_id: string, turn_id: string, retry_at: integer): (boolean, string?)
    if type(turn_id) ~= "string" or turn_id == "" or type(retry_at) ~= "number"
        or retry_at ~= math.floor(retry_at) or retry_at < 0 then
        return false, "turn retry requires a turn id and non-negative integer deadline"
    end
    local db, db_err = open_db(db_id)
    if not db then return false, db_err end
    local result, write_err = conversation.update_turn(db, turn_id, [[UPDATE kickside_channel_turns
        SET retry_at=$1 WHERE turn_id=$2 AND appended_at IS NULL]], { retry_at, turn_id })
    db:release()
    if write_err then return false, "turn retry deadline write failed: " .. tostring(write_err) end
    if not result or tonumber(result.rows_affected) == nil then
        return false, "turn retry deadline write returned no affected-row count"
    end
    return tonumber(result.rows_affected) == 1, nil
end

function M.clear_retry(db_id: string, turn_id: string): (boolean, string?)
    if type(turn_id) ~= "string" or turn_id == "" then return false, "turn_id is required" end
    local db, db_err = open_db(db_id)
    if not db then return false, db_err end
    local result, write_err = conversation.update_turn(db, turn_id, [[UPDATE kickside_channel_turns SET retry_at=NULL
        WHERE turn_id=$1 AND appended_at IS NULL AND retry_at IS NOT NULL]], { turn_id })
    db:release()
    if write_err then return false, "turn retry clear failed: " .. tostring(write_err) end
    if not result or tonumber(result.rows_affected) == nil then
        return false, "turn retry clear returned no affected-row count"
    end
    return tonumber(result.rows_affected) == 1, nil
end

function M.is_unappended(db_id: string, turn_id: string): (boolean?, string?)
    if type(turn_id) ~= "string" or turn_id == "" then return nil, "turn_id is required" end
    local db, db_err = open_db(db_id)
    if not db then return nil, db_err end
    local rows, read_err = db:query([[SELECT 1 AS pending FROM kickside_channel_turns
        WHERE turn_id=$1 AND appended_at IS NULL]], { turn_id })
    db:release()
    if read_err then return nil, "unappended turn check failed: " .. tostring(read_err) end
    return rows ~= nil and #rows > 0, nil
end

function M.list_unappended(db_id: string): ({ any }?, string?)
    local db, db_err = open_db(db_id)
    if not db then return nil, db_err end
    local rows, read_err = db:query(
        "SELECT turn_id,retry_at FROM kickside_channel_turns WHERE appended_at IS NULL ORDER BY accepted_at,turn_id")
    db:release()
    if read_err then return nil, "pending turn read failed: " .. tostring(read_err) end
    local pending: { any } = {}
    for _, row in ipairs(rows or {}) do
        pending[#pending + 1] = { turn_id = tostring(row.turn_id), retry_at = tonumber(row.retry_at) }
    end
    return pending, nil
end

return M
