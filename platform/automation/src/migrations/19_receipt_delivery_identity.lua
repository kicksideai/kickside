-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("19 receipt delivery identity", function()
        for _,dialect in ipairs({"postgres","sqlite"}) do
            database(dialect,function()
                up(function(db)
                    local _,err=db:execute("ALTER TABLE kickside_automation_receipt ADD COLUMN delivery_key TEXT")
                    if err then error(tostring(err)) end
                    local _,declaration_err=db:execute("ALTER TABLE kickside_automation_receipt ADD COLUMN declaration_hash TEXT")
                    if declaration_err then error(tostring(declaration_err)) end
                end)
            end)
        end
    end)
end)
