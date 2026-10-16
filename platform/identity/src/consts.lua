local registry = require("registry")

-- Shared vocabulary for the identity module: the configured DB id (rewritten by
-- the target_db requirement onto db_config) and the link-code parameters.
local M = {}

M.DB_CONFIG = "kickside.identity:db_config"

-- Link codes: short, unambiguous (no 0/O/1/I), short-lived, capped per user.
M.CODE_TTL_SECONDS = 300
M.MAX_ACTIVE_CODES = 3
M.CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
M.CODE_LENGTH = 8

-- A link may pin a starting DM agent. The choice is validated against the user's
-- accessible user_agents (same access seam the DM redirect uses) or the
-- redirect-only greeter the DM path falls back to. These two ids are a wire
-- contract shared with kickside.agents (the user_agent impl) and kickside.dm (the
-- greeter); they stay in sync with those modules.
M.USER_AGENT_IMPL = "kickside.agents:user_agent"
M.GREETER_AGENT_ID = "kickside.dm.agents:greeter"

-- db_id() reads the database id rewritten onto db_config by the target_db
-- requirement, so persistence binds the composed DB rather than a hardcoded one.
function M.db_id(): string
    local entry = select(1, registry.get(M.DB_CONFIG)) :: any
    return entry.meta.db_id :: string
end

return M
