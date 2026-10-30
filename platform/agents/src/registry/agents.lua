-- Canonical implementation of `kickside.agents:agents` registry contract.
--
-- An agent is a component with class=agent, impl_id=kickside.agents:user_agent.
-- Configuration (prompt, model, tools, traits, kb) lives in private_context.
-- Composes kickside.component:component_service for the full agent lifecycle —
-- component creation, meta, access, and private_context (via PATCH_CONTEXT). No
-- direct table access; the component module owns its persistence.
--
-- Binding methods return (result, error?) where error carries a typed `kind`
-- (the shared errors framework), so consumers classify by kind, not message prose.

local contract = require("contract")
local uuid = require("uuid")
local component = require("component")
local envelope = require("envelope")
local registry = require("registry")
local security = require("security")
local errors = require("errors")
local agent_types = require("agent_types")
local capability_context = require("capability_context")
local capability_visibility = require("capability_visibility")

local COMPONENT_SERVICE = "kickside.component:component_service"
local AGENT_CLASS = agent_types.AGENT_CLASS

local M = {}

-- Build a typed error carrying a `kind` for kind-based HTTP/status classification.
local function fail(kind: any, message: string): error
    return (errors.new({ message = message, kind = kind }) :: error)
end

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

local function validate_trait_contexts(traits: any, trait_contexts: any): error?
    local validation, err = capability_context.validate_trait_contexts(traits, trait_contexts, registry.get)
    if err then return err end
    if validation.ok == true then return nil end
    return fail(errors.INVALID, "capability context invalid: " .. capability_context.error_message(validation))
end

local function validate_capability_ids(ids: any, capability_type: string): error?
    local _, err = capability_visibility.validate_ids(ids, capability_type, registry.get)
    return err
end

local function open_component_service(): (any, error?)
    local svc, err = contract.get(COMPONENT_SERVICE)
    if err then return nil, fail(errors.INTERNAL, "component_service: " .. tostring(err)) end
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, fail(errors.PERMISSION_DENIED, "security actor and scope are required")
    end
    local instance, ierr = svc:with_actor(actor):with_scope(scope):open()
    if ierr then return nil, fail(errors.INTERNAL, "open: " .. tostring(ierr)) end
    return instance, nil
end

local function read_private_context(component_id: string): (any, error?, integer?)
    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end
    local ctx_result, ctx_err = svc:get_access_context({
        component_id = component_id,
        access_mask = component.ACCESS.WRITE,
        include_context = true,
    })
    if ctx_err then return nil, fail(errors.NOT_FOUND, "get_access_context: " .. tostring(ctx_err)) end
    if not ctx_result or not ctx_result.success then
        return nil, fail(errors.PERMISSION_DENIED, "get_access_context returned: " .. tostring(ctx_result and ctx_result.error or "no result"))
    end
    return ctx_result.context or {}, nil, ctx_result.context_revision
end

-- Patch a component's private_context through the component_service PATCH_CONTEXT
-- command: only the supplied keys are written, every other key is left untouched
-- server-side. This is the partial-update seam that avoids the read-modify-write
-- lost update where two writers each rewrite the whole blob and drop each other's
-- fields. No direct table access — the component module owns that persistence.
local function patch_private_context(component_id: string, patch: any, expected_revision: integer?): (any, error?)
    if type(patch) ~= "table" then
        return nil, fail(errors.INVALID, "patch table is required")
    end

    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end
    local result, uerr = svc:update({
        component_id = component_id,
        commands = { { type = "PATCH_CONTEXT", payload = { component_id = component_id, patch = patch } } },
        expected_revision = expected_revision,
    })
    if uerr then return nil, envelope.call_error(uerr, "update private_context") end
    local result_err = envelope.error_of(result, "update private_context")
    if result_err then return nil, result_err end
    return patch, nil
end

-- ─── contract methods ──────────────────────────────────────────────────

-- create: create an agent.
-- Input:  { name, prompt?, model?, tools?, traits?, delegates?, ... }
-- Output: { component_id, name, rollback }
function M.create(args: any): (agent_types.CreateResult?, error?)
    args = args or {}
    if not is_str(args.name) then return nil, fail(errors.INVALID, "name is required") end

    -- New agents can create artifacts and read uploads by default. An explicit empty traits array
    -- remains a supported opt-out, and update never backfills existing agents.
    local traits = args.traits
    if traits == nil then traits = agent_types.default_traits() end

    local trait_err = validate_capability_ids(traits, "trait")
    if trait_err then return nil, trait_err end
    local tool_err = validate_capability_ids(args.tools, "tool")
    if tool_err then return nil, tool_err end

    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end

    local component_id = uuid.v4()

    local private_context = ({
        prompt = args.prompt or "",
        model = args.model or agent_types.DEFAULT_MODEL,
        temperature = tonumber(args.temperature),
        max_tokens = tonumber(args.max_tokens) or agent_types.DEFAULT_MAX_TOKENS,
        traits = traits,
        trait_contexts = args.trait_contexts or {},
        trait_agent_options = args.trait_agent_options or {},
        agent_options = args.agent_options or {},
        tools = args.tools or {},
        delegates = args.delegates or {},
        thinking_effort = args.thinking_effort,
        memory_target_id = args.memory_target_id or "",
        memory_provider_id = args.memory_provider_id or "",
    }) :: agent_types.AgentConfig
    local context_err = validate_trait_contexts(private_context.traits, private_context.trait_contexts)
    if context_err then return nil, context_err end

    local result, err = svc:register({
        component_id = component_id,
        impl_id = agent_types.USER_AGENT_IMPL,
        private_context = private_context,
        meta = {
            title = args.name,
            comment = args.description or "",
            icon = args.icon or "tabler:robot",
            class = AGENT_CLASS,
            status = "active",
            model = args.model or agent_types.DEFAULT_MODEL,
            delegate_count = tostring(#(args.delegates or {})),
            public = args.public == true,
        },
    })
    if err then return nil, fail(errors.INTERNAL, "register_component: " .. tostring(err)) end
    if not result or not result.success then
        return nil, fail(errors.INTERNAL, "register failed: " .. tostring(result and result.error or "unknown"))
    end

    return ({
        component_id = component_id,
        name = args.name,
        rollback = { method = "delete", args = { component_id = component_id } },
    }) :: agent_types.CreateResult, nil
end

-- find: lookup by component_id or name.
function M.find(args: any): (agent_types.ComponentRow?, error?)
    args = args or {}
    if not is_str(args.component_id) and not is_str(args.name) then
        return nil, fail(errors.INVALID, "component_id or name is required")
    end

    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end

    local meta: { [string]: string } = { class = AGENT_CLASS }
    if is_str(args.name) then meta.title = args.name :: string end

    local result, err = svc:list({ filters = { meta = meta } })
    if err then return nil, fail(errors.INTERNAL, "list_components: " .. tostring(err)) end
    if not result or not result.success then
        return nil, fail(errors.INTERNAL, "list_components returned: " .. tostring(result and result.error or "no result"))
    end

    local list = ((result.components or {}) :: { agent_types.ComponentRow })
    if is_str(args.component_id) then
        for _, c in ipairs(list) do
            if c.component_id == args.component_id then return c, nil end
        end
        return nil, nil
    end
    if #list == 0 then return nil, nil end
    return list[1], nil
end

function M.upsert(args: any): (agent_types.UpsertResult?, error?)
    args = args or {}
    if not is_str(args.name) then return nil, fail(errors.INVALID, "name is required") end
    local existing, err = M.find({ name = args.name })
    if err then return nil, err end
    if existing then return ({ agent = existing, created = false, rollback = nil }) :: agent_types.UpsertResult, nil end
    local created, cerr = M.create(args)
    if cerr then return nil, cerr end
    local agent, find_err = M.find({ component_id = created.component_id })
    if find_err then return nil, find_err end
    if not agent then return nil, fail(errors.NOT_FOUND, "created agent component not found: " .. created.component_id) end
    return ({ agent = agent, created = true, rollback = created.rollback }) :: agent_types.UpsertResult, nil
end

-- update: patch metadata + private_context fields.
function M.update(args: any): (agent_types.ComponentRef?, error?)
    args = args or {}
    if not is_str(args.component_id) then return nil, fail(errors.INVALID, "component_id is required") end

    local trait_err = validate_capability_ids(args.traits, "trait")
    if trait_err then return nil, trait_err end
    local tool_err = validate_capability_ids(args.tools, "tool")
    if tool_err then return nil, tool_err end

    local meta_fields: { [string]: any } = {}
    if args.name ~= nil then meta_fields.title = args.name end
    if args.description ~= nil then meta_fields.comment = args.description end
    if args.icon ~= nil then meta_fields.icon = args.icon end
    if args.model ~= nil then meta_fields.model = args.model end
    if args.public ~= nil then meta_fields.public = args.public == true end

    local pc_patch: { [string]: any } = {}
    if args.prompt ~= nil then pc_patch.prompt = args.prompt end
    if args.model ~= nil then pc_patch.model = args.model end
    if args.temperature == false then pc_patch.temperature = false
    elseif args.temperature ~= nil then pc_patch.temperature = tonumber(args.temperature) end
    if args.max_tokens ~= nil then pc_patch.max_tokens = tonumber(args.max_tokens) end
    if args.tools ~= nil then pc_patch.tools = args.tools end
    if args.traits ~= nil then pc_patch.traits = args.traits end
    if args.trait_contexts ~= nil then pc_patch.trait_contexts = args.trait_contexts end
    if args.trait_agent_options ~= nil then pc_patch.trait_agent_options = args.trait_agent_options end
    if args.agent_options ~= nil then pc_patch.agent_options = args.agent_options end
    if args.delegates ~= nil then pc_patch.delegates = args.delegates end
    if args.thinking_effort == false then pc_patch.thinking_effort = false
    elseif args.thinking_effort ~= nil then pc_patch.thinking_effort = args.thinking_effort end
    if args.memory_target_id ~= nil then pc_patch.memory_target_id = args.memory_target_id end
    if args.memory_provider_id ~= nil then pc_patch.memory_provider_id = args.memory_provider_id end

    if next(meta_fields) == nil and next(pc_patch) == nil then
        return nil, fail(errors.INVALID, "nothing to update")
    end

    local expected_revision: integer? = nil
    if next(pc_patch) ~= nil then
        if args.traits ~= nil or args.trait_contexts ~= nil then
            local existing, rerr, revision = read_private_context(args.component_id :: string)
            if rerr then return nil, rerr end
            expected_revision = revision
            local traits = args.traits ~= nil and args.traits or existing.traits or {}
            local trait_contexts = args.trait_contexts ~= nil and args.trait_contexts or existing.trait_contexts or {}
            local context_err = validate_trait_contexts(traits, trait_contexts)
            if context_err then return nil, context_err end
        end
    end

    local commands: { any } = {}
    if next(meta_fields) ~= nil then
        commands[#commands + 1] = { type = "SET_META", payload = { fields = meta_fields } }
    end
    if next(pc_patch) ~= nil then
        commands[#commands + 1] = { type = "PATCH_CONTEXT", payload = { patch = pc_patch } }
    end

    -- Metadata and private agent config describe one logical edit. Send both
    -- through the component service's transaction-scoped update batch so a
    -- failure in either projection rolls the whole edit back.
    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end
    local result, update_err = svc:update({
        component_id = args.component_id,
        commands = commands,
        expected_revision = expected_revision,
    })
    if update_err then return nil, envelope.call_error(update_err, "update agent") end
    local result_err = envelope.error_of(result, "update agent")
    if result_err then return nil, result_err end

    return ({ component_id = args.component_id }) :: agent_types.ComponentRef, nil
end

-- delete: remove agent component.
function M.delete(args: any): (agent_types.ComponentRef?, error?)
    args = args or {}
    if not is_str(args.component_id) then return nil, fail(errors.INVALID, "component_id is required") end

    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end

    local result, err = svc:delete({ component_id = args.component_id })
    if err then return nil, fail(errors.INTERNAL, "delete_component: " .. tostring(err)) end
    if not result or not result.success then
        return nil, fail(errors.INTERNAL, "delete_component returned: " .. tostring(result and result.error or "no result"))
    end
    return ({ component_id = args.component_id }) :: agent_types.ComponentRef, nil
end

-- list: one offset page of visible agents, newest first. Filters: text?.
-- Output: { agents, total_count, has_more }
function M.list(args: any): (any?, error?)
    args = args or {}
    local request: any = { filters = { meta = { class = AGENT_CLASS } } }
    if is_str(args.text) then request.filters.text = args.text end
    if type(args.pagination) == "table" then request.pagination = args.pagination end
    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end
    local result, err = svc:list(request)
    if err then return nil, envelope.call_error(err, "list_components") end
    local result_err = envelope.error_of(result, "list_components")
    if result_err then return nil, result_err end
    local rows = (result.components or {}) :: { agent_types.ComponentRow }
    return { agents = rows, total_count = result.total_count or #rows, has_more = result.has_more == true }, nil
end

-- ─── KB / tool / thread bindings ──────────────────────────────────────

local function attach_array(component_id: string, key: string, value: string): (any, error?)
    local existing, err, revision = read_private_context(component_id)
    if err then return nil, err end
    local arr: { string } = ((existing :: any)[key] or {}) :: { string }
    -- dedup
    for _, v in ipairs(arr) do
        if v == value then return { component_id = component_id, attached = true, deduped = true }, nil end
    end
    arr[#arr + 1] = value
    local _, perr = patch_private_context(component_id, { [key] = arr }, revision)
    if perr then return nil, perr end
    return { component_id = component_id, attached = true }, nil
end

local function detach_array(component_id: string, key: string, value: string): (any, error?)
    local existing, err, revision = read_private_context(component_id)
    if err then return nil, err end
    local arr: { string } = ((existing :: any)[key] or {}) :: { string }
    local new_arr: { string } = {}
    for _, v in ipairs(arr) do
        if v ~= value then new_arr[#new_arr + 1] = v end
    end
    local _, perr = patch_private_context(component_id, { [key] = new_arr }, revision)
    if perr then return nil, perr end
    return { component_id = component_id, detached = true }, nil
end

function M.attach_kb(args: any): (any, error?)
    args = args or {}
    if not is_str(args.component_id) then return nil, fail(errors.INVALID, "component_id is required") end
    if not is_str(args.kb_id) then return nil, fail(errors.INVALID, "kb_id is required") end
    -- agent has a single memory_target_id (not array) — set it.
    local _, err = patch_private_context(args.component_id :: string, { memory_target_id = args.kb_id })
    if err then return nil, err end
    return { component_id = args.component_id, kb_id = args.kb_id, attached = true }, nil
end

function M.detach_kb(args: any): (any, error?)
    args = args or {}
    if not is_str(args.component_id) then return nil, fail(errors.INVALID, "component_id is required") end
    if not is_str(args.kb_id) then return nil, fail(errors.INVALID, "kb_id is required") end
    local existing, read_err, revision = read_private_context(args.component_id :: string)
    if read_err then return nil, read_err end
    if (existing :: any).memory_target_id ~= args.kb_id then
        return nil, fail(errors.INVALID, "kb " .. tostring(args.kb_id) .. " is not this agent's memory KB")
    end
    local _, err = patch_private_context(args.component_id :: string, { memory_target_id = "" }, revision)
    if err then return nil, err end
    return { component_id = args.component_id, detached = true }, nil
end

function M.attach_tool(args: any): (any, error?)
    args = args or {}
    if not is_str(args.component_id) then return nil, fail(errors.INVALID, "component_id is required") end
    if not is_str(args.tool_id) then return nil, fail(errors.INVALID, "tool_id is required") end
    local tool_err = validate_capability_ids({ args.tool_id }, "tool")
    if tool_err then return nil, tool_err end
    return attach_array(args.component_id :: string, "tools", args.tool_id :: string)
end

function M.detach_tool(args: any): (any, error?)
    args = args or {}
    if not is_str(args.component_id) then return nil, fail(errors.INVALID, "component_id is required") end
    if not is_str(args.tool_id) then return nil, fail(errors.INVALID, "tool_id is required") end
    return detach_array(args.component_id :: string, "tools", args.tool_id :: string)
end

return M
