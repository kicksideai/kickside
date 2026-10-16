local http = require("http")
local security = require("security")
local funcs = require("funcs")
local component = require("component")
local agent_types = require("agent_types")
local query_params = require("query_params")
local agent_ref = require("agent_ref")

local PACK_TOKEN = "kickside.agents.api:pack_start_token"
local MAX_PICKER_LIMIT = 100

-- Pack a start token via the isolated pack_start_token function (separate pool),
-- keeping the session token chain out of this handler's import closure.
local function pack_token(agent, model, kind)
    local r, call_err = funcs.call(PACK_TOKEN, { agent = agent, model = model, kind = kind })
    if call_err or not r then return nil end
    return r.token
end

local function bare_component_id(id)
    return agent_ref.user_component_id(id) or ""
end

local function agent_payload(comp, include_token: boolean): any
    local meta = comp.meta or {}
    local model = meta.model or ""
    local id = comp.component_id
    if type(id) ~= "string" or id == "" then return nil end

    local agent = {
        id = id,
        title = meta.title or "",
        description = meta.comment or "",
        icon = meta.icon or "tabler:robot",
        public = agent_types.component_is_public(meta),
        status = meta.status or "active",
        model = model,
        delegate_count = meta.delegate_count or 0,
        created_at = comp.created_at,
        updated_at = comp.updated_at,
        access_level = comp.access_level or 0,
    }

    if include_token then
        local token = pack_token(agent_ref.user(id), model, "default")
        if not token then return nil end
        agent.start_token = token
    end
    return agent
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return end

    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    -- Async multi-select params for the search-based delegate/redirect picker:
    -- `ids` returns only the listed agents (resolves selected chips, ignores
    -- q/limit), `q` is a case-insensitive title/description substring filter,
    -- `limit` caps rows (defaults to 20 when q is present). With none present
    -- the full list is returned unfiltered.
    local ids_param = req:query("ids")
    local want_ids: { [string]: boolean }? = nil
    local id_order: { string }? = nil
    if type(ids_param) == "string" and ids_param ~= "" then
        local parsed_want: { [string]: boolean } = {}
        local parsed_order: { string } = {}
        for id in string.gmatch(ids_param, "([^,]+)") do
            local component_id = bare_component_id(id)
            if component_id ~= "" and not parsed_want[component_id] then
                parsed_want[component_id] = true
                parsed_order[#parsed_order + 1] = component_id
            end
        end
        want_ids = parsed_want
        id_order = parsed_order
    end
    local q = nil
    local limit = nil
    if not want_ids then
        local q_param = req:query("q")
        q = (type(q_param) == "string" and q_param ~= "") and string.lower(q_param) or nil
        local parsed_limit, limit_err = query_params.query_int(req, "limit", nil, { min = 1, max = MAX_PICKER_LIMIT })
        if limit_err then
            query_params.bad_request(res, limit_err)
            return
        end
        if parsed_limit ~= nil then
            limit = parsed_limit
        elseif q then
            limit = 20
        end
    end

    local user_id = actor:id()
    if not user_id or user_id == "" then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "invalid actor" })
        return
    end

    local service, svc_err = component.get_service()
    if svc_err or not service then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "component service unavailable" })
        return
    end

    if want_ids then
        local ids: { string } = id_order or {}
        local rows, query_err = component.query({
            component_ids = ids,
            impl_ids = { agent_types.USER_AGENT_IMPL },
            include = { meta = true, access = true },
            limit = #ids,
            offset = 0,
        })
        if query_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, error = tostring(query_err) })
            return
        end

        local by_id = {}
        for _, comp in ipairs(rows or {}) do
            by_id[comp.component_id] = comp
        end

        local agents = {}
        for _, id in ipairs(ids) do
            local comp = by_id[id]
            if comp then
                local agent = agent_payload(comp, false)
                if agent then table.insert(agents, agent) end
            end
        end

        res:set_status(http.STATUS.OK)
        res:write_json({
            success = true,
            count = #agents,
            agents = agents,
        })
        return
    end

    -- The component service scopes list_components to the ambient actor through
    -- the access join, so the returned set is every agent the user can reach:
    -- their own and the ones shared with them, each row carrying access_level.
    local result, list_err = service:list({
        filters = { impl_ids = { agent_types.USER_AGENT_IMPL } },
        pagination = { limit = 100, offset = 0 },
    })
    if not result or not result.success then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = list_err or (result and result.error) or "list failed" })
        return
    end

    local agents = {}
    for _, comp in ipairs(result.components or {}) do
        local meta = comp.meta or {}
        local title = meta.title or ""
        local description = meta.comment or ""

        if q then
            local matched = string.find(string.lower(title), q, 1, true) ~= nil
                or string.find(string.lower(description), q, 1, true) ~= nil
            if not matched then goto continue end
        end

        local agent = agent_payload(comp, not q and not limit)
        if agent then table.insert(agents, agent) end

        if limit and #agents >= limit then break end

        ::continue::
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        count = #agents,
        agents = agents,
    })
end

return { handler = handler, agent_payload = agent_payload }
