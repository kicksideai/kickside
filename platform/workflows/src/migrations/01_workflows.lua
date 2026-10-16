-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("01 workflows", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE workflow_def_events (
                    "id" BIGSERIAL NOT NULL,
                    "workflow_id" text NOT NULL,
                    "seq" bigint NOT NULL,
                    "type" text NOT NULL,
                    "body" text NOT NULL DEFAULT '{}'::text,
                    "actor" text,
                    "created_at" text NOT NULL,
                    CONSTRAINT "workflow_def_events_pkey" PRIMARY KEY (id),
                    CONSTRAINT "workflow_def_events_workflow_id_seq_key" UNIQUE (workflow_id, seq)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_events_stream ON workflow_def_events USING btree (workflow_id, seq)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE workflow_def_nodes (
                    "workflow_id" text NOT NULL,
                    "id" text NOT NULL,
                    "kind" text NOT NULL,
                    "ref" text,
                    "title" text,
                    "config" text NOT NULL DEFAULT '{}'::text,
                    "status" text NOT NULL DEFAULT 'active'::text,
                    "created_by" text,
                    "created_at" text NOT NULL,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "workflow_def_nodes_pkey" PRIMARY KEY (workflow_id, id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_nodes_kind ON workflow_def_nodes USING btree (workflow_id, kind)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE workflow_def_edges (
                    "workflow_id" text NOT NULL,
                    "id" text NOT NULL,
                    "source_id" text NOT NULL,
                    "target_id" text NOT NULL,
                    "source_port" text,
                    "target_port" text,
                    "when_expr" text,
                    "transform" text NOT NULL DEFAULT '{}'::text,
                    "created_by" text,
                    "created_at" text NOT NULL,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "workflow_def_edges_pkey" PRIMARY KEY (workflow_id, id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_edges_source ON workflow_def_edges USING btree (workflow_id, source_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_edges_target ON workflow_def_edges USING btree (workflow_id, target_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE workflow_def_notes (
                    "workflow_id" text NOT NULL,
                    "id" text NOT NULL,
                    "body" text NOT NULL DEFAULT ''::text,
                    "kind" text NOT NULL DEFAULT 'note'::text,
                    "color" text,
                    "created_by" text,
                    "created_at" text NOT NULL,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "workflow_def_notes_pkey" PRIMARY KEY (workflow_id, id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE workflow_def_layout (
                    "workflow_id" text NOT NULL,
                    "node_id" text NOT NULL,
                    "x" real,
                    "y" real,
                    "width" real,
                    "height" real,
                    "meta" text NOT NULL DEFAULT '{}'::text,
                    CONSTRAINT "workflow_def_layout_pkey" PRIMARY KEY (workflow_id, node_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE workflow_versions (
                    "id" BIGSERIAL NOT NULL,
                    "workflow_id" text NOT NULL,
                    "version" bigint NOT NULL,
                    "def_seq" bigint NOT NULL,
                    "document" text NOT NULL DEFAULT '{}'::text,
                    "compiled_commands" text NOT NULL DEFAULT '[]'::text,
                    "allowlist" text NOT NULL DEFAULT '{}'::text,
                    "created_by" text,
                    "created_at" text NOT NULL,
                    CONSTRAINT "workflow_versions_pkey" PRIMARY KEY (id),
                    CONSTRAINT "workflow_versions_workflow_id_version_key" UNIQUE (workflow_id, version)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_versions_stream ON workflow_versions USING btree (workflow_id, version DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE workflow_runs (
                    "run_id" text NOT NULL,
                    "workflow_id" text NOT NULL,
                    "version" bigint NOT NULL,
                    "draft_def_seq" bigint,
                    "dataflow_id" text,
                    "trigger_kind" text NOT NULL DEFAULT 'manual'::text,
                    "trigger_id" text,
                    "dedup_key" text,
                    "origin" text NOT NULL DEFAULT 'published'::text,
                    "status" text NOT NULL DEFAULT 'pending'::text,
                    "error" text,
                    "started_at" text NOT NULL,
                    "finished_at" text,
                    "invocation_id" text,
                    "binding_id" text,
                    "binding_revision" integer,
                    "admission_state" text NOT NULL DEFAULT 'unadmitted'::text,
                    "superseded_by" text,
                    "completion_check_at" text,
                    "completion_check_token" text,
                    "terminal_event_pending" boolean NOT NULL DEFAULT false,
                    "terminal_event_check_at" text,
                    "terminal_event_token" text,
                    "execution_identity_json" text,
                    "public_meta_refreshed_at" text,
                    "creation_payload_json" text,
                    "admission_hash" text,
                    CONSTRAINT "workflow_runs_check" CHECK (version > 0 AND draft_def_seq IS NULL OR version = 0 AND draft_def_seq IS NOT NULL AND draft_def_seq >= 0),
                    CONSTRAINT "workflow_runs_check1" CHECK (trigger_kind = 'binding'::text AND binding_id IS NOT NULL AND binding_id <> ''::text AND binding_revision IS NOT NULL AND binding_revision > 0 OR trigger_kind <> 'binding'::text AND binding_id IS NULL AND binding_revision IS NULL),
                    CONSTRAINT "workflow_runs_pkey" PRIMARY KEY (run_id),
                    CONSTRAINT "workflow_runs_admission_state_check" CHECK (admission_state = ANY (ARRAY['unadmitted'::text, 'admitted'::text]))
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_runs_recent ON workflow_runs USING btree (workflow_id, started_at DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_runs_status ON workflow_runs USING btree (workflow_id, status, started_at DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_runs_dataflow ON workflow_runs USING btree (dataflow_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_workflow_live_dedup ON workflow_runs USING btree (workflow_id, trigger_id, dedup_key) WHERE ((dedup_key IS NOT NULL) AND (superseded_by IS NULL))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_workflow_completion_due ON workflow_runs USING btree (completion_check_at, run_id) WHERE (status = ANY (ARRAY['pending'::text, 'running'::text]))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_workflow_event_due ON workflow_runs USING btree (terminal_event_check_at, run_id) WHERE terminal_event_pending
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_workflow_admission_count ON workflow_runs USING btree (trigger_id, status, admission_state) WHERE (superseded_by IS NULL)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_workflow_run_retention ON workflow_runs USING btree (finished_at, run_id) WHERE ((status = ANY (ARRAY['completed'::text, 'failed'::text, 'cancelled'::text, 'terminated'::text])) AND (NOT terminal_event_pending))
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE workflow_runs")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE workflow_versions")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE workflow_def_layout")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE workflow_def_notes")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE workflow_def_edges")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE workflow_def_nodes")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE workflow_def_events")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE workflow_def_events (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    workflow_id TEXT NOT NULL,
                    seq         INTEGER NOT NULL,
                    type        TEXT NOT NULL,
                    body        TEXT NOT NULL DEFAULT '{}',
                    actor       TEXT,
                    created_at  TEXT NOT NULL,
                    UNIQUE (workflow_id, seq)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_events_stream ON workflow_def_events (workflow_id, seq)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE workflow_def_nodes (
                    workflow_id  TEXT NOT NULL,
                    id           TEXT NOT NULL,
                    kind         TEXT NOT NULL,
                    ref          TEXT,
                    title        TEXT,
                    config       TEXT NOT NULL DEFAULT '{}',
                    status       TEXT NOT NULL DEFAULT 'active',
                    created_by   TEXT,
                    created_at   TEXT NOT NULL,
                    updated_at   TEXT NOT NULL,
                    PRIMARY KEY (workflow_id, id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_nodes_kind ON workflow_def_nodes (workflow_id, kind)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE workflow_def_edges (
                    workflow_id TEXT NOT NULL,
                    id          TEXT NOT NULL,
                    source_id   TEXT NOT NULL,
                    target_id   TEXT NOT NULL,
                    source_port TEXT,
                    target_port TEXT,
                    when_expr   TEXT,
                    transform   TEXT NOT NULL DEFAULT '{}',
                    created_by  TEXT,
                    created_at  TEXT NOT NULL,
                    updated_at  TEXT NOT NULL,
                    PRIMARY KEY (workflow_id, id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_edges_source ON workflow_def_edges (workflow_id, source_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_edges_target ON workflow_def_edges (workflow_id, target_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE workflow_def_notes (
                    workflow_id TEXT NOT NULL,
                    id          TEXT NOT NULL,
                    body        TEXT NOT NULL DEFAULT '',
                    kind        TEXT NOT NULL DEFAULT 'note',
                    color       TEXT,
                    created_by  TEXT,
                    created_at  TEXT NOT NULL,
                    updated_at  TEXT NOT NULL,
                    PRIMARY KEY (workflow_id, id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE workflow_def_layout (
                    workflow_id TEXT NOT NULL,
                    node_id     TEXT NOT NULL,
                    x           REAL,
                    y           REAL,
                    width       REAL,
                    height      REAL,
                    meta        TEXT NOT NULL DEFAULT '{}',
                    PRIMARY KEY (workflow_id, node_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE workflow_versions (
                    id                INTEGER PRIMARY KEY AUTOINCREMENT,
                    workflow_id       TEXT NOT NULL,
                    version           INTEGER NOT NULL,
                    def_seq           INTEGER NOT NULL,
                    document          TEXT NOT NULL DEFAULT '{}',
                    compiled_commands TEXT NOT NULL DEFAULT '[]',
                    allowlist         TEXT NOT NULL DEFAULT '{}',
                    created_by        TEXT,
                    created_at        TEXT NOT NULL,
                    UNIQUE (workflow_id, version)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_versions_stream ON workflow_versions (workflow_id, version DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE workflow_runs (
                    run_id                TEXT PRIMARY KEY,
                    workflow_id           TEXT NOT NULL,
                    version               INTEGER NOT NULL,
                    draft_def_seq         INTEGER,
                    dataflow_id           TEXT,
                    trigger_kind          TEXT NOT NULL DEFAULT 'manual',
                    trigger_id            TEXT,
                    dedup_key             TEXT,
                    origin                TEXT NOT NULL DEFAULT 'published',
                    status                TEXT NOT NULL DEFAULT 'pending',
                    error                 TEXT,
                    started_at            TEXT NOT NULL,
                    finished_at           TEXT,
                    invocation_id         TEXT,
                    binding_id            TEXT,
                    binding_revision      INTEGER, admission_state TEXT NOT NULL DEFAULT 'unadmitted' CHECK(admission_state IN ('unadmitted','admitted')), superseded_by TEXT, completion_check_at TEXT, completion_check_token TEXT, terminal_event_pending INTEGER NOT NULL DEFAULT 0 CHECK(terminal_event_pending IN (0,1)), terminal_event_check_at TEXT, terminal_event_token TEXT, execution_identity_json TEXT, public_meta_refreshed_at TEXT, creation_payload_json TEXT, admission_hash TEXT,
                    CHECK (
                    (version > 0 AND draft_def_seq IS NULL)
                    OR (version = 0 AND draft_def_seq IS NOT NULL AND draft_def_seq >= 0)
                    ),
                    CHECK (
                    (trigger_kind = 'binding' AND binding_id IS NOT NULL AND binding_id <> ''
                    AND binding_revision IS NOT NULL AND binding_revision > 0)
                    OR (trigger_kind <> 'binding' AND binding_id IS NULL AND binding_revision IS NULL)
                    )
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_runs_recent ON workflow_runs (workflow_id, started_at DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_runs_status ON workflow_runs (workflow_id, status, started_at DESC)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_wf_runs_dataflow ON workflow_runs (dataflow_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE UNIQUE INDEX uq_workflow_live_dedup ON workflow_runs(workflow_id,trigger_id,dedup_key) WHERE dedup_key IS NOT NULL AND superseded_by IS NULL
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_workflow_completion_due ON workflow_runs(completion_check_at,run_id) WHERE status IN ('pending','running')
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_workflow_event_due ON workflow_runs(terminal_event_check_at,run_id) WHERE terminal_event_pending=1
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_workflow_admission_count ON workflow_runs(trigger_id,status,admission_state) WHERE superseded_by IS NULL
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_workflow_run_retention ON workflow_runs(finished_at,run_id)
                    WHERE status IN ('completed','failed','cancelled','terminated') AND NOT terminal_event_pending
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE workflow_runs")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE workflow_versions")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE workflow_def_layout")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE workflow_def_notes")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE workflow_def_edges")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE workflow_def_nodes")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE workflow_def_events")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
