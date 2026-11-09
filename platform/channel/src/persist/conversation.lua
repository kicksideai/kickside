-- The conversation owner row: one per (provider, external_id). Admission,
-- session identity changes and owner cleanup lock it before touching turn or
-- session rows; owner delete marks it deleting so no new session or turn is
-- admitted. The session owner map names the conversation every session id
-- belongs to, including archived and admitted ones.
local sql = require("sql")
local row_size = require("row_size")
local time = require("time")

local M = {}

M.SESSION_OWNERS_SQL = [[
    SELECT session_id,provider,external_id FROM kickside_channel_session_owner
    UNION SELECT session_id,provider,external_id FROM kickside_channel_sessions
    UNION SELECT session_id,provider,external_id FROM kickside_channel_admissions
    UNION SELECT old_session_id AS session_id,provider,external_id FROM kickside_channel_session_archives
    UNION SELECT new_session_id AS session_id,provider,external_id FROM kickside_channel_session_archives]]

local function failure(message: string, cause: any?): error
    return (errors.new({ message = message .. (cause and ": " .. tostring(cause) or ""),
        kind = errors.INTERNAL, retryable = true }) :: error)
end

local function count(result: any, action: string): (integer?, error?)
    local n = result and tonumber(result.rows_affected)
    if type(n) ~= "number" or n < 0 or n ~= math.floor(n) then
        return nil, failure(action .. " returned no affected-row count")
    end
    return n :: integer, nil
end

local function deleting(provider: string, external_id: string): error
    return (errors.new({ message = "channel conversation is being deleted",
        kind = errors.CONFLICT, retryable = false,
        details = { reason = "owner_deleting", scope = provider .. ":" .. external_id,
            operation = "owner_delete" } }) :: error)
end

function M.lock_tx(tx: any, dbtype: any, provider: string, external_id: string): (any?, error?)
    local inserted, insert_err = tx:execute([[INSERT INTO kickside_channel_conversation
        (provider,external_id) VALUES ($1,$2)
        ON CONFLICT (provider,external_id) DO NOTHING]], { provider, external_id })
    if insert_err then return nil, failure("channel conversation create failed", insert_err) end
    local _, count_err = count(inserted, "channel conversation create")
    if count_err then return nil, count_err end
    local suffix = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
    local rows, read_err = tx:query([[SELECT deleting FROM kickside_channel_conversation
        WHERE provider=$1 AND external_id=$2]] .. suffix, { provider, external_id })
    if read_err or type(rows) ~= "table" or not rows[1] then
        return nil, failure("channel conversation lock failed", read_err or "missing row")
    end
    return rows[1], nil
end

local function reject_pending_unlink_tx(tx: any, provider: string, external_id: string): error?
    local rows, read_err = tx:query([[SELECT link_pending FROM kickside_channel_cleanup_counts
        WHERE provider=$1 AND external_id=$2]], { provider, external_id })
    if read_err or type(rows) ~= "table" then
        return failure("channel unlink fence read failed", read_err or "missing rows")
    end
    if rows[1] then
        local pending = tonumber(rows[1].link_pending)
        if pending == nil then return failure("channel unlink fence is invalid") end
        if pending == 1 then return deleting(provider, external_id) end
    end
    return nil
end

-- admit_tx locks the conversation and refuses it while owner delete or an
-- identity unlink handoff is in progress.
function M.admit_tx(tx: any, dbtype: any, provider: string, external_id: string): error?
    local row, lock_err = M.lock_tx(tx, dbtype, provider, external_id)
    if lock_err then return lock_err end
    if tonumber(row.deleting) == 1 then return deleting(provider, external_id) end
    return reject_pending_unlink_tx(tx, provider, external_id)
end

-- claim_session_tx records the conversation that owns session_id. A session
-- already owned by this conversation is a replay; one owned by another
-- conversation is refused.
function M.claim_session_tx(tx: any, dbtype: any, provider: string,
    external_id: string, session_id: string): (boolean?, error?)
    local admit_err = M.admit_tx(tx, dbtype, provider, external_id)
    if admit_err then return nil, admit_err end
    local owners, read_err = tx:query([[SELECT provider,external_id
        FROM kickside_channel_session_owner WHERE session_id=$1]], { session_id })
    if read_err or type(owners) ~= "table" then
        return nil, failure("channel session owner read failed", read_err or "missing rows")
    end
    if owners[1] then
        if owners[1].provider ~= provider or owners[1].external_id ~= external_id then
            return nil, failure("channel session identity belongs to another conversation")
        end
        return false, nil
    end
    local claimed, claim_err = tx:execute([[INSERT INTO kickside_channel_session_owner
        (session_id,provider,external_id) VALUES ($1,$2,$3)]],
        { session_id, provider, external_id })
    local n, count_err = count(claimed, "channel session owner")
    if claim_err or count_err or n ~= 1 then
        return nil, failure("channel session owner write failed", claim_err or count_err or n)
    end
    return true, nil
end

function M.owner_for_session_tx(tx: any, session_id: string): ({ provider: string, external_id: string }?, error?)
    local rows, read_err = tx:query([[SELECT provider,external_id FROM kickside_channel_session_owner
        WHERE session_id=$1]], { session_id })
    if read_err or type(rows) ~= "table" then
        return nil, failure("channel turn owner read failed", read_err or "missing rows")
    end
    local row = rows[1]
    if not row or type(row.provider) ~= "string" or type(row.external_id) ~= "string" then
        return nil, failure("channel accepted turn has no owned session")
    end
    return { provider = row.provider, external_id = row.external_id }, nil
end

function M.turn_owner_tx(executor: any, dbtype: any, turn_id: string): (any?, error?)
    local session_expr: string
    if dbtype == sql.type.POSTGRES then
        session_expr = "(t.route_json::jsonb ->> 'session_id')"
    elseif dbtype == sql.type.SQLITE then
        session_expr = "json_extract(t.route_json, '$.session_id')"
    else
        return nil, failure("channel turn database dialect unsupported", dbtype)
    end
    local rows, read_err = executor:query([[SELECT
        COALESCE(t.owner_provider,s.provider) AS provider,
        COALESCE(t.owner_external_id,s.external_id) AS external_id,c.deleting
        FROM kickside_channel_turns t
        LEFT JOIN (]] .. M.SESSION_OWNERS_SQL .. [[) s ON s.session_id=]] .. session_expr .. [[
          AND (t.owner_provider IS NULL OR t.owner_external_id IS NULL)
        LEFT JOIN kickside_channel_conversation c
          ON c.provider=COALESCE(t.owner_provider,s.provider)
         AND c.external_id=COALESCE(t.owner_external_id,s.external_id)
        WHERE t.turn_id=$1]], { turn_id })
    if read_err or type(rows) ~= "table" then
        return nil, failure("channel turn update owner read failed", read_err or "missing rows")
    end
    if #rows > 1 then return nil, failure("channel turn has ambiguous conversation ownership") end
    return rows[1], nil
end

-- Turn bookkeeping uses the same owner-before-turn lock order as admission.
-- A visible delete fence is terminal for these writes; it also lets late
-- acknowledgements settle without waiting behind the cleanup page they name.
function M.update_turn(db: sql.DB, turn_id: string, statement: string, args: { any }): (any?, error?)
    local dbtype, type_err = db:type()
    if type_err then return nil, failure("channel turn database type failed", type_err) end
    local tx, begin_err = db:begin()
    if begin_err or not tx then return nil, failure("channel turn update begin failed", begin_err) end
    local row, read_err = M.turn_owner_tx(tx, dbtype, turn_id)
    if read_err then tx:rollback(); return nil, read_err end
    if not row or tonumber(row.deleting) == 1 then
        tx:rollback()
        return { rows_affected = 0 }, nil
    end
    if row.provider and row.external_id then
        local suffix = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
        local owners, lock_err = tx:query([[SELECT deleting FROM kickside_channel_conversation
            WHERE provider=$1 AND external_id=$2]] .. suffix, { row.provider, row.external_id })
        if lock_err or type(owners) ~= "table" then
            tx:rollback()
            return nil, failure("channel turn update owner lock failed", lock_err or "missing rows")
        end
        if not owners[1] or tonumber(owners[1].deleting) == 1 then
            tx:rollback()
            return { rows_affected = 0 }, nil
        end
    end
    local result, write_err = tx:execute(statement, args)
    local _, count_err = count(result, "channel turn update")
    if write_err or count_err then
        tx:rollback()
        return nil, failure("channel turn update failed", write_err or count_err)
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, failure("channel turn update commit failed", commit_err) end
    return result, nil
end

-- deleting_status lists conversations whose owner delete is still pending.
function M.deleting_status(db_id: string, limit: integer): (any?, error?)
    local db, open_err = sql.get(db_id)
    if open_err or not db then return nil, failure("channel conversation database unavailable", open_err) end
    local rows, read_err = db:query([[SELECT provider,external_id,delete_requested_at
        FROM kickside_channel_conversation WHERE deleting=1
        ORDER BY delete_requested_at,provider,external_id LIMIT $1]], { limit })
    db:release()
    if read_err or type(rows) ~= "table" then
        return nil, failure("channel delete status read failed", read_err or "missing rows")
    end
    local pending = {}
    for _, row in ipairs(rows) do
        pending[#pending + 1] = { scope = row.provider .. ":" .. row.external_id,
            operation = "owner_delete", requested_at = row.delete_requested_at }
    end
    return pending, nil
end

function M.begin_delete(db_id: string, provider: string, external_id: string): error?
    local db, open_err = sql.get(db_id)
    if open_err or not db then return failure("channel owner delete database unavailable", open_err) end
    local dbtype, type_err = db:type()
    if type_err then db:release(); return failure("channel owner delete database type failed", type_err) end
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); return failure("channel owner delete begin failed", begin_err) end
    local _, lock_err = M.lock_tx(tx, dbtype, provider, external_id)
    if lock_err then tx:rollback(); db:release(); return lock_err end
    local result, update_err = tx:execute([[UPDATE kickside_channel_conversation
        SET deleting=1,delete_requested_at=COALESCE(delete_requested_at,$1)
        WHERE provider=$2 AND external_id=$3]], { time.now():utc():format_rfc3339(), provider, external_id })
    local n, count_err = count(result, "channel owner delete fence")
    if update_err or count_err or n ~= 1 then
        tx:rollback(); db:release()
        return failure("channel owner delete fence failed", update_err or count_err or n)
    end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then return failure("channel owner delete fence commit failed", commit_err) end
    return nil
end

function M.insert_turn_for_owner(db_id: string, route: any, encoded: string,
    turn_id: string, max_row_bytes: integer,
    owner: { provider: string, external_id: string }): error?
    local size_err = row_size.check(owner.provider .. ":" .. owner.external_id,
        #encoded, max_row_bytes, "turn_row")
    if size_err then return size_err end
    local db, open_err = sql.get(db_id)
    if open_err or not db then return failure("channel turn database unavailable", open_err) end
    local dbtype, type_err = db:type()
    if type_err then db:release(); return failure("channel turn database type failed", type_err) end
    local tx, begin_err = db:begin()
    if begin_err or not tx then db:release(); return failure("channel turn begin failed", begin_err) end
    local notice = type(route.thread) == "table" and route.thread.role == "notice"
    local admit_err = M.admit_tx(tx, dbtype, owner.provider, owner.external_id)
    if admit_err then tx:rollback(); db:release(); return admit_err end
    if not notice then
        -- The preliminary owner read is only a routing hint. The session must
        -- still be owned by this conversation after its row lock, which
        -- serializes owner deletion.
        local owned, owner_err = M.owner_for_session_tx(tx, route.session_id :: string)
        if owner_err or not owned then
            tx:rollback(); db:release()
            return owner_err or failure("channel accepted turn has no owned session")
        end
        if owned.provider ~= owner.provider or owned.external_id ~= owner.external_id then
            tx:rollback(); db:release()
            return failure("channel accepted turn owner changed during admission")
        end
    end
    -- A notice has no bridge append; its acceptance is its completed local step.
    local accepted_at = time.now():utc():format_rfc3339()
    local statement = notice
        and "INSERT INTO kickside_channel_turns (turn_id,route_json,accepted_at,appended_at,owner_provider,owner_external_id) VALUES ($1,$2,$3,$3,$4,$5)"
        or "INSERT INTO kickside_channel_turns (turn_id,route_json,accepted_at,owner_provider,owner_external_id) VALUES ($1,$2,$3,$4,$5)"
    local result, write_err = tx:execute(statement,
        { turn_id, encoded, accepted_at, owner.provider, owner.external_id })
    if write_err or not result or tonumber(result.rows_affected) ~= 1 then
        tx:rollback(); db:release()
        return failure("channel accepted turn write failed", write_err or "missing affected-row count")
    end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then return failure("channel accepted turn commit failed", commit_err) end
    return nil
end

function M.insert_turn(db_id: string, route: any, encoded: string,
    turn_id: string, max_row_bytes: integer): error?
    local notice = type(route.thread) == "table" and route.thread.role == "notice"
    local owner: { provider: string, external_id: string }?
    if notice then
        owner = { provider = route.session_provider :: string,
            external_id = route.reply.resource_id :: string }
    else
        local db, open_err = sql.get(db_id)
        if open_err or not db then return failure("channel turn database unavailable", open_err) end
        local owner_err: error?
        owner, owner_err = M.owner_for_session_tx(db, route.session_id :: string)
        db:release()
        if owner_err or not owner then return owner_err end
    end
    return M.insert_turn_for_owner(db_id, route, encoded, turn_id, max_row_bytes, owner)
end

return M
