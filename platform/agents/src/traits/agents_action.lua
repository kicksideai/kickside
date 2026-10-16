-- The Agents tool for a master agent. Three actions, two distinct semantics:
--
--   list      refresh the reachable roster (same set injected on start).
--   delegate  run a self-contained subtask on another agent IN AN ISOLATED CONTEXT
--             and return its result here -- you stay in control and continue. The
--             call is routed through the session's delegation function with the
--             target stamped into context (to_agent_id), exactly as a configured
--             delegate would be.
--   redirect  HAND THE SESSION OFF to another agent via the config.agent control
--             directive -- that agent takes over and you do not continue.
--
-- Every target is bounded by the configured namespace allow-list (context.namespaces)
-- and access-checked (a user agent must be in the caller's accessible set; system
-- agents are public). self_id (seeded by the resolver) cannot be targeted.

local funcs = require("funcs")
local ctx = require("ctx")
local env = require("env")
local security = require("security")
local roster_list = require("roster_list")
local keyset = require("keyset")
local master_ns = require("master_ns")

local DELEGATION_ENV = "wippy.session.env:delegation_func_id"

local function wants_description(args: any): (boolean?, error?)
    if args.fields == nil then return false, nil end
    if type(args.fields) ~= "table" then return nil, errors.new({ message = "fields must be an array", kind = errors.INVALID }) end
    for _, field in ipairs(args.fields) do
        if field ~= "description" then return nil, errors.new({ message = "unsupported field: " .. tostring(field), kind = errors.INVALID }) end
    end
    return #args.fields > 0, nil
end

-- Shared target validation for delegate/redirect: scope, self, access. Returns an
-- error string when the target is not reachable, or nil when it is.
local function reject(agent_id: string, namespaces: any, self_id: string): string?
    if agent_id == "" then
        return "Error: agent_id is required. Use the list action to see reachable agents."
    end
    if self_id ~= "" and agent_id == self_id then
        return "Error: cannot target yourself."
    end
    if not master_ns.allowed(namespaces, agent_id) then
        return "Error: `" .. agent_id .. "` is outside your namespace scope (" .. master_ns.describe(namespaces) .. ")."
    end
    if not roster_list.can_target(agent_id) then
        return "Error: agent `" .. agent_id .. "` not found or not accessible. Use list to see reachable agents."
    end
    return nil
end

-- list pages the reachable agents in agent_id order.
local function do_list(args: any, namespaces: any, self_id: string): (any, error?)
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local include_description, fields_err = wants_description(args)
    if fields_err then return nil, fields_err end
    local roster, roster_err = roster_list.reachable(namespaces, self_id)
    if roster_err then return nil, roster_err end
    local rows: { any } = {}
    for _, agent in ipairs(roster) do
        local row = { agent_id = agent.agent_id, title = agent.title }
        if include_description then row.description = agent.description end
        rows[#rows + 1] = row
    end
    local page, next_cursor = keyset.page(rows, keyset.field("agent_id"), limit :: integer, cursor)
    return { success = true, scope = master_ns.describe(namespaces), agents = page, count = #page, next_cursor = next_cursor }, nil
end

local function do_delegate(agent_id: string, task: string, self_id: string): (any, error?)
    if task == "" then
        return nil, errors.new({ message = "task is required -- the self-contained instruction the sub-agent works from (it does not see this conversation).", kind = errors.INVALID })
    end
    local func_id = env.get(DELEGATION_ENV)
    if not func_id or func_id == "" then
        return nil, errors.new({ message = "delegation is not configured for this session.", kind = errors.INVALID })
    end
    -- Carry the full session context to the sub-agent's arena, with the routing
    -- keys the delegation function reads stamped on top.
    local call_ctx = ctx.all() or {}
    if type(call_ctx) ~= "table" then call_ctx = {} end
    (call_ctx :: any).to_agent_id = agent_id
    if self_id ~= "" then (call_ctx :: any).from_agent_id = self_id end

    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, errors.new({ message = tostring("Error delegating to `" .. agent_id .. "`: authenticated session actor is unavailable."), kind = errors.PERMISSION_DENIED })
    end

    local result, err = funcs.new()
        :with_actor(actor)
        :with_scope(scope)
        :with_context(call_ctx)
        :call(tostring(func_id), { message = task })
    if err then
        return nil, errors.new({ message = tostring("Error delegating to `" .. agent_id .. "`: " .. tostring(err)), kind = errors.INTERNAL })
    end
    return result
end

local function handler(args: any): (any, error?)
    args = (type(args) == "table") and args or {}
    local action = tostring(args.action or "")
    local namespaces = ctx.get("namespaces")
    local self_id = tostring(ctx.get("self_id") or "")

    if action == "list" then
        return do_list(args, namespaces, self_id)
    end

    local agent_id = tostring(args.agent_id or "")

    if action == "delegate" then
        local rejected = reject(agent_id, namespaces, self_id)
        if rejected then return nil, errors.new({ message = rejected, kind = (agent_id == "" or agent_id == self_id) and errors.INVALID or errors.PERMISSION_DENIED }) end
        return do_delegate(agent_id, tostring(args.task or ""), self_id)
    end

    if action == "redirect" then
        local rejected = reject(agent_id, namespaces, self_id)
        if rejected then return nil, errors.new({ message = rejected, kind = (agent_id == "" or agent_id == self_id) and errors.INVALID or errors.PERMISSION_DENIED }) end
        return {
            message = "Redirecting to agent: " .. agent_id,
            _control = { config = { agent = agent_id } },
        }
    end

    return nil, errors.new({ message = "Unknown action. Use list, delegate, or redirect.", kind = errors.INVALID })
end

return { handler = handler }
