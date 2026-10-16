-- Fresh-install schema. Columns, constraints and indexes are declared at creation.

return require("migration").define(function()
    migration("10 drive schema", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_automation_drive (
                    "automation_id" text NOT NULL,
                    "drive_key" text NOT NULL,
                    "applied_json" text NOT NULL DEFAULT '{}'::text,
                    "applied_hash" text NOT NULL DEFAULT ''::text,
                    "revision" bigint NOT NULL DEFAULT 1,
                    "rewind_generation" bigint NOT NULL DEFAULT 0,
                    "command_generation" bigint NOT NULL DEFAULT 0,
                    "pending_command_id" text,
                    "source_kind" text NOT NULL,
                    "source_thread_id" uuid,
                    "sink_port" text,
                    "sink_resource_id" text,
                    "action_json" text NOT NULL DEFAULT '{}'::text,
                    "cursor" text,
                    "event_seq" bigint NOT NULL DEFAULT 0,
                    "backfill_since" text,
                    "delivery_revision" bigint NOT NULL DEFAULT 1,
                    "pin_generation" bigint,
                    "last_committed_occurrence_seq" bigint NOT NULL DEFAULT 0,
                    "occurrence_seq" bigint,
                    "occurrence_due_at" text,
                    "occurrence_payload_json" text,
                    "occurrence_key" text,
                    "phase" text NOT NULL DEFAULT 'pending'::text,
                    "enabled" boolean NOT NULL DEFAULT true,
                    "round_seq" bigint NOT NULL DEFAULT 0,
                    "round_token" text,
                    "round_until" text,
                    "job_id" uuid,
                    "wake_generation" bigint NOT NULL DEFAULT 0,
                    "wake_applied_generation" bigint NOT NULL DEFAULT 0,
                    "next_run_at" text,
                    "last_round_at" text,
                    "unresolved_count" bigint NOT NULL DEFAULT 0,
                    "uncertain_count" bigint NOT NULL DEFAULT 0,
                    "last_error_json" text,
                    "reconcile_next_at" text,
                    "reconcile_pass_id" text,
                    "sweep_pending" boolean NOT NULL DEFAULT false,
                    "pass_pages" bigint NOT NULL DEFAULT 0,
                    "pass_items" bigint NOT NULL DEFAULT 0,
                    "pin_advance_cursor" bigint,
                    "pin_next_at" text,
                    "pin_error_json" text,
                    "repair_next_at" text,
                    CONSTRAINT "kickside_automation_drive_revision_check" CHECK (revision > 0),
                    CONSTRAINT "kickside_automation_drive_rewind_generation_check" CHECK (rewind_generation >= 0),
                    CONSTRAINT "kickside_automation_drive_command_generation_check" CHECK (command_generation >= 0),
                    CONSTRAINT "kickside_automation_drive_event_seq_check" CHECK (event_seq >= 0),
                    CONSTRAINT "kickside_automation_drive_delivery_revision_check" CHECK (delivery_revision > 0),
                    CONSTRAINT "kickside_automation_drive_enabled_check" CHECK (enabled = ANY (ARRAY[false, true])),
                    CONSTRAINT "kickside_automation_drive_unresolved_count_check" CHECK (unresolved_count >= 0),
                    CONSTRAINT "kickside_automation_drive_uncertain_count_check" CHECK (uncertain_count >= 0),
                    CONSTRAINT "kickside_automation_drive_sweep_pending_check" CHECK (sweep_pending = ANY (ARRAY[false, true])),
                    CONSTRAINT "kickside_automation_drive_check" CHECK (wake_generation >= wake_applied_generation),
                    CONSTRAINT "kickside_automation_drive_pkey" PRIMARY KEY (automation_id, drive_key),
                    CONSTRAINT "kickside_automation_drive_pass_pages_check" CHECK (pass_pages >= 0),
                    CONSTRAINT "kickside_automation_drive_pass_items_check" CHECK (pass_items >= 0)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_drive_source_thread ON kickside_automation_drive USING btree (source_thread_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_drive_sink ON kickside_automation_drive USING btree (sink_port, sink_resource_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_drive_phase ON kickside_automation_drive USING btree (phase)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_drive_wake ON kickside_automation_drive USING btree (automation_id, drive_key) WHERE (wake_generation > wake_applied_generation)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_drive_recovery ON kickside_automation_drive USING btree (next_run_at) WHERE (next_run_at IS NOT NULL)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_drive_missing_slot ON kickside_automation_drive USING btree (automation_id, drive_key) WHERE ((job_id IS NULL) AND (pending_command_id IS NULL))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_automation_pin_advance_due ON kickside_automation_drive USING btree (pin_next_at, automation_id, drive_key) WHERE (pin_advance_cursor IS NOT NULL)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_automation_receipt (
                    "owner_id" text NOT NULL,
                    "source_port" text NOT NULL,
                    "item_key" text NOT NULL,
                    "map_slot" text NOT NULL,
                    "identity_key" text NOT NULL,
                    "dest_ref_json" text,
                    "dest_version" text,
                    "pass_id" text,
                    "updated_at" text NOT NULL,
                    CONSTRAINT "kickside_automation_receipt_pkey" PRIMARY KEY (owner_id, source_port, item_key, map_slot)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_automation_receipt_pass ON kickside_automation_receipt USING btree (owner_id, source_port, pass_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_automation_receipt_retention ON kickside_automation_receipt USING btree (updated_at, owner_id, source_port, item_key, map_slot)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_automation_prepared (
                    "automation_id" text NOT NULL,
                    "idempotency_key" text NOT NULL,
                    "payload_hash" text NOT NULL,
                    "prepared_json" text NOT NULL,
                    "created_at" text NOT NULL,
                    "settled_at" text,
                    CONSTRAINT "kickside_automation_prepared_pkey" PRIMARY KEY (automation_id, idempotency_key)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_automation_prepared_created ON kickside_automation_prepared USING btree (created_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_automation_op (
                    "automation_id" text NOT NULL,
                    "request_id" text NOT NULL,
                    "generation" bigint NOT NULL,
                    "digest" text NOT NULL,
                    "target_receipts_json" text NOT NULL DEFAULT '{}'::text,
                    "outcome_json" text,
                    "state" text NOT NULL,
                    "created_at" text NOT NULL,
                    "completed_at" text,
                    CONSTRAINT "kickside_automation_op_generation_check" CHECK (generation > 0),
                    CONSTRAINT "kickside_automation_op_state_check" CHECK (state = ANY (ARRAY['pending'::text, 'succeeded'::text, 'failed'::text, 'superseded'::text])),
                    CONSTRAINT "kickside_automation_op_pkey" PRIMARY KEY (automation_id, request_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_automation_op_created ON kickside_automation_op USING btree (created_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_automation_command (
                    "automation_id" text NOT NULL,
                    "generation" bigint NOT NULL DEFAULT 0,
                    "pending_request_id" text,
                    "pending_digest" text,
                    "pending_kind" text,
                    "pending_input_json" text,
                    "pending_drives_json" text,
                    "pending_step" text,
                    "next_attempt_at" text,
                    "last_error_json" text,
                    CONSTRAINT "kickside_automation_command_generation_check" CHECK (generation >= 0),
                    CONSTRAINT "kickside_automation_command_check" CHECK (pending_request_id IS NULL AND pending_step IS NULL OR pending_request_id IS NOT NULL AND pending_digest IS NOT NULL AND pending_input_json IS NOT NULL AND pending_drives_json IS NOT NULL),
                    CONSTRAINT "kickside_automation_command_pkey" PRIMARY KEY (automation_id)
                    )
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_automation_command_due ON kickside_automation_command USING btree (pending_step, next_attempt_at, automation_id) WHERE (pending_request_id IS NOT NULL)
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_automation_command")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_automation_op")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_automation_prepared")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_automation_receipt")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_automation_drive")
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([=[
                    CREATE TABLE kickside_automation_drive (
                    automation_id TEXT NOT NULL, drive_key TEXT NOT NULL,
                    applied_json TEXT NOT NULL DEFAULT '{}', applied_hash TEXT NOT NULL DEFAULT '',
                    revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0),
                    rewind_generation INTEGER NOT NULL DEFAULT 0 CHECK(rewind_generation>=0),
                    command_generation INTEGER NOT NULL DEFAULT 0 CHECK(command_generation>=0),
                    pending_command_id TEXT, source_kind TEXT NOT NULL,
                    source_thread_id TEXT, sink_port TEXT, sink_resource_id TEXT,
                    action_json TEXT NOT NULL DEFAULT '{}', cursor TEXT,
                    event_seq INTEGER NOT NULL DEFAULT 0 CHECK(event_seq>=0), backfill_since TEXT,
                    delivery_revision INTEGER NOT NULL DEFAULT 1 CHECK(delivery_revision>0),
                    pin_generation INTEGER, last_committed_occurrence_seq INTEGER NOT NULL DEFAULT 0,
                    occurrence_seq INTEGER, occurrence_due_at TEXT, occurrence_payload_json TEXT,
                    occurrence_key TEXT, phase TEXT NOT NULL DEFAULT 'pending',
                    enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)),
                    round_seq INTEGER NOT NULL DEFAULT 0, round_token TEXT, round_until TEXT,
                    job_id TEXT, wake_generation INTEGER NOT NULL DEFAULT 0,
                    wake_applied_generation INTEGER NOT NULL DEFAULT 0,
                    next_run_at TEXT, last_round_at TEXT,
                    unresolved_count INTEGER NOT NULL DEFAULT 0 CHECK(unresolved_count>=0),
                    uncertain_count INTEGER NOT NULL DEFAULT 0 CHECK(uncertain_count>=0),
                    last_error_json TEXT, reconcile_next_at TEXT, reconcile_pass_id TEXT,
                    sweep_pending INTEGER NOT NULL DEFAULT 0 CHECK(sweep_pending IN (0,1)),
                    pass_pages INTEGER NOT NULL DEFAULT 0 CHECK (pass_pages >= 0), pass_items INTEGER NOT NULL DEFAULT 0 CHECK (pass_items >= 0), pin_advance_cursor BIGINT, pin_next_at TEXT, pin_error_json TEXT, repair_next_at TEXT,
                    CHECK(wake_generation>=wake_applied_generation),
                    PRIMARY KEY(automation_id,drive_key))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_drive_source_thread ON kickside_automation_drive(source_thread_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_drive_sink ON kickside_automation_drive(sink_port,sink_resource_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_drive_phase ON kickside_automation_drive(phase)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_drive_wake ON kickside_automation_drive(automation_id,drive_key) WHERE wake_generation>wake_applied_generation
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_drive_recovery ON kickside_automation_drive(next_run_at) WHERE next_run_at IS NOT NULL
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_automation_receipt (
                    owner_id TEXT NOT NULL, source_port TEXT NOT NULL, item_key TEXT NOT NULL,
                    map_slot TEXT NOT NULL, identity_key TEXT NOT NULL,
                    dest_ref_json TEXT, dest_version TEXT,
                    pass_id TEXT, updated_at TEXT NOT NULL,
                    PRIMARY KEY(owner_id,source_port,item_key,map_slot))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_automation_prepared (
                    automation_id TEXT NOT NULL, idempotency_key TEXT NOT NULL,
                    payload_hash TEXT NOT NULL, prepared_json TEXT NOT NULL, created_at TEXT NOT NULL,
                    settled_at TEXT, PRIMARY KEY(automation_id,idempotency_key))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_automation_prepared_created ON kickside_automation_prepared(created_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_automation_op (
                    automation_id TEXT NOT NULL, request_id TEXT NOT NULL,
                    generation INTEGER NOT NULL CHECK(generation>0), digest TEXT NOT NULL,
                    target_receipts_json TEXT NOT NULL DEFAULT '{}', outcome_json TEXT,
                    state TEXT NOT NULL CHECK(state IN ('pending','succeeded','failed','superseded')),
                    created_at TEXT NOT NULL, completed_at TEXT,
                    PRIMARY KEY(automation_id,request_id))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_automation_op_created ON kickside_automation_op(created_at)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE TABLE kickside_automation_command (
                    automation_id TEXT PRIMARY KEY, generation INTEGER NOT NULL DEFAULT 0 CHECK(generation>=0),
                    pending_request_id TEXT, pending_digest TEXT, pending_kind TEXT,
                    pending_input_json TEXT, pending_drives_json TEXT, pending_step TEXT,
                    next_attempt_at TEXT, last_error_json TEXT,
                    CHECK((pending_request_id IS NULL AND pending_step IS NULL) OR
                    (pending_request_id IS NOT NULL AND pending_digest IS NOT NULL AND pending_input_json IS NOT NULL AND pending_drives_json IS NOT NULL)))
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_automation_command_due ON kickside_automation_command(pending_step,next_attempt_at,automation_id) WHERE pending_request_id IS NOT NULL
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_drive_missing_slot ON kickside_automation_drive(automation_id,drive_key)
                    WHERE job_id IS NULL AND pending_command_id IS NULL
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_automation_receipt_pass ON kickside_automation_receipt(owner_id, source_port, pass_id)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_automation_receipt_retention
                    ON kickside_automation_receipt(updated_at,owner_id,source_port,item_key,map_slot)
                ]=])
                if err then error(tostring(err)) end
                local _, err = db:execute([=[
                    CREATE INDEX idx_automation_pin_advance_due ON kickside_automation_drive (pin_next_at,automation_id,drive_key) WHERE pin_advance_cursor IS NOT NULL
                ]=])
                if err then error(tostring(err)) end
            end)
            down(function(db)
                local _, err = db:execute("DROP TABLE kickside_automation_command")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_automation_op")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_automation_prepared")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_automation_receipt")
                if err then error(tostring(err)) end
                local _, err = db:execute("DROP TABLE kickside_automation_drive")
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
