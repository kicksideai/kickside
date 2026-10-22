local http = require("http")
local security = require("security")
local funcs = require("funcs")
local registry = require("registry")
local contract = require("contract")
local component = require("component")
local agent_types = require("agent_types")
local query_params = require("query_params")
local agent_ref = require("agent_ref")

local PACK_TOKEN = "kickside.agents.api:pack_start_token"
local AGENT_RESOLVER_CONTRACT = "wippy.agent:resolver"
local MAX_PICKER_LIMIT = 100

-- Pack a start token via the isolated pack_start_token function (separate pool),
-- keeping the session token chain out of this handler's import closure.
local function pack_token(agent, model, kind)
    local r, call_err = funcs.call(PACK_TOKEN, { agent = agent, model = model, kind = kind })
    if call_err then return nil, call_err end
    if not r then return nil, "token packing failed" end
    return r.token, r.error
end

local function open_start_resolver(actor)
    local scope = security.scope()
    if not scope then
        return nil, "authorization scope unavailable"
    end
    local def, err = contract.get(AGENT_RESOLVER_CONTRACT)
    if err or not def then
        return nil, err or "agent resolver contract not found"
    end
    local resolver, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err or not resolver then
        return nil, open_err or "agent resolver open failed"
    end
    return resolver, nil
end

-- The reason an agent cannot start, as the launch list reports it.
local function start_error(err: error)
    local details = err:details()
    return {
        code = type(details) == "table" and details.code or nil,
        kind = err:kind(),
        message = err:message(),
    }
end

-- Resolves an agent for launch. The resolver returns nil without an error for
-- an agent the caller cannot reach, which stays out of the list. A resolver
-- error names why a reachable agent cannot start.
local function resolve_start(resolver, agent_id)
    local spec, err = resolver:resolve({ agent_id = agent_id })
    if err then return true, start_error(err) end
    return spec ~= nil, nil
end

local AGENT_TYPE = "agent.gen1"
local DEFAULT_CLASS = "public"
local DEFAULT_ORDER = 500
local DEFAULT_GROUP = "Agents"
local DEFAULT_KIND = "default"
local USER_AGENT_GROUP = "Custom Agents"

local function as_list(value, fallback)
    if type(value) == "table" then
        return value
    end
    if value == nil or value == "" then
        return { fallback }
    end
    return { value }
end

local function contains(list, expected)
    for _, value in ipairs(list or {}) do
        if value == expected then return true end
    end
    return false
end

local function order_value(value)
    return tonumber(value) or DEFAULT_ORDER
end

local function system_agent_visible(meta, required_class)
    -- Discovery is private-by-default. `meta.public` is the canonical visibility
    -- declaration; class is only a grouping tag and cannot grant visibility.
    if type(meta) ~= "table" or meta.public ~= true or meta.private == true then
        return false
    end
    local classes = as_list(meta.class, DEFAULT_CLASS)
    return contains(classes, required_class or DEFAULT_CLASS)
end

local function enabled_flag(value)
    return value == true or value == 1 or value == "true"
end

local function palette_metadata(meta)
    meta = type(meta) == "table" and meta or {}
    return {
        palette_hidden = enabled_flag(meta.palette_hidden),
        environment = meta.environment,
    }
end

local function agent_before(a, b)
    -- The user's own agents lead, so a limited picker browse always surfaces
    -- them ahead of the system catalog instead of trimming them off the tail.
    if a.source ~= b.source then
        return a.source == "user"
    end
    if a.order == b.order then
        return (a.title or "") < (b.title or "")
    end
    return a.order < b.order
end

-- Builds the agent list for `actor`. `opts.launch` selects the chat host's
-- launch list, the one mode that resolves each agent and packs start tokens.
-- Returns the response payload and its HTTP status.
local function list(actor, opts)
    local required_class = opts.required_class
    local want_ids: { [string]: boolean }? = opts.want_ids
    local wanted_user_ids: { string } = opts.wanted_user_ids or {}
    local q = opts.q
    local limit = opts.limit
    local resolve_mode = opts.launch ~= true

    local function id_wanted(name)
        return want_ids == nil or want_ids[name] == true
    end
    local function q_match(title, comment)
        if q == nil then return true end
        return string.find(string.lower(title or ""), q, 1, true) ~= nil
            or string.find(string.lower(comment or ""), q, 1, true) ~= nil
    end

    local start_resolver = nil
    if not resolve_mode then
        local resolver, resolver_err = open_start_resolver(actor)
        if not resolver then
            return { success = false, error = "Failed to open agent resolver: " .. tostring(resolver_err) }, http.STATUS.INTERNAL_ERROR
        end
        start_resolver = resolver
    end

    local entries, err = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = AGENT_TYPE
    })

    if err then
        return { success = false, error = err }, http.STATUS.INTERNAL_ERROR
    end

    local agents = {}
    -- Launch mode only: reachable agents the resolver rejects, with the reason.
    -- They stay out of `agents`, whose entries all carry a start token.
    local unavailable = {}
    for _, entry in ipairs(entries) do
        if not system_agent_visible(entry.meta, required_class) then
            goto continue
        end
        local classes = as_list(entry.meta.class, DEFAULT_CLASS)

        local model = entry.meta.model or (entry.data and entry.data.model)
        local kind = entry.meta.session_kind or DEFAULT_KIND

        local group = entry.meta.group
        if not group or (type(group) == "table" and #group == 0) then
            group = { DEFAULT_GROUP }
        elseif type(group) ~= "table" then
            group = { group }
        end

        local agent = {
            name = entry.id or "",
            title = entry.meta.title or "",
            comment = entry.meta.comment or "",
            group = group,
            order = order_value(entry.meta.order),
            icon = entry.meta.icon or "",
            class = classes,
            model = model,
            source = "system",
            public = true,
        }
        for key, value in pairs(palette_metadata(entry.meta)) do agent[key] = value end

        if not id_wanted(agent.name) or not q_match(agent.title, agent.comment) then
            goto continue
        end

        if not resolve_mode then
            local reachable, failure = resolve_start(start_resolver, agent.name)
            if not reachable then
                goto continue
            end
            if failure then
                agent.can_start = false
                agent.start_error = failure
                table.insert(unavailable, agent)
                goto continue
            end
            local token, token_err = pack_token(entry.id or "", model, kind)
            if not token then
                return {
                    success = false,
                    error = "Failed to generate start token for " .. (agent.name or "unknown") .. ": " .. (token_err or "unknown error")
                }, http.STATUS.INTERNAL_ERROR
            end
            agent.start_token = token
            agent.can_start = true
        end

        table.insert(agents, agent)

        ::continue::
    end

    -- Merge user-created agents from the component service
    local service, svc_err = component.get_service()
    if service and not svc_err then
        local user_components = {}
        if want_ids ~= nil then
            if #wanted_user_ids > 0 then
                local rows, _ = component.query({
                    component_ids = wanted_user_ids,
                    impl_ids = { agent_types.USER_AGENT_IMPL },
                    include = { meta = true, access = true },
                    limit = #wanted_user_ids,
                    offset = 0,
                })
                user_components = rows or {}
            end
        else
            local user_result, _ = service:list({
                filters = {
                    impl_ids = { agent_types.USER_AGENT_IMPL },
                },
                pagination = { limit = 100, offset = 0 },
            })
            if user_result and user_result.success then
                user_components = user_result.components or {}
            end
        end

        for _, comp in ipairs(user_components) do
            local component_id = type(comp.component_id) == "string" and comp.component_id or ""
            if component_id == "" then
                goto continue_user_component
            end
            -- Every agent the caller can read lists; meta.public governs
            -- discovery by other subjects, not the caller's own picker.
            local meta = comp.meta or {}
            -- Surface the agent's own model (meta.model, written on create/update).
            -- No silent default: substituting one here would pack a start token for a
            -- different LLM than the agent is configured for. A blank model (corrupt
            -- record) flows through as-is, exactly like the system-agent path above.
            local model = meta.model

            -- The agent's resolvable id matches the session/start-token ref
            -- ("user_agent:<id>"), like a system agent's registry id, so the
            -- chat host resolves a real name instead of the raw ref.
            local name = agent_ref.user(component_id)
            local title = meta.title or "Custom Agent"
            local comment = meta.comment or ""

            if id_wanted(name) and q_match(title, comment) then
                local agent = {
                    name = name,
                    title = title,
                    comment = comment,
                    group = { USER_AGENT_GROUP },
                    order = DEFAULT_ORDER + 100,
                    icon = meta.icon or "tabler:robot",
                    class = { DEFAULT_CLASS },
                    model = model,
                    source = "user",
                    public = true,
                }
                for key, value in pairs(palette_metadata(meta)) do agent[key] = value end
                if resolve_mode then
                    table.insert(agents, agent)
                else
                    local reachable, failure = resolve_start(start_resolver, name)
                    if not reachable then
                        goto continue_user_component
                    end
                    if failure then
                        agent.can_start = false
                        agent.start_error = failure
                        table.insert(unavailable, agent)
                        goto continue_user_component
                    end
                    local token, _ = pack_token(name, model, DEFAULT_KIND)
                    if token then
                        agent.start_token = token
                        agent.can_start = true
                        table.insert(agents, agent)
                    end
                end
            end
            ::continue_user_component::
        end
    end

    table.sort(agents, agent_before)

    if limit and #agents > limit then
        local trimmed = {}
        for i = 1, limit do trimmed[#trimmed + 1] = agents[i] end
        agents = trimmed
    end

    local groups = {}
    local group_map = {}

    for _, agent in ipairs(agents) do
        for _, group_name in ipairs(agent.group) do
            if not group_map[group_name] then
                group_map[group_name] = {
                    name = group_name,
                    title = group_name,
                    order = DEFAULT_ORDER,
                    agents = {}
                }
                table.insert(groups, group_map[group_name])
            end
            table.insert(group_map[group_name].agents, agent)
        end
    end

    table.sort(groups, function(a, b)
        if a.order == b.order then
            return (a.title or "") < (b.title or "")
        end
        return a.order < b.order
    end)

    local payload: { [string]: any } = {
        success = true,
        count = #agents,
        agents = agents,
        grouped = groups
    }
    if not resolve_mode then
        table.sort(unavailable, agent_before)
        payload.unavailable = unavailable
    end
    return payload, http.STATUS.OK
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return
    end

    res:set_content_type(http.CONTENT.JSON)
    res:set_header("Cache-Control", "no-store")

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    -- Optional ?class=<tag> narrows system agents to a specific surface
    -- (e.g. agent_manager for the agent-management page). User agents are
    -- always merged regardless of this filter.
    local required_class = req:query("class")
    if not required_class or required_class == "" then
        required_class = DEFAULT_CLASS
    end

    -- Selection mode: the shared multi-select resolves chips via ?ids=<refs> and
    -- searches via ?q=&limit=. In either mode we return the same agent shape but
    -- skip start-token packing (a picker never launches a session), so a chip
    -- resolves its real title from the canonical id with no per-agent token cost.
    local ids_param = req:query("ids")
    local want_ids: { [string]: boolean }? = nil
    local wanted_user_ids: { string } = {}
    local wanted_user_seen: { [string]: boolean } = {}
    if type(ids_param) == "string" and ids_param ~= "" then
        local parsed_want: { [string]: boolean } = {}
        for id in string.gmatch(ids_param, "([^,]+)") do
            local trimmed = agent_ref.trim(id)
            if trimmed ~= "" then
                parsed_want[trimmed] = true
                local user_id = agent_ref.user_component_id(trimmed)
                if user_id and not wanted_user_seen[user_id] then
                    wanted_user_seen[user_id] = true
                    wanted_user_ids[#wanted_user_ids + 1] = user_id
                end
            end
        end
        want_ids = parsed_want
    end
    local q = req:query("q")
    if type(q) == "string" and q ~= "" then q = string.lower(q) else q = nil end
    -- A picker call carries ids (resolve chips), q (search), or limit (browse).
    -- Only the bare, param-less call is the chat host's launch list, which is the
    -- one mode that needs start tokens — pickers never launch a session, so they
    -- skip token packing (and the silent per-agent drop on a pack failure).
    local raw_limit = req:query("limit")
    local has_limit = type(raw_limit) == "string" and raw_limit ~= ""
    local limit = nil
    if want_ids == nil then
        local parsed_limit, limit_err = query_params.query_int(req, "limit", nil, { min = 1, max = MAX_PICKER_LIMIT })
        if limit_err then
            query_params.bad_request(res, limit_err)
            return
        end
        if parsed_limit ~= nil then
            limit = parsed_limit
        elseif q ~= nil then
            limit = 20
        end
    end

    local payload, status = list(actor, {
        required_class = required_class,
        want_ids = want_ids,
        wanted_user_ids = wanted_user_ids,
        q = q,
        limit = limit,
        launch = want_ids == nil and q == nil and not has_limit,
    })
    res:set_status(status)
    res:write_json(payload)
end

return {
    handler = handler,
    list = list,
    system_agent_visible = system_agent_visible,
    user_agent_visible = agent_types.component_is_public,
    palette_metadata = palette_metadata,
}
