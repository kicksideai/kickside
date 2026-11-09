local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local owner_hooks = require("owner_hooks")
local oauth = require("oauth_repo")
local credentials = require("mcp_repo")
local time = require("time")

local MIGRATION = "kickside.mcp.migrations:02_mcp_oauth"

return test.run_cases(function()
    test.describe("retention during MCP installation", function()
        test.it("continues a saturated credential leg and reports the next retained expiry", function()
            local db = assert(sql.get("app:db"))
            local prefix = "retention-chain-" .. uuid.v4()
            local _, seed_err = db:execute([[WITH RECURSIVE n(x) AS (
                SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<5001)
                INSERT INTO kickside_mcp_credentials
                (credential_id,token_hash,token_prefix,actor_id,status,created_at,updated_at,expires_at)
                SELECT $1 || CAST(x AS TEXT),$1 || CAST(x AS TEXT),'gc',$1,'active',1,1,1 FROM n]], {prefix})
            test.is_nil(seed_err, tostring(seed_err))
            local passes = 0
            repeat
                local report, run_err = owner_hooks.run()
                test.is_nil(run_err, tostring(run_err))
                test.eq(#report.failures, 0)
                if report.deadline_ms ~= nil then
                    test.is_true(report.deadline_ms > math.floor(time.now():unix_nano()/1000000),
                        "continuation never schedules expired backlog as a deadline")
                end
                passes = passes + 1
                local rows = assert(db:query("SELECT COUNT(*) AS n FROM kickside_mcp_credentials WHERE actor_id=$1", {prefix}))
                if tonumber(rows[1].n) == 0 then break end
                test.is_true(report.needs_continue, "one saturated 250-row leg requests continuation")
                test.is_true(passes < 30, "the chain drains the backlog")
            until false
            test.is_true(passes >= 1)
            local expires = 4102444800
            local _, fresh_err = db:execute([[INSERT INTO kickside_mcp_credentials
                (credential_id,token_hash,token_prefix,actor_id,status,created_at,updated_at,expires_at)
                VALUES ($1,$1,'gc',$1,'active',1,1,$2)]], {prefix, expires})
            test.is_nil(fresh_err, tostring(fresh_err))
            local report, run_err = owner_hooks.run()
            test.is_nil(run_err, tostring(run_err))
            test.not_nil(report.deadline_ms, "retained rows schedule their next expiry")
            test.is_true(report.deadline_ms <= (expires + 30*86400)*1000)
            local _, cleanup_err = db:execute("DELETE FROM kickside_mcp_credentials WHERE actor_id=$1", {prefix})
            db:release()
            test.is_nil(cleanup_err, tostring(cleanup_err))
        end)

        test.it("schedules the next pass from an existing grant's expiry without another write", function()
            local raw = "retention-deadline-" .. uuid.v4()
            local put_err = oauth.put_code(raw, {client_id="retention-client",actor_id="retention-actor",
                redirect_uri="https://example.test/callback",code_challenge="challenge",ttl=3})
            test.is_nil(put_err, tostring(put_err))
            local db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT expires_at FROM kickside_mcp_oauth_codes WHERE code_hash=$1", {oauth.code_hash(raw)}))
            db:release()
            local expiry = assert(tonumber(rows[1].expires_at))*1000
            local report, run_err = owner_hooks.run()
            test.is_nil(run_err, tostring(run_err))
            test.eq(#report.failures, 0)
            test.eq(report.deadline_ms, expiry)
            test.is_false(report.needs_continue)
            local delay = (report.deadline_ms :: number) - math.floor(time.now():unix_nano()/1000000)
            test.is_true(delay > 0)
            time.sleep(tostring(delay + 50) .. "ms")
            report, run_err = owner_hooks.run()
            test.is_nil(run_err, tostring(run_err))
            test.eq(#report.failures, 0)
            db = assert(sql.get("app:db"))
            rows = assert(db:query("SELECT COUNT(*) AS n FROM kickside_mcp_oauth_codes WHERE code_hash=$1", {oauth.code_hash(raw)}))
            db:release()
            test.eq(tonumber(rows[1].n), 0)
        end)

        test.it("bounds a continuous OAuth code stream by its existing grant lifetime", function()
            local db = assert(sql.get("app:db"))
            local prefix = "grant-stream-" .. uuid.v4()
            local now = time.now():unix()
            for minute = 1,12 do
                local _, age_err = db:execute("UPDATE kickside_mcp_oauth_codes SET expires_at=expires_at-60 WHERE client_id=$1", {prefix})
                test.is_nil(age_err, tostring(age_err))
                local _, seed_err = db:execute([[WITH RECURSIVE n(x) AS (
                    SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<20)
                    INSERT INTO kickside_mcp_oauth_codes
                    (code_hash,client_id,actor_id,redirect_uri,code_challenge,grant_json,expires_at,created_at)
                    SELECT $1 || CAST(x AS TEXT),$2,'actor','https://example.test/callback','challenge','{}',$3,$4 FROM n]],
                    {prefix .. tostring(minute) .. "-",prefix,now+300,now})
                test.is_nil(seed_err, tostring(seed_err))
                local pages = 0
                repeat
                    local _, err, progress = oauth.prune_expired_codes(10)
                    test.is_nil(err, tostring(err))
                    pages = pages + 1
                    test.is_true(pages < 5)
                    if not progress.needs_continue then break end
                until false
                local rows = assert(db:query("SELECT COUNT(*) AS n FROM kickside_mcp_oauth_codes WHERE client_id=$1", {prefix}))
                test.eq(tonumber(rows[1].n),math.min(minute,5)*20)
            end
            local _, cleanup_err = db:execute("DELETE FROM kickside_mcp_oauth_codes WHERE client_id=$1", {prefix})
            db:release()
            test.is_nil(cleanup_err,tostring(cleanup_err))
        end)

        test.it("bounds idle clients and retired credentials by their existing windows", function()
            local db = assert(sql.get("app:db"))
            local prefix = "retention-stream-" .. uuid.v4()
            local now = time.now():unix()
            for day = 1,96 do
                local _, age_err = db:execute("UPDATE kickside_mcp_oauth_clients SET last_used_at=last_used_at-86400 WHERE client_name=$1",{prefix})
                test.is_nil(age_err,tostring(age_err))
                local _, seed_err = db:execute([[INSERT INTO kickside_mcp_oauth_clients(client_id,client_name,redirect_uris_json,created_at,last_used_at)
                    VALUES ($1,$2,'[]',$3,$3)]],{prefix .. tostring(day),prefix,now})
                test.is_nil(seed_err,tostring(seed_err))
                local _, err = oauth.prune_idle_clients(500)
                test.is_nil(err,tostring(err))
                local rows = assert(db:query("SELECT COUNT(*) AS n FROM kickside_mcp_oauth_clients WHERE client_name=$1",{prefix}))
                test.eq(tonumber(rows[1].n),math.min(day,90))
            end
            for day = 1,36 do
                local _, age_err = db:execute("UPDATE kickside_mcp_credentials SET revoked_at = revoked_at - $1 WHERE actor_id=$2",{86400,prefix})
                test.is_nil(age_err,tostring(age_err))
                local _, seed_err = db:execute([[INSERT INTO kickside_mcp_credentials
                    (credential_id,token_hash,token_prefix,actor_id,status,created_at,updated_at,revoked_at)
                    VALUES ($1,$1,'gc',$2,'revoked',$3,$3,$3)]],{prefix .. tostring(day),prefix,now})
                test.is_nil(seed_err,tostring(seed_err))
                local _, err = credentials.prune_retired(500)
                test.is_nil(err,tostring(err))
                local rows = assert(db:query("SELECT COUNT(*) AS n FROM kickside_mcp_credentials WHERE actor_id=$1",{prefix}))
                test.eq(tonumber(rows[1].n),math.min(day,30))
            end
            local _, client_err = db:execute("DELETE FROM kickside_mcp_oauth_clients WHERE client_name=$1",{prefix})
            local _, credential_err = db:execute("DELETE FROM kickside_mcp_credentials WHERE actor_id=$1",{prefix})
            db:release()
            test.is_nil(client_err,tostring(client_err))
            test.is_nil(credential_err,tostring(credential_err))
        end)

        test.it("defers cleanup until every MCP migration is applied, then resumes", function()
            local db = assert(sql.get("app:db"))
            local id = "install-retention-" .. uuid.v4()
            local held = MIGRATION .. ":held-" .. id
            local _, insert_err = db:execute([[INSERT INTO kickside_mcp_credentials
                (credential_id,token_hash,token_prefix,actor_id,status,created_at,updated_at,expires_at)
                VALUES ($1,$2,'gc','gc-actor','active',1,1,1)]], { id, "hash-" .. id })
            test.is_nil(insert_err)
            local _, hold_err = db:execute("UPDATE _migrations SET id=$1 WHERE id=$2", { held, MIGRATION })
            test.is_nil(hold_err)
            -- Exercise the real registry, hook dispatch and ledger on both engines.
            local ok, err = pcall(function()
                local report, run_err = owner_hooks.run()
                test.is_nil(run_err, tostring(run_err))
                test.eq(#report.failures, 0, "a pending owner migration defers the owner without failing it")
                local rows, query_err = db:query("SELECT COUNT(*) AS n FROM kickside_mcp_credentials WHERE credential_id=$1", { id })
                test.is_nil(query_err)
                test.eq(tonumber(rows[1].n), 1, "pending migration must prevent owner invocation")
            end)
            local _, restore_err = db:execute("UPDATE _migrations SET id=$1 WHERE id=$2", { MIGRATION, held })
            test.is_nil(restore_err)
            if not ok then
                local _, cleanup_err = db:execute("DELETE FROM kickside_mcp_credentials WHERE credential_id=$1", { id })
                db:release()
                test.is_nil(cleanup_err)
                error(err)
            end
            local report, run_err = owner_hooks.run()
            local rows, query_err = db:query("SELECT COUNT(*) AS n FROM kickside_mcp_credentials WHERE credential_id=$1", { id })
            db:release()
            test.is_nil(run_err, tostring(run_err))
            test.eq(#report.failures, 0, "no retention owner fails")
            test.is_true(report.deleted >= 1)
            test.is_nil(query_err)
            test.eq(tonumber(rows[1].n), 0)
        end)

        test.it("reports the owner's actual SQL failure message", function()
            local db = assert(sql.get("app:db"))
            local _, rename_err = db:execute("ALTER TABLE kickside_mcp_oauth_codes RENAME TO retention_test_held_codes")
            test.is_nil(rename_err)
            local ok, report, run_err = pcall(owner_hooks.run)
            local _, restore_err = db:execute("ALTER TABLE retention_test_held_codes RENAME TO kickside_mcp_oauth_codes")
            db:release()
            test.is_nil(restore_err)
            test.is_true(ok, tostring(report))
            test.is_nil(run_err, tostring(run_err))
            local owner_err: any = nil
            for _, failed in ipairs(report.failures) do
                if failed.owner == "kickside.mcp:retention" then owner_err = failed.error end
            end
            test.not_nil(owner_err, "the failing MCP owner is reported")
            test.contains(tostring(owner_err), "kickside_mcp_oauth_codes")
            local address_pos = string.find(tostring(owner_err), "table: 0x", 1, true)
            test.is_nil(address_pos)
        end)
    end)
end)
