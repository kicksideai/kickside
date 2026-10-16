return require("migration").define(function()
    migration("04 authority snapshot", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function(db)
                    local _, err = db:execute("ALTER TABLE kickside_mcp_credentials ADD COLUMN authority_json TEXT")
                    if err then error(tostring(err)) end
                end)
            end)
        end
    end)
end)
