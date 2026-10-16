local cancel = require("lifecycle_cancel")
local sql = require("sql")

return require("migration").define(function()
    migration("21 retire upload intent maintenance slot", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(db)
                    while true do
                        local rows, err = db:query([[SELECT id FROM kickside_job
                            WHERE job_type='kickside.uploads.service:intent_reconcile'
                            AND status='pending' ORDER BY id LIMIT 256]])
                        if err then error(err) end
                        if #rows == 0 then break end
                        for _, row in ipairs(rows) do
                            local cancelled, cancel_err = cancel.cancel_job_tx(db,
                                dialect == "postgres" and sql.type.POSTGRES or sql.type.SQLITE,
                                {id=tostring(row.id)})
                            if cancel_err then error(cancel_err) end
                            if not cancelled then error("retired upload intent slot remains pending") end
                        end
                    end
                end)
            end)
        end
    end)
end)
