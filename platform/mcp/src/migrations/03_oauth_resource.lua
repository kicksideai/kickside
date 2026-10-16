return require("migration").define(function()
    migration("03 oauth resource", function()
        for _, engine in ipairs({ "postgres", "sqlite" }) do
            database(engine, function()
                up(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_mcp_credentials ADD COLUMN oauth_resource TEXT")
                    if err then error(tostring(err)) end
                end)
            end)
        end
    end)
end)
