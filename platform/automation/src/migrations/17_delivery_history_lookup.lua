-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("17 delivery history lookup", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(db)
                    local _,err=db:execute("CREATE INDEX IF NOT EXISTS idx_automation_delivery_history_identity ON kickside_automation_delivery_history"
                        .. " (automation_id,drive_key,source_port,item_key,identity_key,round_at DESC,round_token DESC)")
                    if err then error(tostring(err)) end
                end)
            end)
        end
    end)
end)
