-- Trait curator tool. The master agent uses it to discover the traits available to
-- it and turn them on or off for the rest of the session.
--
--   list        enumerate the activatable traits (non-private agent.trait entries,
--               bounded by the configured namespace allow-list), marking which are
--               already on.
--   activate    add a trait to the session's trait set. The new full set is emitted
--               as a `config.traits` control directive, so the session recompiles
--               the agent and the trait's TOOLS and prompt go live this turn.
--               Optional `context` is passed to that trait as its per-trait context.
--   deactivate  remove a trait the curator previously activated (base traits the
--               agent was configured with cannot be removed at runtime).
--
-- The full set is `base_traits` (the agent's configured set) unioned with the curator's
-- dynamic additions (`master_active`) and their optional contexts (`master_contexts`).
-- Both ride the curator's OWN context inside the
-- {id, context} specs emitted as config.traits -- the one canonical override
-- (set_active_traits, persisted to the session config, cleared on agent switch). So the
-- dynamic set survives a restart and resets per agent with no separate session key. The
-- tool reads its context back through ctx, which the compiler merges into its exec context.

local ctx = require("ctx")
local registry = require("registry")
local id_set = require("id_set")
local master_ns = require("master_ns")
local curator_specs = require("curator_specs")
local capability_context = require("capability_context")
local keyset = require("keyset")

local TRAIT_TYPE = "agent.trait"

local function wants_description(args: any): (boolean?, error?)
    if args.fields == nil then return false, nil end
    if type(args.fields) ~= "table" then return nil, errors.new({ message = "fields must be an array", kind = errors.INVALID }) end
    for _, field in ipairs(args.fields) do
        if field ~= "description" then return nil, errors.new({ message = "unsupported field: " .. tostring(field), kind = errors.INVALID }) end
    end
    return #args.fields > 0, nil
end

-- The trait entry's public meta if id names an activatable trait under the
-- configured namespace scope; nil + reason otherwise (fail closed).
local function configured_traits(): { string }
    return id_set.parse(ctx.get("trait_ids"))
end

local function trait_id_allowed(trait_id: string, trait_ids: { string }): boolean
    if #trait_ids == 0 then return true end
    return id_set.has(trait_ids, trait_id)
end

local function scope_label(namespaces: any, trait_ids: { string }): string
    local base = master_ns.describe(namespaces)
    if #trait_ids == 0 then return base end
    return base .. "; selected capabilities: " .. table.concat(trait_ids, ", ")
end

local function trait_description(meta: any): string
    local desc = tostring(meta.comment or "")
    local schema_note = capability_context.summary(meta.context_schema)
    if schema_note ~= "" then
        if desc ~= "" then desc = desc .. " " .. schema_note else desc = schema_note end
    end
    return desc
end

local function activatable(trait_id: string, namespaces: any, trait_ids: { string }): (any?, error?)
    local entry, err = registry.get(trait_id)
    if err then return nil, err end
    if not entry then return nil, errors.new({ kind = errors.NOT_FOUND, message = "capability `" .. trait_id .. "` not found." }) end
    local meta = (entry :: any).meta or {}
    if meta.type ~= TRAIT_TYPE then return nil, errors.new({ kind = errors.INVALID, message = "`" .. trait_id .. "` is not a capability." }) end
    if meta.private or not meta.public then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "capability `" .. trait_id .. "` is not public and cannot be activated." })
    end
    if not trait_id_allowed(trait_id, trait_ids) then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "capability `" .. trait_id .. "` is outside this agent's selected capability scope." })
    end
    if not master_ns.allowed(namespaces, trait_id) then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "capability `" .. trait_id .. "` is outside this agent's namespace scope ("
            .. master_ns.describe(namespaces) .. ")." })
    end
    return meta, nil
end

local function base_set(): { string }
    return id_set.parse(ctx.get("base_traits"))
end

-- The dynamic set rides the curator's own trait context (carried in active_traits),
-- so it persists with the session config and resets on an agent switch -- no separate
-- session-context key.
local function active_set(): { string }
    return id_set.parse(ctx.get("master_active"))
end

local function active_contexts(): { [string]: any }
    return curator_specs.copy_trait_contexts(ctx.get("master_contexts"))
end

-- Emit the recompile directive. config.traits is sent as {id, context} specs (not a
-- plain id list) so the per-trait context -- including the curator's own base + the
-- dynamic set -- survives the recompile. That single override is the persistence.
local function apply(new_active: { string }, new_contexts: any, message: string): any
    local specs = curator_specs.build(base_set(), new_active, ctx.get("trait_contexts"),
        tostring(ctx.get("self_id") or ""), new_contexts)
    return {
        message = message,
        _control = { config = { traits = specs } },
    }
end

-- list_traits pages the activatable capabilities in id order.
local function list_traits(args: any, namespaces: any, query: string): (any, error?)
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local include_description, fields_err = wants_description(args)
    if fields_err then return nil, fields_err end
    local entries, err = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = TRAIT_TYPE })
    if err then return nil, errors.new({ message = tostring("Error listing capabilities: " .. tostring(err)), kind = errors.INTERNAL }) end
    local base = base_set()
    local active = active_set()
    local trait_ids = configured_traits()
    local rows: { any } = {}
    for _, entry in ipairs((entries or {}) :: { any }) do
        local meta = (entry :: any).meta or {}
        local id = (entry :: any).id or ""
        local searchable = string.lower(id .. " " .. tostring(meta.title or "") .. " " ..
            trait_description(meta) .. " " .. table.concat(id_set.parse(meta.tags), " "))
        if meta.public and not meta.private and id ~= "" and master_ns.allowed(namespaces, id)
            and trait_id_allowed(id, trait_ids) and (query == "" or searchable:find(query, 1, true)) then
            local state = "available"
            if id_set.has(base, id) then state = "base"
            elseif id_set.has(active, id) then state = "active" end
            local row = {
                id = id,
                title = meta.title or id,
                tags = id_set.parse(meta.tags),
                state = state,
                context_configurable = meta.web_component ~= nil,
            }
            if include_description then row.description = trait_description(meta) end
            rows[#rows + 1] = row
        end
    end
    local page, next_cursor = keyset.page(rows, keyset.field("id"), limit :: integer, cursor)
    return { success = true, scope = scope_label(namespaces, trait_ids), capabilities = page, count = #page, next_cursor = next_cursor }, nil
end

local function handler(args: any): (any, error?)
    args = (type(args) == "table") and args or {}
    local action = tostring(args.action or "")
    local namespaces = ctx.get("namespaces")
    local trait_ids = configured_traits()

    if action == "list" then
        return list_traits(args, namespaces, string.lower(tostring(args.q or "")))
    end

    local trait_id = tostring(args.trait_id or "")
    if trait_id == "" then
        return nil, errors.new({ message = tostring("trait_id is required to " .. action .. " a capability. Use list to see available capabilities."), kind = errors.INVALID })
    end

    if action == "activate" then
        local meta, reason = activatable(trait_id, namespaces, trait_ids)
        if not meta then return nil, reason end
        if id_set.has(base_set(), trait_id) then
            return { message = "Capability `" .. trait_id .. "` is part of this agent's base configuration and is already active." }
        end
        local active = active_set()
        if id_set.has(active, trait_id) then
            return { message = "Capability `" .. trait_id .. "` is already active." }
        end
        local contexts = active_contexts()
        local supplied_context = (args :: any).context
        if supplied_context ~= nil then
            local validation = capability_context.validate((meta :: any).context_schema, supplied_context)
            if validation.ok ~= true then
                return nil, errors.new({ message = "capability context invalid for `" .. trait_id .. "`: " ..
                    capability_context.error_message(validation), kind = errors.INVALID })
            end
            contexts[trait_id] = curator_specs.copy_trait_context(trait_id, supplied_context)
        else
            local validation = capability_context.validate((meta :: any).context_schema, {})
            if validation.ok ~= true then
                return nil, errors.new({ message = "capability context required for `" .. trait_id .. "`: " ..
                    capability_context.error_message(validation), kind = errors.INVALID })
            end
        end
        local title = (meta :: any).title or (meta :: any).name or trait_id
        return apply(id_set.add(active, trait_id), contexts,
            "Activated **" .. tostring(title) .. "** `" .. trait_id ..
            "`. Its tools and guidance are now available; deactivate it when you no longer need it.")
    end

    if action == "deactivate" then
        local active = active_set()
        if not id_set.has(active, trait_id) then
            if id_set.has(base_set(), trait_id) then
                return nil, errors.new({ message = tostring("`" .. trait_id .. "` is a base capability of this agent and cannot be deactivated at runtime."), kind = errors.PERMISSION_DENIED })
            end
            return { message = "Capability `" .. trait_id .. "` is not active." }
        end
        local contexts = active_contexts()
        contexts[trait_id] = nil
        return apply(id_set.remove(active, trait_id), contexts,
            "Deactivated capability `" .. trait_id .. "`. Its tools and guidance are no longer available.")
    end

    return nil, errors.new({ message = "Unknown action. Use list, activate, or deactivate.", kind = errors.INVALID })
end

return { handler = handler }
