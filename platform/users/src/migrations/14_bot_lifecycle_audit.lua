return require("migration").define(function()
    migration("14 bot lifecycle audit", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function(db)
                    local _, err = db:execute([[
                        CREATE TABLE app_user_bot_audit (
                            audit_id TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL,
                            actor_id TEXT NOT NULL,
                            operation TEXT NOT NULL,
                            payload TEXT NOT NULL,
                            created_at TEXT NOT NULL
                        )
                    ]])
                    if err then error(tostring(err)) end
                    local _, index_err = db:execute([[
                        CREATE INDEX idx_app_user_bot_audit_user ON app_user_bot_audit(user_id, created_at)
                    ]])
                    if index_err then error(tostring(index_err)) end
                end)
            end)
        end
    end)
end)
