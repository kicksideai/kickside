-- Reachable-agent enumeration shared by the agent roster build func (start-time
-- prompt injection) and the Agents tool (the `list` refresh + the delegate/redirect
-- access checks). One owner of "which agents can this master reach": the user's
-- accessible user agents (component access seam, synthetic namespace "user_agent")
-- plus the public system agents (registry agent.gen1), filtered by the configured
-- namespace allow-list, with the master's own id excluded.

local security = require("security")
local registry = require("registry")
local component = require("component_lib")
local agent_types = require("agent_types")
local master_ns = require("master_ns")
local agent_ref = require("agent_ref")

local USER_AGENT_IMPL = agent_types.USER_AGENT_IMPL

local M = {}

M.USER_AGENT_PREFIX = agent_ref.USER_AGENT_PREFIX

local AGENT_TYPE = "agent.gen1"
local DEFAULT_CLASS = "public"

function M.current_user(): string?
    local actor = security.actor()
    if not actor then return nil end

    local id = actor:id()
    if id == nil or id == "" then return nil end
    return tostring(id)
end

local function class_is_public(class: any): boolean
    if class == nil or class == "" or class == DEFAULT_CLASS then return true end
    if type(class) == "table" then
        for _, c in ipairs(class :: { any }) do
            if c == DEFAULT_CLASS then return true end
        end
    end
    return false
end

-- The user's accessible user agents as { agent_id, title, description }.
function M.user_agents(): ({ any }, error?)
    local user_id = M.current_user()
    if not user_id then return {} end
    local comps, err = component.list_for_subject(user_id, { impl_ids = { USER_AGENT_IMPL }, meta = true })
    if err or not comps then return {}, errors.new({ message = "list user agents: " .. tostring(err or "no result"), kind = errors.INTERNAL }) end
    local out: { any } = {}
    for _, c in ipairs(comps :: any) do
        -- list_for_subject already scopes to agents this subject can read;
        -- meta.public governs discovery by other subjects, not this roster.
        local meta = (c :: any).meta or {}
        out[#out + 1] = {
            agent_id = agent_ref.user((c :: any).component_id),
            title = meta.title or (c :: any).component_id,
            description = meta.comment or "",
        }
    end
    return out
end

-- Public system agents. `meta.public=true` grants discovery; class remains only
-- a secondary namespace/category filter.
function M.system_agents(): ({ any }, error?)
    local entries, err = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = AGENT_TYPE })
    if err or not entries then return {}, errors.new({ message = "list system agents: " .. tostring(err or "no result"), kind = errors.INTERNAL }) end
    local out: { any } = {}
    for _, entry in ipairs(entries :: any) do
        local meta = (entry :: any).meta or {}
        if meta.public == true and meta.private ~= true and class_is_public(meta.class) and (entry :: any).id then
            out[#out + 1] = {
                agent_id = (entry :: any).id,
                title = meta.title or (entry :: any).id,
                description = meta.comment or "",
            }
        end
    end
    return out
end

-- The reachable roster: user + system agents, namespace-filtered, self excluded,
-- de-duplicated by agent_id. Returns (list, error).
function M.reachable(namespaces: any, self_id: any): ({ any }, error?)
    local self_ref = tostring(self_id or "")
    local out: { any } = {}
    local seen: { [string]: boolean } = {}
    local function consider(list: { any })
        for _, a in ipairs(list) do
            local id = tostring((a :: any).agent_id or "")
            if id ~= "" and id ~= self_ref and not seen[id] and master_ns.allowed(namespaces, id) then
                seen[id] = true
                out[#out + 1] = a
            end
        end
    end
    local users, user_err = M.user_agents()
    if user_err then return {}, user_err end
    local systems, system_err = M.system_agents()
    if system_err then return {}, system_err end
    consider(users)
    consider(systems)
    return out, nil
end

-- Whether the calling user may target agent_id. System agents are public and pass;
-- a user agent must be in the caller's accessible set. Namespace scope is enforced
-- by the caller separately.
function M.can_target(agent_id: string): boolean
    local component_id = agent_ref.user_component_id(agent_id)
    if component_id == nil then
        return true
    end
    local user_id = M.current_user()
    if not user_id then return false end
    local comps, err = component.list_for_subject(user_id, { impl_ids = { USER_AGENT_IMPL } })
    if err or not comps then return false end
    for _, c in ipairs(comps :: any) do
        if tostring((c :: any).component_id) == component_id then return true end
    end
    return false
end

return M
