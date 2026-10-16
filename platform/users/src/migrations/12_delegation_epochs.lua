return require("migration").define(function()
    migration("12 delegation epochs", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function(db)
                    local _, err = db:execute([[
                        CREATE TABLE app_user_delegation_epochs (
                            user_id TEXT PRIMARY KEY,
                            generation BIGINT NOT NULL CHECK (generation >= 0)
                        )
                    ]])
                    if err then error(tostring(err)) end
                end)
            end)
        end
    end)
end)
