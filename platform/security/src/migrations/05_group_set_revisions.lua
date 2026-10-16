return require("migration").define(function()
    migration("security named group set projection revisions", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function(db)
                    db:execute("ALTER TABLE kickside_security_group_sets ADD COLUMN materialized_revision TEXT")
                end)
                down(function(db)
                    db:execute("ALTER TABLE kickside_security_group_sets DROP COLUMN materialized_revision")
                end)
            end)
        end
    end)
end)
