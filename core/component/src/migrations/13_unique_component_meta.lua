local function execute(db: any, statement: string)
    local _, err = db:execute(statement)
    if err then
        error(errors.wrap(err, "component public metadata uniqueness"))
    end
end

return require("migration").define(function()
    migration("13 unique component meta", function()
        for _, engine in ipairs({ "sqlite", "postgres" }) do
            database(engine, function()
                up(function(db)
                    if engine == "postgres" then
                        execute(db, "CREATE UNIQUE INDEX idx_kickside_component_meta_component_key_unique ON kickside_component_meta(component_id, key)")
                        execute(db, "DROP INDEX idx_kickside_component_meta_component_key")
                        execute(db, "ALTER INDEX idx_kickside_component_meta_component_key_unique RENAME TO idx_kickside_component_meta_component_key")
                    else
                        execute(db, "DROP INDEX idx_kickside_component_meta_component_key")
                        execute(db, "CREATE UNIQUE INDEX idx_kickside_component_meta_component_key ON kickside_component_meta(component_id, key)")
                    end
                end)
                down(function(db)
                    execute(db, "DROP INDEX idx_kickside_component_meta_component_key")
                    execute(db, "CREATE INDEX idx_kickside_component_meta_component_key ON kickside_component_meta(component_id, key)")
                end)
            end)
        end
    end)
end)
