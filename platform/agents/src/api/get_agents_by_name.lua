local http = require("http")
local registry = require("registry")
local security = require("security")
local component = require("component")
local component_envelope = require("component_envelope")
local agent_ref = require("agent_ref")
local agent_types = require("agent_types")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local registry = deps.registry or registry
    local component = deps.component or component

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
        and (meta.private == nil or meta.private == false)
end

-- A missing entry and a denied read both mean "no agent" for this caller.
-- Every other failure goes back to the caller with its cause.
local function means_no_agent(err): boolean
    return errors.is(err, errors.NOT_FOUND) or errors.is(err, errors.PERMISSION_DENIED)
end

local function get_agent_by_id(agent_id)
    local entry, err = registry.get(agent_id)
    if err then
        if means_no_agent(err) then return nil end
        return nil, err
    end
    if not is_public_system_agent(entry) then return nil end
    return entry
end

local function get_agent_by_name(name, key)
    local entries, err = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = "agent.gen1",
        ["meta." .. key] = name
    })
    if err then
        if means_no_agent(err) then return nil end
        return nil, err
    end

    for _, entry in ipairs(entries or {}) do
        if is_public_system_agent(entry) then
            return entry
        end
    end
    return nil
end

-- User agents are workspace components, not registry entries: resolve the
-- title through the component service under the caller's READ access, so a
-- chat participant sees the agent's title while anyone else gets no answer.
local function get_user_agent(ref)
    local component_id = agent_ref.user_component_id(ref)
    if not component_id then
        return nil
    end

    local _, access_err = component.validate_access(component_id, component.ACCESS.READ)
    if access_err then
        if means_no_agent(access_err) then return nil end
        return nil, access_err
    end

    local service, svc_err = component.get_service()
    if svc_err or not service then
        return nil, svc_err or "component service is unavailable"
    end

    local comp_result, comp_err = service:get({ component_id = component_id })
    local read_err = comp_err or component_envelope.error_of(comp_result, "get")
    if read_err then
        if means_no_agent(read_err) then return nil end
        return nil, read_err
    end
    if comp_result.impl_id ~= agent_types.USER_AGENT_IMPL then
        return nil
    end

    local meta = type(comp_result.meta) == "table" and comp_result.meta or {}
    if type(meta.title) == "string" and meta.title ~= "" then
        return {id = ref, meta = meta}
    end
    return nil
end

local function resolve_agent(identifier, name_key)
    if agent_ref.is_user(identifier) then return get_user_agent(identifier) end
    if is_agent_id(identifier) then return get_agent_by_id(identifier) end
    return get_agent_by_name(identifier, name_key)
end

local function resolve_identifiers(identifiers)
    local result = {}
    for _, identifier in ipairs(identifiers) do
        local entry = resolve_agent(identifier, "title")
        if entry then result[identifier] = entry.meta.title end
    end
    return result
end

local function describe_agent(identifier)
    local entry, err = resolve_agent(identifier, "name")
    if err then return nil, err end
    if not entry then return nil end
    local prompts = {}
    local declared = entry.data and entry.data.start_prompts
    if type(declared) == "table" then
        for _, prompt in ipairs(declared) do
            if type(prompt) == "string" and prompt ~= "" then
                prompts[#prompts + 1] = prompt
            end
        end
    end
    local name = entry.meta.name or entry.id
    return {id = entry.id, name = name, title = entry.meta.title or name, start_prompts = prompts}
end

-- Catalog lookup for the chat's agent details route. It runs as the caller,
-- so it keeps the public-agent and component READ rules. It returns nil for
-- an unknown or hidden agent, and an error when the lookup itself fails.
local function catalog_agent_details(input)
    local identifier = type(input) == "table" and input.agent or nil
    if type(identifier) ~= "string" or identifier == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "agent_details needs a non-empty 'agent' string" })
    end
    return describe_agent(identifier)
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
    catalog_agent_details = catalog_agent_details,
    describe_agent = describe_agent,
    is_public_system_agent = is_public_system_agent,
    resolve_identifiers = resolve_identifiers,
}
end

local default = new()
default.new = new
return default
