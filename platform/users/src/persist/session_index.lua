local errors = require("errors")
local eligibility = require("credential_eligibility")
-- Maps minted sessions to the account that owns them without retaining a bearer
-- credential. The SQL token store and this index share one database, so account
-- invalidation can delete both rows in a single transaction.

local sql = require("sql")
local consts = require("user_consts")
local policy_coverage = require("policy_coverage")

local M = {}

local SESSIONS = "kickside_user_sessions"
local TOKENS = "kickside_user_auth_tokens"

local function get_db()
    local db_resource = consts.get_db_resource()
    if not db_resource then
        return nil, consts.ERROR.DB_CONNECTION_FAILED .. ": database resource unavailable"
    end
    local db, err = sql.get(db_resource)
    if err then
        return nil, consts.ERROR.DB_CONNECTION_FAILED .. ": " .. tostring(err)
    end
    return db
end

-- Transactions run at the engine default isolation (READ COMMITTED on
-- PostgreSQL). Writers order on account row locks taken through lock_accounts.
local function begin(db)
    local tx, err = db:begin()
    if err or not tx then
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(err)
    end
    return tx, nil
end

local function rollback_and_release(db, tx, err)
    if tx then tx:rollback() end
    if db then db:release() end
    return nil, err
end

local function commit_and_release(db, tx)
    local _, err = tx:commit()
    if err then
        tx:rollback()
        db:release()
        return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(err)
    end
    db:release()
    return true, nil
end

-- Account ids per lock statement; bounds the bound-parameter count.
local LOCK_BATCH = 500

-- lock_accounts locks the existing account rows among user_ids in ascending
-- byte order of user_id and returns them with their status and generation.
-- Every writer that changes an account's sessions or memberships takes its
-- account locks here first, so concurrent writers queue on one lock order: a
-- writer that waits observes the committed account afterwards, and a deleted
-- account is absent from the result. Batches follow the same order, and
-- PostgreSQL sorts with the "C" collation so it matches the byte order of the
-- batch split. FOR NO KEY UPDATE is the lock a generation bump takes; it leaves
-- foreign-key inserts that reference the account unblocked. SQLite runs every
-- transaction on its single connection, which already orders them.
function M.lock_accounts(tx, user_ids)
    if not tx then return nil, consts.ERROR.DB_CONNECTION_FAILED end
    local ids, seen = {}, {}
    for _, id in ipairs(user_ids or {}) do
        if type(id) ~= "string" or id == "" then return nil, consts.ERROR.INVALID_FIELD_VALUE .. "user_id" end
        if not seen[id] then
            seen[id] = true
            ids[#ids + 1] = id
        end
    end
    table.sort(ids)
    local dialect, dialect_err = tx:db_type()
    if dialect_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(dialect_err) end
    local postgres = dialect == sql.type.POSTGRES
    local locked = {}
    for first = 1, #ids, LOCK_BATCH do
        local batch, marks = {}, {}
        for i = first, math.min(first + LOCK_BATCH - 1, #ids) do
            batch[#batch + 1] = ids[i]
            marks[#marks + 1] = "?"
        end
        local query = sql.builder.select("user_id", "status", "auth_generation")
            :from("app_users")
            :where("user_id IN (" .. table.concat(marks, ",") .. ")", unpack(batch))
            :order_by(postgres and 'user_id COLLATE "C"' or "user_id")
        if postgres then query = query:suffix("FOR NO KEY UPDATE") end
        local rows, err = query:run_with(tx):query()
        if err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(err) end
        for _, row in ipairs(rows or {}) do locked[#locked + 1] = row end
    end
    return locked, nil
end

-- Runtime token stores look up the unsigned base token as registry.ParseID(base).
-- A name-only registry ID serializes as ':' .. base, which is consequently the
-- SQL store's token_key. This intentionally stores neither signature nor bearer.
function M.token_key(token)
    if type(token) ~= "string" or token == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "token"
    end
    local base = token:match("^([^.]+)")
    if not base or base == "" then
        return nil, consts.ERROR.INVALID_FIELD_VALUE .. "token"
    end
    return ":" .. base, nil
end

-- record_minted atomically verifies that the account is still active and at the
-- same generation observed during authentication, then records the token-store
-- key. It holds the account lock that every invalidation takes: either
-- revocation wins and mint fails, or mint commits first and revocation deletes
-- its index and token-store rows before it returns.
function M.record_minted(token, user_id, expected_generation, expires_at)
    local token_key, key_err = M.token_key(token)
    if key_err then return nil, key_err end
    if not user_id or user_id == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id"
    end
    local expected = tonumber(expected_generation)
    if expected == nil then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "auth_generation"
    end

    local db, db_err = get_db()
    if db_err or not db then return nil, db_err end
    local tx, tx_err = begin(db)
    if tx_err then db:release(); return nil, tx_err end

    local locked, lock_err = M.lock_accounts(tx, { tostring(user_id) })
    if lock_err then return rollback_and_release(db, tx, lock_err) end
    local user = locked[1]
    if not user then
        local _, discard_err = sql.builder.delete(TOKENS):where("token_key = ?", token_key):run_with(tx):exec()
        if discard_err then return rollback_and_release(db, tx, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(discard_err)) end
        local committed, commit_err = commit_and_release(db, tx)
        if not committed then return nil, commit_err end
        return nil, consts.ERROR.USER_NOT_FOUND
    end
    local eligible, eligibility_err = eligibility.check_in(tx, tostring(user_id))
    if eligibility_err and not errors.is(eligibility_err, errors.PERMISSION_DENIED) then
        return rollback_and_release(db, tx, eligibility_err)
    end
    if not eligible or user.status ~= consts.USER_STATUS.ACTIVE or tonumber(user.auth_generation) ~= expected then
        -- The token has never been returned. Delete its exact SQL-store row in
        -- this same transaction and commit the discard, rather than rolling back
        -- and leaving an orphaned valid credential after an account mutation.
        local _, discard_err = sql.builder.delete(TOKENS):where("token_key = ?", token_key):run_with(tx):exec()
        if discard_err then
            return rollback_and_release(db, tx, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(discard_err))
        end
        local committed, commit_err = commit_and_release(db, tx)
        if not committed then return nil, commit_err end
        if not eligible then return nil, eligibility_err end
        if user.status ~= consts.USER_STATUS.ACTIVE then
            return nil, "account is not active"
        end
        return nil, consts.ERROR.SESSION_GENERATION_CHANGED
    end

    local row = { token_key = token_key, user_id = tostring(user_id), auth_generation = expected }
    if expires_at and expires_at ~= "" then row.expires_at = expires_at end
    local _, insert_err = sql.builder.insert(SESSIONS):set_map(row):run_with(tx):exec()
    if insert_err then
        return rollback_and_release(db, tx, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(insert_err))
    end
    local committed, commit_err = commit_and_release(db, tx)
    if not committed then return nil, commit_err end
    return { recorded = true, token_key = token_key, auth_generation = expected }, nil
end

-- Best-effort compensation for a token-store row created before the atomic mint
-- transaction could insert its ownership index. It is exact-key only; callers
-- must never expose the token when this reports an error.
function M.discard_minted(token)
    local token_key, key_err = M.token_key(token)
    if key_err then return nil, key_err end
    local db, db_err = get_db()
    if db_err or not db then return nil, db_err end
    local _, err = sql.builder.delete(TOKENS):where("token_key = ?", token_key):run_with(db):exec()
    db:release()
    if err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(err) end
    return { discarded = true }, nil
end

local function invalidate_delegations_in(tx, user_id)
    local _, insert_err = tx:execute("INSERT INTO app_user_delegation_epochs (user_id, generation) VALUES ($1, 0) ON CONFLICT (user_id) DO NOTHING", {user_id})
    if insert_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(insert_err) end
    local _, delegation_err = sql.builder.update("app_user_delegation_epochs")
        :set("generation", sql.builder.expr("generation + 1"))
        :where("user_id = ?", user_id):run_with(tx):exec()
    if delegation_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(delegation_err) end
    return true, nil
end

M.invalidate_delegations_in = invalidate_delegations_in

-- invalidate_user_in is deliberately usable from a caller's existing account
-- mutation transaction. Update the generation first: that write takes the
-- account lock, so concurrent mint attempts wait and then observe the new
-- generation. The matching token-store and index rows then disappear in the same
-- commit as the mutation.
function M.invalidate_user_in(tx, user_id, options)
    if not tx then return nil, consts.ERROR.DB_CONNECTION_FAILED end
    if not user_id or user_id == "" then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id"
    end

    local bumped, bump_err = sql.builder.update("app_users")
        :set("auth_generation", sql.builder.expr("auth_generation + 1"))
        :where("user_id = ?", user_id)
        :run_with(tx):exec()
    if bump_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(bump_err) end
    if not bumped or bumped.rows_affected == 0 then return nil, consts.ERROR.USER_NOT_FOUND end

    if options and options.revoke_delegations == true then
        local invalidated, delegation_err = invalidate_delegations_in(tx, user_id)
        if not invalidated then return nil, delegation_err end
    end

    -- Select under the user-row lock and delete through the builder so placeholder
    -- binding remains correct on both SQLite (`?`) and PostgreSQL (`$1`). A mint
    -- cannot add another row for this user until this transaction commits.
    local owned, owned_err = sql.builder.select("token_key")
        :from(SESSIONS)
        :where("user_id = ?", user_id)
        :run_with(tx):query()
    if owned_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(owned_err) end
    local revoked = 0
    for _, row in ipairs(owned or {}) do
        local removed, token_err = sql.builder.delete(TOKENS)
            :where("token_key = ?", row.token_key)
            :run_with(tx):exec()
        if token_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(token_err) end
        revoked = revoked + ((removed and removed.rows_affected) or 0)
    end
    local removed_sessions, session_err = sql.builder.delete(SESSIONS)
        :where("user_id = ?", user_id)
        :run_with(tx):exec()
    if session_err then return nil, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(session_err) end
    return {
        revoked = revoked,
        sessions_removed = (removed_sessions and removed_sessions.rows_affected) or 0,
    }, nil
end

function M.invalidate_user(user_id)
    local db, db_err = get_db()
    if db_err or not db then return nil, db_err end
    local tx, tx_err = begin(db)
    if tx_err then db:release(); return nil, tx_err end
    local result, revoke_err = M.invalidate_user_in(tx, user_id)
    if revoke_err then return rollback_and_release(db, tx, revoke_err) end
    local committed, commit_err = commit_and_release(db, tx)
    if not committed then return nil, commit_err end
    return result, nil
end

-- Explicit session invalidation keeps its existing allow-only contract. Custom
-- scope writes use fence_groups directly and always advance authority epochs.
local function authority_unchanged(tx, user_id, changed, options)
    local memberships, read_err = sql.builder.select("group_id"):from("app_user_groups")
        :where("user_id = ?", user_id):run_with(tx):query()
    if read_err then return nil, read_err end
    local before, after, previous = {}, {}, {}
    local history = type(options.previous_group_rules) == "table" and options.previous_group_rules or {}
    for _, membership in ipairs(memberships or {}) do
        local group = membership.group_id
        before[#before + 1] = group
        if options.fence_delegations then
            after[#after + 1] = group
            if changed[group] then previous[group] = type(history[group]) == "table" and history[group] or false end
        elseif not changed[group] then after[#after + 1] = group end
    end
    local change, change_err = policy_coverage.member_change(before, after, previous)
    if change_err then return nil, change_err end
    return not change.reduced, nil
end

local function group_filter(group_ids)
    if type(group_ids) ~= "table" or #group_ids == 0 then
        return nil, consts.ERROR.MISSING_REQUIRED_FIELD .. "group_ids"
    end
    local ids, marks, seen = {}, {}, {}
    for _, id in ipairs(group_ids) do
        if type(id) ~= "string" or id == "" then return nil, consts.ERROR.INVALID_FIELD_VALUE .. "group_id" end
        if not seen[id] then
            seen[id] = true
            ids[#ids + 1] = id
            marks[#marks + 1] = "?"
        end
    end
    return {ids = ids, marks = marks, seen = seen}, nil
end

-- Locks the accounts that are members of the filtered groups. An account deleted
-- while this transaction waits for its lock is absent: it has no sessions left.
local function lock_members(tx, filter)
    local members, read_err = sql.builder.select("DISTINCT user_id"):from("app_user_groups")
        :where("group_id IN (" .. table.concat(filter.marks, ",") .. ")", unpack(filter.ids))
        :run_with(tx):query()
    if read_err then return nil, tostring(read_err) end
    local ids = {}
    for _, member in ipairs(members or {}) do ids[#ids + 1] = member.user_id end
    return M.lock_accounts(tx, ids)
end

local function mutate_groups(group_ids, options, mutation)
    local filter, filter_err = group_filter(group_ids)
    if filter_err then return nil, filter_err end
    local db, db_err = get_db()
    if db_err or not db then return nil, db_err end
    local tx, tx_err = begin(db)
    if tx_err then db:release(); return nil, tx_err end
    local users, lock_err = lock_members(tx, filter)
    if lock_err then return rollback_and_release(db, tx, lock_err) end
    local revoked, invalidated = 0, 0
    for _, user in ipairs(users) do
        local unchanged, unchanged_err = false, nil
        if options and options.check_coverage == true then
            unchanged, unchanged_err = authority_unchanged(tx, user.user_id, filter.seen, options)
        end
        if unchanged_err then return rollback_and_release(db, tx, unchanged_err) end
        if not unchanged then
            local result, mutation_err = mutation(tx, user.user_id)
            if mutation_err then return rollback_and_release(db, tx, mutation_err) end
            if not result or result.revoked == nil then
                return rollback_and_release(db, tx, consts.ERROR.DB_OPERATION_FAILED .. ": missing group mutation result")
            end
            revoked = revoked + result.revoked
            invalidated = invalidated + 1
        end
    end
    local committed, commit_err = commit_and_release(db, tx)
    if not committed then return nil, commit_err end
    return { users_invalidated = invalidated, revoked = revoked }, nil
end

function M.invalidate_groups(group_ids, options)
    if options and options.preserve_sessions == true then return M.fence_groups(group_ids, options) end
    return mutate_groups(group_ids, {check_coverage = options and options.allow_only == true,
        previous_group_rules = options and options.previous_group_rules}, function(tx, user_id)
        return M.invalidate_user_in(tx, user_id, {revoke_delegations = true})
    end)
end

function M.fence_groups(group_ids, options)
    return mutate_groups(group_ids, {check_coverage = options and options.previous_group_rules ~= nil,
        fence_delegations = true, previous_group_rules = options and options.previous_group_rules}, function(tx, user_id)
        local fenced, err = invalidate_delegations_in(tx, user_id)
        if not fenced then return nil, err end
        return {revoked = 0}, nil
    end)
end

-- invalidate_token deletes precisely one SQL token-store key and its matching
-- index row. It is the single-session logout primitive and is safe to retry.
function M.invalidate_token(token)
    local token_key, key_err = M.token_key(token)
    if key_err then return nil, key_err end
    local db, db_err = get_db()
    if db_err or not db then return nil, db_err end
    local tx, tx_err = begin(db)
    if tx_err then db:release(); return nil, tx_err end

    local owners, owner_err = sql.builder.select("user_id")
        :from(SESSIONS)
        :where("token_key = ?", token_key)
        :limit(1)
        :run_with(tx):query()
    if owner_err then
        return rollback_and_release(db, tx, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(owner_err))
    end
    local removed_token, token_err = sql.builder.delete(TOKENS):where("token_key = ?", token_key):run_with(tx):exec()
    if token_err then return rollback_and_release(db, tx, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(token_err)) end
    local _, session_err = sql.builder.delete(SESSIONS):where("token_key = ?", token_key):run_with(tx):exec()
    if session_err then return rollback_and_release(db, tx, consts.ERROR.DB_OPERATION_FAILED .. ": " .. tostring(session_err)) end
    local committed, commit_err = commit_and_release(db, tx)
    if not committed then return nil, commit_err end
    return {
        -- PostgreSQL enforces the token_key ON DELETE CASCADE before the explicit
        -- defensive session delete below, while SQLite test configurations may
        -- leave foreign keys disabled. Report the authoritative token-row delete
        -- so both dialects return the same revocation count.
        revoked = (removed_token and removed_token.rows_affected) or 0,
        user_id = owners and owners[1] and owners[1].user_id or nil,
    }, nil
end

return M
