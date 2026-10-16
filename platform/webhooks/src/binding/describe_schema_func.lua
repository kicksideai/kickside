local ctx = require("ctx")
local repo = require("webhook_repo")
local function handle(): (any?, any)
    local id, context_err = ctx.get("component_id")
    if context_err then return nil, context_err end
    local schema, err = repo.instance_schema(id)
    if err or not schema then return nil, err end
    return { context_schema = schema }, nil
end
return { handle = handle }
