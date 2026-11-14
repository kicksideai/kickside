return require("migration").define(function()
    migration("26 identity lookup", function()
        for _, engine in ipairs({"sqlite", "postgres"}) do
            database(engine, function()
                up(function(db)
                    local _, err = db:execute("CREATE INDEX IF NOT EXISTS idx_job_identity ON kickside_job(job_identity,id)")
                    if err then error(err) end
                end)
            end)
        end
    end)
end)
