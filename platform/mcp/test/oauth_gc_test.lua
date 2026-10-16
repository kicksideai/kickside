local test = require("test")
local sql = require("sql")
local time = require("time")
local oauth_repo = require("mcp_oauth_repo")
local owner_hooks = require("owner_hooks")

local function count(db, hash)
    if db == nil then error("database unavailable") end
    local rows, err = db:query("SELECT COUNT(*) AS n FROM kickside_mcp_oauth_codes WHERE code_hash=$1", { hash })
    test.is_nil(err)
    return tonumber(rows[1].n)
end

local function define_tests()
    test.describe("MCP OAuth code GC", function()
        test.it("existing retention tick removes expired codes and preserves live grants", function()
            local suffix = tostring(time.now():unix())
            local expired, live = "gc-expired-" .. suffix, "gc-live-" .. suffix
            local args = {
                client_id = "gc-client", actor_id = "gc-actor", redirect_uri = "https://example.test/cb",
                code_challenge = "gc-challenge", grant = { actor = "gc-actor" },
            }
            args.ttl = -1
            test.is_nil(oauth_repo.put_code(expired, args))
            args.ttl = 3600
            test.is_nil(oauth_repo.put_code(live, args))
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if db == nil then error("database unavailable") end
            local expired_hash, live_hash = oauth_repo.code_hash(expired), oauth_repo.code_hash(live)
            test.eq(count(db, expired_hash), 1)
            test.eq(count(db, live_hash), 1)
            db:release()

            local report, prune_err = owner_hooks.run()
            test.is_nil(prune_err)
            test.eq(#report.failures, 0, "no retention owner fails")
            test.is_true(report.deleted >= 1)
            db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if db == nil then error("database unavailable") end
            test.eq(count(db, expired_hash), 0)
            test.eq(count(db, live_hash), 1)
            local _, cleanup_err = db:execute("DELETE FROM kickside_mcp_oauth_codes WHERE code_hash=$1", { live_hash })
            test.is_nil(cleanup_err)
            db:release()
        end)

        test.it("retires idle client registrations but renews clients used for consent", function()
            local stale, stale_err = oauth_repo.register_client({ redirect_uris = { "https://example.test/old" } })
            local live, live_err = oauth_repo.register_client({ redirect_uris = { "https://example.test/live" } })
            test.is_nil(stale_err)
            test.is_nil(live_err)
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if db == nil then error("database unavailable") end
            local old = time.now():unix() - 91 * 86400
            local _, age_err = db:execute([[UPDATE kickside_mcp_oauth_clients
                SET last_used_at=$1 WHERE client_id=$2]], { old, stale.client_id })
            test.is_nil(age_err)
            db:release()

            local stale_lookup, lookup_err = oauth_repo.get_client(stale.client_id)
            test.is_nil(stale_lookup)
            test.not_nil(lookup_err)
            local active, active_err = oauth_repo.get_client(live.client_id)
            test.is_nil(active_err)
            test.not_nil(active)
            local report, prune_err = owner_hooks.run()
            test.is_nil(prune_err)
            test.eq(#report.failures, 0, "no retention owner fails")
            test.is_true(report.deleted >= 1)

            db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if db == nil then error("database unavailable") end
            local rows, query_err = db:query([[SELECT client_id FROM kickside_mcp_oauth_clients
                WHERE client_id IN ($1,$2) ORDER BY client_id]], { stale.client_id, live.client_id })
            test.is_nil(query_err)
            test.eq(#rows, 1)
            test.eq(rows[1].client_id, live.client_id)
            local _, cleanup_err = db:execute("DELETE FROM kickside_mcp_oauth_clients WHERE client_id=$1", { live.client_id })
            test.is_nil(cleanup_err)
            db:release()
        end)
    end)
end

return test.run_cases(define_tests)
