-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Test-only adapter: delivers one page through the sync's round consumer with
-- the runtime policy and the transform strategy registry reads counted.
local consumer = require("consumer")
local runtime_policy = require("runtime_policy")
local strategies = require("transform_strategies")

local M = {}

type Map = { [string]: any }

local reads: Map = { policy = 0, strategy = 0 }

local function counted(library: Map, name: string, counter: string)
    local original = library[name]
    library[name] = function(...): (any, any, any)
        reads[counter] = reads[counter] + 1
        return original(...)
    end
end

counted(runtime_policy, "policy", "policy")
counted(strategies, "resolve", "strategy")
counted(strategies, "open", "strategy")

function M.run(request: Map): (Map?, any)
    reads.policy, reads.strategy = 0, 0
    local out, err = consumer.deliver(request)
    if err then return nil, err end
    return { out = out, policy_reads = reads.policy, strategy_reads = reads.strategy }, nil
end

return M
