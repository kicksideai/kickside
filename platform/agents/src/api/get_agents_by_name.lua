local http = require("http")
local registry = require("registry")
local security = require("security")
local component = require("component")
local agent_ref = require("agent_ref")
local agent_types = require("agent_types")

local function split_string(str: string, sep: string): {string}
    local fields: {string} = {}
    local pattern = string.format("([^%s]+)", sep)
    str:gsub(pattern, function(c) fields[#fields + 1] = c end)
    return fields
end

local function is_agent_id(str)
    return str:find(":")
end

local function is_public_system_agent(entry)
    local meta = entry and entry.meta
    return type(meta) == "table"
        and meta.type == "agent.gen1"
        and meta.public == true
        and meta.private ~= true
end

local function get_agent_by_id(agent_id)
    local entry, err = registry.get(agent_id)
    if not entry then
        return nil, err
    end

    if not is_public_system_agent(entry) then
        return nil, "Agent is not public"
    end

    return entry.meta.title
end

local function get_agent_by_name(name)
    local entries, err = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = "agent.gen1",
        ["meta.title"] = name
    })

    if err or not entries or #entries == 0 then
        return nil, err or "Not found"
    end

    for _, entry in ipairs(entries) do
        if is_public_system_agent(entry) then
            return entry.meta.title
        end
    end
    return nil, "Not found"
end

-- User agents are workspace components, not registry entries: resolve the
-- title through the component service under the caller's READ access, so a
-- chat participant sees the agent's title while anyone else gets no answer.
local function get_user_agent_title(ref)
    local component_id = agent_ref.user_component_id(ref)
    if not component_id then
        return nil
    end

    local _, access_err = component.validate_access(component_id, component.ACCESS.READ)
    if access_err then
        return nil
    end

    local service, svc_err = component.get_service()
    if svc_err or not service then
        return nil
    end

    local comp_result = service:get({ component_id = component_id })
    if not comp_result or not comp_result.success then
        return nil
    end
    if comp_result.impl_id ~= agent_types.USER_AGENT_IMPL then
        return nil
    end

    local meta = type(comp_result.meta) == "table" and comp_result.meta or {}
    if type(meta.title) == "string" and meta.title ~= "" then
        return meta.title
    end
    return nil
end

local function resolve_identifiers(identifiers)
    local result = {}
    for _, identifier in ipairs(identifiers) do
        if agent_ref.is_user(identifier) then
            result[identifier] = get_user_agent_title(identifier)
        elseif is_agent_id(identifier) then
            result[identifier] = get_agent_by_id(identifier)
        else
            result[identifier] = get_agent_by_name(identifier)
        end
    end
    return result
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return
    end
    res:set_header("Cache-Control", "no-store")
    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local agents_param = req:query("agents")
    if not agents_param or agents_param == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({
            success = false,
            error = "Missing 'agents' query parameter"
        })
        return
    end

    res:set_content_type(http.CONTENT.JSON)
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        agents = resolve_identifiers(split_string(agents_param, ","))
    })
end

return {
    handler = handler,
    is_public_system_agent = is_public_system_agent,
    resolve_identifiers = resolve_identifiers,
}
