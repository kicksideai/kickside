-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("02 create component meta table", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_component_meta (
                    "meta_id" uuid NOT NULL,
                    "component_id" uuid NOT NULL,
                    "key" text NOT NULL,
                    "value" text,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "updated_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    CONSTRAINT "kickside_component_meta_pkey" PRIMARY KEY (meta_id),
                    CONSTRAINT "kickside_component_meta_component_id_fkey" FOREIGN KEY (component_id) REFERENCES kickside_components(component_id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_meta_component_id ON kickside_component_meta USING btree (component_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_meta_key ON kickside_component_meta USING btree (key)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_meta_value ON kickside_component_meta USING btree (value)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_meta_key_value ON kickside_component_meta USING btree (key, value)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_meta_component_key ON kickside_component_meta USING btree (component_id, key)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_component_meta")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE "kickside_component_meta" (
                    meta_id TEXT PRIMARY KEY,
                    component_id TEXT NOT NULL,
                    key TEXT NOT NULL,
                    value TEXT,
                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    FOREIGN KEY (component_id) REFERENCES "kickside_components"(component_id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_meta_component_id ON "kickside_component_meta"(component_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_meta_key ON "kickside_component_meta"(key)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_meta_value ON "kickside_component_meta"(value)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_meta_key_value ON "kickside_component_meta"(key, value)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_meta_component_key ON "kickside_component_meta"(component_id, key)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_component_meta")
                if err then error(err) end
            end)
        end)
    end)
end)
