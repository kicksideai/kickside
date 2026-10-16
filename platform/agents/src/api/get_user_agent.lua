local http = require("http")
local security = require("security")
local component = require("component")
local component_envelope = require("component_envelope")
local http_errors = require("http_errors")
local user_agents = require("user_agents")
local agent_types = require("agent_types")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
    local component = deps.component or component

local function build_agent_payload(component_id: string, comp_result: any, private_context: any, sanitize_refs: any?): any
    local meta = type(comp_result.meta) == "table" and comp_result.meta or {}
    private_context = type(private_context) == "table" and private_context or {}
    if type(sanitize_refs) == "function" then
        private_context = sanitize_refs(private_context)
    end

    return {
        id = component_id,
        impl_id = comp_result.impl_id or "",
        title = meta.title or "",
        description = meta.comment or "",
        icon = meta.icon or "tabler:robot",
        public = agent_types.component_is_public(meta),
        prompt = private_context.prompt or "",
        model = private_context.model or "",
        temperature = private_context.temperature ~= false and private_context.temperature or nil,
        max_tokens = private_context.max_tokens or agent_types.DEFAULT_MAX_TOKENS,
        traits = private_context.traits or {},
        trait_contexts = private_context.trait_contexts or {},
        trait_agent_options = private_context.trait_agent_options or {},
        agent_options = private_context.agent_options or {},
        thinking_effort = private_context.thinking_effort ~= false and private_context.thinking_effort or nil,
        tools = private_context.tools or {},
        delegates = private_context.delegates or {},
        memory_target_id = private_context.memory_target_id or "",
        memory_provider_id = private_context.memory_provider_id or "",
        created_at = comp_result.created_at or "",
        updated_at = comp_result.updated_at or "",
    }
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return
    end

    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local component_id = req:param("id")
    if not component_id or component_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "id is required" })
        return
    end

    -- Typed access gate: the component client returns a kind-carrying error
    -- (NOT_FOUND / PERMISSION_DENIED) that api_errors maps by kind, not message prose.
    -- Reading the config is a read: READ is what a share grants, and the update
    -- endpoint keeps its own WRITE gate.
    local _, access_err = component.validate_access(component_id, component.ACCESS.READ)
    if access_err then
        local status = http_errors.classify(access_err)
        local msg = tostring(access_err or "not found or access denied")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    local service, svc_err = component.get_service()
    if svc_err or not service then
        res:set_status((http_errors.classify(svc_err)))
        res:write_json({ success = false, error = "component service unavailable: " .. tostring(svc_err) })
        return
    end

    -- Access verified above; a failure here is an internal fault, not a client error.
    local comp_result, comp_err = service:get({ component_id = component_id })
    if not comp_result or not comp_result.success then
        res:set_status((http_errors.classify(comp_err or component_envelope.error_of(comp_result, "get"))))
        res:write_json({ success = false, error = "failed to read agent: " .. tostring(comp_err or (comp_result and comp_result.error) or "no result") })
        return
    end

    local ctx_result, ctx_err = service:get_access_context({
        component_id = component_id,
        access_mask = component.ACCESS.READ,
        include_context = true,
    })
    if not ctx_result or not ctx_result.success then
        res:set_status((http_errors.classify(ctx_err or component_envelope.error_of(ctx_result, "get_access_context"))))
        res:write_json({ success = false, error = "failed to read agent context: " .. tostring(ctx_err or (ctx_result and ctx_result.error) or "no result") })
        return
    end

    local private_context = ctx_result.context or {}

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        agent = build_agent_payload(component_id, comp_result, private_context, user_agents.sanitize_agent_refs),
    })
end

return {
    handler = handler,
    build_agent_payload = build_agent_payload,
}
end

local default = new()
default.new = new
return default
