-- Harness seam: drive the HTTP create path (user_agents.create) under a scoped
-- actor via funcs, so the agents_test regression suite can assert an agent created
-- through the API surface is discoverable by the registry list/find path.

local user_agents = require("user_agents")

local function handler(args: any): (any, string?)
    return user_agents.create(args or {})
end

return { handler = handler }
