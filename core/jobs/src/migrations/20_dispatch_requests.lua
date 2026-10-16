return require("migration").define(function()
    migration("20 addressed dispatch requests", function()
        for _, dialect in ipairs({ "postgres", "sqlite" }) do
            database(dialect, function()
                up(function(db)
                    local timestamp = dialect == "postgres" and "TIMESTAMP WITH TIME ZONE" or "TEXT"
                    local _, err = db:execute("ALTER TABLE kickside_job ADD COLUMN dispatch_requested_at " .. timestamp)
                    if err then error(err) end
                    for _, statement in ipairs({
                        "CREATE INDEX idx_job_dispatch_request ON kickside_job(queue_tier,dispatch_requested_at,id) WHERE status='pending' AND dispatch_requested_at IS NOT NULL",
                        "CREATE INDEX idx_job_due_pick ON kickside_job(queue_tier,scheduled_at,priority DESC,concurrency_key,id) WHERE status='pending' AND scheduled_at IS NOT NULL",
                        "CREATE INDEX idx_job_pending_deadline ON kickside_job(scheduled_at) WHERE status='pending' AND scheduled_at IS NOT NULL",
                    }) do
                        local _, index_err = db:execute(statement)
                        if index_err then error(index_err) end
                    end
                end)
                down(function(db)
                    for _, statement in ipairs({
                        "DROP INDEX idx_job_pending_deadline", "DROP INDEX idx_job_due_pick", "DROP INDEX idx_job_dispatch_request",
                        "ALTER TABLE kickside_job DROP COLUMN dispatch_requested_at",
                    }) do
                        local _, err = db:execute(statement)
                        if err then error(err) end
                    end
                end)
            end)
        end
    end)
end)
