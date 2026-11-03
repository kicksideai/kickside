-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local sql = require("sql")
local funcs = require("funcs")
local uuid = require("uuid")

local function run()
    test.describe("Optional retry field migration", function()
        test.it("preserves earlier node data and resumes an incomplete additive upgrade", function()
            local db, db_err = sql.get("app:retry_upgrade_db")
            test.is_nil(db_err)
            local function execute(statement, params)
                local _, err = db:execute(statement, params or {})
                test.is_nil(err, tostring(err))
            end
            execute([[CREATE TABLE workflow_def_nodes (
                workflow_id TEXT NOT NULL, id TEXT NOT NULL, kind TEXT NOT NULL,
                ref TEXT, title TEXT, config TEXT NOT NULL DEFAULT '{}', status TEXT NOT NULL DEFAULT 'active',
                created_by TEXT, created_at TEXT, updated_at TEXT, PRIMARY KEY(workflow_id, id))]])
            execute("CREATE TABLE workflow_versions (workflow_id TEXT, document TEXT, compiled_commands TEXT)")
            execute("INSERT INTO workflow_def_nodes (workflow_id,id,kind,ref,title,config) VALUES ($1,$2,$3,$4,$5,$6)",
                {"example-workflow", "step", "block", "example:run", "Existing step", '{"limit":4}'})
            execute("INSERT INTO workflow_versions VALUES ($1,$2,$3)", {"example-workflow", '{"nodes":[]}', '[]'})
            -- A partially applied upgrade retains the existing optional column.
            execute("ALTER TABLE workflow_def_nodes ADD COLUMN retry_policy TEXT NOT NULL DEFAULT 'null'")
            local function migrate()
                local result, err = funcs.call("kickside.workflows.migrations:07_retry_policy", {
                    database_id = "app:retry_upgrade_db", direction = "up", id = uuid.v4()})
                test.is_nil(err, tostring(err))
                test.eq(result.failed, 0, tostring(result.error))
            end
            migrate()
            local rows, err = db:query("SELECT * FROM workflow_def_nodes")
            test.is_nil(err)
            test.eq(#rows, 1)
            test.eq(rows[1].config, '{"limit":4}')
            test.eq(rows[1].title, "Existing step")
            test.eq(rows[1].retry_policy, "null")
            test.eq(rows[1].start_to_close_timeout, "null")
            test.eq(rows[1].schedule_to_close_timeout, "null")
            execute("UPDATE workflow_def_nodes SET retry_policy=$1", {'{"maximum_attempts":3}'})
            migrate()
            rows, err = db:query("SELECT retry_policy FROM workflow_def_nodes")
            test.is_nil(err)
            test.eq(rows[1].retry_policy, '{"maximum_attempts":3}')
            rows, err = db:query("SELECT * FROM workflow_versions")
            test.is_nil(err)
            test.eq(rows[1].document, '{"nodes":[]}')
            test.eq(rows[1].compiled_commands, '[]')
            execute("DROP TABLE workflow_def_nodes")
            execute("DROP TABLE workflow_versions")
            db:release()
        end)
    end)
end
return {run = test.run_cases(run)}
