-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local applied = require("pool_applied")
local counts = require("pool_counts")
local cfg = require("config")
local M = {}
function M.read(): (table?, error?)
    local state, err = applied.read(cfg.db_id())
    if err then return nil, err end
    local queues, count_err = counts.read(cfg.db_id())
    if count_err then return nil, count_err end
    state.applied_revision = tonumber(state.applied_revision)
    state.total, state.awaited, state.general = tonumber(state.total) or 0, tonumber(state.awaited) or 0, tonumber(state.general) or 0
    state.online = state.applied_revision >= 0
    state.queued, state.running, state.database = queues.queued, queues.running, queues.database
    local running = 0
    for _, count in pairs(queues.running) do running = running + count end
    state.busy = math.min(state.total, running)
    state.idle = math.max(0, state.total - state.busy)
    return state, nil
end
return M
