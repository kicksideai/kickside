local test = require("test")
local sql = require("sql")
local time = require("time")
local security = require("security")
local funcs = require("funcs")
local owner_hooks = require("owner_hooks")
local subjects = require("subjects")
local credentials = require("mcp_repo")
local notifier = require("retention_notifier")

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
            db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if db == nil then error("database unavailable") end
            test.eq(count(db, ids.expired), 0)
            test.eq(count(db, ids.revoked), 0)
            local retained = assert(db:query([[SELECT COUNT(*) AS n FROM kickside_mcp_credentials
                WHERE credential_id IN ($1,$2,$3,$4,$5,$6)]],
                {ids.expired,ids.revoked,ids.live,ids.recent,ids.unexpired,ids.nonexpiring}))
            test.eq(tonumber(retained[1].n),4,"exactly the two aged fixtures are reclaimed")
            for _, id in ipairs({ ids.live, ids.recent, ids.unexpired, ids.nonexpiring }) do
                test.eq(count(db, id), 1)
                local _, cleanup_err = db:execute("DELETE FROM kickside_mcp_credentials WHERE credential_id=$1", { id })
                test.is_nil(cleanup_err)
            end
            db:release()
        end)

        test.it("wakes on first revocation and leaves deadline refreshes quiet", function()
            local id = "revoke-wake-" .. tostring(time.now():unix_nano())
            local db = assert(sql.get("app:db"))
            insert(db,id,"active",nil,nil)
            db:release()
            local notify, calls = notifier.notify, 0
            notifier.notify = function(change)
                calls = calls + 1
                return notify(change)
            end
            local ok, first, first_err = pcall(credentials.revoke,id,"test")
            local first_calls = calls
            local second_ok, second, second_err = pcall(credentials.revoke,id,"test")
            notifier.notify = notify
            db = assert(sql.get("app:db"))
            local _, cleanup_err = db:execute("DELETE FROM kickside_mcp_credentials WHERE credential_id=$1",{id})
            db:release()
            test.is_nil(cleanup_err,tostring(cleanup_err))
            test.is_true(ok,tostring(first))
            test.is_true(second_ok,tostring(second))
            test.is_nil(first_err,tostring(first_err))
            test.is_nil(second_err,tostring(second_err))
            test.is_true(first); test.is_true(second)
            test.eq(first_calls,1,"first revocation establishes a retention deadline")
            test.eq(calls,1,"revocation refresh only postpones its deadline")
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

            local function mint(expires_at)
                local actor = security.new_actor(actor_id, { user_id = actor_id, security_groups = {} })
                local policy = security.policy("app:mcp_suite_policy")
                local scope = security.new_scope({ policy })
                return funcs.new():with_actor(actor):with_scope(scope):call("app:mint_func",
                    { whitelist_component_ids = {}, label = "quota", policy = {}, expires_at = expires_at })
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
            test.eq(admitted.notifications,0,"nonexpiring credentials establish no cleanup deadline")
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
