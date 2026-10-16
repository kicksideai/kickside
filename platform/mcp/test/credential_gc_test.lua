local test = require("test")
local sql = require("sql")
local time = require("time")
local security = require("security")
local funcs = require("funcs")
local owner_hooks = require("owner_hooks")
local subjects = require("subjects")

local function insert(db, id, status, expiry, revoked_at)
    local values = {
        credential_id = id, token_hash = "hash-" .. id, token_prefix = "gc",
        actor_id = "gc-actor", status = status,
        created_at = 1, updated_at = 1,
    }
    if expiry then values.expires_at = expiry end
    if revoked_at then values.revoked_at = revoked_at end
    local _, err = sql.builder.insert("kickside_mcp_credentials"):set_map(values):run_with(db):exec()
    test.is_nil(err)
end

local function count(db, id)
    if db == nil then error("database unavailable") end
    local rows, err = db:query("SELECT COUNT(*) AS n FROM kickside_mcp_credentials WHERE credential_id=$1", { id })
    test.is_nil(err)
    return tonumber(rows[1].n)
end

local function define_tests()
    test.describe("MCP credential GC", function()
        test.it("prunes aged revoked and expired rows but preserves live rows", function()
            local suffix = tostring(time.now():unix())
            local now = time.now():unix()
            local old = now - 31 * 86400
            local recent = now - 86400
            local ids = {
                expired = "gc-expired-" .. suffix,
                revoked = "gc-revoked-" .. suffix,
                live = "gc-live-" .. suffix,
                recent = "gc-recent-" .. suffix,
                unexpired = "gc-unexpired-" .. suffix,
                nonexpiring = "gc-no-expiry-" .. suffix,
            }
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if db == nil then error("database unavailable") end
            insert(db, ids.expired, "active", old)
            insert(db, ids.revoked, "revoked", nil, old)
            insert(db, ids.live, "active", now + 86400, nil)
            insert(db, ids.recent, "revoked", nil, recent)
            insert(db, ids.unexpired, "active", nil, nil)
            insert(db, ids.nonexpiring, "active", 0, nil)
            db:release()

            local report, prune_err = owner_hooks.run()
            test.is_nil(prune_err)
            test.eq(#report.failures, 0, "no retention owner fails")
            test.is_true(report.deleted >= 2)
            db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if db == nil then error("database unavailable") end
            test.eq(count(db, ids.expired), 0)
            test.eq(count(db, ids.revoked), 0)
            for _, id in ipairs({ ids.live, ids.recent, ids.unexpired, ids.nonexpiring }) do
                test.eq(count(db, id), 1)
                local _, cleanup_err = db:execute("DELETE FROM kickside_mcp_credentials WHERE credential_id=$1", { id })
                test.is_nil(cleanup_err)
            end
            db:release()
        end)

        test.it("caps active credentials per owner and admits a replacement after revoke", function()
            local actor_id = "gc-quota-" .. tostring(time.now():unix())
            subjects.put(actor_id, subjects.STATUS.ACTIVE, {})
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if db == nil then error("database unavailable") end
            for i = 1, 100 do
                local id = actor_id .. "-" .. tostring(i)
                local _, err = sql.builder.insert("kickside_mcp_credentials")
                    :set_map({ credential_id = id, token_hash = "hash-" .. id,
                        token_prefix = "gc", actor_id = actor_id, status = "active",
                        created_at = 1, updated_at = 1 })
                    :run_with(db):exec()
                test.is_nil(err)
            end
            db:release()

            local function mint()
                local actor = security.new_actor(actor_id, { user_id = actor_id, security_groups = {} })
                local policy = security.policy("app:mcp_suite_policy")
                local scope = security.new_scope({ policy })
                return funcs.new():with_actor(actor):with_scope(scope):call("app:mint_func",
                    { whitelist_component_ids = {}, label = "quota", policy = {} })
            end
            local denied = mint()
            test.is_nil(denied.result)
            test.contains(tostring(denied.error), "active credential limit")

            db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if db == nil then error("database unavailable") end
            local _, revoke_err = db:execute([[UPDATE kickside_mcp_credentials
                SET status='revoked',revoked_at=$1 WHERE credential_id=$2]],
                { time.now():unix(), actor_id .. "-1" })
            test.is_nil(revoke_err)
            db:release()
            local admitted = mint()
            test.is_nil(admitted.error)
            test.not_nil(admitted.result)
            db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if db == nil then error("database unavailable") end
            local rows, count_err = db:query([[SELECT COUNT(*) AS n FROM kickside_mcp_credentials
                WHERE actor_id=$1 AND status='active']], { actor_id })
            test.is_nil(count_err)
            test.eq(tonumber(rows[1].n), 100)
            local _, cleanup_err = db:execute("DELETE FROM kickside_mcp_credentials WHERE actor_id=$1", { actor_id })
            test.is_nil(cleanup_err)
            db:release()
            subjects.remove(actor_id)
        end)
    end)
end

return test.run_cases(define_tests)
