-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("06 graph", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_thread_edge (
                    "id" uuid NOT NULL,
                    "from_thread_id" uuid NOT NULL,
                    "to_thread_id" uuid NOT NULL,
                    "edge_type" text NOT NULL,
                    "attrs" jsonb NOT NULL DEFAULT '{}'::jsonb,
                    "source_event_id" uuid,
                    "active" boolean NOT NULL DEFAULT true,
                    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                    CONSTRAINT "kickside_thread_edge_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kickside_thread_edge_from_thread_id_fkey" FOREIGN KEY (from_thread_id) REFERENCES kickside_thread(id) ON DELETE CASCADE,
                    CONSTRAINT "kickside_thread_edge_to_thread_id_fkey" FOREIGN KEY (to_thread_id) REFERENCES kickside_thread(id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_thread_edge_natural ON kickside_thread_edge USING btree (from_thread_id, to_thread_id, edge_type, COALESCE((source_event_id)::text, ''::text))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_thread_edge_from ON kickside_thread_edge USING btree (from_thread_id, edge_type, active)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_thread_edge_to ON kickside_thread_edge USING btree (to_thread_id, edge_type, active)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_thread_edge")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_thread_edge (
                    id              TEXT PRIMARY KEY,
                    from_thread_id  TEXT NOT NULL REFERENCES kickside_thread(id) ON DELETE CASCADE,
                    to_thread_id    TEXT NOT NULL REFERENCES kickside_thread(id) ON DELETE CASCADE,
                    edge_type       TEXT NOT NULL,
                    attrs           TEXT NOT NULL DEFAULT '{}',
                    source_event_id TEXT,
                    active          INTEGER NOT NULL DEFAULT 1,
                    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_thread_edge_natural ON kickside_thread_edge (from_thread_id, to_thread_id, edge_type, COALESCE(source_event_id, ''))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_thread_edge_from ON kickside_thread_edge (from_thread_id, edge_type, active)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_thread_edge_to ON kickside_thread_edge (to_thread_id, edge_type, active)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_thread_edge")
                if err then error(err) end
            end)
        end)
    end)
end)
