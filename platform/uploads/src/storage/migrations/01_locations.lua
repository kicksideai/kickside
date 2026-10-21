return require("migration").define(function()
    migration("01 upload storage locations", function()
        local function create(db)
            local _, destination_err = db:execute([[CREATE TABLE kickside_upload_storage_destinations (
                resource_id TEXT PRIMARY KEY, config_id TEXT NOT NULL,
                bucket TEXT NOT NULL, endpoint TEXT NOT NULL
            )]])
            if destination_err then error(tostring(destination_err)) end
            local _, err = db:execute([[CREATE TABLE kickside_upload_storage_locations (
                storage_id TEXT NOT NULL, storage_path TEXT NOT NULL,
                resource_id TEXT NOT NULL, object_key TEXT NOT NULL,
                state TEXT NOT NULL CHECK (state IN ('copying','ready')),
                size BIGINT, verification_digest TEXT, etag TEXT,
                updated_at TEXT NOT NULL,
                PRIMARY KEY (storage_id,storage_path), UNIQUE (resource_id,object_key)
            )]])
            if err then error(tostring(err)) end
            local _, index_err = db:execute([[CREATE INDEX idx_upload_storage_locations_retention
                ON kickside_upload_storage_locations(updated_at,object_key)]])
            if index_err then error(tostring(index_err)) end
        end
        local function drop(db)
            local _, err = db:execute("DROP TABLE kickside_upload_storage_locations")
            if err then error(tostring(err)) end
            local _, destination_err = db:execute("DROP TABLE kickside_upload_storage_destinations")
            if destination_err then error(tostring(destination_err)) end
        end
        database("postgres", function() up(create); down(drop) end)
        database("sqlite", function() up(create); down(drop) end)
    end)
end)
