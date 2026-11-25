local logger = require("logger")
local http = require("http")
local registry = require("registry")
local security = require("security")
local component = require("component")
local component_envelope = require("component_envelope")
local agent_ref = require("agent_ref")
local agent_types = require("agent_types")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
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

-- Stored agent data that the chat cannot show is an error, not "no agent".
local function bad_agent(agent_id: string, problem: string): error
    return errors.new({ kind = errors.INTERNAL, message = "agent " .. agent_id .. " " .. problem })
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
-- A user agent without a title is bad data and an error.
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

    local meta = comp_result.meta
    if type(meta) ~= "table" or type(meta.title) ~= "string" or meta.title == "" then
        return nil, bad_agent(ref, "has no title")
    end
    return {id = ref, meta = meta}
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

-- Start prompts must be a list of strings. An empty prompt is dropped. Any
-- other value is bad agent data and an error.
local function start_prompts_of(entry): ({string}?, error?)
    local declared = entry.data and entry.data.start_prompts
    if declared == nil then return {} end
    if type(declared) ~= "table" then
        return nil, bad_agent(entry.id, "has start_prompts that are not a list")
    end
    local count = 0
    for _, prompt in pairs(declared) do
        count = count + 1
        if type(prompt) ~= "string" then
            return nil, bad_agent(entry.id, "has a start prompt that is not a string")
        end
    end
    -- count keys in all, so keys 1..count present means exactly a list.
    for index = 1, count do
        if declared[index] == nil then
            return nil, bad_agent(entry.id, "has start_prompts that are not a list")
        end
    end
    local prompts: {string} = {}
    for _, prompt in ipairs(declared) do
        if prompt ~= "" then prompts[#prompts + 1] = prompt end
    end
    return prompts
end

local function describe_agent(identifier)
    local entry, err = resolve_agent(identifier, "name")
    if err then return nil, err end
    if not entry then return nil end
    local prompts, prompts_err = start_prompts_of(entry)
    if prompts_err then return nil, prompts_err end
    local name = entry.meta.name or entry.id
    return {id = entry.id, name = name, title = entry.meta.title or name, start_prompts = prompts}
end

local function details()
    local req, res = http.request(), http.response()
    if not req or not res then return end
    res:set_header("Cache-Control", "no-store")
    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({success = false, error = "authentication required"})
        return
    end
    local identifier = req:query("agent")
    if type(identifier) ~= "string" or identifier == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({success = false, error = "Missing 'agent' query parameter"})
        return
    end
    local agent, err = describe_agent(identifier)
    if err then
        logger:error("Agent details lookup failed", { error = tostring(err) })
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({success = false, error = "Agent lookup failed"})
        return
    end
    if not agent then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({success = false, error = "Agent not found"})
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({success = true, agent = agent})
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
    details = details,
    describe_agent = describe_agent,
    is_public_system_agent = is_public_system_agent,
    resolve_identifiers = resolve_identifiers,
}
end

local default = new()
default.new = new
return default
