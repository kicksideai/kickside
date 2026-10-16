\set ON_ERROR_STOP on

-- Parameters are calculated by run.sh. All large tables use one INSERT ... SELECT.
SELECT value AS automation_id FROM kickside_lod_state WHERE key='automation_id' \gset
SELECT value AS source_thread_id FROM kickside_lod_state WHERE key='source_thread_id' \gset
SELECT value AS prune_thread_id FROM kickside_lod_state WHERE key='prune_thread_id' \gset

-- Two hundred installed event automations span fifty source threads, each
-- accompanied by eight installed five-minute interval automations. Add one
-- event slot per event automation and the independent 10,000-watcher fan-out
-- on the first thread.
CREATE TEMP TABLE lod_slot_seed(
    automation_id TEXT NOT NULL,thread_id UUID NOT NULL,
    drive_key TEXT NOT NULL,job_id UUID NOT NULL,
    PRIMARY KEY(automation_id,drive_key));
INSERT INTO lod_slot_seed
SELECT a.id,a.thread_id::uuid,'base-' || lpad(a.ordinal::text,6,'0'),
       md5('lod-slot:base:' || a.ordinal::text)::uuid
FROM kickside_lod_automations a;
INSERT INTO lod_slot_seed
SELECT :'automation_id',:'source_thread_id'::uuid,
       'watch-' || lpad(n::text,6,'0'),md5('lod-slot:watch:' || n::text)::uuid
FROM generate_series(1, :'watcher_count'::integer) AS n;

INSERT INTO kickside_job
    (id,thread_id,job_type,worker_ref,payload,status,priority,attempts,max_attempts,queue_tier,
     generation,scheduled_at,created_at,updated_at,job_identity,slot,wake_key,wake_enabled,
     wake_generation,wake_control_pending,execution_seq,owner_kind,owner_id)
SELECT s.job_id,s.thread_id,'kickside.automation:round','kickside.automation:round',
       jsonb_build_object('automation_id',s.automation_id,'drive_key',s.drive_key),
       'pending',0,0,j.max_attempts,'live',1,NULL,NOW(),NOW(),
       '5:drive' || length(s.automation_id)::text || ':' || s.automation_id
            || length(s.drive_key)::text || ':' || s.drive_key,
       TRUE,'thread:' || s.thread_id::text,TRUE,0,FALSE,:'run_depth'::bigint,j.owner_kind,j.owner_id
FROM lod_slot_seed s
JOIN kickside_automation_drive main ON main.automation_id=s.automation_id AND main.drive_key='main'
JOIN kickside_job j ON j.id=main.job_id;

INSERT INTO kickside_automation_drive
    (automation_id,drive_key,applied_json,applied_hash,revision,source_kind,source_thread_id,
     action_json,event_seq,phase,enabled,round_seq,job_id,wake_generation,wake_applied_generation)
SELECT s.automation_id,s.drive_key,main.applied_json,main.applied_hash,1,'event',
       s.thread_id,main.action_json,source.event_count,'pending',TRUE,0,s.job_id,0,0
FROM lod_slot_seed s
JOIN kickside_automation_drive main ON main.automation_id=s.automation_id AND main.drive_key='main'
JOIN kickside_thread source ON source.id=s.thread_id;

UPDATE kickside_automation_drive d
SET event_seq=t.event_count,round_token=NULL,round_until=NULL
FROM kickside_thread t
WHERE d.automation_id IN (SELECT id FROM kickside_lod_automations)
  AND d.source_kind='event' AND t.id=d.source_thread_id;
UPDATE kickside_job j
SET status='pending',attempts=0,lease_token=NULL,lease_until=NULL,heartbeat_at=NULL,
    scheduled_at=NULL,
    wake_enabled=TRUE,wake_generation=0,wake_control_pending=FALSE,
    execution_seq=:'run_depth'::bigint
FROM kickside_automation_drive d
WHERE d.automation_id IN (SELECT id FROM kickside_lod_automations UNION ALL SELECT id FROM kickside_lod_timer_automations) AND j.id=d.job_id;

INSERT INTO kickside_job_run
    (id,job_id,thread_id,job_type,attempt_no,worker_pid,lease_token,status,started_at,
     finished_at,duration_ms,result_json,actions_json,created_at,updated_at,execution_seq,
     owner_kind,owner_id)
SELECT md5(j.id::text || ':' || seq::text)::uuid,j.id,NULL,j.job_type,seq,NULL,NULL,'completed',
       NOW() - INTERVAL '30 days' + seq * INTERVAL '1 millisecond',
       NOW() - INTERVAL '30 days' + seq * INTERVAL '2 milliseconds',1,'{}','{}',
       NOW() - INTERVAL '30 days',NOW() - INTERVAL '30 days',seq,j.owner_kind,j.owner_id
FROM kickside_automation_drive d
JOIN kickside_job j ON j.id=d.job_id
CROSS JOIN generate_series(1, :'run_depth'::integer) AS seq
WHERE d.automation_id IN (SELECT id FROM kickside_lod_automations UNION ALL SELECT id FROM kickside_lod_timer_automations);

-- Five million historical events: one million aged rows on the isolated prune
-- thread and the rest evenly distributed over load-only threads.
INSERT INTO kickside_thread(id,thread_class,event_count,last_event_ts)
SELECT md5('lod-data-thread:' || n::text)::uuid,'kickside.load.dataset',0,NULL
FROM generate_series(1, :'data_threads'::integer) AS n;

INSERT INTO kickside_event(id,thread_id,type,role,body,seq,created_at)
SELECT md5('lod-event:' || n::text)::uuid,
       CASE WHEN n <= :'prune_events'::integer THEN :'prune_thread_id'::uuid
            ELSE md5('lod-data-thread:' || (((n-:'prune_events'::integer-1) % :'data_threads'::integer)+1)::text)::uuid END,
       'kickside.load:seed','user','{}'::jsonb,
       CASE WHEN n <= :'prune_events'::integer THEN n::integer
            ELSE ((n-:'prune_events'::integer-1) / :'data_threads'::integer + 1)::integer END,
       NOW() - INTERVAL '2 days'
FROM generate_series(1, :'event_count'::integer) AS n;

UPDATE kickside_thread SET event_count=:'prune_events'::integer,last_event_ts=NOW()-INTERVAL '2 days'
WHERE id=:'prune_thread_id'::uuid;
WITH grouped AS (
    SELECT thread_id,MAX(seq) AS event_count
    FROM kickside_event
    WHERE thread_id <> :'prune_thread_id'::uuid
    GROUP BY thread_id
)
UPDATE kickside_thread t SET event_count=g.event_count,last_event_ts=NOW()-INTERVAL '2 days'
FROM grouped g WHERE t.id=g.thread_id;

INSERT INTO kickside_automation_receipt
    (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,dest_version,delivery_revision,updated_at)
SELECT a.id,'kickside.load:events','receipt-' || n::text,'',
       'identity-' || n::text,'{}','1',1,NOW()-INTERVAL '1 day'
FROM generate_series(1, :'receipt_count'::integer) AS n
JOIN kickside_lod_automations a ON a.ordinal=((n-1) % (SELECT COUNT(*) FROM kickside_lod_automations))+1;

INSERT INTO kickside_trigger_item_ledger
    (owner_id,source_port,item_key,source_version,dedup_key,identity_key,envelope_json,payload_hash,
     state,attempts,first_failed_at,last_failed_at,next_attempt_at,error_code,retriable,terminal,
     replay_generation,resolved_at,expires_at,created_at,updated_at)
SELECT a.id,'kickside.load:events','ledger-' || n::text,'','ledger-' || n::text,
       'd:ledger-' || n::text,'{}','lod-seed','resolved',0,NOW()-INTERVAL '2 days',
       NOW()-INTERVAL '2 days',NULL,'resolved',FALSE,TRUE,0,NOW()-INTERVAL '1 day',
       NOW()+INTERVAL '365 days',NOW()-INTERVAL '2 days',NOW()-INTERVAL '1 day'
FROM generate_series(1, :'ledger_count'::integer) AS n
JOIN kickside_lod_automations a ON a.ordinal=((n-1) % (SELECT COUNT(*) FROM kickside_lod_automations))+1;

INSERT INTO kickside_lod_state(key,value) VALUES
    ('base_drives',:'base_drive_count'),('watchers',:'watcher_count'),
    ('seed_run_depth',:'run_depth'),('prune_events',:'prune_events'),
    ('dataset_scale',:'scale')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;

ANALYZE kickside_job;
ANALYZE kickside_job_run;
ANALYZE kickside_event;
ANALYZE kickside_automation_receipt;
ANALYZE kickside_trigger_item_ledger;

SELECT 'drives' AS metric,COUNT(*) AS rows FROM kickside_automation_drive WHERE automation_id IN (SELECT id FROM kickside_lod_automations UNION ALL SELECT id FROM kickside_lod_timer_automations)
UNION ALL SELECT 'events',COUNT(*) FROM kickside_event WHERE type='kickside.load:seed'
UNION ALL SELECT 'receipts',COUNT(*) FROM kickside_automation_receipt WHERE owner_id IN (SELECT id FROM kickside_lod_automations)
UNION ALL SELECT 'ledger',COUNT(*) FROM kickside_trigger_item_ledger WHERE owner_id IN (SELECT id FROM kickside_lod_automations)
UNION ALL SELECT 'runs',COUNT(*) FROM kickside_job_run r JOIN kickside_automation_drive d ON d.job_id=r.job_id WHERE d.automation_id IN (SELECT id FROM kickside_lod_automations UNION ALL SELECT id FROM kickside_lod_timer_automations);
