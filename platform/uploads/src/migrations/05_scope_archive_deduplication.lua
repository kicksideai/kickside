local function execute(db, statement)
    local _, err = db:execute(statement)
    if err then error(tostring(err)) end
end

return require("migration").define(function()
    migration("05 scope archive deduplication", function()
        for _, engine in ipairs({ "sqlite", "postgres" }) do
            database(engine, function()
                up(function(db)
                    execute(db, "ALTER TABLE kickside_uploads ADD COLUMN dedup_scope TEXT NOT NULL DEFAULT ''")
                    if engine == "sqlite" then
                        execute(db, "UPDATE kickside_uploads SET dedup_scope = COALESCE(json_extract(metadata, '$.parent_upload_id'), '') WHERE metadata IS NOT NULL")
                    else
                        execute(db, "UPDATE kickside_uploads SET dedup_scope = COALESCE(metadata::jsonb->>'parent_upload_id', '') WHERE metadata IS NOT NULL")
                    end
                    execute(db, "DROP INDEX idx_kickside_uploads_actor_content")
                    execute(db, "CREATE UNIQUE INDEX idx_kickside_uploads_actor_content ON kickside_uploads(actor_id, content_sha256, dedup_scope) WHERE content_sha256 IS NOT NULL")
                end)
                down(function(db)
                    execute(db, "DROP INDEX idx_kickside_uploads_actor_content")
                    execute(db, "ALTER TABLE kickside_uploads DROP COLUMN dedup_scope")
                    execute(db, "CREATE UNIQUE INDEX idx_kickside_uploads_actor_content ON kickside_uploads(actor_id, content_sha256) WHERE content_sha256 IS NOT NULL")
                end)
            end)
        end
    end)
end)
