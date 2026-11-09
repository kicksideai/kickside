-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("18 ledger eligibility", function()
        for _,dialect in ipairs({"postgres","sqlite"}) do
            database(dialect,function()
                up(function(db)
                    local _,err=db:execute([[CREATE INDEX idx_trigger_ledger_front ON kickside_trigger_item_ledger
                        (owner_id,source_port,item_key,delivery_order,identity_key)
                        WHERE state IN ('retrying','waiting','uncertain','parked')]])
                    if err then error(tostring(err)) end
                    local _,identity_err=db:execute([[CREATE INDEX idx_trigger_ledger_identity ON kickside_trigger_item_ledger
                        (owner_id,identity_key,source_port)]])
                    if identity_err then error(tostring(identity_err)) end
                    local _,retention_err=db:execute([[CREATE INDEX idx_trigger_ledger_legacy_retention ON kickside_trigger_item_ledger
                        (updated_at,owner_id,source_port,item_key,identity_key)
                        WHERE state IN ('resolved','dead') AND expires_at IS NULL]])
                    if retention_err then error(tostring(retention_err)) end
                end)
            end)
        end
    end)
end)
