-- One run-history terminal vocabulary for schema checks and bounded cleanup.
-- A parked attempt is finished even when its reusable job slot stays pending.
local job_types = require("job_types")
local M = {}
local state = job_types.RUN_STATE
local terminal: { string } = {
    state.SUCCESS, state.FAILED, state.LEASE_LOST, state.SKIPPED, state.COMPLETED, state.PARKED,
}
local quoted: { string } = {}
for i, status in ipairs(terminal) do quoted[i] = "'" .. status .. "'" end
local TERMINAL = table.concat(quoted, ",")

function M.terminal_predicate(): string
    return "status IN (" .. TERMINAL .. ")"
end

function M.history_predicate(): string
    return "status IN ('" .. state.RUNNING .. "'," .. TERMINAL .. ")"
end

return M
