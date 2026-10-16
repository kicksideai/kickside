local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local owner_hooks = require("owner_hooks")

local MIGRATION = "kickside.mcp.migrations:02_mcp_oauth"

return test.run_cases(function()
    test.describe("retention during MCP installation", function()
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
