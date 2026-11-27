-- Model card projections and input cleaning.
local registry_models = require("registry_models")
local models_types = require("models_types")
local policy = require("catalog_policy")
local mapper = require("model_mapper")

local M = {}

-- Normalize per-request retry options before saving a model card.
local function normalize_card_options(options: any): any
    if type(options) ~= "table" then return {} end
    if (options :: any).retry ~= nil then
        (options :: any).retry = policy.normalize_retry_config((options :: any).retry)
    end
    return options
end

local function effective_capabilities(inferred: any, overrides: any): { string }
    local out: { string } = {}
    for _, capability in ipairs(inferred or {}) do
        if overrides[capability] ~= false then table.insert(out, capability) end
    end
    local additions: { string } = {}
    for capability, enabled in pairs(overrides) do
        if enabled == true and not policy.table_has(out, capability) then table.insert(additions, capability) end
    end
    table.sort(additions)
    for _, capability in ipairs(additions) do table.insert(out, capability) end
    return out
end

-- Ownership in the stored shape, as an export document carries it.
local function supplied_ownership(value: any): (any?, string?)
    if type(value) ~= "table" then return nil, "capability_ownership must be an object" end
    local inferred = value.inferred
    if inferred ~= nil then
        if type(inferred) ~= "table" then return nil, "capability_ownership.inferred must be a list" end
        inferred = policy.explicit_list(inferred, {})
    end
    if type(value.overrides) ~= "table" then return nil, "capability_ownership.overrides must be an object" end
    local overrides = {}
    for capability, enabled in pairs(value.overrides) do
        if type(capability) ~= "string" or type(enabled) ~= "boolean" then
            return nil, "capability_ownership.overrides must map capabilities to true or false"
        end
        overrides[capability] = enabled
    end
    return { inferred = inferred, overrides = overrides }
end

-- A card's capabilities are its last inferred set with administrator overrides
-- applied. Discovery replaces the inferred set; a save records the membership
-- change it makes as overrides; a reset returns capabilities to discovery.
-- Supplied ownership takes the place of the saved ownership the save is
-- recorded against.
local function capability_ownership(input: any, base: any?, inferred: any?): (any?, any?, string?)
    local saved = base and base.capability_ownership or { inferred = {}, overrides = {} }
    local supplied = input.capability_ownership ~= nil
    if supplied then
        local ownership, ownership_err = supplied_ownership(input.capability_ownership)
        if not ownership then return nil, nil, ownership_err end
        saved = ownership
    end
    local ownership = { inferred = inferred or saved.inferred, overrides = {} }
    for capability, enabled in pairs(saved.overrides) do ownership.overrides[capability] = enabled end
    if inferred ~= nil and saved.inferred == nil then
        for _, capability in ipairs(inferred) do
            if ownership.overrides[capability] == nil then ownership.overrides[capability] = false end
        end
    end
    if inferred == nil then
        local current = effective_capabilities(saved.inferred, saved.overrides)
        local target = policy.explicit_list(input.capabilities,
            supplied and current or (base and base.capabilities or { "generate" }))
        for _, capability in ipairs(current) do
            if not policy.table_has(target, capability) then ownership.overrides[capability] = false end
        end
        for _, capability in ipairs(target) do
            if not policy.table_has(current, capability) then ownership.overrides[capability] = true end
        end
    end
    if input.reset_capabilities ~= nil then
        if type(input.reset_capabilities) ~= "table" then return nil, nil, "reset_capabilities must be a list" end
        if ownership.inferred == nil then return nil, nil, "discover capabilities before resetting overrides" end
        for _, capability in ipairs(input.reset_capabilities) do ownership.overrides[capability] = nil end
    end
    return effective_capabilities(ownership.inferred, ownership.overrides), ownership
end

-- Pricing is visible to members through model resolution. Apply the same
-- credential classification as Models portability while keeping provider rates.
local function public_pricing(value: any): any
    if type(value) ~= "table" then return {} end
    local public, secret = policy.split_config(value)
    if next(secret) == nil then return value end
    return public
end

local function sanitize_discovered_pricing(metadata: any): any
    local discovered = metadata.discovered
    if type(discovered) == "table" and discovered.pricing ~= nil then
        discovered.pricing = public_pricing(discovered.pricing)
    end
    return metadata
end

local function build_card(row: any, profile: any?): (any?, any?)
    local capabilities, capabilities_err = policy.decode_json(row.capabilities_json, {})
    if capabilities_err then return nil, capabilities_err end
    local classes, classes_err = policy.decode_json(row.classes_json, {})
    if classes_err then return nil, classes_err end
    local provider_options, options_err = policy.decode_json(row.options_json, {})
    if options_err then return nil, options_err end
    local pricing, pricing_err = policy.decode_json(row.pricing_json, {})
    if pricing_err then return nil, pricing_err end
    local metadata, metadata_err = policy.decode_json(row.metadata_json, {})
    if metadata_err then return nil, metadata_err end
    local ownership, ownership_err = policy.decode_json(row.capability_ownership_json, nil)
    if ownership_err then return nil, ownership_err end
    -- Model edits take precedence over limits advertised in discovery metadata.
    local stored_limits = {
        max_tokens = models_types.positive_limit(row.max_tokens),
        output_tokens = models_types.positive_limit(row.output_tokens),
        dimensions = models_types.positive_limit(row.dimensions),
    }
    local context, output, dimensions = mapper.model_limits(metadata.discovered)
    local open_context = profile and not profile.error and policy.provider_context(profile) or nil
    local enabled = tonumber(row.enabled) ~= 0

    return {
        id = row.name,
        name = row.name,
        title = row.title ~= "" and row.title or row.name,
        description = row.description or "",
        capabilities = policy.normalize_list(capabilities, {}),
        capability_ownership = ownership,
        class = policy.normalize_list(classes, {}),
        priority = tonumber(row.priority) or 0,
        max_tokens = stored_limits.max_tokens or context,
        output_tokens = stored_limits.output_tokens or output,
        stored_limits = stored_limits,
        pricing = public_pricing(pricing),
        providers = {
            {
                id = row.provider_id,
                provider_model = row.provider_model,
                options = provider_options,
                context = open_context,
                provider_profile_id = row.provider_profile_id,
            }
        },
        dimensions = stored_limits.dimensions or dimensions,
        source = row.source or models_types.SOURCE_MANUAL,
        provider_profile_id = row.provider_profile_id,
        enabled = enabled and not (profile and (profile.error or profile.enabled == false)),
        configured_enabled = enabled,
        class_load_failed = enabled and profile and profile.configured_enabled == true and profile.error ~= nil or nil,
        error = profile and profile.error or nil,
        metadata = sanitize_discovered_pricing(metadata),
    }
end

local function public_card_summary(card: any): any
    local provider = card.providers and card.providers[1] or {}
    return {
        name = card.name,
        title = card.title or card.name,
        capabilities = card.capabilities or {},
        class = card.class or {},
        priority = card.priority or 0,
        source = card.source,
        provider_id = provider.id,
        provider_model = provider.provider_model,
        provider_profile_id = card.provider_profile_id or provider.provider_profile_id,
        enabled = card.enabled ~= false,
        error = card.error,
    }
end

-- Copy the public route fields explicitly. Provider entries may carry private
-- transport settings alongside the catalog fields.
local function public_routes(card: any): { any }
    local routes: { any } = {}
    for _, provider in ipairs(card.providers or {}) do
        routes[#routes + 1] = policy.scrub_sensitive({
            provider_id = provider.id,
            provider_model = provider.provider_model,
            provider_profile_id = provider.provider_profile_id,
            options = provider.options,
            pricing = provider.pricing,
            sampling = provider.sampling,
            limits = provider.limits,
            max_tokens = provider.max_tokens,
            output_tokens = provider.output_tokens,
        })
    end
    return routes
end

local function public_card(card: any): any
    local provider = card.providers and card.providers[1] or {}
    local out = public_card_summary(card)
    out.description = card.description or ""
    out.capability_ownership = card.capability_ownership
    out.max_tokens = card.max_tokens
    out.output_tokens = card.output_tokens
    out.pricing = card.pricing or {}
    out.dimensions = card.dimensions
    out.options = policy.scrub_sensitive(provider.options or {})
    out.routes = public_routes(card)
    out.metadata = policy.scrub_sensitive(card.metadata or {})
    return out
end

-- Carry the saved limits. The receiving catalog derives absent values from
-- discovery metadata in the same way as the source catalog.
local function export_card(card: any): any
    local exported = public_card(card)
    exported.enabled = card.configured_enabled
    exported.max_tokens = card.stored_limits.max_tokens
    exported.output_tokens = card.stored_limits.output_tokens
    exported.dimensions = card.stored_limits.dimensions
    exported.routes = nil
    local public = policy.split_config(exported)
    return public
end

local function card_limit(input: any, stored: any?, field: string): number?
    if input[field] ~= nil then return models_types.positive_limit(input[field]) end
    return stored and stored[field]
end

-- A save that sends `options` sets them; one that omits them keeps the options
-- of the card it edits, so a UI round trip never wipes a card's provider options.
local function card_options(input: any, base: any?): any
    if type(input.options) == "table" then return policy.scrub_sensitive(input.options) end
    local provider = base and base.providers and base.providers[1]
    if provider and type(provider.options) == "table" then return policy.scrub_sensitive(provider.options) end
    return {}
end

local function clean_card_input(input: any, base: any?, inferred: any?): (any?, string?)
    if type(input) ~= "table" then return nil, "model body must be an object" end
    local name = input.name or (base and base.name)
    if type(name) ~= "string" or name == "" then return nil, "name is required" end
    if base == nil then
        for _, card in ipairs(registry_models.get_all() or {}) do
            if card.name == name then
                base = card
                break
            end
        end
    end
    local provider_id = input.provider_id or (base and (base.providers and base.providers[1] and base.providers[1].id)) or models_types.DEFAULT_PROVIDER
    local provider_model = input.provider_model or (base and (base.providers and base.providers[1] and base.providers[1].provider_model)) or name
    if type(provider_id) ~= "string" or provider_id == "" then return nil, "provider_id is required" end
    if type(provider_model) ~= "string" or provider_model == "" then return nil, "provider_model is required" end

    -- Resolve enabled with an explicit branch: the `a ~= nil and a or b` idiom
    -- collapses a literal `false` into the fallback, so disabling never stuck.
    local enabled: boolean
    if input.enabled ~= nil then
        enabled = input.enabled == true
    elseif base ~= nil and base.configured_enabled ~= nil then
        enabled = base.configured_enabled
    elseif base ~= nil then
        enabled = base.enabled ~= false
    else
        enabled = true
    end

    local capabilities, ownership, ownership_err = capability_ownership(input, base, inferred)
    if ownership_err then return nil, ownership_err end
    local stored_limits = base and (base.stored_limits or base)
    local card = {
        name = name,
        title = input.title or (base and base.title) or name,
        description = input.description or (base and base.description) or "",
        provider_id = provider_id,
        provider_profile_id = input.provider_profile_id or (base and base.provider_profile_id),
        provider_model = provider_model,
        capabilities = capabilities,
        capability_ownership = ownership,
        classes = policy.explicit_list(input.class or input.classes, base and base.class or {}),
        priority = tonumber(input.priority or (base and base.priority) or 10) or 10,
        max_tokens = card_limit(input, stored_limits, "max_tokens"),
        output_tokens = card_limit(input, stored_limits, "output_tokens"),
        dimensions = card_limit(input, stored_limits, "dimensions"),
        pricing = public_pricing(type(input.pricing) == "table" and input.pricing or (base and base.pricing)),
        options = normalize_card_options(card_options(input, base)),
        source = input.source or (base and base.source) or models_types.SOURCE_MANUAL,
        enabled = enabled,
        metadata = sanitize_discovered_pricing(policy.scrub_sensitive(type(input.metadata) == "table" and input.metadata or (base and base.metadata or {}))),
    }
    return card
end

M.build_card = build_card
M.public_card = public_card
M.public_card_summary = public_card_summary
M.export_card = export_card
M.clean_card_input = clean_card_input

return M
