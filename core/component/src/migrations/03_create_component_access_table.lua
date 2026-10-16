-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("03 create component access table", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_component_access (
                    "access_id" uuid NOT NULL,
                    "subject_id" text NOT NULL,
                    "component_id" uuid NOT NULL,
                    "source_component_id" text NOT NULL,
                    "access_mask" integer NOT NULL DEFAULT 0,
                    "inherited" integer NOT NULL DEFAULT 0,
                    "subject_type" text NOT NULL,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    CONSTRAINT "chk_kickside_component_access_mask_range" CHECK (access_mask >= 0 AND access_mask <= 15),
                    CONSTRAINT "kickside_component_access_pkey" PRIMARY KEY (access_id),
                    CONSTRAINT "kickside_component_access_component_id_fkey" FOREIGN KEY (component_id) REFERENCES kickside_components(component_id) ON DELETE CASCADE,
                    CONSTRAINT "uq_kickside_component_access_subject" UNIQUE (subject_type, subject_id, component_id, source_component_id),
                    CONSTRAINT "chk_kickside_component_access_subject_type" CHECK (subject_type = ANY (ARRAY['user'::text, 'group'::text, 'service'::text]))
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_access_component_id ON kickside_component_access USING btree (component_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_access_mask ON kickside_component_access USING btree (access_mask)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_access_source ON kickside_component_access USING btree (source_component_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_access_subject_id ON kickside_component_access USING btree (subject_type, subject_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_access_subject_component ON kickside_component_access USING btree (subject_type, subject_id, component_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_access_subject_mask ON kickside_component_access USING btree (subject_type, subject_id, access_mask)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_component_access")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE "kickside_component_access" (access_id TEXT PRIMARY KEY,subject_id TEXT NOT NULL,component_id TEXT NOT NULL,source_component_id TEXT NOT NULL,access_mask INTEGER NOT NULL DEFAULT 0 CHECK (access_mask >= 0 AND access_mask <= 15),inherited INTEGER NOT NULL DEFAULT 0,subject_type TEXT NOT NULL CHECK (subject_type IN ('user', 'group', 'service')),created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),FOREIGN KEY (component_id) REFERENCES "kickside_components"(component_id) ON DELETE CASCADE,UNIQUE(subject_type, subject_id, component_id, source_component_id))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_access_component_id ON "kickside_component_access"(component_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_access_mask ON "kickside_component_access"(access_mask)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_access_source ON "kickside_component_access"(source_component_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_access_subject_id ON "kickside_component_access"(subject_type, subject_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_access_subject_component ON "kickside_component_access"(subject_type, subject_id, component_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_component_access_subject_mask ON "kickside_component_access"(subject_type, subject_id, access_mask)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_component_access")
                if err then error(err) end
            end)
        end)
    end)
end)
