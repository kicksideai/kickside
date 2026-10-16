local test_state = require("test_state")

local M = {}

function M.verify_and_link(code: string, provider: string, external_id: string, display_name: string): (string?, string?)
    test_state.set_link({ code = code, provider = provider, external_id = external_id, display_name = display_name })
    if code == "valid-code" then return "user-1", nil end
    return nil, "invalid code"
end

function M.resolve_link(provider: string, external_id: string): (any?, string?)
    if provider == "discord" and external_id == "ext-linked" then
        return { link_id = "link-1", user_id = "user-1", default_agent_id = "" }, nil
    end
    return nil, nil
end

return M
