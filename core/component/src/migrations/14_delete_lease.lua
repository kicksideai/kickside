return require("migration").define(function()
    migration("14 delete lease", function()
        for _, engine in ipairs({"sqlite", "postgres"}) do
            database(engine, function()
                up(function(db)
                    local query = engine == "postgres"
                        and "SELECT column_name AS name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='kickside_components'"
                        or "PRAGMA table_info(kickside_components)"
                    local rows, read_err = db:query(query)
                    if read_err then error(read_err) end
                    if type(rows) ~= "table" then error("component delete lease migration returned no columns") end
                    local present = {}
                    for _, row in ipairs(rows) do present[row.name] = true end
                    for _, column in ipairs({"lease_token", "lease_until"}) do
                        if not present[column] then
                            local _, err = db:execute("ALTER TABLE kickside_components ADD COLUMN " .. column .. " TEXT")
                            if err then error(err) end
                        end
                    end
                end)
            end)
        end
    end)
end)
