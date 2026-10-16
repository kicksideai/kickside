-- Redirect tool. `list` shows the agents the caller can hand off to; `switch`
-- hands the session to one of them by returning the runtime `_control` directive
-- (control transfers — this agent does not continue). The caller may only switch
-- to a user_agent it can access, so a redirect can't hand the session a toolset
-- the user isn't entitled to.

local component = require("component")
local security = require("security")
local agent_types = require("agent_types")
local agent_ref = require("agent_ref")
local keyset = require("keyset")

local USER_AGENT_IMPL = agent_types.USER_AGENT_IMPL

local function wants_description(args: any): (boolean?, error?)
    if args.fields == nil then return false, nil end
    if type(args.fields) ~= "table" then return nil, errors.new({ message = "fields must be an array", kind = errors.INVALID }) end
    for _, field in ipairs(args.fields) do
        if field ~= "description" then return nil, errors.new({ message = "unsupported field: " .. tostring(field), kind = errors.INVALID }) end
    end
    return #args.fields > 0, nil
end

local function current_user(): string?
    local actor = security.actor()
    local id = actor and actor:id() or nil
    if id == nil or id == "" then return nil end
    return tostring(id)
end

-- The user agents this user can access, via the component module's access seam.
local function list_user_agents(user_id: string): (any, error?)
    local comps, err = component.list_for_subject(user_id, { impl_ids = { USER_AGENT_IMPL }, meta = true })
    if err or not comps then return nil, errors.new({ message = "list redirect agents: " .. tostring(err or "no result"), kind = errors.INTERNAL }) end
    local out = {}
    for _, c in ipairs(comps :: any) do
        local meta = c.meta or {}
        if agent_types.component_is_public(meta) then
            out[#out + 1] = {
                component_id = c.component_id,
                name = meta.title or c.component_id,
                description = meta.comment or "",
            }
        end
    end
    return out
end

local function can_access(user_id: string, component_id: string): boolean
    -- Direct switching remains an authorization check, not a discovery check:
    -- a previously configured private target may still be resolved by exact id.
    local comps, err = component.list_for_subject(user_id, { impl_ids = { USER_AGENT_IMPL } })
    if err or not comps then return false end
    for _, c in ipairs(comps :: any) do
        if c.component_id == component_id then return true end
    end
    return false
end

local function handler(args: any): (any, error?)
    args = (type(args) == "table") and args or {}
    local user_id = current_user()
    if not user_id then return nil, errors.new({ message = "No user context available.", kind = errors.PERMISSION_DENIED }) end

    if args.action == "list" then
        local limit, cursor, page_err = keyset.args(args)
        if page_err then return nil, page_err end
        local include_description, fields_err = wants_description(args)
        if fields_err then return nil, fields_err end
        local agents, list_err = list_user_agents(user_id)
        if list_err then return nil, list_err end
        local rows: { any } = {}
        for _, a in ipairs(agents :: any) do
            local row = {
                agent_id = agent_ref.user(a.component_id),
                name = a.name,
            }
            if include_description then row.description = a.description end
            rows[#rows + 1] = row
        end
        local page, next_cursor = keyset.page(rows, keyset.field("agent_id"), limit :: integer, cursor)
        return { success = true, agents = page, count = #page, next_cursor = next_cursor }, nil
    end

    if args.action == "switch" then
        local agent_id = args.agent_id
        if not agent_id or agent_id == "" then
            return nil, errors.new({ message = "agent_id is required. Use list to see available agents.", kind = errors.INVALID })
        end
        local component_id = agent_ref.user_component_id(agent_id)
        if component_id == nil then
            return nil, errors.new({ message = "agent not found or not accessible. Use list to see your agents.", kind = errors.PERMISSION_DENIED })
        end
        if not can_access(user_id, component_id) then
            return nil, errors.new({ message = "agent not found or not accessible. Use list to see your agents.", kind = errors.PERMISSION_DENIED })
        end
        return {
            message = "Redirecting to agent: " .. tostring(agent_id),
            _control = { config = { agent = agent_id } },
        }
    end

    return nil, errors.new({ message = "Unknown action. Use list or switch.", kind = errors.INVALID })
end

return { handler = handler }
