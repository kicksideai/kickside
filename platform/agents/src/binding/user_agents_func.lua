local component = require("component")
local component_envelope = require("component_envelope")
local registry = require("registry")
local agent_types = require("agent_types")
local capability_context = require("capability_context")
local capability_visibility = require("capability_visibility")

local user_agents = {}

local function with_message(cause: any, message: string): error
    local wrapped = errors.wrap(cause, message)
    return errors.new({ message = message, kind = wrapped:kind(),
        retryable = wrapped:retryable(), details = wrapped:details() })
end

local function discovery_meta_fields(args: table): table
    local fields = {}
    -- Public discovery is opt-in and strictly boolean. Missing or malformed
    -- values remain private rather than being coerced truthy.
    if args.public ~= nil then fields.public = args.public == true end
    if args.palette_hidden ~= nil then fields.palette_hidden = args.palette_hidden == true end
    if args.environment ~= nil then fields.environment = tostring(args.environment) end
    return fields
end
user_agents.discovery_meta_fields = discovery_meta_fields

local function update_meta_fields(args: table): table
    local fields = discovery_meta_fields(args)
    -- A metadata-only maintenance patch (for example palette visibility) must not
    -- rewrite the capability summary. Only recompute it when delegates are present.
    if args.delegates ~= nil then fields.delegate_count = #(args.delegates or {}) end
    return fields
end
user_agents.update_meta_fields = update_meta_fields

-- Re-exported for callers that filter components by the user-agent impl.
user_agents.IMPL_ID = agent_types.USER_AGENT_IMPL

local function clamp(value, default, min, max)
    local n = tonumber(value)
    if not n then return default end
    if n < min then return min end
    if n > max then return max end
    return n
end
user_agents.clamp = clamp

local function entry_available(id, entry_type: string): (boolean, string?)
    return capability_visibility.validate_ids({ id }, entry_type, registry.get)
end

-- Verifies each referenced trait/tool is a canonical public capability. Registry
-- reads run under the initiating actor/scope, so an id hidden from that actor is
-- rejected even if another actor could resolve it.
local function validate_entry_ids(ids: any, entry_type: string)
    return capability_visibility.validate_ids(ids, entry_type, registry.get)
end
user_agents.validate_entry_ids = validate_entry_ids

local function filter_entry_ids(ids, entry_type: string)
    if type(ids) ~= "table" then return {} end
    local out = {}
    local seen = {}
    for _, id in ipairs(ids) do
        if type(id) == "string" and id ~= "" and not seen[id] then
            local ok = entry_available(id, entry_type)
            if ok then
                out[#out + 1] = id
                seen[id] = true
            end
        end
    end
    return out
end

local function select_map(map, ids)
    if type(map) ~= "table" then return {} end
    local out = {}
    for _, id in ipairs(ids or {}) do
        if map[id] ~= nil then out[id] = map[id] end
    end
    return out
end

function user_agents.sanitize_agent_refs(private_context: any): any
    local ctx = type(private_context) == "table" and private_context or {}
    local out = {}
    for k, v in pairs(ctx) do out[k] = v end

    local traits = filter_entry_ids(ctx.traits, "trait")
    out.traits = traits
    out.trait_contexts = select_map(ctx.trait_contexts, traits)
    out.trait_agent_options = select_map(ctx.trait_agent_options, traits)
    out.tools = filter_entry_ids(ctx.tools, "tool")
    return out
end

local function validate_trait_contexts(traits: any, trait_contexts: any): (boolean, string?)
    local validation = capability_context.validate_trait_contexts(traits, trait_contexts, registry.get)
    if validation.ok == true then return true, nil end
    return false, "capability context invalid: " .. capability_context.error_message(validation)
end

function user_agents.list_for_user(user_id: string): { any }
    if not user_id or user_id == "" then return {} end

    -- Scope strictly to the given user_id (not the ambient actor): the DM hub
    -- runs as a system actor and must list the DM user's agents. The component
    -- module owns the access join — list_for_subject keeps it inside that seam.
    local comps, err = component.list_for_subject(user_id, { impl_ids = { agent_types.USER_AGENT_IMPL }, meta = true, limit = 50 })
    if err or not comps then return {} end

    local agents: { any } = {}
    for _, c in ipairs(comps) do
        local meta = c.meta or {}
        if agent_types.component_is_public(meta) then
            agents[#agents + 1] = {
                component_id = c.component_id,
                title = meta.title or "",
                description = meta.comment or "",
                status = meta.status or "active",
                delegate_count = meta.delegate_count or 0,
            }
        end
    end
    return agents
end

-- Reads one user agent's editable config (private_context + title). READ access
-- is enforced by the component service, so a shared agent is readable; update
-- keeps its own WRITE gate. Returns { success, agent } or { success=false, error }.
function user_agents.get(component_id: string): any
    if not component_id or component_id == "" then
        return { success = false, error = "component_id is required" }
    end
    local service, svc_err = component.get_service()
    if svc_err or not service then
        return { success = false, error = "component service unavailable" }
    end
    local comp_result, comp_err = service:get({ component_id = component_id })
    if not comp_result or not comp_result.success or comp_result.impl_id ~= agent_types.USER_AGENT_IMPL then
        return { success = false, error = comp_err or "not found" }
    end
    local ctx_result, ctx_err = service:get_access_context({
        component_id = component_id,
        access_mask = component.ACCESS.READ,
        include_context = true,
    })
    if not ctx_result or not ctx_result.success then
        return { success = false, error = ctx_err or "access denied" }
    end
    local meta = comp_result.meta or {}
    local ctx: any = user_agents.sanitize_agent_refs(ctx_result.context or {})
    return {
        success = true,
        agent = {
            component_id = component_id,
            title = meta.title or "",
            traits = ctx.traits or {},
            trait_contexts = ctx.trait_contexts or {},
            trait_agent_options = ctx.trait_agent_options or {},
            agent_options = ctx.agent_options or {},
            tools = ctx.tools or {},
        },
    }
end

-- Registers a new user agent component. Failure returns the original typed error.
local function create(args: table, get_service: any): (any?, error?)
    local title = args.title
    if not title or title == "" then
        return nil, errors.new({ message = "title is required", kind = errors.INVALID })
    end
    local model = args.model or agent_types.DEFAULT_MODEL
    if not model or model == "" then
        return nil, errors.new({ message = "model is required", kind = errors.INVALID })
    end

    local service, svc_err = get_service()
    if svc_err or not service then
        return nil, with_message(svc_err or errors.new({ message = "component service unavailable", kind = errors.INTERNAL }), "component service unavailable")
    end

    -- Reject duplicate names. Without this the picker fills with several agents
    -- sharing a title and users can no longer tell them apart.
    local existing, list_err = service:list({
        filters = { impl_ids = { agent_types.USER_AGENT_IMPL }, meta = { title = title } },
        pagination = { limit = 1, offset = 0 },
    })
    -- The dedup guard can only be trusted on a successful read. On a list failure
    -- existing is nil and the guard would fall through to create, letting a
    -- transient read error admit a duplicate name. Abort the create instead.
    if list_err or not existing or not existing.success then
        local cause = list_err or component_envelope.error_of(existing, "list") or errors.new({ message = "list failed", kind = errors.INTERNAL })
        local wrapped = errors.wrap(cause, "could not verify agent name uniqueness")
        return nil, errors.new({ message = "could not verify agent name uniqueness: " .. tostring(cause),
            kind = wrapped:kind(), retryable = wrapped:retryable(), details = wrapped:details() })
    end
    if existing.components and #existing.components > 0 then
        return nil, errors.new({ message = "An agent named '" .. title .. "' already exists. Pick a different name.", kind = errors.CONFLICT })
    end

    local traits = args.traits
    if traits == nil then traits = agent_types.default_traits() end

    local ok, verr = validate_entry_ids(traits, "trait")
    if not ok then return nil, errors.new({ message = tostring(verr), kind = errors.INVALID }) end
    ok, verr = validate_trait_contexts(traits, args.trait_contexts or {})
    if not ok then return nil, errors.new({ message = tostring(verr), kind = errors.INVALID }) end
    ok, verr = validate_entry_ids(args.tools, "tool")
    if not ok then return nil, errors.new({ message = tostring(verr), kind = errors.INVALID }) end

    local delegates = args.delegates or {}
    local result, err = service:register({
        impl_id = agent_types.USER_AGENT_IMPL,
        -- Workspace "+" places the agent under the current folder; absent = root.
        parent_id = (type(args.parent_id) == "string" and args.parent_id ~= "") and args.parent_id or nil,
        private_context = {
            prompt = args.prompt or "",
            model = model,
            temperature = type(args.temperature) == "number" and clamp(args.temperature, agent_types.DEFAULT_TEMPERATURE, 0, 2) or nil,
            max_tokens = clamp(args.max_tokens, agent_types.DEFAULT_MAX_TOKENS, 1, 128000),
            thinking_effort = args.thinking_effort,
            traits = traits,
            trait_contexts = args.trait_contexts or {},
            trait_agent_options = args.trait_agent_options or {},
            agent_options = args.agent_options or {},
            tools = args.tools or {},
            delegates = delegates,
            memory_target_id = args.memory_target_id or "",
            memory_provider_id = args.memory_provider_id or "",
        },
        meta = {
            title = title,
            comment = args.description or "",
            icon = args.icon or "tabler:robot",
            class = agent_types.AGENT_CLASS,
            status = "active",
            model = model,
            delegate_count = #delegates,
            public = args.public == true,
            palette_hidden = args.palette_hidden == true,
            environment = args.environment,
        },
    })
    if not result or not result.success then
        return nil, err or component_envelope.error_of(result, "register") or errors.new({ message = "creation failed", kind = errors.INTERNAL })
    end

    return { success = true, component_id = result.component_id }
end

-- Updates an existing user agent in place. Patches metadata via the component
-- contract (WRITE access enforced there) and merges private_context with the
-- stored values so omitted fields are preserved. Same return shape as create().
local function update(component_id: string, args: table, get_service: any): (any?, error?)
    if not component_id or component_id == "" then
        return nil, errors.new({ message = "component_id is required", kind = errors.INVALID })
    end

    local ok, verr = validate_entry_ids(args.traits, "trait")
    if not ok then return nil, errors.new({ message = tostring(verr), kind = errors.INVALID }) end
    ok, verr = validate_entry_ids(args.tools, "tool")
    if not ok then return nil, errors.new({ message = tostring(verr), kind = errors.INVALID }) end

    local meta_fields = update_meta_fields(args)
    if args.title ~= nil then meta_fields.title = args.title end
    if args.description ~= nil then meta_fields.comment = args.description end
    if args.icon ~= nil then meta_fields.icon = args.icon end
    if args.model ~= nil then meta_fields.model = args.model end
    for key, value in pairs(discovery_meta_fields(args)) do meta_fields[key] = value end

    local service, svc_err = get_service()
    if svc_err or not service then
        return nil, with_message(svc_err or errors.new({ message = "component service unavailable", kind = errors.INTERNAL }), "component service unavailable")
    end
    -- The merge below fills omitted fields from the stored context, so the read
    -- MUST succeed. Aborting on a context error surfaces the failure instead of
    -- merging against an empty context, which would persist the agent with a wiped
    -- prompt/model/capabilities on a transient error.
    local ctx_result, ctx_err = service:get_access_context({
        component_id = component_id,
        access_mask = component.ACCESS.WRITE,
        include_context = true,
    })
    if ctx_err or not ctx_result or not ctx_result.success then
        local failure = ctx_err or component_envelope.error_of(ctx_result, "get_access_context")
        local message = errors.is(failure, errors.PERMISSION_DENIED) and "agent not found or access denied"
            or "failed to read current agent context: " .. tostring(failure)
        return nil, with_message(failure, message)
    end

    local existing_ctx = user_agents.sanitize_agent_refs(ctx_result.context or {})

    local model = args.model or existing_ctx.model
    local private_context = {
        prompt = args.prompt ~= nil and args.prompt or existing_ctx.prompt or "",
        model = model,
        temperature = (function(): number?
            if args.temperature == false then return nil end
            local wanted = args.temperature ~= nil and args.temperature or existing_ctx.temperature
            if type(wanted) ~= "number" then return nil end
            return clamp(wanted, agent_types.DEFAULT_TEMPERATURE, 0, 2)
        end)(),
        max_tokens = clamp(args.max_tokens ~= nil and args.max_tokens or existing_ctx.max_tokens, agent_types.DEFAULT_MAX_TOKENS, 1, 128000),
        traits = args.traits ~= nil and args.traits or existing_ctx.traits or {},
        trait_contexts = args.trait_contexts ~= nil and args.trait_contexts or existing_ctx.trait_contexts or {},
        trait_agent_options = args.trait_agent_options ~= nil and args.trait_agent_options or existing_ctx.trait_agent_options or {},
        agent_options = args.agent_options ~= nil and args.agent_options or existing_ctx.agent_options or {},
        tools = args.tools ~= nil and args.tools or existing_ctx.tools or {},
        delegates = args.delegates ~= nil and args.delegates or existing_ctx.delegates or {},
        -- false is the explicit clear marker: JSON null decodes to nil, which is
        -- indistinguishable from "field not sent" and must keep the stored value.
        thinking_effort = args.thinking_effort == false and nil
            or (args.thinking_effort ~= nil and args.thinking_effort or existing_ctx.thinking_effort),
        memory_target_id = args.memory_target_id ~= nil and args.memory_target_id or existing_ctx.memory_target_id or "",
        memory_provider_id = args.memory_provider_id ~= nil and args.memory_provider_id or existing_ctx.memory_provider_id or "",
    }

    ok, verr = validate_trait_contexts(private_context.traits, private_context.trait_contexts)
    if not ok then return nil, errors.new({ message = tostring(verr), kind = errors.INVALID }) end

    local commands = {}
    if next(meta_fields) ~= nil then
        commands[#commands + 1] = { type = "SET_META", payload = { fields = meta_fields } }
    end
    commands[#commands + 1] = {
        type = "SET_CONTEXT",
        payload = { private_context = private_context },
    }

    -- Keep the public summary and the private execution config in one component
    -- transaction. Returning an error can no longer leave half of the edit live.
    local result, update_err = service:update({
        component_id = component_id,
        commands = commands,
    })
    if update_err or not result or not result.success then
        local failure = update_err or component_envelope.error_of(result, "update")
        return nil, with_message(failure, "agent update failed: " .. tostring(failure))
    end

    return { success = true, component_id = component_id }
end

-- Each constructed instance has its own service resolver. The registry binding
-- uses component.get_service; callers can supply a service at construction.
function user_agents.new(get_service: any): any
    return {
        create = function(args: table): (any?, error?) return create(args, get_service) end,
        update = function(component_id: string, args: table): (any?, error?) return update(component_id, args, get_service) end,
    }
end

local default_instance = user_agents.new(component.get_service)
user_agents.create = default_instance.create
user_agents.update = default_instance.update

return user_agents
