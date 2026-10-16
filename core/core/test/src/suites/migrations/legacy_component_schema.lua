-- Published kickside/component 0.2.5; kickside.component.migrations:01_create_components_table
-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("01 create components table", function()
        database("postgres", function()
            up(function(db)
                local _, extension_err = db:execute("CREATE EXTENSION IF NOT EXISTS ltree")
                if extension_err then error(extension_err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_components (
                    "component_id" uuid NOT NULL,
                    "impl_id" text NOT NULL,
                    "private_context" jsonb DEFAULT '{}'::jsonb,
                    "created_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "updated_at" text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'UTC'::text), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'::text),
                    "parent_id" uuid,
                    "position" text,
                    "path" ltree,
                    "context_revision" bigint NOT NULL DEFAULT 0,
                    "deleting_at" text,
                    "identity_generation" bigint NOT NULL DEFAULT 0,
                    "identity_hash" text,
                    CONSTRAINT "chk_kickside_components_impl_id_nonempty" CHECK (impl_id <> ''::text),
                    CONSTRAINT "kickside_components_pkey" PRIMARY KEY (component_id),
                    CONSTRAINT "kickside_components_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES kickside_components(component_id) ON DELETE SET NULL,
                    CONSTRAINT "chk_kickside_components_position_nonempty" CHECK ("position" IS NULL OR "position" <> ''::text),
                    CONSTRAINT "chk_kickside_components_context_revision_nonneg" CHECK (context_revision >= 0),
                    CONSTRAINT "chk_kickside_components_identity_generation_nonneg" CHECK (identity_generation >= 0)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_components_impl_id ON kickside_components USING btree (impl_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_components_created_at ON kickside_components USING btree (created_at)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_components_updated_at ON kickside_components USING btree (updated_at)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_components_parent_position ON kickside_components USING btree (parent_id, "position")
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_components_path ON kickside_components USING gist (path)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_component_pending_delete ON kickside_components USING btree (deleting_at, component_id) WHERE (deleting_at IS NOT NULL)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_components")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE "kickside_components" (
                    component_id TEXT PRIMARY KEY,
                    impl_id TEXT NOT NULL CHECK (impl_id <> ''),
                    private_context TEXT DEFAULT '{}',
                    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
                    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
                    , parent_id TEXT REFERENCES "kickside_components"(component_id) ON DELETE SET NULL, position TEXT CHECK (position IS NULL OR position <> ''), path TEXT, context_revision INTEGER NOT NULL DEFAULT 0 CHECK (context_revision >= 0), deleting_at TEXT, identity_generation INTEGER NOT NULL DEFAULT 0 CHECK (identity_generation >= 0), identity_hash TEXT)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_components_impl_id ON "kickside_components"(impl_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_components_created_at ON "kickside_components"(created_at)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_components_updated_at ON "kickside_components"(updated_at)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_components_parent_position ON "kickside_components"(parent_id, position)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_components_path ON "kickside_components"(path)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_component_pending_delete
                    ON "kickside_components"(deleting_at,component_id)
                    WHERE deleting_at IS NOT NULL
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_components")
                if err then error(err) end
            end)
        end)
    end)
end)
