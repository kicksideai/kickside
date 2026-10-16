-- Test-only kickside.contract:scope_resolver (v2 contract shape). It answers the
-- requested principal, or the ambient actor's principal, as live and active with
-- the harness process scope. The Users module owns the real admission rules;
-- core suites exercise core's handling of the answer.
local security = require("security")
local sql = require("sql")
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
    if string.sub(checked.id, 1, 11) == "transition-" then
        local root = args.execution_root
        if type(root) ~= "table" or type(root.record_id) ~= "string" then
            return nil, errors.new({ message = "transition fixture root is missing", kind = errors.INVALID })
        end
        local db, db_err = sql.get("app:db")
        if db_err then return nil, db_err end
        if not db then return nil, errors.new({ message = "principal-state fixture DB is unavailable", kind = errors.UNAVAILABLE }) end
        local rows, read_err = db:query("SELECT key,value FROM kickside_component_meta WHERE component_id=$1 AND key IN ($2,$3)",
            { root.record_id, "core_test.principal_state", "core_test.scope_name" })
        local _, release_err = db:release()
        if read_err then return nil, read_err end
        if release_err then return nil, release_err end
        local status = nil
        for _, row in ipairs(rows or {}) do
            if row.key == "core_test.principal_state" then status = row.value end
            if row.key == "core_test.scope_name" then scope_name = row.value end
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
        groups = { "core_test" },
        scope_name = scope_name,
        meta = meta,
    }, nil
end

return M
