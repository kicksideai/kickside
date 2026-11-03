-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Settings change propagation over the kickside.settings:changes process-group
-- scope. The writer publishes each committed revision to the change keeper on
-- every node; a keeper reloads its node's cache and then tells local subscribers.

local pg = require("pg")
local process = require("process")

local M = {}

M.SCOPE = "kickside.settings:changes"
-- One change keeper per node joins this group.
M.KEEPERS = "kickside.settings.keepers"
-- Processes that react to settings changes join this group on their node.
M.SUBSCRIBERS = "kickside.settings.subscribers"
-- Message topic for both groups; the payload is { revision = <number> }.
M.TOPIC = "kickside.settings.changed"

local function open(): (any?, any?)
    local scope, err = pg.open(M.SCOPE)
    if err or not scope then return nil, err or "settings change scope unavailable" end
    return scope, nil
end

-- publish sends a committed revision to the change keeper on every node.
function M.publish(revision: number): (boolean, any?)
    local scope, err = open()
    if not scope then return false, err end
    local _, berr = scope:broadcast(M.KEEPERS, M.TOPIC, { revision = revision })
    scope:release()
    if berr then return false, berr end
    return true, nil
end

-- subscribe joins the calling process to this node's change subscribers and
-- returns the channel that receives { revision } after this node's cache holds
-- that revision. Read settings through the contract when a message arrives.
function M.subscribe(): (any?, any?)
    local scope, err = open()
    if not scope then return nil, err end
    local _, jerr = scope:join(M.SUBSCRIBERS)
    if jerr then return nil, jerr end
    return process.listen(M.TOPIC), nil
end

return M
