-- Stable public facade for workflow persistence. The implementation modules share
-- one table, preserving the existing kickside.workflows.store:store surface and test seams.
local state = require("store_state")
local events = require("store_events")
local projection = require("store_projection")
local purge = require("store_purge")
local history = require("store_history")

local M, I = state.new()
events(M, I)
projection(M, I)
purge(M, I)
history(M, I)

return M
