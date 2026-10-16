local sql = require("sql")
local crypto = require("crypto")
local uuid = require("uuid")
local time = require("time")
local component = require("component")
local channel_cleanup = require("channel_cleanup")
local channel_cleanup_finalize = require("channel_cleanup_finalize")
local consts = require("identity_consts")
local agent_ref = require("agent_ref")
local credential_eligibility = require("credential_eligibility")

-- Provider-neutral external-identity linking. A KickSide user generates a code in
-- the dashboard; the user proves ownership of an external account (e.g. by DMing
-- the bot "link <code>") which links provider:external_id -> user_id. Any bot
-- then resolves an inbound external sender to its KickSide user. Codes are short,
-- single-use, time-boxed, and capped per user; an external account links to at
-- most one user.
local function construct(dependencies: any): any
local selected_cleanup = dependencies.channel_cleanup or channel_cleanup
local selected_finalize = dependencies.channel_cleanup_finalize or channel_cleanup_finalize
local M = {}

type ExecResult = { rows_affected: number? }
type LinkError = string | error
type ExternalLink = { link_id: string, user_id: string, default_agent_id: string }

local function affected(result): integer
    if type(result) ~= "table" then return 0 end
    return math.floor(tonumber((result :: ExecResult).rows_affected) or 0)
end

local function unlink_error(message: string, kind: string, cause: any?, discarded: any?): error
    return (errors.new({ message = message .. (cause and ": " .. tostring(cause) or ""),
        kind = kind, retryable = kind ~= errors.INVALID,
        details = discarded and { discarded = discarded } or nil }) :: error)
end

local function now_epoch(): number
    return tonumber(os.time()) or 0
end

-- Wall-clock timestamps (created_at) are stored as canonical RFC3339 UTC strings,
-- byte-identical across SQLite and PostgreSQL and lexicographically sortable.
-- expires_at stays a unix epoch integer: it is TTL math, not a wall-clock value.
local function now_rfc3339(): string
    return time.now():utc():format_rfc3339()
end

local function open_db(): (sql.DB?, string?)
    local db, err = sql.get(consts.db_id())
    if err or not db then return nil, "database unavailable: " .. tostring(err) end
    return db :: sql.DB, nil
end

local function random_code(): string
    local parts: { string } = {}
    for i = 1, consts.CODE_LENGTH do
        local bytes = crypto.random.bytes(1)
        local idx = (string.byte(bytes, 1) % #consts.CODE_CHARS) + 1
        parts[i] = consts.CODE_CHARS:sub(idx, idx)
    end
    return table.concat(parts)
end

-- The bare component id of an agent reference, stripping the redirect-style
-- `user_agent:` prefix the DM path also accepts.
local function bare_agent_id(agent_id: string): string
    if agent_ref.is_user(agent_id) then
        return agent_ref.user_component_id(agent_id) or ""
    end
    return agent_id
end

-- A starting agent is allowed when it is the redirect-only greeter or one of the
-- user's accessible user_agents -- the same access seam the DM redirect enforces,
-- so a link can never pin a toolset the user is not entitled to.
local function user_can_access_agent(user_id: string, agent_id: string): boolean
    if agent_id == consts.GREETER_AGENT_ID then return true end
    local target = bare_agent_id(agent_id)
    local comps = component.list_for_subject(user_id, { impl_ids = { consts.USER_AGENT_IMPL }, meta = false })
    if not comps then return false end
    for _, c in ipairs(comps :: any) do
        if tostring((c :: any).component_id) == target then return true end
    end
    return false
end

-- generate_code(user_id, agent_id?) -> (code, nil) | (nil, err). Issues a fresh
-- code for the user, after pruning expired/used codes and enforcing the
-- active-code cap. An optional agent_id pins the DM's starting agent; it is
-- validated against the user's accessible agents (or the greeter) and stored on
-- the code so verify_and_link carries it onto the link. Omitted -> the DM falls
-- back to the greeter.
function M.generate_code(user_id: string, agent_id: string?): (string?, LinkError?)
    if type(user_id) ~= "string" or user_id == "" then return nil, "user_id is required" end

    local eligible, eligibility_err = credential_eligibility.check(user_id)
    if not eligible then return nil, eligibility_err end

    local chosen_agent = type(agent_id) == "string" and (agent_id :: string):gsub("^%s*(.-)%s*$", "%1") or ""
    if chosen_agent ~= "" and not user_can_access_agent(user_id, chosen_agent) then
        return nil, "agent is not accessible to this user"
    end

    local db, db_err = open_db()
    if not db then return nil, db_err end

    local now = now_epoch()
    db:execute("DELETE FROM kickside_link_codes WHERE expires_at < $1 OR used = 1", { now })

    local rows = db:query(
        "SELECT COUNT(*) as cnt FROM kickside_link_codes WHERE user_id = $1 AND expires_at >= $2 AND used = 0",
        { user_id, now })
    if rows and rows[1] and (tonumber(rows[1].cnt) or 0) >= consts.MAX_ACTIVE_CODES then
        db:release()
        return nil, "too many active link codes; wait for an existing code to expire"
    end

    local code = random_code()
    local _, ins_err = db:execute(
        "INSERT INTO kickside_link_codes (code, user_id, agent_id, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)",
        { code, user_id, chosen_agent, now + consts.CODE_TTL_SECONDS, now_rfc3339() })
    db:release()
    if ins_err then return nil, "failed to create link code: " .. tostring(ins_err) end
    return code, nil
end

-- verify_and_link(code, provider, external_id, display_name?) ->
-- (user_id, nil) | (nil, err). Atomically claims the code (single-use) and links
-- the external account to the code's owner, carrying the code's pinned starting
-- agent onto the link, and rejecting a takeover of an account already linked to a
-- different user.
function M.verify_and_link(code: string, provider: string, external_id: string, display_name: string?): (string?, LinkError?)
    if type(code) ~= "string" or code == "" then return nil, "code is required" end
    if type(provider) ~= "string" or provider == "" then return nil, "provider is required" end
    if type(external_id) ~= "string" or external_id == "" then return nil, "external_id is required" end
    local db, db_err = open_db()
    if not db then return nil, db_err end

    local code_upper = code:upper()
    local now = now_epoch()

    local owners, owner_err = db:query(
        "SELECT user_id FROM kickside_link_codes WHERE code=$1 AND expires_at >= $2 AND used=0", {code_upper, now})
    if owner_err then db:release(); return nil, owner_err end
    if not owners or #owners == 0 then db:release(); return nil, "invalid or expired link code" end
    local owner = tostring(owners[1].user_id)
    local eligible, eligibility_err = credential_eligibility.check(owner)
    if not eligible then db:release(); return nil, eligibility_err end

    local tx, tx_err = db:begin()
    if tx_err or not tx then
        db:release()
        return nil, "failed to begin link transaction: " .. tostring(tx_err)
    end

    local claim, claim_err = tx:execute(
        "UPDATE kickside_link_codes SET used = 1 WHERE code = $1 AND expires_at >= $2 AND used = 0 AND user_id = $3",
        { code_upper, now_epoch(), owner })
    if claim_err then
        tx:rollback()
        db:release()
        return nil, "failed to claim link code: " .. tostring(claim_err)
    end
    if affected(claim) == 0 then
        tx:rollback()
        db:release()
        return nil, "invalid or expired link code"
    end

    local rows, state_err = tx:query(
        "SELECT user_id, agent_id FROM kickside_link_codes WHERE code = $1", { code_upper })
    if state_err or not rows or #rows == 0 then
        tx:rollback()
        db:release()
        return nil, "link code state lost: " .. tostring(state_err)
    end
    local user_id = tostring(rows[1].user_id)
    local default_agent_id = tostring(rows[1].agent_id or "")
    -- The conditional upsert is the ownership gate. It permits an idempotent
    -- refresh by the same user but never overwrites another user's link, even
    -- under a concurrent claim. The code claim and link write share this
    -- transaction, so every failure leaves the code available for a valid retry.
    local linked, link_err = tx:execute(
        "INSERT INTO kickside_external_links (link_id, provider, external_id, user_id, display_name, default_agent_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (provider, external_id) DO UPDATE SET display_name = excluded.display_name, default_agent_id = excluded.default_agent_id WHERE kickside_external_links.user_id = excluded.user_id",
        { uuid.v7(), provider, external_id, user_id, display_name or "", default_agent_id, now_rfc3339() })
    if link_err then
        tx:rollback()
        db:release()
        return nil, "failed to create link: " .. tostring(link_err)
    end
    if affected(linked) == 0 then
        tx:rollback()
        db:release()
        return nil, "this account is already linked to another user; unlink it first"
    end

    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback()
        db:release()
        return nil, "failed to commit link: " .. tostring(commit_err)
    end
    db:release()

    return user_id, nil
end

-- resolve(provider, external_id) -> user_id | nil. The hot path every inbound
-- message takes; nil means the external account is not linked.
function M.resolve(provider: string, external_id: string): (string?, error?)
    local link, err = M.resolve_link(provider, external_id)
    if err or not link then return nil, err end
    return link.user_id, nil
end

function M.resolve_link(provider: string, external_id: string): (ExternalLink?, error?)
    if type(provider) ~= "string" or provider == "" then return nil, nil end
    if type(external_id) ~= "string" or external_id == "" then return nil, nil end
    local db, db_err = sql.get(consts.db_id())
    if db_err or not db then
        return nil, (errors.new({message = "link database unavailable: " .. tostring(db_err),
            kind = errors.UNAVAILABLE, retryable = true, details = {error_kind = "infrastructure"}}) :: error)
    end
    local rows, read_err = db:query(
        "SELECT link_id, user_id, default_agent_id FROM kickside_external_links WHERE provider = $1 AND external_id = $2",
        {provider, external_id})
    db:release()
    if read_err then
        return nil, (errors.new({message = "link lookup failed: " .. tostring(read_err),
            kind = errors.UNAVAILABLE, retryable = true, details = {error_kind = "infrastructure"}}) :: error)
    end
    if not rows or #rows == 0 then return nil, nil end
    local eligible, eligibility_err = credential_eligibility.check(tostring(rows[1].user_id))
    if not eligible then return nil, eligibility_err end
    return {link_id = tostring(rows[1].link_id), user_id = tostring(rows[1].user_id),
        default_agent_id = tostring(rows[1].default_agent_id or "")}, nil
end

-- link_get(link_id) is the stable restriction lookup used by execution
-- identity. A deleted link never resolves to a replacement user's account.
function M.link_get(link_id: string): (any?, error?)
    if type(link_id) ~= "string" or link_id == "" then
        return nil, (errors.new({ message = "link_id is required", kind = errors.INVALID,
            details = { error_kind = "declaration" } }) :: error)
    end
    local db, db_err = sql.get(consts.db_id())
    if db_err or not db then
        return nil, (errors.new({ message = "link database unavailable: " .. tostring(db_err),
            kind = errors.UNAVAILABLE, retryable = true,
            details = { error_kind = "infrastructure" } }) :: error)
    end
    local rows, query_err = db:query(
        "SELECT link_id, provider, external_id, user_id FROM kickside_external_links WHERE link_id = $1",
        { link_id })
    db:release()
    if query_err then
        return nil, (errors.new({ message = "link lookup failed: " .. tostring(query_err),
            kind = errors.UNAVAILABLE, retryable = true,
            details = { error_kind = "infrastructure" } }) :: error)
    end
    if not rows or #rows == 0 then return nil, nil end
    local eligible, eligibility_err = credential_eligibility.check(tostring(rows[1].user_id))
    if not eligible then return nil, eligibility_err end
    return {
        link_id = tostring(rows[1].link_id),
        provider = tostring(rows[1].provider),
        external_id = tostring(rows[1].external_id),
        user_id = tostring(rows[1].user_id),
    }, nil
end

-- unlink(user_id, provider, external_id) -> (ok, err). Scoped to the owning user
-- so a caller can only remove its own link.
function M.unlink(user_id: string, provider: string, external_id: string): (boolean, any?, any?)
    if type(user_id) ~= "string" or user_id == "" then
        return false, unlink_error("user_id is required", errors.INVALID)
    end
    if type(provider) ~= "string" or provider == "" then
        return false, unlink_error("provider is required", errors.INVALID)
    end
    if type(external_id) ~= "string" or external_id == "" then
        return false, unlink_error("external_id is required", errors.INVALID)
    end
    local db, db_err = open_db()
    if not db then return false, db_err end
    local owned, owned_err = db:query(
        "SELECT user_id FROM kickside_external_links WHERE user_id = $1 AND provider = $2 AND external_id = $3",
        { user_id, provider, external_id })
    db:release()
    if owned_err or type(owned) ~= "table" then
        return false, unlink_error("link ownership read failed", errors.UNAVAILABLE, owned_err or "missing result")
    end
    local cleanup: any = nil
    if #owned > 0 then
        -- Channel settles its bounded cleanup before Identity removes the link.
        cleanup, db_err = selected_cleanup.cleanup_conversation({
            provider = provider,
            external_id = external_id,
            retain_counts = true,
        })
        if db_err then return false, db_err end
        if type(cleanup) ~= "table" then
            return false, errors.new({ message = "conversation cleanup returned no result", kind = errors.INTERNAL,
                retryable = true })
        end
        if cleanup.success ~= true then
            return false, cleanup.error or errors.new({ message = "conversation cleanup failed without an error",
                kind = errors.INTERNAL, retryable = true })
        end

        db, db_err = open_db()
        if not db then return false, unlink_error("link database unavailable after cleanup",
            errors.UNAVAILABLE, db_err, cleanup.discarded) end
        local tx, begin_err = db:begin({ isolation = sql.isolation.SERIALIZABLE })
        if begin_err or not tx then
            db:release()
            return false, unlink_error("link delete begin failed", errors.UNAVAILABLE,
                begin_err or "missing transaction", cleanup.discarded)
        end
        local result, delete_err = tx:execute(
            "DELETE FROM kickside_external_links WHERE user_id = $1 AND provider = $2 AND external_id = $3",
            { user_id, provider, external_id })
        if delete_err or not result or tonumber(result.rows_affected) ~= 1 then
            tx:rollback()
            db:release()
            return false, unlink_error("link delete failed", errors.UNAVAILABLE,
                delete_err or "missing row proof", cleanup.discarded)
        end
        local _, commit_err = tx:commit()
        db:release()
        if commit_err then
            return false, unlink_error("link delete commit failed", errors.UNAVAILABLE, commit_err,
                cleanup.discarded)
        end

        -- Channel keeps its admission fence while link_pending is set. Remove
        -- that owner state only after the Identity row is gone; on a failed
        -- finalization, an authorized retry with the now-missing link completes
        -- the same idempotent handoff below.
        local finalized, finalize_err = selected_finalize.complete_unlink({
            provider = provider, external_id = external_id,
        })
        if finalize_err then
            return false, unlink_error("conversation count finalization failed", errors.UNAVAILABLE,
                finalize_err, cleanup.discarded)
        end
        if type(finalized) ~= "table" or finalized.success ~= true then
            local cause = type(finalized) == "table" and finalized.error or "missing result"
            return false, unlink_error("conversation count finalization failed", errors.UNAVAILABLE,
                cause, cleanup.discarded)
        end
        return true, nil, finalized.discarded or cleanup.discarded
    end

    -- Missing ownership is normally an idempotent success. If this is a retry
    -- after Identity committed the delete but Channel could not finalize, let
    -- Channel finish only its already-settled unlink pointer. A different
    -- current owner means this request has no authority over that handoff.
    db, db_err = open_db()
    if not db then return false, unlink_error("link retry database unavailable", errors.UNAVAILABLE, db_err) end
    local current, current_err = db:query(
        "SELECT user_id FROM kickside_external_links WHERE provider = $1 AND external_id = $2",
        { provider, external_id })
    db:release()
    if current_err or type(current) ~= "table" then
        return false, unlink_error("link retry ownership read failed", errors.UNAVAILABLE,
            current_err or "missing result")
    end
    if #current > 0 then return true, nil, nil end

    local finalized, finalize_err = selected_finalize.complete_unlink({
        provider = provider, external_id = external_id,
    })
    if finalize_err then
        return false, unlink_error("conversation count finalization failed", errors.UNAVAILABLE, finalize_err)
    end
    if type(finalized) ~= "table" or finalized.success ~= true then
        local cause = type(finalized) == "table" and finalized.error or "missing result"
        return false, unlink_error("conversation count finalization failed", errors.UNAVAILABLE, cause)
    end
    return true, nil, finalized.discarded
end

-- cleanup_principal deletes all identity rows keyed by a deleted KickSide user.
-- The lifecycle reaper invokes it through the declared principal-cleanup hook; any
-- error aborts the reaper tick so the same lifecycle event retries.
function M.cleanup_principal(args: any): any
    local user_id = type(args) == "table" and tostring((args :: any).user_id or (args :: any).principal_id or "") or ""
    if user_id == "" then return { success = false, error = "user_id is required" } end
    local db, db_err = open_db()
    if not db then return { success = false, error = db_err } end
    local _, code_err = db:execute("DELETE FROM kickside_link_codes WHERE user_id = $1", { user_id })
    if code_err then db:release(); return { success = false, error = tostring(code_err) } end
    local _, link_err = db:execute("DELETE FROM kickside_external_links WHERE user_id = $1", { user_id })
    db:release()
    if link_err then return { success = false, error = tostring(link_err) } end
    return { success = true }
end

-- list_links(user_id) -> (rows, nil) | (nil, err). The user's linked accounts.
function M.list_links(user_id: string): ({ any }?, string?)
    if type(user_id) ~= "string" or user_id == "" then return nil, "user_id is required" end
    local db, db_err = open_db()
    if not db then return nil, db_err end
    local rows, q_err = db:query(
        "SELECT provider, external_id, display_name, created_at FROM kickside_external_links WHERE user_id = $1 ORDER BY created_at DESC",
        { user_id })
    db:release()
    if q_err then return nil, tostring(q_err) end
    return rows or {}, nil
end

M.new = construct
return M
end

return construct({})
