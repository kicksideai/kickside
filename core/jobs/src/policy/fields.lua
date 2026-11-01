-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The live-editable policy surface. Runtime validation stays in config.resolve.
return {
    { key = "worker.count_postgres", min = 1, max = 256, unit = "workers" },
    { key = "worker.count_sqlite", min = 1, max = 2, unit = "workers" },
    { key = "worker.awaited_slots", min = 1, max = 256, unit = "slots" },
    { key = "worker.claim_batch", min = 1, max = 256, unit = "jobs" },
    { key = "fairness.shares", min = 0, max = 1000, unit = "shares" },
    { key = "lease.timeout", unit = "duration" },
    { key = "lease.heartbeat", unit = "duration" },
    { key = "retry.max_attempts", min = 1, max = 1000000, unit = "attempts" },
    { key = "retry.retry_after_ms", min = 1, max = 86400000, unit = "ms" },
    { key = "retry.max_delay_ms", min = 1000, max = 86400000, unit = "ms" },
    { key = "proc.max_execution", unit = "duration" },
}
