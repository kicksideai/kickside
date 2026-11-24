return require("migration").define(function()
    migration("16 handoff nonces", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function(db)
                    local _, err = db:execute([[
                        CREATE TABLE IF NOT EXISTS app_user_handoff_nonces (
                            nonce TEXT PRIMARY KEY,
                            expires_at BIGINT NOT NULL
                        )
                    ]])
                    if err then error(tostring(err)) end
                end)
                down(function(db)
                    local _, err = db:execute("DROP TABLE IF EXISTS app_user_handoff_nonces")
                    if err then error(tostring(err)) end
                end)
            end)
        end
    end)
end)
