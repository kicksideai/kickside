\set ON_ERROR_STOP on
VACUUM (ANALYZE);
WITH stats AS (
    SELECT COALESCE(SUM(n_dead_tup),0)::numeric AS dead,
           COALESCE(SUM(n_live_tup),0)::numeric AS live
    FROM pg_stat_user_tables
    WHERE relname IN ('kickside_job','kickside_job_run','kickside_event',
        'kickside_automation_drive','kickside_automation_receipt','kickside_trigger_item_ledger')
), ratio AS (
    SELECT CASE WHEN live=0 THEN NULL ELSE dead/live END AS value,dead,live FROM stats
)
INSERT INTO kickside_lod_metric(metric,target,measured,status,detail)
SELECT 'dead/live tuple ratio','≤0.2 after VACUUM',
       COALESCE(to_char(value,'FM999999990.000'),'N/A (no live tuples)'),
       CASE WHEN value IS NULL THEN 'N/A' WHEN value<=0.2 THEN 'PASS' ELSE 'FAIL' END,
       'Post-VACUUM (ANALYZE) ratio across jobs, runs, events, drives, receipts and item ledger; dead='
           || dead::text || ', live=' || live::text
FROM ratio
ON CONFLICT(metric) DO UPDATE SET target=excluded.target,measured=excluded.measured,
    status=excluded.status,detail=excluded.detail;
