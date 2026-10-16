-- Delegate trait build func. Reads the resolved delegates from its trait context
-- ({ targets = { { name, title, description } } }, populated by the agent
-- resolver) and lists them under the delegation prompt so the agent knows which
-- sub-agents it can offload isolated subtasks to and what each is for. The tool
-- `name` is the sanitized identifier the LLM must call. Returns { prompt } or {}.

local function execute(base_prompt: any, context: any): any
    context = (type(context) == "table") and context or {}
    local targets = (context :: any).targets
    if type(targets) ~= "table" or #(targets :: any) == 0 then return {} end

    local lines = {
        "## Delegates",
        "",
        "Offload a self-contained subtask to one of these sub-agents by calling the matching tool. Each runs in an isolated context, performs the subtask, and returns its result to you -- it does not take over the conversation:",
        "",
    }
    for _, t in ipairs(targets :: any) do
        local name = (type(t) == "table") and (t.name or "") or tostring(t)
        local title = (type(t) == "table") and (t.title or name) or name
        local desc = (type(t) == "table") and (t.description or "") or ""
        if desc ~= "" then
            lines[#lines + 1] = string.format("- **%s** (`%s`) -- %s", tostring(title), tostring(name), tostring(desc))
        else
            lines[#lines + 1] = string.format("- **%s** (`%s`)", tostring(title), tostring(name))
        end
    end

    return { prompt = table.concat(lines, "\n") }
end

return { execute = execute }
