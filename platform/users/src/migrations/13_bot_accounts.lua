return require("migration").define(function()
    migration("13 bot accounts", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function(db)
                    local _, err = db:execute([[
                        CREATE TABLE app_user_bot_accounts (
                            user_id TEXT PRIMARY KEY REFERENCES app_users(user_id),
                            created_by TEXT NOT NULL,
                            created_at TEXT NOT NULL
                        )
                    ]])
                    if err then error(tostring(err)) end
                end)
            end)
        end
    end)
end)
