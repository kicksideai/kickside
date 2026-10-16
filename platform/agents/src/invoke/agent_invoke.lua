-- kickside.data:writable endpoint for running a user agent. The write IS the run:
-- resolve the target agent, overlay any extra traits, run a single agent flow, and
-- return the agent's output.

local contract = require("contract")
local flow = require("flow")
local json = require("json")
local registry = require("registry")
local security = require("security")
local component = require("component")
local agent_types = require("agent_types")
local agent_ref = require("agent_ref")
local capability_context = require("capability_context")
local tool_visibility = require("tool_visibility")
local writable_sink = require("writable_sink")
local checkpoint_policy = require("checkpoint_policy")

local M = {}

local AGENT_RESOLVER_CONTRACT = "wippy.agent:resolver"
local MAX_ITERATIONS = 50
local MAX_TOOLS = 40

type Map = { [string]: any }

type Deps = {
    flow: any?,
    resolver: any?,
    get_entry: ((string) -> (any?, any?))?,
    can_tool: ((string) -> boolean)?,
    can_agent: ((string) -> boolean)?,
    agent_service: any?,
}

type RunOk = {
    agent_id: string,
    metadata: Map,
    run_result: any,
}

type RunErr = {
    message: string,
    retriable: boolean,
    code: string?,
}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function positive_int(value: any, default_value: integer, min_value: integer, max_value: integer): integer
    local n = tonumber(value) or default_value
    n = math.floor(n)
    if n < min_value then return min_value end
    if n > max_value then return max_value end
    return n :: integer
end

local function string_list(raw: any, max_items: integer): { string }
    local out: { string } = {}
    local seen: { [string]: boolean } = {}
    if type(raw) ~= "table" then return out end
    for _, item in ipairs(raw :: { any }) do
        local id = ""
        if type(item) == "string" then
            id = trim(item)
        elseif type(item) == "table" then
            id = trim((item :: Map).id)
        end
        if id ~= "" and not seen[id] then
            seen[id] = true
            out[#out + 1] = id
            if #out >= max_items then break end
        end
    end
    return out
end

local function copy_selected_map(raw: any, selected: { string }): Map
    local out: Map = {}
    if type(raw) ~= "table" then return out end
    local allowed: { [string]: boolean } = {}
    for _, id in ipairs(selected) do allowed[id] = true end
    for k, v in pairs(raw :: Map) do
        if type(k) == "string" and allowed[k] and type(v) == "table" then
            out[k] = v
        end
    end
    return out
end

local function trait_spec(id: string, context_value: any, agent_options: any): any
    local spec: Map = { id = id }
    if type(context_value) == "table" and next(context_value :: Map) ~= nil then
        spec.context = context_value
    end
    if type(agent_options) == "table" and next(agent_options :: Map) ~= nil then
        spec.agent_options = agent_options
    end
    return spec
end

local function flow_mod(deps: Deps?): any
    return (deps and deps.flow) or flow
end

local function current_runtime_identity(): (any?, any?, string?)
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, nil, "security actor and scope are required"
    end
    return actor, scope, nil
end

local function get_entry_fn(deps: Deps?): (string) -> (any?, any?)
    return function(id: string): (any?, any?)
        if deps and deps.get_entry then
            return (deps.get_entry :: any)(id)
        end
        return (registry :: any).get(id)
    end
end

-- check_tool_ids requires every override entry to name a registered function.lua
-- declaring meta.type=tool, the same shape the tool caller dispatches, so a run is
-- refused up front instead of failing mid-flow on an id that is not a tool.
local function check_tool_ids(tool_ids: { string }, deps: Deps?): (string?, boolean?)
    local get_entry = get_entry_fn(deps)
    for _, id in ipairs(tool_ids) do
        local entry, entry_err = get_entry(id)
        if entry_err or type(entry) ~= "table" then return "unknown tool: " .. id end
        local e = entry :: Map
        local entry_meta = (type(e.meta) == "table" and e.meta or {}) :: Map
        if e.kind ~= "function.lua" or entry_meta.type ~= "tool" then return "not a tool: " .. id end
        if tool_visibility.meta_is_private(entry_meta) then return "tool is private: " .. id, true end
        local frame = type(e.security) == "table" and (e.security :: Map) or {}
        if frame.actor ~= nil or frame.scope ~= nil then
            return "tool has configured authority: " .. id, true
        end
        local allowed
        if deps and deps.can_tool then allowed = deps.can_tool(id)
        else allowed = security.can("funcs.call", id) end
        if allowed ~= true then return "tool is not authorized: " .. id, true end
    end
    return nil
end

local function check_trait_contexts(traits: { string }, trait_contexts: Map, deps: Deps?): string?
    local validation = capability_context.validate_trait_contexts(traits, trait_contexts, get_entry_fn(deps))
    if validation.ok == true then return nil end
    return "capability context invalid: " .. capability_context.error_message(validation)
end

-- Authorize the selected target before handing it to flow. The system-agent
-- resolver accepts a namespaced registry id without checking visibility.
local function authorization_failure(stage: string, failure: any): RunErr
    local kind = type(failure) == "table" and failure.kind or nil
    if errors.is(failure, errors.PERMISSION_DENIED) or kind == errors.PERMISSION_DENIED then
        return { message = stage .. ": " .. tostring(failure), retriable = false, code = "permission_denied" }
    end
    if errors.is(failure, errors.NOT_FOUND) or kind == errors.NOT_FOUND then
        return { message = stage .. ": " .. tostring(failure), retriable = false, code = "not_found" }
    end
    local code = (errors.is(failure, errors.UNAVAILABLE) or kind == errors.UNAVAILABLE)
        and "provider_unavailable" or "provider_error"
    return { message = stage .. ": " .. tostring(failure or "no result"), retriable = true, code = code }
end

local function authorize_agent(ref: string, deps: Deps?): (boolean, RunErr?)
    if deps and deps.can_agent then return deps.can_agent(ref) == true, nil end
    local component_id = agent_ref.user_component_id(ref)
    if component_id then
        local service, service_err
        if deps and deps.agent_service then service = deps.agent_service
        else service, service_err = component.get_service() end
        if service_err or not service then return false, authorization_failure("component service", service_err) end
        local agent, get_err = service:get({ component_id = component_id })
        if get_err or not agent then return false, authorization_failure("agent lookup", get_err) end
        if agent.success ~= true then return false, authorization_failure("agent lookup", agent) end
        if agent.impl_id ~= agent_types.USER_AGENT_IMPL then return false, nil end
        local access, access_err = service:get_access_context({
            component_id = component_id, access_mask = component.ACCESS.READ, include_context = false,
        })
        if access_err or not access then return false, authorization_failure("agent access check", access_err) end
        if access.success ~= true then return false, authorization_failure("agent access check", access) end
        return true, nil
    end
    local entry, entry_err = get_entry_fn(deps)(ref)
    if entry_err then return false, authorization_failure("agent registry lookup", entry_err) end
    if type(entry) ~= "table" then return false, nil end
    local meta = type(entry.meta) == "table" and entry.meta or {}
    return entry.kind == "registry.entry" and meta.type == "agent.gen1"
        and meta.public == true and meta.private ~= true
end

local function resolver_instance(deps: Deps?): (any?, string?)
    if deps and deps.resolver then return deps.resolver, nil end
    local resolver_contract, err = contract.get(AGENT_RESOLVER_CONTRACT)
    if err or not resolver_contract then return nil, "agent resolver unavailable: " .. tostring(err) end
    local actor, scope, security_err = current_runtime_identity()
    if security_err then return nil, security_err end
    local resolver, open_err = resolver_contract:with_actor(actor):with_scope(scope):open()
    if open_err or not resolver then return nil, "agent resolver open failed: " .. tostring(open_err) end
    return resolver, nil
end

-- The flow agent target. With no extra traits or overrides the bare agent ref runs
-- as-is; extra traits are merged over the resolved spec (by id, last wins) and per-run
-- overrides (prompt/model/temperature/tools) overlay it, so the run carries the
-- configured shaping without mutating the stored agent. A tools override replaces the
-- spec's top-level tool list; the compiler merges trait-contributed tools separately,
-- so trait-granted tools remain with the run.
local function build_agent_target(agent_ref: string, traits: { string }, trait_contexts: Map, trait_agent_options: Map, overrides: Map, deps: Deps?): (any, Map?, string?)
    local has_traits = type(traits) == "table" and #traits > 0
    local has_overrides = type(overrides) == "table" and next(overrides :: Map) ~= nil
    if not has_traits and not has_overrides then
        return agent_ref, nil, nil
    end

    local resolver, rerr = resolver_instance(deps)
    if not resolver then return nil, nil, rerr end
    local raw_spec, resolve_err = resolver:resolve({ agent_id = agent_ref })
    if resolve_err or type(raw_spec) ~= "table" then
        return nil, nil, "agent could not be resolved for overlay: " .. tostring(resolve_err or "not found")
    end

    local spec: Map = {}
    for k, v in pairs(raw_spec :: Map) do spec[k] = v end

    if has_traits then
        local merged: { any } = {}
        local by_id: { [string]: integer } = {}
        if type(spec.traits) == "table" then
            for _, existing in ipairs(spec.traits :: { any }) do
                local id = type(existing) == "string" and existing or (type(existing) == "table" and (existing :: Map).id or nil)
                if type(id) == "string" and id ~= "" and by_id[id] == nil then
                    merged[#merged + 1] = existing
                    by_id[id] = #merged
                end
            end
        end
        for _, id in ipairs(traits) do
            local next_spec = trait_spec(id, trait_contexts[id], trait_agent_options[id])
            if by_id[id] then
                merged[by_id[id]] = next_spec
            else
                merged[#merged + 1] = next_spec
                by_id[id] = #merged
            end
        end
        spec.traits = merged
    end

    if has_overrides then
        for k, v in pairs(overrides :: Map) do spec[k] = v end
    end

    if overrides.model ~= nil then
        local applied, policy_err = checkpoint_policy.apply(spec)
        if policy_err then return nil, nil, tostring(policy_err) end
        spec = applied
    end

    return spec, nil, nil
end

-- output_of(value) is the agent's answer text when the run returns one,
-- otherwise the run's structured result itself.
local function output_of(value: any): any
    if type(value) == "table" then
        local direct = (value :: Map).answer or (value :: Map).text or (value :: Map).message or (value :: Map).result
        if type(direct) == "string" then return direct end
    end
    return value
end

local function fail(message: string, retriable: boolean, code: string?): any
    return {
        success = false,
        error = { code = code or (retriable and "provider_error" or "invalid_request"), message = tostring(message),
            retriable = retriable, scope = retriable and "provider" or "item" },
    }
end

local function run_fail(message: string, retriable: boolean, code: string?): RunErr
    return { message = tostring(message), retriable = retriable, code = code }
end

local function run_agent(req: any, deps: Deps?): (RunOk?, RunErr?)
    req = type(req) == "table" and req or {}
    local config = type(req.config) == "table" and req.config or {}
    local input = type(req.input) == "table" and req.input or {}

    local resolved_agent_ref = agent_ref.normalize(config.agent_id)
    if resolved_agent_ref == "" then return nil, run_fail("agent_id is required", false) end
    local message = trim(input.content)
    if message == "" then message = trim(config.message) end
    if message == "" then return nil, run_fail("a message is required", false) end

    local authorized, auth_err = authorize_agent(resolved_agent_ref, deps)
    if auth_err then return nil, auth_err end
    if not authorized then
        return nil, run_fail("agent is not authorized: " .. resolved_agent_ref, false, "permission_denied")
    end

    local context = trim(config.context)
    if context ~= "" then
        message = message .. "\n\nContext:\n" .. context
    end

    local traits = string_list(config.traits, 40)
    local trait_contexts = copy_selected_map(config.trait_contexts, traits)
    local trait_agent_options = copy_selected_map(config.trait_agent_options, traits)
    local trait_err = check_trait_contexts(traits, trait_contexts, deps)
    if trait_err then return nil, run_fail(trait_err, false) end
    local max_iterations = positive_int(config.max_iterations, 8, 1, MAX_ITERATIONS)
    local title = trim(config.title) ~= "" and trim(config.title) or resolved_agent_ref

    -- Optional per-run overrides of the selected agent, empty when unset so the agent
    -- keeps its own configuration.
    local overrides: Map = {}
    local system_prompt = trim(config.system_prompt)
    if system_prompt ~= "" then overrides.prompt = system_prompt end
    local model_override = trim(config.model)
    if model_override ~= "" then overrides.model = model_override end
    local temperature_raw = config.temperature
    if type(temperature_raw) == "number" then
        overrides.temperature = temperature_raw
    elseif type(temperature_raw) == "string" and trim(temperature_raw) ~= "" then
        local parsed = tonumber(trim(temperature_raw))
        if parsed ~= nil then overrides.temperature = parsed end
    end
    -- config.tool_ids replaces the agent's directly assigned tools for this run;
    -- trait-granted tools remain (the compiler merges trait tool contributions
    -- separately from the spec tool list). Empty keeps the agent's own tools.
    local tool_ids = string_list(config.tool_ids, MAX_TOOLS)
    if #tool_ids > 0 then
        local tool_err, denied = check_tool_ids(tool_ids, deps)
        if tool_err then return nil, run_fail(tool_err, false, denied and "permission_denied" or nil) end
        overrides.tools = tool_ids
    end

    local agent_target, agent_metadata, target_err = build_agent_target(resolved_agent_ref, traits, trait_contexts, trait_agent_options, overrides, deps)
    if target_err then return nil, run_fail(target_err, false) end

    local metadata = type(req.metadata) == "table" and (req.metadata :: Map) or {}
    local arena_context: Map = {}
    for k, v in pairs(metadata) do arena_context[k] = v end

    local agent_cfg: Map = {
        arena = {
            max_iterations = max_iterations,
            tool_calling = "auto",
            context = arena_context,
        },
        metadata = agent_metadata or { title = title .. " agent" },
    }
    local run_result, run_err = flow_mod(deps).create()
        :with_title("Agent run: " .. title)
        :with_metadata(metadata)
        :with_input({ message = message })
        :agent(agent_target, agent_cfg)
        :run()
    if run_err then return nil, run_fail(tostring(run_err), true) end

    return {
        agent_id = resolved_agent_ref,
        metadata = metadata,
        run_result = run_result,
    }, nil
end

local function full_content(value: any): string
    if value == nil then return "" end
    if type(value) == "string" then return value end
    if type(value) == "table" then
        local direct = (value :: Map).answer or (value :: Map).text or (value :: Map).message or (value :: Map).result
        if type(direct) == "string" then return direct end
        local encoded, err = json.encode(value)
        if not err and type(encoded) == "string" then return encoded end
    end
    return tostring(value)
end

local function pipe_envelope(run: RunOk): Map
    local metadata: Map = {}
    for k, v in pairs(run.metadata or {}) do metadata[k] = v end
    metadata.agent_id = run.agent_id
    local out: Map = {
        success = true,
        content = full_content(run.run_result),
        content_type = "text/markdown",
        metadata = metadata,
        raw = run.run_result,
    }
    if type(run.run_result) == "table" then out.structured = run.run_result end
    return out
end

-- invoke(req) runs the configured agent once as a pipe transform and returns the full
-- content with the structured output alongside it.
function M.invoke(req: any, deps: Deps?): (any, any?)
    local run, err = run_agent(req, deps)
    if err then
        -- The funcs boundary returns only the first value plus a call-level
        -- error, so a (nil, message) failure loses its reason across it. The
        -- failure is therefore a self-describing envelope (the write shape);
        -- the second return stays for in-process callers.
        local e = err :: RunErr
        return {
            success = false,
            error = { code = e.code or "agent_invoke_error", message = e.message, retriable = e.retriable, scope = "sink" },
        }, e.message
    end
    return pipe_envelope(run :: RunOk), nil
end

-- write(req) runs the configured agent once. req follows the kickside.data:writable
-- ABI: config carries the endpoint picker values (agent_id + the run shaping), input
-- carries the message. Returns the writable result with the agent's whole output so
-- a caller (recurrent_action) can mirror it into public state.
function M.write(req: any, deps: Deps?): any
    local _, origin_failure = writable_sink.origin(req)
    if origin_failure then return origin_failure end
    local run, err = run_agent(req, deps)
    if err then return fail(err.message, err.retriable, err.code) end
    local r = run :: RunOk
    local output = output_of(r.run_result)
    local ref: Map = { agent_id = r.agent_id }
    if type(req) == "table" then
        if type(req.identity_key) == "string" and req.identity_key ~= "" then ref.identity_key = req.identity_key end
        if type(req.idempotency_key) == "string" and req.idempotency_key ~= "" then ref.idempotency_key = req.idempotency_key end
    end
    local slot = type(req) == "table" and trim(req.map_slot) or ""
    if slot == "" then slot = "default" end
    return {
        success = true,
        result = "created",
        dest_ref = ref,
        dest_refs = { [slot] = { dest_ref = ref } },
        output = output,
    }
end

return M
