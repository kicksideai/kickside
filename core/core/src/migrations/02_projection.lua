-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("02 projection", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_projection (
                    "id" uuid NOT NULL,
                    "thread_id" uuid NOT NULL,
                    "kind" text NOT NULL,
                    "projection_key" text NOT NULL DEFAULT 'default'::text,
                    "body" jsonb NOT NULL DEFAULT '{}'::jsonb,
                    "state" text NOT NULL DEFAULT 'valid'::text,
                    "last_event_seq" integer NOT NULL DEFAULT 0,
                    "actor_id" text,
                    "actor_context" text,
                    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                    CONSTRAINT "kickside_projection_state_ck" CHECK (state = ANY (ARRAY['valid'::text, 'invalid'::text, 'pending'::text])),
                    CONSTRAINT "kickside_projection_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kickside_projection_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES kickside_thread(id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_thread ON kickside_projection USING btree (thread_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_kind ON kickside_projection USING btree (kind)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_state ON kickside_projection USING btree (state)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_projection_thread_kind_key ON kickside_projection USING btree (thread_id, kind, projection_key)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_projection_updated_at BEFORE UPDATE ON kickside_projection FOR EACH ROW EXECUTE FUNCTION core_set_updated_at()
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_projection_cursor (
                    "id" uuid NOT NULL,
                    "projection_id" uuid NOT NULL,
                    "thread_id" uuid NOT NULL,
                    "cursor_key" text NOT NULL DEFAULT 'default'::text,
                    "last_seq" integer NOT NULL DEFAULT 0,
                    "status" text NOT NULL DEFAULT 'active'::text,
                    "last_error" text,
                    "generation" bigint NOT NULL DEFAULT 1,
                    "debounce_idle_ms" integer NOT NULL DEFAULT 0,
                    "debounce_max_ms" integer NOT NULL DEFAULT 0,
                    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "job_id" uuid,
                    "actor_id" text,
                    "execution_identity_json" text,
                    CONSTRAINT "kickside_projection_cursor_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kickside_projection_cursor_projection_id_cursor_key_key" UNIQUE (projection_id, cursor_key),
                    CONSTRAINT "kickside_projection_cursor_projection_id_fkey" FOREIGN KEY (projection_id) REFERENCES kickside_projection(id) ON DELETE CASCADE,
                    CONSTRAINT "kickside_projection_cursor_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES kickside_thread(id) ON DELETE CASCADE,
                    CONSTRAINT "kickside_projection_cursor_status_ck" CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'invalid'::text])),
                    CONSTRAINT "kickside_projection_cursor_debounce_idle_ck" CHECK (debounce_idle_ms >= 0),
                    CONSTRAINT "kickside_projection_cursor_debounce_max_ck" CHECK (debounce_max_ms >= 0)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_cursor_thread ON kickside_projection_cursor USING btree (thread_id, status)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_cursor_projection ON kickside_projection_cursor USING btree (projection_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_cursor_gen ON kickside_projection_cursor USING btree (projection_id, cursor_key, generation)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_cursor_job ON kickside_projection_cursor USING btree (job_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_projection_cursor_updated_at BEFORE UPDATE ON kickside_projection_cursor FOR EACH ROW EXECUTE FUNCTION core_set_updated_at()
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_projection_cursor")
                if err then error(err) end
                local _, err = db:execute("DROP TABLE kickside_projection")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_projection (
                    id              TEXT PRIMARY KEY,
                    thread_id       TEXT NOT NULL REFERENCES kickside_thread(id) ON DELETE CASCADE,
                    kind            TEXT NOT NULL,
                    projection_key  TEXT NOT NULL DEFAULT 'default',
                    body            TEXT NOT NULL DEFAULT '{}',
                    state           TEXT NOT NULL DEFAULT 'valid' CHECK (state IN ('valid', 'invalid', 'pending')),
                    last_event_seq  INTEGER NOT NULL DEFAULT 0,
                    actor_id        TEXT,
                    actor_context   TEXT,
                    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_thread ON kickside_projection (thread_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_kind ON kickside_projection (kind)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_state ON kickside_projection (state)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_projection_thread_kind_key ON kickside_projection (thread_id, kind, projection_key)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_projection_updated_at
                    AFTER UPDATE ON kickside_projection
                    FOR EACH ROW
                    BEGIN
                    UPDATE kickside_projection SET updated_at = datetime('now') WHERE id = NEW.id;
                    END
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_projection_cursor (
                    id TEXT PRIMARY KEY,
                    projection_id TEXT NOT NULL REFERENCES kickside_projection(id) ON DELETE CASCADE,
                    thread_id TEXT NOT NULL REFERENCES kickside_thread(id) ON DELETE CASCADE,
                    cursor_key TEXT NOT NULL DEFAULT 'default',
                    last_seq INTEGER NOT NULL DEFAULT 0,
                    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','invalid')),
                    generation INTEGER NOT NULL DEFAULT 1,
                    last_error TEXT,
                    debounce_idle_ms INTEGER NOT NULL DEFAULT 0 CHECK(debounce_idle_ms >= 0),
                    debounce_max_ms INTEGER NOT NULL DEFAULT 0 CHECK(debounce_max_ms >= 0),
                    job_id TEXT,
                    actor_id TEXT,
                    execution_identity_json TEXT,
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                    UNIQUE(projection_id,cursor_key)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_cursor_thread ON kickside_projection_cursor(thread_id,status)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_cursor_projection ON kickside_projection_cursor(projection_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_cursor_gen ON kickside_projection_cursor(projection_id,cursor_key,generation)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_projection_cursor_job ON kickside_projection_cursor(job_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_projection_cursor_updated_at
                    AFTER UPDATE ON kickside_projection_cursor FOR EACH ROW
                    BEGIN UPDATE kickside_projection_cursor SET updated_at=datetime('now') WHERE id=NEW.id; END
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_projection_cursor")
                if err then error(err) end
                local _, err = db:execute("DROP TABLE kickside_projection")
                if err then error(err) end
            end)
        end)
    end)
end)
