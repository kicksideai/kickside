-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("15 group member paging", function()
        for _, engine in ipairs({ "postgres", "sqlite" }) do
            database(engine, function()
                up(function(db)
                    local _, err = db:execute("CREATE INDEX IF NOT EXISTS idx_app_user_groups_group_user ON app_user_groups(group_id, user_id)")
                    if err then error(tostring(err)) end
                end)
            end)
        end
    end)
end)
