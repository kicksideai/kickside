local migrator = require("migration")
local natural = require("natural_key")
local sql = require("sql")

return function(options)
    local report = {bound=0, already_bound=0, unverifiable=0, reasons={}}
    local result = migrator.run(function()
        migration("11 bind verified legacy natural keys", function()
            for _, dialect in ipairs({"postgres", "sqlite"}) do
                database(dialect, function()
                    up(function(db)
                        local after = nil
                        while true do
                            local rows, err = db:query([[SELECT t.id,k.thread_id AS mapped_id FROM kickside_thread t
                                LEFT JOIN kickside_thread_natural_key k ON k.thread_id=t.id
                                ]] .. (after and "WHERE t.id>$1 " or "") .. "ORDER BY t.id LIMIT 256", after and {after} or {})
                            if err then error(err) end
                            if #rows == 0 then break end
                            for _, row in ipairs(rows) do
                                if row.mapped_id ~= nil then
                                    report.already_bound = report.already_bound + 1
                                else
                                    local adopted, bind_err = natural.adopt_legacy(db,
                                        dialect == "postgres" and sql.type.POSTGRES or sql.type.SQLITE,tostring(row.id))
                                    if bind_err then error(bind_err) end
                                    if adopted.bound then report.bound = report.bound + 1
                                    else
                                        report.unverifiable = report.unverifiable + 1
                                        report.reasons[adopted.reason] = (report.reasons[adopted.reason] or 0) + 1
                                    end
                                end
                            end
                            after = rows[#rows].id
                        end
                    end)
                end)
            end
        end)
    end, options)
    result.natural_keys = report
    return result
end
