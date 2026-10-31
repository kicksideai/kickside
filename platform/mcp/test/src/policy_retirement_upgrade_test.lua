local test = require("test")
local sql = require("sql")
local json = require("json")
local funcs = require("funcs")
local uuid = require("uuid")
local security = require("security")
local time = require("time")
local repo = require("mcp_repo")
local owner_hooks = require("owner_hooks")

local MIGRATION = "kickside.mcp.migrations:05_retired_policy_credentials"
local RETIRED = {
    "app.security:user.self_service", "app.security:user.profile_env",
    "app.security:user.app_shell_access", "app.security:user.view_registry_access",
    "app.security:user.dataflow_view_origin", "app.security:user.navigation_registry",
    "app.security:user.default_membership_registry", "app.security:user.documentation_registry",
    "app.security:user.runtime_contract_methods", "app.security:user.runtime_contract_context",
    "app.security:user.runtime_function_context", "app.security:user.runtime_process_notifications",
    "app.security:user.runtime_session_spawn", "app.security:user.runtime_env_read",
    "app.security:user.runtime_http_private_ip", "app.security:user.runtime_dataflow_node_spawn",
    "kickside.skills.security:bundle_transfer_output_publish",
}

local db, ids
local function seed(authority, identity, status)
    local id = uuid.v4()
    ids[#ids + 1] = id
    -- Retention may run during this upgrade test; keep historical rows recent.
    local now = time.now():unix()
    local _, err = db:execute([[INSERT INTO kickside_mcp_credentials
        (credential_id, token_hash, token_prefix, actor_id, authority_json, execution_identity_json,
         status, created_at, updated_at, revoked_at, revoked_by)
        VALUES ($1, $1, 'prefix', 'test-user', $2, $3, $4, $5, $6, $7, 'original')]],
        {id, authority or sql.NULL, identity or sql.NULL, status or "active", now - 3, now - 2, now - 1})
    test.is_nil(err)
    return id
end

local function migrate()
    local result, err = funcs.new():with_actor(security.new_actor("system:credential-upgrade-test"))
        :with_scope(assert(security.named_scope("wippy.security:process"))):call(MIGRATION, {
        database_id = "app:db", id = MIGRATION .. ":" .. uuid.v4(), direction = "up",
    })
    test.is_nil(err)
    test.not_nil(result)
    test.eq(result.failed, 0, json.encode(result))
end

local function stored(id)
    return assert(db:query("SELECT * FROM kickside_mcp_credentials WHERE credential_id=$1", {id}))[1]
end

local function define_tests()
    test.describe("credential policy retirement upgrade", function()
        test.before_each(function()
            db = assert(sql.get("app:db"))
            ids = {}
        end)
        test.after_each(function()
            for _, id in ipairs(ids) do
                local _, err = db:execute("DELETE FROM kickside_mcp_credentials WHERE credential_id=$1", {id})
                test.is_nil(err)
            end
            db:release()
        end)

        test.it("revokes each affected ceiling and leaves its captured authority unchanged", function()
            for _, policy in ipairs(RETIRED) do
                local authority = assert(json.encode({policy_ids = {policy}, groups = {"app:custom"}}))
                seed(authority, '{"credential_id":"captured-reference"}')
            end
            local before = {}
            for _, id in ipairs(ids) do before[id] = stored(id) end
            migrate()
            for _, id in ipairs(ids) do
                local row = stored(id)
                test.eq(row.status, "revoked")
                test.eq(row.authority_json, before[id].authority_json)
                test.eq(row.execution_identity_json, before[id].execution_identity_json)
                test.eq(row.token_hash, before[id].token_hash)
                test.eq(row.created_at, before[id].created_at)
                test.is_true(tonumber(row.revoked_at) > tonumber(before[id].revoked_at))
                local restriction, err = repo.restriction_get(id)
                test.is_nil(restriction)
                test.not_nil(err)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            end
            local revoked = stored(ids[1])
            migrate()
            test.eq(stored(ids[1]).revoked_at, revoked.revoked_at)
            test.eq(stored(ids[1]).updated_at, revoked.updated_at)
        end)

        test.it("revokes a stored identity restriction and a retention pass keeps recent history and similar policy ids", function()
            local identity = '{"restriction":{"policy_ids":["app.security:user.runtime_env_read"]}}'
            local affected = seed(nil, identity)
            local retained = seed('{"policy_ids":["app.security:user.runtime_registry_read","app.security:user.self_service_extra"],"groups":[]}', nil)
            local historical = seed('{"policy_ids":["app.security:user.self_service"],"groups":[]}', identity, "revoked")
            local before = assert(json.encode(stored(historical)))
            local untouched = assert(json.encode(stored(retained)))
            migrate()
            local report, retention_err = owner_hooks.run()
            test.is_nil(retention_err)
            test.eq(#report.failures, 0, json.encode(report))
            test.eq(stored(affected).status, "revoked")
            test.eq(stored(affected).execution_identity_json, identity)
            test.eq(assert(json.encode(stored(historical))), before)
            test.eq(assert(json.encode(stored(retained))), untouched)
        end)

        test.it("matches decoded policy values and reports corrupt active JSON without rewriting it", function()
            local escaped = [=[{"policy_ids":["app.security:user.\u0073elf_service"],"groups":[]}]=]
            local affected = seed(escaped, nil)
            migrate()
            test.eq(stored(affected).status, "revoked")
            test.eq(stored(affected).authority_json, escaped)
            local malformed = seed('{', nil)
            local result, err = funcs.call(MIGRATION, {
                database_id = "app:db", id = MIGRATION .. ":" .. uuid.v4(), direction = "up",
            })
            test.is_nil(err)
            test.eq(result.failed, 1)
            test.eq(stored(malformed).authority_json, '{')
            test.eq(stored(malformed).status, "active")
        end)
    end)
end

return {run = test.run_cases(define_tests)}
