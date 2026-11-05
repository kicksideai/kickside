return require("migration").define(function()
    migration("13 thread event read", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_thread ADD COLUMN event_read TEXT NOT NULL DEFAULT ''")
                    if err then error(err) end
                end)
                down(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_thread DROP COLUMN event_read")
                    if err then error(err) end
                end)
            end)
        end
    end)
end)
