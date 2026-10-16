-- Agent roster build func. Injects, on start, the agents this master can reach,
-- bounded by its configured namespace allow-list (context.namespaces) and excluding
-- its own id (context.self_id, seeded by the resolver). The semantics of delegate vs
-- redirect live in the trait's static prompt; this lists who is reachable so the
-- agent can pass a concrete agent_id to the Agents tool. Returns { prompt }.

local roster_list = require("roster_list")
local master_ns = require("master_ns")

-- The prompt lists at most this many agents; the Agents tool pages the rest.
local PROMPT_ROSTER_MAX = 60

local function execute(base_prompt: any, context: any): (any, error?)
    context = (type(context) == "table") and context or {}
    local namespaces = (context :: any).namespaces
    local reachable, roster_err = roster_list.reachable(namespaces, (context :: any).self_id)
    if roster_err then return nil, roster_err end
    local roster: { any } = {}
    for index = 1, math.min(#reachable, PROMPT_ROSTER_MAX) do roster[#roster + 1] = reachable[index] end
    local truncated = #reachable > #roster

    if #roster == 0 then
        return { prompt = "## Reachable agents\n\nNo agents are reachable in your configured scope (" ..
            master_ns.describe(namespaces) .. "). Delegate and redirect are unavailable until agents come into scope." }
    end

    local lines: { string } = {
        "## Reachable agents",
        "",
        "These are the agents you can delegate to or redirect to (scope: " .. master_ns.describe(namespaces) ..
            "). Pass the `agent_id` shown in backticks to the Agents tool:",
        "",
    }
    for _, a in ipairs(roster) do
        local title = tostring((a :: any).title or (a :: any).agent_id)
        local id = tostring((a :: any).agent_id)
        local desc = tostring((a :: any).description or "")
        if desc ~= "" then
            lines[#lines + 1] = string.format("- **%s** (`%s`) — %s", title, id, desc)
        else
            lines[#lines + 1] = string.format("- **%s** (`%s`)", title, id)
        end
    end
    if truncated then
        lines[#lines + 1] = ""
        lines[#lines + 1] = "_(roster truncated to " .. tostring(PROMPT_ROSTER_MAX) ..
            "; use the Agents tool's `list` action to see more.)_"
    end

    return { prompt = table.concat(lines, "\n") }
end

return { execute = execute }
