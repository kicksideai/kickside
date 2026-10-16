return require("migration").define(function()
    migration("09 thread subjects", function()
        for _, dialect in ipairs({ "postgres", "sqlite" }) do
            database(dialect, function()
                up(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_event ADD COLUMN subject TEXT")
                    if err then error(err) end
                    local _, err = db:execute("ALTER TABLE kickside_event ADD COLUMN subject_version INTEGER CHECK(subject_version > 0)")
                    if err then error(err) end
                    local _, err = db:execute([[CREATE UNIQUE INDEX idx_event_subject_version
                        ON kickside_event(thread_id, subject, subject_version) WHERE subject IS NOT NULL]])
                    if err then error(err) end
                    local id_type = dialect == "postgres" and "UUID" or "TEXT"
                    local _, err = db:execute([[CREATE TABLE kickside_thread_subject (
                        thread_id ]] .. id_type .. [[ NOT NULL REFERENCES kickside_thread(id) ON DELETE CASCADE,
                        subject TEXT NOT NULL,
                        version INTEGER NOT NULL CHECK(version > 0),
                        last_seq INTEGER NOT NULL CHECK(last_seq > 0),
                        updated_at TEXT NOT NULL,
                        PRIMARY KEY(thread_id, subject))]])
                    if err then error(err) end
                end)
                down(function(db)
                    for _, statement in ipairs({ "DROP TABLE kickside_thread_subject",
                        "DROP INDEX idx_event_subject_version",
                        "ALTER TABLE kickside_event DROP COLUMN subject_version",
                        "ALTER TABLE kickside_event DROP COLUMN subject" }) do
                        local _, err = db:execute(statement)
                        if err then error(err) end
                    end
                end)
            end)
        end
    end)
end)
