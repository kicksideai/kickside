local sql = require("sql")
local execution_identity = require("execution_identity")

local M = {}

-- The harness users resolver (IDENTITY-1): a principal answers with its
-- runtime actor key, the harness scope and group.
function M.resolve(args: any): any
    local principal = type(args) == "table" and (args :: any).principal or nil
    if type(principal) ~= "table" or type(principal.id) ~= "string" then
        return nil, "principal is required"
    end
    if not execution_identity.same_principal(principal, args.authorized_by or principal) then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
            message = "may_act_as denied: the harness declares no delegation grants"})
    end
    local db, db_err = sql.get("app:db")
    if db_err or not db then return nil, db_err end
    local _, create_err = db:execute("CREATE TABLE IF NOT EXISTS round_authority_revocation (principal_id TEXT PRIMARY KEY, error_kind TEXT NOT NULL)")
    if create_err then db:release(); return nil, create_err end
    local _, policy_create_err = db:execute("CREATE TABLE IF NOT EXISTS round_scope_policy (principal_id TEXT NOT NULL, policy_id TEXT NOT NULL, PRIMARY KEY (principal_id, policy_id))")
    if policy_create_err then db:release(); return nil, policy_create_err end
    local rows, read_err = db:query("SELECT error_kind FROM round_authority_revocation WHERE principal_id=$1", {args.authorized_by and args.authorized_by.id or principal.id})
    if read_err then db:release(); return nil, read_err end
    local policies, policies_err = db:query("SELECT policy_id FROM round_scope_policy WHERE principal_id=$1 ORDER BY policy_id", {principal.id})
    db:release()
    if policies_err then return nil, policies_err end
    local scope_policy_ids: { string } = {}
    for _, row in ipairs(policies or {}) do scope_policy_ids[#scope_policy_ids + 1] = row.policy_id end
    if rows[1] and rows[1].error_kind ~= "scope" then
        return nil, errors.new({kind=errors.PERMISSION_DENIED, retryable=false,
            message="recorded authority is revoked", details={error_kind=rows[1].error_kind}})
    end
    return {
        principal = { kind = principal.kind, id = principal.id },
        actor_id = execution_identity.actor_key(principal),
        groups = { "automation_test" },
        scope_name = rows[1] and rows[1].error_kind == "scope" and "app:effect_revoked_scope" or "wippy.security:process",
        scope_groups = #scope_policy_ids > 0 and { "wippy.security:process" } or nil,
        scope_policy_ids = #scope_policy_ids > 0 and scope_policy_ids or nil,
        meta = { user_id = principal.kind == "user" and principal.id or nil, status = "active",
            security_groups = { "automation_test" } },
    }
end

return M
