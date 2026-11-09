-- Persistence + lifecycle for MCP credentials. This is the trust boundary: it
-- mints a bearer token (hashed at rest, raw returned once) bound to its actor and a
-- whitelist of component subtrees, resolves an incoming token to a principal that
-- runs AS the actor with the whitelist resolved to path prefixes (the central
-- access gate confines it -- reject-only, never widening the actor's access), and
-- revokes (a pure status flip; the credential holds no grants of its own). The
-- dispatcher is the only reader of resolve_token; the management API drives
-- mint/revoke/list.

local sql = require("sql")
local hash = require("hash")
local crypto = require("crypto")
local uuid = require("uuid")
local time = require("time")
local json = require("json")
local security = require("security")
local component = require("component")
local consts = require("mcp_consts")
local mcp_types = require("mcp_types")
local execution_identity = require("execution_identity")
local credential_quota = require("credential_quota")
local credential_policy = require("credential_policy")
local presets = require("mcp_presets")

local authority_snapshot = require("authority_snapshot")
local credential_eligibility = require("credential_eligibility")
local M = {}

-- sha256 hex of a raw token. Lookups hash on the way in; the raw value is never
-- stored, so a DB read can never recover a usable token.
function M.token_hash(raw: string): string
    -- hash.sha256 returns (hex, err); forwarding both feeds an extra bound
    -- parameter into strict-counting drivers (Postgres) at token lookup.
    return select(1, hash.sha256(raw)) :: string
end

-- Mint a raw token: a CSPRNG body behind a stable prefix. Returns raw + the
-- short prefix kept for display.
local function generate_token(): (string, string)
    local raw = consts.TOKEN.PREFIX .. crypto.random.string(consts.TOKEN.RANDOM_LEN)
    return raw, raw:sub(1, consts.TOKEN.PREFIX_DISPLAY_LEN)
end

local function now_unix(): integer
    return time.now():unix() :: integer
end

local function db_open(): (any?, string?)
    local db, err = sql.get(mcp_types.db_id())
    if err or not db then
        return nil, "mcp db unavailable: " .. tostring(err)
    end
    return db, nil
end

local function id_set(list: any): { [string]: boolean }
    local set: { [string]: boolean } = {}
    if type(list) == "table" then
        for _, id in ipairs(list :: { any }) do
            if type(id) == "string" and id ~= "" then set[id :: string] = true end
        end
    end
    return set
end

local function id_list(list: any): { string }
    local out: { string } = {}
    if type(list) == "table" then
        for _, id in ipairs(list :: { any }) do
            if type(id) == "string" and id ~= "" then out[#out + 1] = id :: string end
        end
    end
    return out
end

-- mint: create a credential owned by the current actor. The credential runs AS its
-- actor, narrowed by a whitelist of component subtrees -- there is no synthetic
-- principal and no granted subtree, so the actor's own access is the ceiling and the
-- whitelist can only ever reject (enforced by the central access gate via the
-- resolved path prefixes). An empty whitelist means the whole tree the actor reaches.
-- Each whitelisted id is validated to be visible to the actor at mint, so a
-- credential can never name a component its actor cannot see.
-- args: { whitelist_component_ids?, label?, policy?, context?, expires_at? }
function M.mint(args: any): (any?, any?)
    if args == nil then args = {} end
    local actor = security.actor()
    if not actor then return nil, "no authenticated actor" end
    local actor_id = actor:id()
    if type(actor_id) ~= "string" or actor_id == "" then
        return nil, "invalid actor id"
    end

    local eligible, eligibility_err = credential_eligibility.check(actor_id)
    if not eligible then return nil, eligibility_err end

    local valid, validation_err = credential_policy.validate_mint(args)
    if not valid then return nil, "invalid credential restrictions: " .. tostring(validation_err) end

    local policy, preset_err = presets.apply(args.policy)
    if not policy then return nil, preset_err end

    local whitelist = id_list(args.whitelist_component_ids)

    -- Validate the actor can see each whitelisted component (runs as the actor via
    -- the access-filtered query), so the whitelist never names something out of reach.
    if #whitelist > 0 then
        local svc, svc_err = component.get_service()
        if not svc then return nil, "component service unavailable: " .. tostring(svc_err) end
        local res, qerr = (svc :: any):query({ component_ids = whitelist, access_mask = component.ACCESS.READ })
        if qerr or not res or res.success ~= true then
            return nil, "whitelist validation failed: " .. tostring((res and res.error) or qerr or "query failed")
        end
        local seen = id_set((function()
            local ids: { string } = {}
            for _, c in ipairs(res.components or {}) do ids[#ids + 1] = tostring((c :: any).component_id) end
            return ids
        end)())
        for _, id in ipairs(whitelist) do
            if not seen[id] then return nil, "whitelisted component not accessible: " .. id end
        end
    end

    local credential_id = uuid.v4()
    local admitted, admission_err = execution_identity.capture()
    if admission_err or not admitted then return nil, tostring(admission_err or "identity admission failed") end
    if admitted.credential_id ~= nil then return nil, "a credential cannot mint a replacement credential" end
    if admitted.principal.kind ~= execution_identity.KIND.USER or admitted.principal.id ~= actor_id then
        return nil, "MCP credentials require their authenticated user owner"
    end
    local authority, authority_err = execution_identity.capture_authority(admitted)
    if authority_err or not authority then return nil, authority_err end
    local authority_json, authority_encode_err = json.encode(authority)
    if authority_encode_err then return nil, authority_encode_err end
    admitted.credential_id = credential_id
    local identity_row, identity_err = execution_identity.to_row(admitted)
    if identity_err or not identity_row then return nil, tostring(identity_err or "identity encoding failed") end
    local raw, prefix = generate_token()
    local token_hash = M.token_hash(raw)
    local label = type(args.label) == "string" and (args.label :: string) or ""
    local context = type(args.context) == "table" and args.context or {}
    local expires_at = (type(args.expires_at) == "number") and math.floor(args.expires_at :: number) or nil

    local db, db_err = db_open()
    if not db then return nil, db_err end

    local ts = now_unix()
    local inserted, ins_err = credential_quota.insert(db, actor_id, ts, {
            credential_id = credential_id,
            token_hash = token_hash,
            token_prefix = prefix,
            actor_id = actor_id,
            execution_identity_json = identity_row.actor_context,
            authority_json = authority_json,
            whitelist_json = json.encode(whitelist),
            label = label,
            status = consts.STATUS.ACTIVE,
            policy_json = json.encode(policy),
            context_json = json.encode(context),
            expires_at = expires_at,
            oauth_resource = args.oauth_resource,
            created_at = ts,
            updated_at = ts,
        })
    db:release()
    if ins_err or not inserted then
        return nil, "failed to persist credential: " .. tostring(ins_err)
    end

    return {
        credential_id = credential_id,
        token = raw, -- returned ONCE; never stored
        token_prefix = prefix,
        actor_id = actor_id,
        whitelist_component_ids = whitelist,
        label = label,
        expires_at = expires_at,
    }, nil
end

-- Decode a stored policy_json into the credential's full surface ceiling: direct
-- tools, the traits it may activate, its default active trait set, and the agent
-- profile (non-security startup prefs).
local function decode_policy(policy_json: any): (any?, string?)
    local p, policy_err = credential_policy.decode(policy_json)
    if not p then return nil, policy_err end
    return {
        allowed_tool_ids = id_set(p.allowed_tool_ids),
        allowed_trait_ids = id_set(p.allowed_trait_ids),
        restrict_traits = p.restrict_traits,
        default_active_trait_ids = id_list(p.default_active_trait_ids),
        agent_profile = type(p.agent_profile) == "table" and p.agent_profile or {},
    }
end

local decode_whitelist = credential_policy.decode_whitelist

local CREDENTIAL_COLUMNS = "credential_id, actor_id, whitelist_json, status, policy_json, context_json,"
    .. " expires_at, created_at, execution_identity_json, oauth_resource, authority_json"

-- One authoritative active-row decoder for bearer dispatch and deferred
-- credential rechecks. A missing or invalid identity refuses.
local function active_credential(row: any): (any?, any?)
    if type(row) ~= "table" then return nil, "credential not found" end
    if row.status ~= consts.STATUS.ACTIVE then return nil, "credential revoked" end
    local expiry = tonumber(row.expires_at)
    if row.expires_at ~= nil and expiry == nil then return nil, "credential expiry is invalid" end
    if expiry ~= nil and expiry > 0 and expiry < now_unix() then return nil, "credential expired" end
    if type(row.actor_id) ~= "string" or row.actor_id == "" then return nil, "credential actor_id is invalid" end
    local eligible, eligibility_err = credential_eligibility.check(row.actor_id)
    if not eligible then return nil, eligibility_err end
    local identity, identity_err = execution_identity.from_row(row.actor_id, row.execution_identity_json)
    if identity_err or not identity then return nil, "credential has no valid execution identity" end
    if identity.credential_id ~= row.credential_id
        or identity.principal.kind ~= execution_identity.KIND.USER
        or identity.principal.id ~= row.actor_id then
        return nil, "credential execution identity does not match its owner"
    end
    local whitelist, wl_err = decode_whitelist(row.whitelist_json)
    if wl_err or not whitelist then return nil, "credential whitelist invalid: " .. tostring(wl_err) end
    local prefixes: { string }? = nil
    if #whitelist > 0 then
        local resolved, rerr = component.resolve_path_prefixes(whitelist)
        if rerr then return nil, "whitelist resolution failed: " .. tostring(rerr) end
        if type(resolved) ~= "table" then return nil, "whitelist resolution returned no paths" end
        prefixes = resolved
    end
    local ctx: any = {}
    if type(row.context_json) == "string" and row.context_json ~= "" then
        local decoded, derr = json.decode(row.context_json)
        if derr or type(decoded) ~= "table" then return nil, "credential context is corrupt" end
        ctx = decoded
    end
    local policy, policy_err = decode_policy(row.policy_json)
    if not policy then return nil, policy_err end
    local authority, authority_err = authority_snapshot.decode(row.authority_json)
    if authority_err then return nil, tostring(authority_err) end
    local active = id_list((ctx :: any).active_trait_ids)
    if (ctx :: any).active_trait_ids == nil then active = policy.default_active_trait_ids end
    return {
        credential_id = row.credential_id,
        scope_policy_ids = consts.SCOPE_RESTRICTION_IDS,
        authority = authority,
        actor_id = row.actor_id,
        status = row.status,
        execution_identity = identity,
        whitelist_component_ids = whitelist,
        whitelist_prefixes = prefixes,
        allowed_tool_ids = policy.allowed_tool_ids,
        allowed_trait_ids = policy.allowed_trait_ids,
        restrict_traits = policy.restrict_traits,
        active_trait_ids = active,
        default_active_trait_ids = policy.default_active_trait_ids,
        agent_profile = policy.agent_profile,
        context = ctx,
        oauth_resource = row.oauth_resource,
    }, nil
end

function M.resolve_token(raw: any): (any?, any)
    if type(raw) ~= "string" or raw == "" then return nil, "missing token" end
    local db, db_err = db_open()
    if not db then return nil, db_err end
    local rows, q_err = db:query("SELECT " .. CREDENTIAL_COLUMNS .. " FROM " .. consts.TABLES.CREDENTIALS
        .. " WHERE token_hash = $1", { M.token_hash(raw) })
    if q_err then db:release(); return nil, "token lookup failed: " .. tostring(q_err) end
    local row = rows and rows[1]
    if not row then db:release(); return nil, "invalid token" end
    -- Usage tracking is part of credential admission because callers observe last_used_at.
    local _, usage_err = db:execute("UPDATE " .. consts.TABLES.CREDENTIALS .. " SET last_used_at = $1 WHERE credential_id = $2",
        { now_unix(), row.credential_id })
    db:release()
    if usage_err then return nil, "credential usage write failed: " .. tostring(usage_err) end
    return active_credential(row)
end

-- Protected owner read used by core execution on every inherited credential
-- boundary; it does not accept a bearer token or construct a runtime actor.
local function restriction_error(message: string, infrastructure: boolean): error
    return (errors.new({ message = message,
        kind = infrastructure and errors.UNAVAILABLE or errors.PERMISSION_DENIED,
        retryable = infrastructure,
        details = { error_kind = infrastructure and "infrastructure" or "subject" },
    }) :: error)
end

function M.restriction_get(credential_id: any): (any?, error?)
    if type(credential_id) ~= "string" or credential_id == "" then
        return nil, restriction_error("credential_id is required", false)
    end
    local db, db_err = db_open()
    if not db then return nil, restriction_error(tostring(db_err), true) end
    local rows, q_err = db:query("SELECT " .. CREDENTIAL_COLUMNS .. " FROM " .. consts.TABLES.CREDENTIALS
        .. " WHERE credential_id = $1", { credential_id })
    db:release()
    if q_err then return nil, restriction_error("credential lookup failed: " .. tostring(q_err), true) end
    local record, record_err = active_credential(rows and rows[1])
    if record then return record, nil end
    if type(record_err) == "userdata" then return nil, record_err end
    local message = tostring(record_err or "credential not found")
    local infrastructure = message:find("resolution failed", 1, true) ~= nil
    return nil, restriction_error(message, infrastructure)
end

-- persist_active_traits: write the credential's runtime active trait set into its
-- context_json (preserving other context keys). The meta-tools (use_trait, etc.)
-- call this so the surface change survives the next stateless request.
function M.persist_active_traits(credential_id: any, active_trait_ids: { string }): (boolean, string?)
    if type(credential_id) ~= "string" or credential_id == "" then
        return false, "credential_id is required"
    end
    local db, db_err = db_open()
    if not db then return false, db_err end
    local rows, read_err = sql.builder.select("context_json")
        :from(consts.TABLES.CREDENTIALS)
        :where("credential_id = ?", credential_id)
        :limit(1)
        :run_with(db):query()
    if read_err then
        db:release()
        return false, "read active traits failed: " .. tostring(read_err)
    end
    if not rows or #rows == 0 then
        db:release()
        return false, "credential not found"
    end
    local ctx, decode_err = json.decode((rows[1] :: any).context_json :: string)
    if decode_err or type(ctx) ~= "table" then
        db:release()
        return false, "credential context is invalid: " .. tostring(decode_err or "expected object")
    end
    ctx.active_trait_ids = active_trait_ids
    local encoded, encode_err = json.encode(ctx)
    if encode_err then
        db:release()
        return false, "encode active traits failed: " .. tostring(encode_err)
    end
    local result, err = sql.builder.update(consts.TABLES.CREDENTIALS)
        :set("context_json", encoded)
        :set("updated_at", now_unix())
        :where("credential_id = ?", credential_id)
        :run_with(db):exec()
    db:release()
    if err then return false, "persist active traits failed: " .. tostring(err) end
    if not result or tonumber(result.rows_affected) ~= 1 then return false, "credential not found" end
    return true, nil
end

-- update_management: atomically patch the human-facing label and the policy groups
-- supplied by the management API. Omitted groups retain their stored values; an
-- explicitly supplied empty list/object clears only that group. Ownership is part
-- of the same transaction, so the API does not perform a read/modify/write race.
-- Returns (updated, err), where updated=false with no error means not found/not owned.
function M.update_management(credential_id: any, actor_id: any, patch: any): (boolean, any?)
    if type(credential_id) ~= "string" or credential_id == "" then
        return false, "credential_id is required"
    end
    if type(actor_id) ~= "string" or actor_id == "" then
        return false, "actor_id is required"
    end
    if type(patch) ~= "table" then return false, "patch must be a table" end
    local valid, validation_err = credential_policy.validate(patch, true)
    if not valid then return false, "invalid credential policy patch: " .. tostring(validation_err) end


    local expanded, preset_err = presets.apply(patch)
    if not expanded then return false, preset_err end
    patch = expanded

    local db, db_err = db_open()
    if not db then return false, db_err end
    local tx, tx_err = db:begin()
    if not tx then db:release(); return false, "begin update failed: " .. tostring(tx_err) end

    local rows, read_err = sql.builder.select("policy_json")
        :from(consts.TABLES.CREDENTIALS)
        :where("credential_id = ? AND actor_id = ?", credential_id, actor_id)
        :limit(1)
        :run_with(tx):query()
    if read_err then
        tx:rollback(); db:release()
        return false, "read credential for update failed: " .. tostring(read_err)
    end
    if not rows or #rows == 0 then
        tx:rollback(); db:release()
        return false, nil
    end

    local update = sql.builder.update(consts.TABLES.CREDENTIALS)
    local has_change = false
    if patch.label ~= nil then
        update = update:set("label", patch.label)
        has_change = true
    end

    local has_policy = patch.allowed_tool_ids ~= nil or patch.allowed_trait_ids ~= nil
        or patch.default_active_trait_ids ~= nil or patch.agent_profile ~= nil
        or patch.restrict_traits ~= nil or patch.preset ~= nil
    if has_policy then
        local policy, policy_err = credential_policy.decode((rows[1] :: any).policy_json)
        if not policy then
            tx:rollback(); db:release()
            return false, policy_err
        end
        if patch.allowed_tool_ids ~= nil then policy.allowed_tool_ids = id_list(patch.allowed_tool_ids) end
        if patch.allowed_trait_ids ~= nil then policy.allowed_trait_ids = id_list(patch.allowed_trait_ids) end
        if patch.default_active_trait_ids ~= nil then
            policy.default_active_trait_ids = id_list(patch.default_active_trait_ids)
        end
        if patch.agent_profile ~= nil then policy.agent_profile = patch.agent_profile end
        if patch.restrict_traits ~= nil then policy.restrict_traits = patch.restrict_traits end
        if patch.preset ~= nil then policy.preset = patch.preset end
        local encoded, encode_err = json.encode(policy)
        if encode_err then
            tx:rollback(); db:release()
            return false, "encode credential policy failed: " .. tostring(encode_err)
        end
        update = update:set("policy_json", encoded)
        has_change = true
    end

    if has_change then
        local _, update_err = update
            :set("updated_at", now_unix())
            :where("credential_id = ? AND actor_id = ?", credential_id, actor_id)
            :run_with(tx):exec()
        if update_err then
            tx:rollback(); db:release()
            return false, "update credential failed: " .. tostring(update_err)
        end
    end

    local _, commit_err = tx:commit()
    if commit_err then
        tx:rollback(); db:release()
        return false, "commit credential update failed: " .. tostring(commit_err)
    end
    db:release()
    return true, nil
end

-- revoke: deactivate a credential. The credential holds no granted subtree of its
-- own (it runs as its actor), so revocation is a pure status flip -- its token stops
-- resolving on the next request. Caller authority is gated by the management API.
function M.revoke(credential_id: any, revoked_by: any): (boolean, string?)
    if type(credential_id) ~= "string" or credential_id == "" then
        return false, "credential_id is required"
    end
    local db, db_err = db_open()
    if not db then return false, db_err end
    local rows, q_err = sql.builder.select("status")
        :from(consts.TABLES.CREDENTIALS)
        :where("credential_id = ?", credential_id)
        :limit(1)
        :run_with(db):query()
    if q_err then db:release(); return false, "lookup failed: " .. tostring(q_err) end
    if not rows or #rows == 0 then db:release(); return false, "credential not found" end

    local _, upd_err = sql.builder.update(consts.TABLES.CREDENTIALS)
        :set("status", consts.STATUS.REVOKED)
        :set("revoked_at", now_unix())
        :set("revoked_by", type(revoked_by) == "string" and revoked_by or "")
        :set("updated_at", now_unix())
        :where("credential_id = ?", credential_id)
        :run_with(db):exec()
    db:release()
    if upd_err then return false, "revoke update failed: " .. tostring(upd_err) end
    return true, nil
end

-- delete: hard-remove a credential row. Owner-scoped: only the actor's own
-- credential is deleted, so the row disappears from the list and its token stops
-- resolving. Caller authority is gated by the management API.
function M.delete(credential_id: any, actor_id: any): (boolean, string?)
    if type(credential_id) ~= "string" or credential_id == "" then
        return false, "credential_id is required"
    end
    if type(actor_id) ~= "string" or actor_id == "" then
        return false, "actor_id is required"
    end
    local db, db_err = db_open()
    if not db then return false, db_err end
    local _, del_err = sql.builder.delete(consts.TABLES.CREDENTIALS)
        :where("credential_id = ? AND actor_id = ?", credential_id, actor_id)
        :run_with(db):exec()
    db:release()
    if del_err then return false, "delete failed: " .. tostring(del_err) end
    return true, nil
end

require("repo_queries")(M, db_open, now_unix, function(row: any): string?
    local policy, policy_err = credential_policy.decode(row.policy_json)
    if not policy then return policy_err end
    local whitelist, whitelist_err = decode_whitelist(row.whitelist_json)
    if not whitelist then return whitelist_err end
    row.allowed_tool_ids = policy.allowed_tool_ids or {}
    row.allowed_trait_ids = policy.allowed_trait_ids or {}
    row.restrict_traits = policy.restrict_traits
    row.whitelist_component_ids = whitelist
    return nil
end)

return M
