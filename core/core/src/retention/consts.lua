-- Core retention vocabulary. The per-thread policy controls Core event retention;
-- Jobs stores its retention overrides in its own policy table.

local M = {}

M.POLICY_TABLE = "kickside_retention_policy"

-- archive_mode values the schema permits. tombstone_only is the column default
-- in the schema; this engine has no tombstone table, so it hard-deletes either
-- way and the mode is retained as metadata for a future archival sink.
M.ARCHIVE_MODE = {
    TOMBSTONE_ONLY = "tombstone_only",
    HARD_DELETE = "hard_delete",
}

-- Enforced defaults mirror the schema column DEFAULTs. Policy upsert refuses
-- supplied windows below DAYS_MIN and uses these defaults for omitted values.
M.DEFAULTS = {
    event_hot_retention_days = 90,
    archive_mode = "tombstone_only",
    enabled = true,
}

-- A retention window must be at least one day; upsert refuses lower values.
M.DAYS_MIN = 1

return M
