-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("15 prepared settlement index", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(db)
                    local _, err = db:execute([[CREATE INDEX IF NOT EXISTS idx_trigger_ledger_settled_delivery
                        ON kickside_trigger_item_ledger (owner_id, identity_key) WHERE state='resolved']])
                    if err then error(err) end
                end)
            end)
        end
    end)
end)
