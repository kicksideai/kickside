-- Test-only kickside.contract:scope_resolver (v2 contract shape). It answers the
-- requested principal, or the ambient actor's principal, as live and active with
-- the harness process scope. The Users module owns the real admission rules;
-- core suites exercise core's handling of the answer.
local security = require("security")
local sql = require("sql")
local json = require("json")
local execution_identity = require("execution_identity")

local M = {}

function M.resolve(args: any): (any?, error?)
    local principal: any = type(args) == "table" and (args :: any).principal or nil
    if principal == nil then
        local actor = security.actor()
        local keyed, key_err = execution_identity.principal_of_key(actor and actor:id() or nil)
        if key_err or not keyed then return nil, key_err end
        principal = keyed
    end
    local checked, check_err = execution_identity.check_principal(principal, "principal")
    if check_err or not checked then return nil, check_err end
    if string.sub(checked.id, 1, 16) == "lifecycle-token-" then
        local db, open_err = sql.get("app:db")
        if open_err then return nil, open_err end
        if not db then return nil, errors.new({ message = "lifecycle token fixture DB is unavailable", kind = errors.UNAVAILABLE }) end
        local rows, read_err = db:query("SELECT $1 AS subject_id", { checked.id })
        local _, release_err = db:release()
        if read_err then return nil, read_err end
        if release_err then return nil, release_err end
        if not rows or not rows[1] then return nil, errors.new({ message = "lifecycle token fixture principal is missing", kind = errors.NOT_FOUND }) end
    end
    local scope_name = "wippy.security:process"
    local groups = {"core_test"}
    local epochs = {provider = 0}
    if string.sub(checked.id, 1, 11) == "transition-"
        or (type(args.authorized_by) == "table" and string.sub(args.authorized_by.id, 1, 11) == "transition-") then
        local root = args.execution_root
        if type(root) ~= "table" or type(root.record_id) ~= "string" then
            return nil, errors.new({ message = "transition fixture root is missing", kind = errors.INVALID })
        end
        local db, db_err = sql.get("app:db")
        if db_err then return nil, db_err end
        if not db then return nil, errors.new({ message = "principal-state fixture DB is unavailable", kind = errors.UNAVAILABLE }) end
        local rows, read_err = db:query("SELECT key,value FROM kickside_component_meta WHERE component_id=$1 AND key IN ($2,$3,$4,$5,$6)",
            { root.record_id, "core_test.principal_state", "core_test.scope_name", "core_test.membership_state", "core_test.delegation_state", "core_test.authorizer_state" })
        local _, release_err = db:release()
        if read_err then return nil, read_err end
        if release_err then return nil, release_err end
        local status = nil
        for _, row in ipairs(rows or {}) do
            if row.key == "core_test.principal_state" then status = row.value end
            if row.key == "core_test.scope_name" then scope_name = row.value end
            if row.key == "core_test.membership_state" and row.value == "revoked" then groups = {} end
            if row.key == "core_test.delegation_state" and row.value == "revoked" then epochs.provider = 1 end
            if row.key == "core_test.authorizer_state" and row.value == "revoked" then
                return nil, errors.new({message = "recorded authorizer no longer has ADMIN", kind = errors.PERMISSION_DENIED,
                    retryable = false, details = {code = "authorizer_revoked"}})
            end
        end
        if status == "disabled" or status == "deleted" then
            return nil, errors.new({ message = "deferred principal is " .. status,
                kind = status == "deleted" and errors.NOT_FOUND or errors.PERMISSION_DENIED })
        end
    end
    local meta: { [string]: any } = { status = "active" }
    if (checked :: any).kind == execution_identity.KIND.USER then meta.user_id = (checked :: any).id end
    return {
        principal = checked,
        actor_id = execution_identity.actor_key(checked :: any),
        groups = groups,
        authority_epochs = epochs,
        initial_authority_epochs = {provider = 0},
        scope_name = scope_name,
        meta = meta,
    }, nil
end

function M.groups(_args: any): table
    return {active = true, groups = {"core_test"}}
end

-- Protected credential-reader contract double; the real identity restriction
-- loader validates this answer and checks delegated authority epochs.
function M.credential(args: table): (table?, error?)
    local db, open_err = sql.get("app:db")
    if open_err then return nil, open_err end
    if not db then return nil, errors.new({kind = errors.UNAVAILABLE, message = "credential fixture database unavailable"}) end
    local rows, read_err = db:query([[SELECT c.private_context,m.value AS status FROM kickside_components c
        LEFT JOIN kickside_component_meta m ON m.component_id=c.component_id AND m.key='core_test.credential_state'
        WHERE c.component_id=$1]], {args.credential_id})
    local _, release_err = db:release()
    if read_err then return nil, read_err end
    if release_err then return nil, release_err end
    if not rows or not rows[1] then return nil, errors.new({kind = errors.NOT_FOUND, message = "credential fixture missing"}) end
    local context, decode_err = json.decode(rows[1].private_context)
    if decode_err then return nil, decode_err end
    return {credential_id = args.credential_id, actor_id = context._execution_identity.principal.id,
        status = rows[1].status or "active", whitelist_component_ids = {}, scope_policy_ids = {"app:test_scope_policy"},
        authority = {policy_ids = {"app:test_scope_policy"}, groups = {"core_test"}, epochs = {provider = 0}}}, nil
end

return M
