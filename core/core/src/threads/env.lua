-- Threads-slice runtime wiring. The database id comes from the root target_db
-- requirement, shared with all core migrations and persistence slices.

local core_db = require("core_db")

local M = {}

-- SQL resource id the thread binding + endpoints open, resolved from the root
-- target_db requirement's runtime config.
M.db_id = core_db.id

return M
