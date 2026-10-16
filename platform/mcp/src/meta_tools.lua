-- The meta-tools: the always-present surface that drives discovery + runtime trait
-- activation. session_info / list_traits / find_traits / describe_trait orient the
-- agent; use_trait / drop_trait / set_traits / reset_traits / use_profile mutate the
-- credential's active trait set (persisted, so the surface change survives the next
-- stateless request); list_tools / find_tools / call_tool work the resulting tool
-- surface. Trait activation NEVER grants capability beyond the credential's
-- allowed-trait ceiling; it only reveals already-allowed packs.

local consts = require("mcp_consts")
local traits = require("mcp_traits")
local surface = require("mcp_surface")
local repo = require("mcp_repo")
local canonical_json = require("canonical_json")
local keyset = require("keyset")

local M = {}

M.DEFS = consts.META_TOOL_DEFS

local META_SET: { [string]: any } = {}
for _, t in ipairs(M.DEFS) do META_SET[t.name] = t end

function M.definition(name: string): any return META_SET[name] end

function M.is_meta(name: any): boolean
    return type(name) == "string" and META_SET[name :: string] ~= nil
end

function M.definitions(principal: any): { any }
    local out: { any } = {}
    for _, definition in ipairs(M.DEFS) do
        out[#out + 1] = definition
    end
    return out
end

-- Collect trait ids from the declared ids / id arguments, then keep only ids
-- the credential is allowed to activate and that
-- resolve to a real trait.
local function collect_ids(args: any): { string }
    local out: { string } = {}
    local seen: { [string]: boolean } = {}
    local function add(v: any)
        if type(v) == "string" and v ~= "" and not seen[v] then seen[v] = true; out[#out + 1] = v end
    end
    if type(args) == "table" then
        add((args :: any).id)
        for _, v in ipairs(((args :: any).ids or {}) :: { any }) do add(v) end
    end
    return out
end

local function is_allowed_trait(id: string, principal: any): (boolean?, any?)
    if not traits.is_allowed(id, principal.allowed_trait_ids, principal.restrict_traits) then return false end
    local trait, err = traits.get(id)
    if err then return nil, err end
    return trait ~= nil
end

local function dedupe(list: { string }): { string }
    local seen: { [string]: boolean } = {}
    local out: { string } = {}
    for _, id in ipairs(list) do if not seen[id] then seen[id] = true; out[#out + 1] = id end end
    return out
end

-- Persist + reflect a new active set on the principal so this request's surface
-- (and the report it returns) is consistent with what the next request will see.
local function apply_active(principal: any, new_active: { string }): ({ string }?, any?)
    local cleaned: { string } = {}
    for _, id in ipairs(dedupe(new_active)) do
        local allowed, err = is_allowed_trait(id, principal)
        if err then return nil, err end
        if allowed then cleaned[#cleaned + 1] = id end
    end
    local stored, err = repo.persist_active_traits((principal :: any).credential_id, cleaned)
    if err or not stored then return nil, err or errors.new({ kind = errors.INTERNAL, message = "trait persistence failed" }) end
    (principal :: any).active_trait_ids = cleaned
    return cleaned
end

local function visible_tool_names(principal: any): ({ string }?, any?)
    local descriptors, _, err = surface.build(principal)
    if err then return nil, err end
    local names: { string } = {}
    for _, d in ipairs(descriptors :: { any }) do names[#names + 1] = (d :: any).name end
    return names
end

local function allowed_trait_list(principal: any): ({ any }?, any?)
    local declared, err = traits.list_all()
    if err then return nil, err end
    return traits.allowed(declared, principal.allowed_trait_ids, principal.restrict_traits)
end

local function trait_summary(t: any): any
    return { id = (t :: any).id, name = (t :: any).name, tags = (t :: any).tags,
        tool_count = #((t :: any).tool_ids or {}) }
end

local function tool_summary(descriptor: any): any
    return { name = (descriptor :: any).name }
end

local function tool_catalog(principal: any, available: boolean): ({ any }?, any?)
    local descriptors: { any } = {}
    if available then
        local ids: { [string]: boolean } = {}
        local direct, direct_err = surface.direct_tool_ids(principal)
        if direct_err then return nil, direct_err end
        for _, id in ipairs(direct) do ids[id] = true end
        local allowed, allowed_err = allowed_trait_list(principal)
        if allowed_err then return nil, allowed_err end
        for _, t in ipairs(allowed) do
            for _, tid in ipairs((t :: any).tool_ids :: { string }) do ids[tid] = true end
        end
        for id, ok in pairs(ids) do
            if ok then
                local descriptor, err = surface.descriptor_for(id)
                if err then return nil, err end
                if descriptor then descriptors[#descriptors + 1] = descriptor end
            end
        end
    else
        local built, _names, err = surface.build(principal)
        if err then return nil, err end
        descriptors = built :: { any }
    end
    return descriptors
end

-- handle: run a meta-tool. invoke_fn(tool_id, args) -> (result, err) is supplied by
-- the dispatcher (it owns the actor/scope) for call_tool. Returns the tool result
-- table (already MCP-content-free; the dispatcher wraps it).
function M.handle(name: string, args: any, principal: any, invoke_fn: any): (any?, any?, string?)
    args = args or {}

    if name == "session_info" then
        local allowed_ids: { string } = {}
        local visible_traits: { [string]: boolean } = {}
        local allowed, allowed_err = allowed_trait_list(principal)
        if allowed_err then return nil, allowed_err end
        for _, t in ipairs(allowed) do
            allowed_ids[#allowed_ids + 1] = (t :: any).id
            visible_traits[(t :: any).id] = true
        end
        local active_ids: { string } = {}
        for _, id in ipairs((principal :: any).active_trait_ids or {}) do
            if visible_traits[id] then active_ids[#active_ids + 1] = id end
        end
        local visible, visible_err = visible_tool_names(principal)
        if visible_err then return nil, visible_err end
        local meta_names: { string } = {}
        for _, definition in ipairs(M.definitions(principal)) do meta_names[#meta_names + 1] = definition.name end
        return {
            identity = (principal :: any).actor_id,
            actor = (principal :: any).actor_id,
            whitelist_component_ids = (principal :: any).whitelist_component_ids,
            scoped = ((principal :: any).whitelist_prefixes ~= nil),
            active_traits = active_ids,
            allowed_traits = allowed_ids,
            visible_tools = visible,
            meta_tools = meta_names,
            agent_profile = (principal :: any).agent_profile,
        }, nil
    end

    if name == "list_traits" then
        local limit, cursor, page_err = keyset.args(args)
        if page_err then return nil, page_err end
        local allowed, allowed_err = allowed_trait_list(principal)
        if allowed_err then return nil, allowed_err end
        local rows: { any } = {}
        for _, t in ipairs(allowed) do rows[#rows + 1] = trait_summary(t) end
        local page, next_cursor = keyset.page(rows, keyset.field("id"), limit :: integer, cursor)
        return { traits = page, next_cursor = next_cursor }, nil
    end

    if name == "find_traits" then
        local limit, cursor, page_err = keyset.args(args)
        if page_err then return nil, page_err end
        local allowed, allowed_err = allowed_trait_list(principal)
        if allowed_err then return nil, allowed_err end
        local matched, next_cursor = traits.find(allowed :: { any }, (args :: any).query, (args :: any).tags,
            limit :: integer, cursor)
        local rows: { any } = {}
        for _, t in ipairs(matched) do rows[#rows + 1] = trait_summary(t) end
        return { traits = rows, next_cursor = next_cursor }, nil
    end

    if name == "describe_trait" then
        local id = (args :: any).id
        if type(id) ~= "string" then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "unknown or disallowed trait" }) end
        local allowed, err = is_allowed_trait(id :: string, principal)
        if err then return nil, err end
        if not allowed then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "unknown or disallowed trait" }) end
        return traits.get(id)
    end

    if name == "use_trait" then
        local add = collect_ids(args)
        local next_active: { string } = {}
        for _, id in ipairs((principal :: any).active_trait_ids :: { string }) do next_active[#next_active + 1] = id end
        for _, id in ipairs(add) do next_active[#next_active + 1] = id end
        local active, active_err = apply_active(principal, next_active)
        if active_err then return nil, active_err end
        local visible, visible_err = visible_tool_names(principal)
        if visible_err then return nil, visible_err end
        return { active_traits = active, visible_tools = visible }, nil
    end

    if name == "drop_trait" then
        local rm: { [string]: boolean } = {}
        for _, id in ipairs(collect_ids(args)) do rm[id] = true end
        local next_active: { string } = {}
        for _, id in ipairs((principal :: any).active_trait_ids :: { string }) do
            if not rm[id] then next_active[#next_active + 1] = id end
        end
        local active, active_err = apply_active(principal, next_active)
        if active_err then return nil, active_err end
        local visible, visible_err = visible_tool_names(principal)
        if visible_err then return nil, visible_err end
        return { active_traits = active, visible_tools = visible }, nil
    end

    if name == "set_traits" then
        local active, active_err = apply_active(principal, collect_ids(args))
        if active_err then return nil, active_err end
        local visible, visible_err = visible_tool_names(principal)
        if visible_err then return nil, visible_err end
        return { active_traits = active, visible_tools = visible }, nil
    end

    if name == "reset_traits" then
        local active, active_err = apply_active(principal, (principal :: any).default_active_trait_ids :: { string })
        if active_err then return nil, active_err end
        local visible, visible_err = visible_tool_names(principal)
        if visible_err then return nil, visible_err end
        return { active_traits = active, visible_tools = visible }, nil
    end

    if name == "use_profile" then
        local profile: any = (principal :: any).agent_profile or {}
        local preferred: { string } = {}
        if type(profile.preferred_trait_ids) == "table" then
            for _, id in ipairs(profile.preferred_trait_ids :: { any }) do
                if type(id) == "string" then preferred[#preferred + 1] = id :: string end
            end
        end
        if (args :: any).dry_run == true then
            return { preferred_traits = preferred, active_traits = (principal :: any).active_trait_ids }, nil
        end
        local next_active: { string } = {}
        for _, id in ipairs((principal :: any).active_trait_ids :: { string }) do next_active[#next_active + 1] = id end
        for _, id in ipairs(preferred) do next_active[#next_active + 1] = id end
        local active, active_err = apply_active(principal, next_active)
        if active_err then return nil, active_err end
        local visible, visible_err = visible_tool_names(principal)
        if visible_err then return nil, visible_err end
        return { active_traits = active, visible_tools = visible }, nil
    end

    if name == "list_tools" or name == "find_tools" or name == "describe_tool" then
        local available = (args :: any).available == true
        local descriptors, catalog_err = tool_catalog(principal, available)
        if catalog_err then return nil, catalog_err end
        if name == "describe_tool" then
            local id = (args :: any).id
            if type(id) ~= "string" or id == "" then
                return nil, errors.new({ kind = errors.INVALID, message = "describe_tool requires an id" })
            end
            for _, descriptor in ipairs(descriptors :: { any }) do
                if (descriptor :: any).name == id then return { tool = descriptor }, nil end
            end
            return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "unknown or unavailable tool: " .. id })
        end
        if name == "find_tools" then
            local q = type((args :: any).query) == "string" and (args :: any).query:lower() or ""
            local matched: { any } = {}
            for _, d in ipairs(descriptors) do
                local hay = ((d :: any).name .. " " .. ((d :: any).description or "")):lower()
                if q == "" or hay:find(q, 1, true) then matched[#matched + 1] = d end
            end
            descriptors = matched
        end
        local limit, cursor, page_err = keyset.args(args)
        if page_err then return nil, page_err end
        local page, next_cursor = keyset.page(descriptors, keyset.field("name"), limit :: integer, cursor)
        local summaries: { any } = {}
        for _, descriptor in ipairs(page) do summaries[#summaries + 1] = tool_summary(descriptor) end
        return { tools = summaries, next_cursor = next_cursor }, nil
    end

    if name == "call_tool" then
        local inner = (args :: any).id
        if type(inner) ~= "string" or inner == "" then return nil, errors.new({ kind = errors.INVALID, message = "call_tool requires an id" }) end
        local _, name_to_id, err = surface.build(principal)
        if err then return nil, err end
        local tool_id = (name_to_id :: { [string]: string })[inner]
        if type(tool_id) ~= "string" or tool_id == "" then
            return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "tool not active: " .. inner })
        end
        if type(invoke_fn) ~= "function" then return nil, errors.new({ kind = errors.INTERNAL, message = "no invoker" }) end
        local result, invoke_err = invoke_fn(tool_id, (args :: any).arguments or canonical_json.object({}), { "params", "arguments", "arguments" })
        return result, invoke_err, tool_id
    end

    return nil, errors.new({ kind = errors.NOT_FOUND, message = "unknown meta tool: " .. tostring(name) })
end

return M
