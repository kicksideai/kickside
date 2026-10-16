-- Redirect trait build func. Reads the agent's redirect config from its trait
-- context ({ targets = { { agent_id, comment } } }) and folds the targets +
-- per-target comments into the prompt, so the agent knows who it can hand off to
-- and when. Returns { prompt } (appended to the trait's static prompt) or {}.

local component = require("component")
local agent_ref = require("agent_ref")

-- Read one component's title through the component service (its public meta).
local function agent_title(component_id: string): string?
    local svc, err = component.get_service()
    if err or not svc then return nil end
    local result, gerr = svc:get({ component_id = component_id })
    if gerr or not result or not result.success then return nil end
    return ((result.meta or {}).title :: string?)
end

local function execute(base_prompt: any, context: any): any
    context = (type(context) == "table") and context or {}
    local targets = (context :: any).targets
    if type(targets) ~= "table" or #(targets :: any) == 0 then return {} end

    local lines = {
        "## Redirect targets",
        "",
        "Hand the conversation to one of these agents with the Redirect tool when their scope fits better:",
        "",
    }
    for _, t in ipairs(targets :: any) do
        local id = (type(t) == "table") and (t.agent_id or "") or tostring(t)
        local comment = (type(t) == "table") and (t.comment or "") or ""
        local cid = agent_ref.user_component_id(id)
        local name = (cid and agent_title(cid)) or id
        if comment ~= "" then
            lines[#lines + 1] = string.format("- **%s** (`%s`) — %s", name, tostring(id), tostring(comment))
        else
            lines[#lines + 1] = string.format("- **%s** (`%s`)", name, tostring(id))
        end
    end

    return { prompt = table.concat(lines, "\n") }
end

return { execute = execute }
