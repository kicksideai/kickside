local sql = require("sql")
local row_size = require("row_size")
local uuid = require("uuid")
local time = require("time")
local json = require("json")
local crypto = require("crypto")
local hash = require("hash")
local session_acquire = require("session_acquire")
local conversation_gc = require("conversation_gc")
local conversation = require("channel_conversation")
local policy = require("channel_retention_policy")

-- Session mappings, admissions and accepted turns share this owner store.
local M = {}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function now(): string
    return time.now():utc():format_rfc3339()
end

local function open_db(db_id: string): (sql.DB?, string?)
    if trim(db_id) == "" then return nil, "db_id is required" end
    local db, err = sql.get(db_id)
    if err or not db then return nil, "session db unavailable: " .. tostring(err) end
    return db :: sql.DB, nil
end

-- A nil session id means the conversation has no mapping yet.
function M.get(db_id: string, table_name: string, provider: string, external_id: string): (string?, string?)
    provider = trim(provider)
    external_id = trim(external_id)
    if provider == "" then return nil, "provider is required" end
    if external_id == "" then return nil, "external_id is required" end

    local db, db_err = open_db(db_id)
    if not db then return nil, db_err end
    local rows, qerr = db:query(
        "SELECT session_id FROM " .. table_name .. " WHERE provider = $1 AND external_id = $2 LIMIT 1",
        { provider, external_id })
    db:release()
    if qerr then return nil, tostring(qerr) end
    if not rows or not rows[1] then return nil, nil end
    local session_id = trim(rows[1].session_id)
    if session_id == "" then return nil, nil end
    return session_id, nil
end

-- Acquire a mapping, rotating an idle one before routing the next turn. A
-- supplied admission commits with every session id the acquisition publishes.
function M.get_or_create(db_id: string, table_name: string, provider: string, external_id: string,
    max_idle_seconds: integer?, admission: any?): (string?, boolean, any?)
    provider = trim(provider)
    external_id = trim(external_id)
    if provider == "" then return nil, false, "provider is required" end
    if external_id == "" then return nil, false, "external_id is required" end
    local session_id, created, acquire_err = session_acquire.get_or_create(
        db_id, table_name, provider, external_id, max_idle_seconds, admission, M.rotate_with_archive)
    return session_id, created, acquire_err
end

-- set(...) -> err?. Pins a specific session id for the mapping.
function M.set(db_id: string, table_name: string, provider: string, external_id: string, session_id: string): any?
    provider = trim(provider)
    external_id = trim(external_id)
    session_id = trim(session_id)
    if provider == "" then return "provider is required" end
    if external_id == "" then return "external_id is required" end
    if session_id == "" then return "session_id is required" end
    return session_acquire.set(db_id, table_name, provider, external_id, session_id)
end

-- Drop an owner-teardown mapping; absent mappings are already removed.
function M.remove(db_id: string, table_name: string, provider: string, external_id: string): string?
    provider = trim(provider)
    external_id = trim(external_id)
    if provider == "" then return "provider is required" end
    if external_id == "" then return "external_id is required" end
    local db, db_err = open_db(db_id)
    if not db then return db_err end
    local _, xerr = db:execute(
        "DELETE FROM " .. table_name .. " WHERE provider = $1 AND external_id = $2",
        { provider, external_id })
    db:release()
    if xerr then return "session delete failed: " .. tostring(xerr) end
    return nil
end

-- Backing sessions are deleted before their SQL owner pointers.
local function owner_error(message: string, kind: string, cause: any?): error
    return (errors.new({ message = message .. (cause and ": " .. tostring(cause) or ""),
        kind = kind, retryable = kind ~= errors.INVALID }) :: error)
end

function M._conversation_sessions_on_db(db: any, provider: string, external_id: string): ({ string }?, error?)
    local rows, read_err = db:query([[SELECT session_id FROM kickside_channel_sessions
        WHERE provider=$1 AND external_id=$2 UNION SELECT old_session_id AS session_id
        FROM kickside_channel_session_archives WHERE provider=$1 AND external_id=$2
        UNION SELECT session_id FROM kickside_channel_admissions
        WHERE provider=$1 AND external_id=$2
        UNION SELECT session_id FROM kickside_channel_session_owner
        WHERE provider=$1 AND external_id=$2 ORDER BY session_id LIMIT $3]],
        { provider, external_id, 100 })
    if read_err then return nil, owner_error("conversation session read failed", errors.INTERNAL, read_err) end
    if type(rows) ~= "table" then
        return nil, owner_error("conversation session read returned no result", errors.INTERNAL)
    end
    local ids: { string } = {}
    for _, row in ipairs(rows :: { any }) do ids[#ids + 1] = tostring(row.session_id) end
    return ids, nil
end

function M.conversation_sessions(db_id: string, provider: string, external_id: string): ({ string }?, error?)
    provider, external_id = trim(provider), trim(external_id)
    if provider == "" or external_id == "" then return nil, owner_error("conversation key is required", errors.INVALID) end
    local db, db_err = open_db(db_id)
    if not db then return nil, owner_error("conversation database unavailable", errors.UNAVAILABLE, db_err) end
    local ids, read_err = M._conversation_sessions_on_db(db, provider, external_id)
    db:release()
    return ids, read_err
end

-- Delete the mapping and its accepted turns with a structured uncertainty report.
function M.remove_conversation(db_id: string, provider: string, external_id: string,
    proven_sessions: { string }, retain_counts: boolean?): (any?, error?)
    provider, external_id = trim(provider), trim(external_id)
    if provider == "" or external_id == "" then return nil, owner_error("conversation key is required", errors.INVALID) end
    local db, db_err = open_db(db_id)
    if not db then return nil, owner_error("conversation database unavailable", errors.UNAVAILABLE, db_err) end
    local outcome, remove_err = conversation_gc.remove_on_db(db, provider, external_id, proven_sessions,
        retain_counts)
    db:release()
    return outcome, remove_err
end

-- Clear rotates the mapping to a fresh, charged session identity. A supplied
-- admission commits with it.
function M.clear(db_id: string, table_name: string, provider: string, external_id: string,
    admission: any?): (string?, any?)
    provider = trim(provider)
    external_id = trim(external_id)
    if provider == "" then return nil, "provider is required" end
    if external_id == "" then return nil, "external_id is required" end
    local session_id = uuid.v7()
    local serr = session_acquire.set(db_id, table_name, provider, external_id, session_id, admission)
    if serr then return nil, serr end
    return session_id, nil
end

-- Rotation preserves the old identity and reserves the new one before CAS. A
-- supplied admission commits with the new session id.
function M.rotate_with_archive(db_id: string, table_name: string, provider: string,
    external_id: string, old_session_id: string, reason: string, admission: any?): (string?, any?)
    provider, external_id, old_session_id, reason = trim(provider), trim(external_id), trim(old_session_id), trim(reason)
    if provider == "" or external_id == "" or old_session_id == "" or reason == "" then
        return nil, "session rotation reference is invalid"
    end
    local settings, policy_err = policy.policy()
    if policy_err or not settings then return nil, policy_err end
    local next_id = uuid.v7()
    local admission_row: any? = nil
    if admission ~= nil then
        local row_err: string?
        admission_row, row_err = session_acquire.admission_row(next_id, provider, external_id, admission)
        if row_err then return nil, row_err end
    end
    local db, db_err = open_db(db_id)
    if not db then return nil, db_err end
    local dbtype, type_err = db:type()
    if type_err then db:release(); return nil, type_err end
    local tx, tx_err = db:begin()
    if tx_err or not tx then db:release(); return nil, "session rotation begin failed: " .. tostring(tx_err) end
    local _, lock_err = conversation.lock_tx(tx, dbtype, provider, external_id)
    if lock_err then tx:rollback(); db:release(); return nil, lock_err end
    local size_err = row_size.check(provider .. ":" .. external_id,
        #old_session_id + #next_id + #provider + #external_id + #reason + #now(),
        settings.max_row_bytes, "archive_row")
    if size_err then
        tx:rollback()
        db:release()
        return nil, size_err
    end
    local admission_size_err = session_acquire.check_admission(provider, external_id,
        admission_row, settings.max_row_bytes)
    if admission_size_err then
        tx:rollback()
        db:release()
        return nil, admission_size_err
    end
    local _, reserve_err = conversation.claim_session_tx(tx, dbtype, provider, external_id, next_id)
    if reserve_err then
        tx:rollback()
        db:release()
        return nil, reserve_err
    end
    local result, update_err = tx:execute(
        "UPDATE " .. table_name .. " SET session_id = $1, updated_at = $2"
        .. " WHERE provider = $3 AND external_id = $4 AND session_id = $5",
        { next_id, now(), provider, external_id, old_session_id })
    if update_err or not result or tonumber(result.rows_affected) ~= 1 then
        tx:rollback(); db:release()
        return nil, "session rotation mapping changed: " .. tostring(update_err)
    end
    local _, archive_err = tx:execute(
        "INSERT INTO kickside_channel_session_archives"
        .. " (old_session_id, new_session_id, provider, external_id, reason, rotated_at)"
        .. " VALUES ($1, $2, $3, $4, $5, $6)",
        { old_session_id, next_id, provider, external_id, reason, now() })
    if archive_err then
        tx:rollback(); db:release()
        return nil, "session archive write failed: " .. tostring(archive_err)
    end
    local admit_err = session_acquire.insert_admission_tx(tx, admission_row)
    if admit_err then tx:rollback(); db:release(); return nil, admit_err end
    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback(); db:release()
        return nil, "session rotation commit failed: " .. tostring(commit_err)
    end
    db:release()
    return next_id, nil
end

-- Protected admission is keyed by the immutable session id. A relink creates a
-- new session; old admissions remain attached to their archived history.
function M.get_admission(db_id: string, session_id: string): (any?, string?)
    if trim(session_id) == "" then return nil, "session_id is required" end
    local db, db_err = open_db(db_id)
    if not db then return nil, db_err end
    local rows, read_err = db:query(
        "SELECT provider, external_id, owner_id, record_id, link_id, identity_json, generation"
        .. " FROM kickside_channel_admissions WHERE session_id = $1",
        { session_id })
    db:release()
    if read_err then return nil, "admission read failed: " .. tostring(read_err) end
    if not rows or not rows[1] then return nil, nil end
    local identity, decode_err = json.decode(rows[1].identity_json :: string)
    if decode_err or type(identity) ~= "table" then return nil, "stored admission is invalid" end
    return { provider = rows[1].provider, external_id = rows[1].external_id,
        owner_id = rows[1].owner_id, record_id = rows[1].record_id,
        link_id = rows[1].link_id, identity = identity,
        generation = tonumber(rows[1].generation) }, nil
end

-- The hub reloads each immutable accepted turn by its locator.
function M.accept_turn(db_id: string, route: any, principal: any, turn_id: string): (string?, any?, any?)
    if type(route) ~= "table" or type(route.execution_ref) ~= "table" then
        return nil, "accepted route is invalid"
    end
    if trim(turn_id) == "" then return nil, "accepted turn id is required" end
    if trim(route.session_provider) == "" then return nil, "reply provider is required" end
    local inbound = route.inbound
    local reply = route.reply
    if type(inbound) ~= "table" or type(reply) ~= "table"
        or trim(inbound.external_message_id) == ""
        or trim(reply.component_id) == "" or trim(reply.resource_id) == ""
        or type(principal) ~= "table" or trim(principal.kind) == ""
        or trim(principal.id) == "" then
        return nil, "reply admission is incomplete"
    end
    local seal, seal_err = crypto.random.string(64, "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
    if seal_err or not seal then return nil, "reply proof entropy unavailable: " .. tostring(seal_err) end
    route.reply_proof = {
        turn_id = turn_id,
        seal = seal,
        provider = route.session_provider,
        connection_id = reply.component_id,
        external_conversation_id = reply.resource_id,
        inbound_message_id = inbound.external_message_id,
        reply_op = "send_reply",
        principal = { kind = principal.kind, id = principal.id },
        expires_at = time.now():utc():add(24 * 60 * 60 * time.SECOND):format(time.RFC3339),
    }
    local encoded, encode_err = json.encode(route)
    if encode_err or not encoded then return nil, "route encode failed: " .. tostring(encode_err) end
    local settings, policy_err = policy.policy()
    if policy_err or not settings then return nil, policy_err end
    local write_err = conversation.insert_turn(db_id, route, encoded, turn_id, settings.max_row_bytes)
    if write_err then return nil, write_err end
    return turn_id, nil, route.reply_proof
end

function M.get_accepted(db_id: string, turn_id: string): (any?, string?)
    if trim(turn_id) == "" then return nil, "turn_id is required" end
    local db, db_err = open_db(db_id)
    if not db then return nil, db_err end
    local rows, read_err = db:query(
        "SELECT route_json FROM kickside_channel_turns WHERE turn_id = $1", { turn_id })
    db:release()
    if read_err then return nil, "accepted turn read failed: " .. tostring(read_err) end
    if not rows or not rows[1] then return nil, nil end
    local route, decode_err = json.decode(rows[1].route_json :: string)
    if decode_err or type(route) ~= "table" then return nil, "stored accepted turn is invalid" end
    return route, nil
end

local function same_proof(stored: any, presented: any, target: any): boolean
    if type(stored) ~= "table" or type(presented) ~= "table" or type(target) ~= "table"
        or type(stored.principal) ~= "table" or type(presented.principal) ~= "table"
        or type(target.principal) ~= "table" or type(stored.seal) ~= "string"
        or type(presented.seal) ~= "string" or #stored.seal ~= 64 then return false end
    if not crypto.constant_time_compare(stored.seal, presented.seal) then return false end
    for _, key in ipairs({ "turn_id", "provider", "connection_id", "external_conversation_id",
        "inbound_message_id", "reply_op", "expires_at" }) do
        if stored[key] ~= presented[key] then return false end
    end
    if stored.principal.kind ~= presented.principal.kind or stored.principal.id ~= presented.principal.id then
        return false
    end
    for _, key in ipairs({ "provider", "connection_id", "external_conversation_id",
        "inbound_message_id", "reply_op" }) do
        if stored[key] ~= target[key] then return false end
    end
    return stored.principal.kind == target.principal.kind and stored.principal.id == target.principal.id
end

function M.matches_reply_proof(route: any, proof: any, target: any): boolean
    return type(route) == "table" and type(route.reply) == "table"
        and type(route.inbound) == "table"
        and same_proof(route.reply_proof, proof, target)
        and route.reply_proof.turn_id == proof.turn_id
        and route.session_provider == proof.provider
        and route.reply.component_id == proof.connection_id
        and route.reply.resource_id == proof.external_conversation_id
        and route.inbound.external_message_id == proof.inbound_message_id
end

-- verify_reply(db_id, proof, target) -> (ok, err?, kind?): the proof matches its
-- admitted turn and target, and is unexpired unless the turn already retains
-- its reply outcome (a receipt replay). Nothing is reserved.
function M.verify_reply(db_id: string, proof: any, target: any): (boolean, string?, string?)
    if type(proof) ~= "table" or trim(proof.turn_id) == "" then return false, "invalid reply proof", "access" end
    local db, db_err = open_db(db_id)
    if not db then return false, db_err, "infrastructure" end
    local rows, read_err = db:query(
        "SELECT route_json, reply_state, reply_message_ref FROM kickside_channel_turns WHERE turn_id = $1",
        { proof.turn_id })
    db:release()
    if read_err then return false, "reply admission read failed: " .. tostring(read_err), "infrastructure" end
    local row = rows and rows[1]
    local route: any = nil
    if row then
        local decoded, decode_err = json.decode(row.route_json :: string)
        if decode_err then return false, "stored accepted turn is invalid", "infrastructure" end
        route = decoded
    end
    if not M.matches_reply_proof(route, proof, target) then
        return false, "reply proof does not match the admitted turn", "access"
    end
    if row.reply_state == "sent" and trim(row.reply_message_ref) ~= "" then return true, nil, nil end
    if type(proof.expires_at) ~= "string" then return false, "reply proof expiry is invalid", "access" end
    local expires, expires_err = time.parse(time.RFC3339, proof.expires_at :: string)
    if expires_err or not expires or expires:unix() <= time.now():unix() then
        return false, "reply proof expired", "access"
    end
    return true, nil, nil
end

-- Reserve the one remote send before any bot token is opened. A reserved row is
-- uncertain until a provider receipt is stored; it is never resent automatically.
function M.reserve_reply(db_id: string, proof: any, target: any, content: string): (any?, string?, string?)
    if type(proof) ~= "table" or trim(proof.turn_id) == "" or type(content) ~= "string" then
        return nil, "invalid reply proof", "access"
    end
    local digest, digest_err = hash.sha256(content)
    if digest_err or not digest then return nil, "reply digest unavailable: " .. tostring(digest_err), "infrastructure" end
    local db, db_err = open_db(db_id)
    if not db then return nil, db_err, "infrastructure" end
    local rows, read_err = db:query(
        "SELECT route_json, reply_state, reply_hash, reply_message_ref FROM kickside_channel_turns WHERE turn_id = $1",
        { proof.turn_id })
    if read_err then db:release(); return nil, "reply admission read failed: " .. tostring(read_err), "infrastructure" end
    local row = rows and rows[1]
    local route = nil
    if row then
        route, read_err = json.decode(row.route_json :: string)
    end
    if read_err then db:release(); return nil, "stored accepted turn is invalid", "infrastructure" end
    if not M.matches_reply_proof(route, proof, target) then
        db:release()
        return nil, "reply proof does not match the admitted turn", "access"
    end
    if row.reply_state ~= nil then
        db:release()
        if row.reply_hash ~= digest then return nil, "reply payload conflicts with retained receipt", "access" end
        if row.reply_state == "sent" and trim(row.reply_message_ref :: string) ~= "" then
            return { send = false, message_ref = row.reply_message_ref }, nil
        end
        return { send = false, uncertain = true }, nil
    end
    if type(proof.expires_at) ~= "string" then db:release(); return nil, "reply proof expiry is invalid", "access" end
    local expires, expires_err = time.parse(time.RFC3339, proof.expires_at :: string)
    if expires_err or not expires or expires:unix() <= time.now():unix() then
        db:release()
        return nil, "reply proof expired", "access"
    end
    local result, reserve_err = conversation.update_turn(db, proof.turn_id,
        "UPDATE kickside_channel_turns SET reply_state = 'reserved', reply_hash = $1"
        .. " WHERE turn_id = $2 AND reply_state IS NULL", { digest, proof.turn_id })
    db:release()
    if reserve_err then return nil, "reply reservation failed: " .. tostring(reserve_err), "infrastructure" end
    if tonumber(result and result.rows_affected) ~= 1 then
        return { send = false, uncertain = true }, nil
    end
    return { send = true }, nil
end

function M.complete_reply(db_id: string, proof: any, content: string, message_ref: string): (boolean, string?, string?)
    if type(proof) ~= "table" or trim(proof.turn_id) == "" or trim(message_ref) == ""
        or type(content) ~= "string" then return false, "reply receipt is invalid", "access" end
    local digest, digest_err = hash.sha256(content)
    if digest_err or not digest then return false, "reply digest unavailable: " .. tostring(digest_err), "infrastructure" end
    local db, db_err = open_db(db_id)
    if not db then return false, db_err, "infrastructure" end
    local rows, read_err = db:query("SELECT route_json FROM kickside_channel_turns WHERE turn_id = $1",
        { proof.turn_id })
    if read_err then db:release(); return false, "reply admission read failed: " .. tostring(read_err), "infrastructure" end
    local route = nil
    if rows and rows[1] then route, read_err = json.decode(rows[1].route_json :: string) end
    if read_err then db:release(); return false, "stored accepted turn is invalid", "infrastructure" end
    if type(route) ~= "table" or not same_proof(route.reply_proof, proof, proof) then
        db:release()
        return false, "reply proof does not match the admitted turn", "access"
    end
    local result, write_err = conversation.update_turn(db, proof.turn_id,
        "UPDATE kickside_channel_turns SET reply_state = 'sent', reply_message_ref = $1"
        .. " WHERE turn_id = $2 AND reply_state = 'reserved' AND reply_hash = $3",
        { message_ref, proof.turn_id, digest })
    db:release()
    if write_err then return false, "reply receipt write failed: " .. tostring(write_err), "infrastructure" end
    return tonumber(result and result.rows_affected) == 1, nil
end

return M
