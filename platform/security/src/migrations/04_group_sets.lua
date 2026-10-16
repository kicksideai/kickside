return require("migration").define(function()
    migration("security named group sets", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function(db)
                    db:execute([[CREATE TABLE kickside_security_group_sets (
                        scope_name TEXT PRIMARY KEY, groups_json TEXT NOT NULL)]])
                end)
                down(function(db)
                    db:execute("DROP TABLE kickside_security_group_sets")
                end)
            end)
        end
    end)
end)
