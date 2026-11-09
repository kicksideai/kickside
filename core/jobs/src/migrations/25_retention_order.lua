-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local run_status = require("run_status")

return require("migration").define(function()
    migration("25 global Jobs retention order", function()
        for _, dialect in ipairs({ "postgres", "sqlite" }) do
            database(dialect, function()
                up(function(db)
                    -- SQLite orders equal index timestamps by the implicit rowid.
                    local ordered = dialect == "sqlite" and "finished_at" or "finished_at,id"
                    local statements = {
                        "CREATE INDEX IF NOT EXISTS idx_job_global_retention ON kickside_job(" .. ordered
                            .. ") WHERE status IN ('done','dead','cancelled') AND finished_at IS NOT NULL",
                        "CREATE INDEX IF NOT EXISTS idx_job_run_global_retention ON kickside_job_run(" .. ordered .. ") WHERE "
                            .. run_status.terminal_predicate() .. " AND finished_at IS NOT NULL",
                        [[CREATE INDEX IF NOT EXISTS idx_job_cleanup_receipt_order
                            ON kickside_job_thread_cleanup_receipt(acknowledged_at,thread_id,page_seq)
                            WHERE acknowledged_at IS NOT NULL]],
                        [[CREATE INDEX IF NOT EXISTS idx_job_cleanup_completed_order
                            ON kickside_job_thread_cleanup(completed_at,thread_id)
                            WHERE completed_at IS NOT NULL]],
                    }
                    for _, statement in ipairs(statements) do
                        local _, err = db:execute(statement)
                        if err then error(err) end
                    end
                end)
            end)
        end
    end)
end)
