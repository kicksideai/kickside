-- Published kickside/core 0.2.6; kickside.core.migrations:01_thread
-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("01 thread", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE OR REPLACE FUNCTION core_set_updated_at()
                    RETURNS trigger
                    LANGUAGE plpgsql
                    AS $function$
                    BEGIN
                    NEW.updated_at = NOW();
                    RETURN NEW;
                    END;
                    $function$
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE OR REPLACE FUNCTION kickside_event_update_guard()
                    RETURNS trigger
                    LANGUAGE plpgsql
                    AS $function$
                    BEGIN
                    RAISE EXCEPTION 'kickside_event rows are immutable';
                    END;
                    $function$
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_thread (
                    "id" uuid NOT NULL,
                    "state" text NOT NULL DEFAULT 'open'::text,
                    "thread_class" text NOT NULL DEFAULT 'conversation'::text,
                    "attrs" jsonb NOT NULL DEFAULT '{}'::jsonb,
                    "event_count" integer NOT NULL DEFAULT 0,
                    "last_event_ts" timestamp with time zone,
                    "component_id" text NOT NULL DEFAULT ''::text,
                    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "max_pruned_seq" bigint NOT NULL DEFAULT 0,
                    "deleting_at" text,
                    "teardown_fence_cursor" text NOT NULL DEFAULT ''::text,
                    "teardown_fence_done" boolean NOT NULL DEFAULT false,
                    "teardown_counts_json" text NOT NULL DEFAULT '{}'::text,
                    "teardown_page_seq" bigint NOT NULL DEFAULT 0,
                    CONSTRAINT "kickside_thread_state_ck" CHECK (state = ANY (ARRAY['open'::text, 'closed'::text, 'archived'::text, 'error'::text])),
                    CONSTRAINT "kickside_thread_event_count_ck" CHECK (event_count >= 0),
                    CONSTRAINT "kickside_thread_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kickside_thread_max_pruned_seq_check" CHECK (max_pruned_seq >= 0)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_thread_state ON kickside_thread USING btree (state)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_thread_last_event ON kickside_thread USING btree (last_event_ts DESC)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_thread_class ON kickside_thread USING btree (thread_class)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_thread_component_id ON kickside_thread USING btree (component_id) WHERE (component_id <> ''::text)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_thread_deleting ON kickside_thread USING btree (deleting_at, id) WHERE (deleting_at IS NOT NULL)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_thread_updated_at BEFORE UPDATE ON kickside_thread FOR EACH ROW EXECUTE FUNCTION core_set_updated_at()
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_event (
                    "id" uuid NOT NULL,
                    "thread_id" uuid NOT NULL,
                    "type" text NOT NULL,
                    "role" text NOT NULL DEFAULT 'system'::text,
                    "body" jsonb NOT NULL DEFAULT '{}'::jsonb,
                    "token_count" integer NOT NULL DEFAULT 0,
                    "seq" integer NOT NULL DEFAULT 0,
                    "content_type" text NOT NULL DEFAULT 'application/json'::text,
                    "content_mode" text NOT NULL DEFAULT 'inline'::text,
                    "content_ref" jsonb,
                    "content_bytes" bigint,
                    "content_hash" text,
                    "external_source" text,
                    "external_id" text,
                    "external_version" text,
                    "trace_id" text,
                    "run_id" text,
                    "caused_by_event_id" uuid,
                    "correlation_key" text,
                    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                    CONSTRAINT "kickside_event_content_mode_ck" CHECK (content_mode = ANY (ARRAY['inline'::text, 'ref'::text, 'hybrid'::text])),
                    CONSTRAINT "kickside_event_content_ref_ck" CHECK (content_mode <> 'ref'::text OR content_ref IS NOT NULL),
                    CONSTRAINT "kickside_event_content_contract_ck" CHECK (content_mode = 'inline'::text AND content_ref IS NULL OR (content_mode = ANY (ARRAY['ref'::text, 'hybrid'::text])) AND content_ref IS NOT NULL),
                    CONSTRAINT "kickside_event_content_ref_object_ck" CHECK (content_ref IS NULL OR jsonb_typeof(content_ref) = 'object'::text),
                    CONSTRAINT "kickside_event_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kickside_event_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES kickside_thread(id) ON DELETE CASCADE
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_type ON kickside_event USING btree (type)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_event_thread_seq ON kickside_event USING btree (thread_id, seq)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_content_type ON kickside_event USING btree (content_type)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_content_hash ON kickside_event USING btree (content_hash) WHERE (content_hash IS NOT NULL)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_external_lookup ON kickside_event USING btree (external_source, external_id, seq) WHERE ((external_source IS NOT NULL) AND (external_id IS NOT NULL))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_trace_created ON kickside_event USING btree (trace_id, created_at, thread_id, seq) WHERE (trace_id IS NOT NULL)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_run_created ON kickside_event USING btree (run_id, created_at, thread_id, seq) WHERE (run_id IS NOT NULL)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_run_match ON kickside_event USING btree (run_id, type, correlation_key, created_at) WHERE (run_id IS NOT NULL)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_cause ON kickside_event USING btree (caused_by_event_id) WHERE (caused_by_event_id IS NOT NULL)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_correlation ON kickside_event USING btree (correlation_key, type, created_at) WHERE (correlation_key IS NOT NULL)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_event_external ON kickside_event USING btree (thread_id, type, external_source, external_id, external_version) WHERE ((external_source IS NOT NULL) AND (external_id IS NOT NULL))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_retention_fresh ON kickside_event USING btree (thread_id, created_at, seq)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_event_immutable BEFORE UPDATE ON kickside_event FOR EACH ROW EXECUTE FUNCTION kickside_event_update_guard()
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_event")
                if err then error(err) end
                local _, err = db:execute("DROP TABLE kickside_thread")
                if err then error(err) end
                local _, err = db:execute("DROP FUNCTION kickside_event_update_guard()")
                if err then error(err) end
                local _, err = db:execute("DROP FUNCTION core_set_updated_at()")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_thread (
                    id              TEXT PRIMARY KEY,
                    state           TEXT NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'closed', 'archived', 'error')),
                    thread_class    TEXT NOT NULL DEFAULT 'conversation',
                    attrs           TEXT NOT NULL DEFAULT '{}',
                    event_count     INTEGER NOT NULL DEFAULT 0 CHECK (event_count >= 0),
                    last_event_ts   TEXT,
                    component_id    TEXT NOT NULL DEFAULT '',
                    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
                    , max_pruned_seq INTEGER NOT NULL DEFAULT 0 CHECK (max_pruned_seq >= 0), deleting_at TEXT, teardown_fence_cursor TEXT NOT NULL DEFAULT '', teardown_fence_done INTEGER NOT NULL DEFAULT 0, teardown_counts_json TEXT NOT NULL DEFAULT '{}', teardown_page_seq INTEGER NOT NULL DEFAULT 0)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_thread_state ON kickside_thread (state)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_thread_last_event ON kickside_thread (last_event_ts DESC)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_thread_class ON kickside_thread (thread_class)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_thread_component_id ON kickside_thread (component_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_thread_updated_at
                    AFTER UPDATE ON kickside_thread
                    FOR EACH ROW
                    BEGIN
                    UPDATE kickside_thread SET updated_at = datetime('now') WHERE id = NEW.id;
                    END
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_event (
                    id                TEXT PRIMARY KEY,
                    thread_id         TEXT NOT NULL REFERENCES kickside_thread(id) ON DELETE CASCADE,
                    type              TEXT NOT NULL,
                    role              TEXT NOT NULL DEFAULT 'system',
                    body              TEXT NOT NULL DEFAULT '{}',
                    token_count       INTEGER NOT NULL DEFAULT 0,
                    seq               INTEGER NOT NULL DEFAULT 0,
                    content_type      TEXT NOT NULL DEFAULT 'application/json',
                    content_mode      TEXT NOT NULL DEFAULT 'inline' CHECK (content_mode IN ('inline', 'ref', 'hybrid')),
                    content_ref       TEXT,
                    content_bytes     INTEGER,
                    content_hash      TEXT,
                    external_source   TEXT,
                    external_id       TEXT,
                    external_version  TEXT,
                    trace_id          TEXT,
                    run_id            TEXT,
                    caused_by_event_id TEXT,
                    correlation_key   TEXT,
                    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_type ON kickside_event (type)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_event_thread_seq ON kickside_event (thread_id, seq)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_content_type ON kickside_event (content_type)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_content_hash ON kickside_event (content_hash) WHERE content_hash IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_external_lookup ON kickside_event (external_source, external_id, seq) WHERE external_source IS NOT NULL AND external_id IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_trace_created ON kickside_event (trace_id, created_at, thread_id, seq) WHERE trace_id IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_run_created ON kickside_event (run_id, created_at, thread_id, seq) WHERE run_id IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_run_match ON kickside_event (run_id, type, correlation_key, created_at) WHERE run_id IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_cause ON kickside_event (caused_by_event_id) WHERE caused_by_event_id IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_correlation ON kickside_event (correlation_key, type, created_at) WHERE correlation_key IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_event_external
                    ON kickside_event (thread_id, type, external_source, external_id, external_version)
                    WHERE external_source IS NOT NULL AND external_id IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_event_immutable
                    BEFORE UPDATE ON kickside_event
                    BEGIN
                    SELECT RAISE(ABORT, 'kickside_event rows are immutable');
                    END
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_event_content_guard_insert
                    BEFORE INSERT ON kickside_event
                    WHEN NEW.content_mode = 'ref' AND NEW.content_ref IS NULL
                    BEGIN
                    SELECT RAISE(ABORT, 'content_ref required when content_mode is ref');
                    END
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_event_content_guard_update
                    BEFORE UPDATE OF content_mode, content_ref ON kickside_event
                    WHEN NEW.content_mode = 'ref' AND NEW.content_ref IS NULL
                    BEGIN
                    SELECT RAISE(ABORT, 'content_ref required when content_mode is ref');
                    END
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_event_retention_fresh
                    ON kickside_event (thread_id, created_at, seq)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_thread_deleting ON kickside_thread(deleting_at,id) WHERE deleting_at IS NOT NULL
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_event")
                if err then error(err) end
                local _, err = db:execute("DROP TABLE kickside_thread")
                if err then error(err) end
            end)
        end)
    end)
end)
