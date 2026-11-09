-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("04 jobs", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_job (
                    "id" uuid NOT NULL,
                    "thread_id" uuid,
                    "job_type" text NOT NULL,
                    "worker_ref" text,
                    "concurrency_key" text,
                    "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
                    "status" text NOT NULL DEFAULT 'pending'::text,
                    "priority" integer NOT NULL DEFAULT 0,
                    "attempts" integer NOT NULL DEFAULT 0,
                    "max_attempts" integer NOT NULL DEFAULT 3,
                    "queue_tier" text NOT NULL DEFAULT 'live'::text,
                    "idempotency_key" text,
                    "last_error" text,
                    "lease_token" text,
                    "lease_until" timestamp with time zone,
                    "heartbeat_at" timestamp with time zone,
                    "actor_id" text,
                    "actor_context" jsonb DEFAULT '{}'::jsonb,
                    "generation" bigint NOT NULL DEFAULT 1,
                    "finished_at" timestamp with time zone,
                    "scheduled_at" timestamp with time zone,
                    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "job_identity" text NOT NULL,
                    "slot" boolean NOT NULL DEFAULT false,
                    "wake_key" text,
                    "wake_enabled" boolean NOT NULL DEFAULT true,
                    "wake_demand_at" timestamp with time zone,
                    "wake_generation" bigint NOT NULL DEFAULT 0,
                    "wake_control_pending" boolean NOT NULL DEFAULT false,
                    "execution_seq" bigint NOT NULL DEFAULT 0,
                    "registry_version" text,
                    "owner_kind" text NOT NULL,
                    "owner_id" text NOT NULL,
                    CONSTRAINT "kickside_job_queue_tier_ck" CHECK (queue_tier = ANY (ARRAY['live'::text, 'backfill'::text, 'maintenance'::text])),
                    CONSTRAINT "kickside_job_generation_ck" CHECK (generation >= 1),
                    CONSTRAINT "kickside_job_status_ck" CHECK (status = ANY (ARRAY['pending'::text, 'running'::text, 'done'::text, 'dead'::text, 'cancelled'::text])),
                    CONSTRAINT "kickside_job_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kickside_job_identity_ck" CHECK (job_identity <> ''::text)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_status ON kickside_job USING btree (status, priority DESC, scheduled_at)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_thread ON kickside_job USING btree (thread_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_type ON kickside_job USING btree (job_type)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_queue_pick ON kickside_job USING btree (status, scheduled_at, queue_tier, priority DESC)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_job_running_concurrency ON kickside_job USING btree (concurrency_key) WHERE ((concurrency_key IS NOT NULL) AND (status = 'running'::text))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_lease_reap ON kickside_job USING btree (lease_until) WHERE ((status = 'running'::text) AND (lease_until IS NOT NULL))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_retention ON kickside_job USING btree (thread_id, finished_at, id) WHERE ((status = ANY (ARRAY['done'::text, 'dead'::text, 'cancelled'::text])) AND (finished_at IS NOT NULL))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_wake_subscriber ON kickside_job USING btree (wake_key, id) WHERE ((status = ANY (ARRAY['pending'::text, 'running'::text])) AND (wake_key IS NOT NULL))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_job_owner_scope ON kickside_job USING btree (owner_kind, owner_id, id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_job_active_identity ON kickside_job USING btree (job_identity) WHERE (status = ANY (ARRAY['pending'::text, 'running'::text]))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_due_tier ON kickside_job USING btree (queue_tier, scheduled_at, id) WHERE ((status = 'pending'::text) AND (scheduled_at IS NOT NULL))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_wake_key ON kickside_job USING btree (wake_key, id) WHERE ((status = ANY (ARRAY['pending'::text, 'running'::text])) AND (wake_enabled = true))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_wake_remaining ON kickside_job USING btree (wake_key, wake_generation, id) WHERE ((status = ANY (ARRAY['pending'::text, 'running'::text])) AND (wake_enabled = true))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE OR REPLACE FUNCTION kickside_jobs_set_updated_at()
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
                    CREATE TRIGGER trg_kickside_job_updated_at BEFORE UPDATE ON kickside_job FOR EACH ROW EXECUTE FUNCTION kickside_jobs_set_updated_at()
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_job_run (
                    "id" uuid NOT NULL,
                    "job_id" uuid NOT NULL,
                    "thread_id" uuid,
                    "job_type" text NOT NULL,
                    "attempt_no" integer NOT NULL,
                    "worker_pid" text,
                    "lease_token" text,
                    "status" text NOT NULL DEFAULT 'running'::text,
                    "started_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "finished_at" timestamp with time zone,
                    "duration_ms" integer,
                    "error_text" text,
                    "result_json" text NOT NULL DEFAULT '{}'::text,
                    "actions_json" text NOT NULL DEFAULT '{}'::text,
                    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
                    "execution_seq" bigint NOT NULL,
                    "owner_kind" text NOT NULL,
                    "owner_id" text NOT NULL,
                    CONSTRAINT "kickside_job_run_attempt_no_ck" CHECK (attempt_no >= 1),
                    CONSTRAINT "kickside_job_run_pkey" PRIMARY KEY (id),
                    CONSTRAINT "kickside_job_run_job_id_fkey" FOREIGN KEY (job_id) REFERENCES kickside_job(id) ON DELETE CASCADE,
                    CONSTRAINT "kickside_job_run_status_ck" CHECK (status = ANY (ARRAY['running'::text, 'success'::text, 'failed'::text, 'lease_lost'::text, 'skipped'::text, 'completed'::text, 'parked'::text]))
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_run_thread_started ON kickside_job_run USING btree (thread_id, started_at DESC)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_run_job_attempt ON kickside_job_run USING btree (job_id, attempt_no DESC)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_run_status ON kickside_job_run USING btree (status, started_at DESC)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_run_retention ON kickside_job_run USING btree (thread_id, finished_at, id) WHERE ((status = ANY (ARRAY['success'::text, 'failed'::text, 'lease_lost'::text, 'skipped'::text, 'completed'::text, 'parked'::text])) AND (finished_at IS NOT NULL))
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_job_run_owner_scope ON kickside_job_run USING btree (owner_kind, owner_id, id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_job_run_execution ON kickside_job_run USING btree (job_id, execution_seq)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_job_run")
                if err then error(err) end
                local _, err = db:execute("DROP TABLE kickside_job")
                if err then error(err) end
                local _, err = db:execute("DROP FUNCTION IF EXISTS kickside_jobs_set_updated_at()")
                if err then error(err) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE "kickside_job" (
                    id TEXT PRIMARY KEY,
                    thread_id TEXT,
                    job_type TEXT NOT NULL,
                    worker_ref TEXT,
                    concurrency_key TEXT,
                    payload TEXT NOT NULL DEFAULT '{}',
                    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','done','dead','cancelled')),
                    priority INTEGER NOT NULL DEFAULT 0,
                    attempts INTEGER NOT NULL DEFAULT 0,
                    max_attempts INTEGER NOT NULL DEFAULT 3,
                    queue_tier TEXT NOT NULL DEFAULT 'live' CHECK (queue_tier IN ('live','backfill','maintenance')),
                    idempotency_key TEXT,
                    last_error TEXT,
                    lease_token TEXT,
                    lease_until TEXT,
                    heartbeat_at TEXT,
                    actor_id TEXT,
                    actor_context TEXT DEFAULT '{}',
                    generation INTEGER NOT NULL DEFAULT 1 CHECK (generation >= 1),
                    finished_at TEXT,
                    scheduled_at TEXT,
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                    job_identity TEXT NOT NULL CHECK (job_identity <> ''),
                    slot INTEGER NOT NULL DEFAULT 0 CHECK (slot IN (0,1)),
                    wake_key TEXT,
                    wake_enabled INTEGER NOT NULL DEFAULT 1 CHECK (wake_enabled IN (0,1)),
                    wake_demand_at TEXT,
                    wake_generation INTEGER NOT NULL DEFAULT 0,
                    wake_control_pending INTEGER NOT NULL DEFAULT 0 CHECK (wake_control_pending IN (0,1)),
                    execution_seq INTEGER NOT NULL DEFAULT 0,
                    registry_version TEXT
                    , owner_kind TEXT NOT NULL, owner_id TEXT NOT NULL)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TABLE "kickside_job_run" (
                    id TEXT PRIMARY KEY,
                    job_id TEXT NOT NULL REFERENCES "kickside_job"(id) ON DELETE CASCADE,
                    thread_id TEXT,
                    job_type TEXT NOT NULL,
                    attempt_no INTEGER NOT NULL CHECK (attempt_no >= 1),
                    worker_pid TEXT,
                    lease_token TEXT,
                    status TEXT NOT NULL DEFAULT 'running'
                    CHECK (status IN ('running','success','failed','lease_lost','skipped','completed','parked')),
                    started_at TEXT NOT NULL DEFAULT (datetime('now')),
                    finished_at TEXT,
                    duration_ms INTEGER,
                    error_text TEXT,
                    result_json TEXT NOT NULL DEFAULT '{}',
                    actions_json TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                    execution_seq INTEGER NOT NULL, owner_kind TEXT NOT NULL, owner_id TEXT NOT NULL,
                    UNIQUE (job_id,execution_seq)
                    )
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_retention ON "kickside_job"(thread_id,finished_at,id)
                    WHERE status IN ('done','dead','cancelled') AND finished_at IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_run_retention ON "kickside_job_run"(thread_id,finished_at,id)
                    WHERE status IN ('success','failed','lease_lost','skipped','completed','parked') AND finished_at IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_wake_subscriber ON "kickside_job"(wake_key,id)
                    WHERE status IN ('pending','running') AND wake_key IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_job_owner_scope ON "kickside_job"(owner_kind,owner_id,id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_job_run_owner_scope ON "kickside_job_run"(owner_kind,owner_id,id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_status ON kickside_job (status, priority DESC, scheduled_at)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_thread ON kickside_job (thread_id)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_type ON kickside_job (job_type)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_queue_pick ON kickside_job (status, scheduled_at, queue_tier, priority DESC)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_job_active_identity ON kickside_job (job_identity) WHERE status IN ('pending','running')
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_kickside_job_running_concurrency ON kickside_job (concurrency_key) WHERE concurrency_key IS NOT NULL AND status = 'running'
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_lease_reap ON kickside_job (lease_until) WHERE status = 'running' AND lease_until IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_due_tier ON kickside_job (queue_tier, scheduled_at, id) WHERE status = 'pending' AND scheduled_at IS NOT NULL
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_wake_key ON kickside_job (wake_key, id) WHERE status IN ('pending','running') AND wake_enabled = 1
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_wake_remaining ON kickside_job (wake_key, wake_generation, id) WHERE status IN ('pending','running') AND wake_enabled = 1
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE TRIGGER trg_kickside_job_updated_at AFTER UPDATE ON kickside_job FOR EACH ROW
                    BEGIN UPDATE kickside_job SET updated_at = datetime('now') WHERE id = NEW.id; END
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_run_thread_started ON kickside_job_run (thread_id, started_at DESC)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_run_job_attempt ON kickside_job_run (job_id, attempt_no DESC)
                ]=])
                if err then error(err) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_kickside_job_run_status ON kickside_job_run (status, started_at DESC)
                ]=])
                if err then error(err) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_job_run")
                if err then error(err) end
                local _, err = db:execute("DROP TABLE kickside_job")
                if err then error(err) end
            end)
        end)
    end)
end)
