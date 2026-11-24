-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("platform model key usage per month", function()
        for _, engine in ipairs({ "sqlite", "postgres" }) do
            database(engine, function()
                up(function(db)
                    local _, err = db:execute([[
                        CREATE TABLE IF NOT EXISTS kickside_model_platform_usage (
                            month TEXT PRIMARY KEY,
                            tokens BIGINT NOT NULL DEFAULT 0
                        )
                    ]])
                    if err then error(err) end
                    return true
                end)
            end)
        end
    end)
end)
