-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local function create_indexes(tx)
    local _, principal_err = tx:execute([[CREATE INDEX IF NOT EXISTS idx_kickside_components_custody_principal
        ON kickside_components (owner_kind,owner_id,component_id) WHERE owner_type='principal']])
    if principal_err then error(principal_err) end
    local _, component_err = tx:execute([[CREATE INDEX IF NOT EXISTS idx_kickside_components_custody_component
        ON kickside_components (owner_id,owner_incarnation,component_id) WHERE owner_type='component']])
    if component_err then error(component_err) end
end

return require("migration").define(function()
    migration("20 index typed component custody", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function() up(create_indexes) end)
        end
    end)
end)
