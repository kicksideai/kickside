-- Pure bridge-lifecycle policy for the conversation hub. Given the bridge currently
-- recorded for a conversation key and an incoming turn's (session_id, agent_id), it
-- decides what the hub must do -- with no process I/O, so the one-bridge-per-conversation
-- invariant (never two sessions deriving a reply at once) is unit-testable. The hub
-- executes the returned action; this module never spawns, cancels, or routes.

local M = {}

-- decide_route returns exactly one of:
--   "spawn"     -- no bridge recorded: start one for this turn
--   "supersede" -- a different session or agent: stop the running bridge and hold this
--                  turn for its successor (started only once the old bridge's EXIT lands)
--   "hold"      -- the bridge is draining (a stop is already in flight): hold this turn
--   "route"     -- same session+agent, live bridge: deliver this turn to it
function M.decide_route(bridge: any, session_id: string, agent_id: string): string
    if type(bridge) ~= "table" then
        return "spawn"
    end
    if (bridge :: any).draining then
        return "hold"
    end
    if tostring((bridge :: any).session_id) ~= session_id
        or tostring((bridge :: any).agent_id) ~= agent_id then
        return "supersede"
    end
    return "route"
end

-- decide_exit: when a bridge's monitored EXIT arrives, "respawn" iff a turn was held for
-- its successor while it drained, otherwise "drop".
function M.decide_exit(bridge: any): string
    if type(bridge) == "table" and type((bridge :: any).pending) == "table" then
        return "respawn"
    end
    return "drop"
end

return M
