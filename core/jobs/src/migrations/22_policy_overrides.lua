return require("migration").define(function()
    migration("22 Jobs policy overrides", function()
        for _, dialect in ipairs({ "postgres", "sqlite" }) do
            database(dialect, function()
                up(function(db)
                    for _, statement in ipairs({
                        "ALTER TABLE kickside_job ADD COLUMN lease_policy TEXT",
                        "CREATE TABLE kickside_job_policy_override (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)",
                        "CREATE TABLE kickside_job_policy_revision (id INTEGER PRIMARY KEY CHECK (id=1), revision BIGINT NOT NULL)",
                        "INSERT INTO kickside_job_policy_revision (id,revision) VALUES (1,0)",
                        [[CREATE TABLE kickside_job_pool_applied (id INTEGER PRIMARY KEY CHECK (id=1),
                            applied_revision BIGINT NOT NULL, total INTEGER NOT NULL, general INTEGER NOT NULL,
                            awaited INTEGER NOT NULL, database TEXT, apply_error TEXT, updated_at ]] .. (dialect == "postgres"
                            and "timestamp with time zone NOT NULL DEFAULT now())" or "TEXT NOT NULL DEFAULT (datetime('now')))"),
                        "INSERT INTO kickside_job_pool_applied (id,applied_revision,total,general,awaited) VALUES (1,-1,0,0,0)",
                    }) do
                        local _, err = db:execute(statement)
                        if err then error(err) end
                    end
                end)
                down(function(db)
                    for _, statement in ipairs({"DROP TABLE kickside_job_pool_applied", "DROP TABLE kickside_job_policy_override", "DROP TABLE kickside_job_policy_revision", "ALTER TABLE kickside_job DROP COLUMN lease_policy"}) do
                        local _, err = db:execute(statement)
                        if err then error(err) end
                    end
                end)
            end)
        end
    end)
end)
