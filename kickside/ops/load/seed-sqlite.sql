.bail on

-- Two hundred separately installed event automations watch the same source
-- thread on SQLite. No SQL-cloned automation or source declaration is used.
UPDATE kickside_automation_drive
SET event_seq=(SELECT event_count FROM kickside_thread WHERE id=source_thread_id),
    round_token=NULL,round_until=NULL
WHERE automation_id IN (SELECT id FROM kickside_lod_automations)
  AND source_kind='event';
UPDATE kickside_job
SET status='pending',attempts=0,lease_token=NULL,lease_until=NULL,heartbeat_at=NULL,
    scheduled_at=NULL,wake_enabled=1,wake_generation=0,wake_control_pending=0,execution_seq=0
WHERE id IN (SELECT job_id FROM kickside_automation_drive
             WHERE automation_id IN (SELECT id FROM kickside_lod_automations));

INSERT INTO kickside_lod_state(key,value) VALUES
    ('base_drives',CAST(:base_drive_count AS TEXT)),('watchers','0'),
    ('seed_run_depth','0'),('prune_events','0'),('dataset_scale','sqlite')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;

SELECT 'drives' AS metric,COUNT(*) AS rows
FROM kickside_automation_drive WHERE automation_id IN (SELECT id FROM kickside_lod_automations);
