-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local registry = require("registry")
local consts = require("security_consts")
local migration_api = require("migration")

local function retire_generated()
    while true do
        local snapshot, read_err = registry.snapshot()
        if read_err then return nil, read_err end
        local entries, find_err = snapshot:find({[".kind"] = consts.POLICY_KIND,
            ["meta.managed_by"] = consts.MANAGED_BY})
        if find_err then return nil, find_err end
        local changes, count = snapshot:changes(), 0
        for _, entry in ipairs(entries or {}) do
            local meta = entry.meta or {}
            if meta.scope_projection_policy ~= nil or meta.scope_metadata == true then
                changes:delete(tostring(entry.id))
                count = count + 1
                if count == 200 then break end
            end
        end
        if count == 0 then return true, nil end
        local _, apply_err = changes:apply()
        if apply_err then return nil, apply_err end
    end
end

local migrate = migration_api.define(function()
    migration("source policy scopes", function()
        for _, engine in ipairs({"postgres", "sqlite"}) do
            database(engine, function()
                up(function()
                    local done, err = retire_generated()
                    if not done then error(err) end
                end)
            end)
        end
    end)
end)
return {migrate = migrate, retire_generated = retire_generated}
