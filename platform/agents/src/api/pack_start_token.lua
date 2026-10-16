local start_tokens = require("start_tokens")

-- Packs a single session start-token for an agent. Isolated in its own function
-- pool so the session token chain (which transitively imports a `consts` lib)
-- never shares a pool with the component chain (which imports its own `consts`),
-- avoiding the alias collision when a list endpoint needs both.
local function handler(args)
    args = args or {}
    local token, err = start_tokens.pack({
        agent = args.agent,
        model = args.model,
        kind = args.kind,
        enable_agent_cache = true,
    })
    return { token = token, error = err }
end

return {
    handler = handler,
}
