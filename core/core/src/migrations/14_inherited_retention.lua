-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local migration_runner = require("migration")
local registry = require("registry")

local function migrate(options)
    local report = {converted=0,preserved=0}
    local result = migration_runner.run(function()
        migration("14 inherited retention", function()
            for _, dialect in ipairs({"postgres","sqlite"}) do
                database(dialect, function()
                    up(function(tx, checkpoint)
                        local rows, read_err = tx:query([[SELECT p.thread_id,c.impl_id,
                            CASE WHEN p.event_hot_retention_days=90 AND p.updated_at=p.created_at THEN 1 ELSE 0 END AS frozen
                            FROM kickside_retention_policy p
                            LEFT JOIN kickside_components c ON c.component_id=p.thread_id
                            ]] .. (checkpoint and "WHERE p.thread_id>$1 " or "")
                            .. "ORDER BY p.thread_id LIMIT 256" .. (dialect == "postgres" and " FOR UPDATE OF p" or ""),
                            checkpoint and {checkpoint} or {})
                        if read_err then error(read_err) end
                        for _, row in ipairs(rows) do
                            local inherit = false
                            if tonumber(row.frozen)==1 and type(row.impl_id)=="string" and row.impl_id~="" then
                                local entry, entry_err = registry.get(row.impl_id)
                                if entry_err and not errors.is(entry_err,errors.NOT_FOUND) then error(entry_err) end
                                -- A missing declaration provides no proof that the stored window is a default.
                                if entry then
                                    local meta = type(entry.meta)=="table" and entry.meta or {}
                                    local retention = type(meta.retention)=="table" and meta.retention or {}
                                    inherit = retention.event_days==nil
                                    if inherit then
                                        local descriptors, find_err = registry.find({["meta.impl_id"]=row.impl_id})
                                        if find_err then error(find_err) end
                                        if not descriptors then error("retention declaration discovery returns no entries") end
                                        for _, descriptor in ipairs(descriptors) do
                                            local declared = type(descriptor.meta)=="table" and descriptor.meta.retention or nil
                                            if type(declared)=="table" and declared.event_days~=nil then inherit=false end
                                        end
                                    end
                                end
                            end
                            if inherit then
                                local _, update_err = tx:execute([[UPDATE kickside_retention_policy
                                    SET event_hot_retention_days=NULL WHERE thread_id=$1]],{row.thread_id})
                                if update_err then error(update_err) end
                                report.converted = report.converted+1
                            else report.preserved = report.preserved+1 end
                        end
                        if #rows<256 then return nil end
                        return tostring(rows[#rows].thread_id)
                    end,"batch")
                end)
            end
        end)
    end,options)
    result.retention = report
    return result
end

return {migrate=migrate}
