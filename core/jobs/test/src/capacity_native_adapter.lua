-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local M = {}

function M.admit(...) return nil, nil end
function M.group(...) return nil, nil end
function M.limits(...) return nil, nil end

function M.snapshot() return {catalog = function() return {}, nil end, group = M.group, descriptor = M.group, limits = M.limits} end

return M
