local contract = require("contract")
local security = require("security")
local registry = require("registry")
local logger = require("logger")
local component = require("component")
local agent_types = require("agent_types")
local tool_resolver = require("tool_resolver")
local curator_specs = require("curator_specs")
local agent_ref = require("agent_ref")
local agent_registry = require("agent_registry")
local capability_context = require("capability_context")
local checkpoint_policy = require("checkpoint_policy")

local COMPONENT_SERVICE = "kickside.component:component_service"
-- Private trait auto-attached when an agent has delegates; folds the delegation
-- semantics + target list into the prompt (see traits/init_delegate.lua).
local DELEGATE_TRAIT = "kickside.agents.traits:delegate"

local function registry_agent_spec(agent_id: string): any?
    local spec, err = agent_registry.get_by_id(agent_id)
    if spec then
        local applied, policy_err = checkpoint_policy.apply(spec)
        if policy_err then return nil, errors.new({kind = errors.INVALID, message = tostring(policy_err)}) end
        return applied
    end
    logger:warn("agent resolver: native registry agent unavailable", {
        agent_id = agent_id,
        err = tostring(err or "not found"),
    })
    return nil
end

local function provider_sort(a, b)
    local am = a.meta or {}
    local bm = b.meta or {}
    local ao = tonumber(am.order) or 100
    local bo = tonumber(bm.order) or 100
    if ao ~= bo then return ao < bo end
    return tostring(am.title or a.id) < tostring(bm.title or b.id)
end

local function resolve_memory_provider(provider_id)
    local query = {
        [".kind"] = "registry.entry",
        ["meta.type"] = agent_types.MEMORY_PROVIDER_TYPE,
    }
    if provider_id and provider_id ~= "" then
        query[".id"] = provider_id
    end

    local entries, err = registry.find(query)
    if err or not entries or #entries == 0 then
        return nil
    end
    table.sort(entries, provider_sort)
    for _, entry in ipairs(entries) do
        local meta = entry.meta or {}
        if not meta.private and type(meta.implementation_id) == "string" and meta.implementation_id ~= "" then
            return {
                id = entry.id,
                implementation_id = meta.implementation_id,
            }
        end
    end
    return nil
end

-- A delegate becomes a tool the LLM can call. Two concerns are encoded here:
--   1. The tool name must be a valid function identifier (^[a-zA-Z0-9_-]+$),
--      so the human title is slugged at assembly time (delegate_tool).
--   2. The description must spell out delegate semantics, because the compiler
--      prefixes it with "Forward the request to " which otherwise reads like a
--      handoff. A delegate is NOT a handoff: the sub-agent runs in an isolated
--      context (it does not see this conversation), does the subtask, and
--      returns its result; the calling agent stays in control. `rule` carries
--      that, plus the target's own description as the "when to use" hint.
local function delegate_spec(id, title, description)
    local desc = (type(description) == "string" and description ~= "") and description or nil
    local rule = "the '" .. title .. "' sub-agent to handle a self-contained subtask "
        .. "in an isolated context and return its result to you. This does not hand off "
        .. "the conversation -- you stay in control and continue with the result"
    if desc then
        rule = rule .. ". Delegate here for: " .. desc
    end
    return { id = id, title = title, description = desc, rule = rule }
end

-- A delegate id resolves to either a user agent component or a registry entry.
-- When it resolves to NEITHER it is a dangling ref (the target agent was deleted);
-- return nil so the caller skips it -- mirrors resolve_memory_provider, which
-- returns nil for a missing provider and lets the caller warn-and-omit.
local function resolve_delegate(service, delegate_id)
    local delegate_comp, _ = service:get({ component_id = delegate_id })
    if delegate_comp and delegate_comp.success then
        local delegate_meta = delegate_comp.meta or {}
        return delegate_spec(agent_ref.user(delegate_id), delegate_meta.title or delegate_id, delegate_meta.comment)
    end

    local entry, _ = registry.get(delegate_id)
    if entry and entry.meta then
        return delegate_spec(delegate_id, entry.meta.title or delegate_id, entry.meta.comment)
    end

    return nil
end

-- Turn a resolved delegate into its LLM-facing tool entry: a sanitized,
-- collision-free name plus the routing id and the semantic rule.
local function delegate_tool(spec, used)
    local name = tool_resolver.sanitize_name(spec.title)
    if name == "" then name = "delegate" end
    local base, n = name, 2
    while used[name] do
        name = base .. "_" .. n
        n = n + 1
    end
    used[name] = true
    return { id = spec.id, name = name, rule = spec.rule, title = spec.title, description = spec.description }
end

local function open_component_service()
    local service_def, get_err = contract.get(COMPONENT_SERVICE)
    if get_err or not service_def then
        return nil, get_err or "component service not found"
    end

    local actor = security.actor()
    if not actor then
        return nil, "resolver requires an authenticated actor"
    end

    local scope = security.scope()
    if not scope then
        return nil, "resolver requires a security scope"
    end

    local service, open_err = (service_def :: any):with_actor(actor):with_scope(scope):open()
    if open_err or not service then
        return nil, open_err or "failed to open component service"
    end
    return service, nil
end

local function resolve(input)
    local agent_id = input.agent_id
    if not agent_id or type(agent_id) ~= "string" or agent_id == "" then
        return nil
    end

    -- Accept both the canonical "user_agent:<component_id>" form and a bare
    -- component id. The chat agent switcher sends the bare component id while
    -- internal callers use the prefixed form; both name the same custom agent.
    local component_id = agent_ref.user_component_id(agent_id)
    if component_id == nil then
        return registry_agent_spec(agent_id)
    end

    local service, svc_err = open_component_service()
    if svc_err or not service then
        logger:warn("agent resolver: component service unavailable", { err = tostring(svc_err) })
        return nil
    end

    local comp_result, comp_err = service:get({ component_id = component_id })
    if comp_err or not comp_result or not comp_result.success then
        logger:warn("agent resolver: component lookup failed", {
            component_id = component_id,
            err = tostring(comp_err or (comp_result and comp_result.error) or "not found"),
        })
        return nil
    end

    -- Only user agent components are agents. KBs, connections, and automations
    -- share the components table; a bare id pointing at one of those must fall
    -- through (return nil) rather than resolve as an agent.
    if comp_result.impl_id ~= agent_types.USER_AGENT_IMPL then
        return nil
    end

    local ctx_result, ctx_err = service:get_access_context({
        component_id = component_id,
        access_mask = component.ACCESS.READ,
        include_context = true,
    })
    if ctx_err or not ctx_result or not ctx_result.success then
        logger:warn("agent resolver: access denied", {
            component_id = component_id,
            err = tostring(ctx_err or (ctx_result and ctx_result.error) or "no access"),
        })
        return nil
    end

    local meta = comp_result.meta or {}
    -- ctx_result.context holds the agent config agents.create persisted.
    local private_ctx = (ctx_result.context or {}) :: agent_types.AgentConfig

    local model = private_ctx.model
    if not model or model == "" then
        return nil, errors.new({
            kind = errors.INVALID,
            message = "Configure a model for this agent before starting it.",
            details = { code = "agent_model_required", component_id = component_id },
        })
    end

    local trait_contexts = curator_specs.copy_trait_contexts(private_ctx.trait_contexts)
    local context_validation = capability_context.validate_trait_contexts(private_ctx.traits, trait_contexts, registry.get)
    if context_validation.ok ~= true then
        return nil, errors.new({
            kind = errors.INVALID,
            message = "Agent capability context is invalid: " .. capability_context.error_message(context_validation),
            details = { code = "agent_trait_context_invalid", component_id = component_id },
        })
    end
    local trait_agent_options = type(private_ctx.trait_agent_options) == "table" and private_ctx.trait_agent_options or {}
    local traits = {}
    if private_ctx.traits and type(private_ctx.traits) == "table" then
        for _, trait_id in ipairs(private_ctx.traits) do
            local ctx = trait_contexts[trait_id]
            local runtime_options = trait_agent_options[trait_id]
            if ctx or type(runtime_options) == "table" then
                local spec: any = { id = trait_id }
                if ctx then
                    spec.context = curator_specs.copy_trait_context(trait_id, ctx)
                end
                if type(runtime_options) == "table" then
                    spec.agent_options = runtime_options
                end
                table.insert(traits, spec)
            else
                table.insert(traits, { id = trait_id })
            end
        end
    end

    local self_ref = agent_ref.user(component_id)
    traits = curator_specs.seed(traits, self_ref)

    local tools = {}
    if private_ctx.tools and type(private_ctx.tools) == "table" then
        for _, tool_id in ipairs(private_ctx.tools) do
            table.insert(tools, tool_id)
        end
    end

    local delegates = {}
    if private_ctx.delegates and type(private_ctx.delegates) == "table" then
        local used_names = {}
        for _, delegate_id in ipairs(private_ctx.delegates) do
            local spec = resolve_delegate(service, delegate_id)
            if spec then
                table.insert(delegates, delegate_tool(spec, used_names))
            else
                -- Dangling delegate (target agent deleted): omit it from the tool
                -- list AND the derived delegate prompt so the LLM is never offered a
                -- delegate that resolves to nothing.
                logger:warn("agent resolver: delegate unavailable", {
                    component_id = component_id,
                    delegate_id = delegate_id,
                })
            end
        end
    end

    -- When the agent has delegates, attach the private delegate trait. It is not
    -- user-assignable (hidden from the Capabilities picker); it is derived from
    -- the delegate set so the prompt explains delegation semantics and lists the
    -- targets by their LLM tool name + purpose.
    if #delegates > 0 then
        local targets = {}
        for _, d in ipairs(delegates) do
            table.insert(targets, { name = d.name, title = d.title, description = d.description })
        end
        table.insert(traits, { id = DELEGATE_TRAIT, context = { targets = targets } })
    end

    -- A non-empty system prompt is required: an empty string (not just nil) would
    -- produce an empty system block, which the Claude provider rejects when it
    -- tags the block for prompt caching ("cache_control cannot be set for empty
    -- text blocks").
    local prompt = private_ctx.prompt
    if not prompt or prompt == "" then prompt = "You are a helpful AI assistant." end

    local resolved = {
        id = agent_ref.user(component_id),
        name = meta.title or "Custom Agent",
        prompt = prompt,
        model = model,
        -- Temperature is opt-in: modern models reject it, so nothing is sent
        -- unless the agent explicitly stores a number (false = explicit off).
        temperature = private_ctx.temperature ~= false and private_ctx.temperature or nil,
        max_tokens = private_ctx.max_tokens or agent_types.DEFAULT_MAX_TOKENS,
        thinking_effort = private_ctx.thinking_effort ~= false and private_ctx.thinking_effort or nil,
        traits = traits,
        agent_options = private_ctx.agent_options or {},
        tools = tools,
        delegates = delegates,
    }

    if private_ctx.memory_target_id and private_ctx.memory_target_id ~= "" then
        local provider = resolve_memory_provider(private_ctx.memory_provider_id)
        if provider then
            resolved.memory_contract = {
                implementation_id = provider.implementation_id,
                context = {
                    component_id = private_ctx.memory_target_id,
                    provider_id = provider.id,
                },
            }
        else
            logger:warn("agent resolver: memory provider unavailable", {
                component_id = component_id,
                provider_id = private_ctx.memory_provider_id,
            })
        end
    end

    local applied, policy_err = checkpoint_policy.apply(resolved)
    if policy_err then return nil, errors.new({kind = errors.INVALID, message = tostring(policy_err)}) end
    return applied
end

return { resolve = resolve }
