-- Model card projections and input cleaning.
local registry_models = require("registry_models")
local models_types = require("models_types")
local policy = require("catalog_policy")

local M = {}

-- Card options carry per-request behavior; retry there is normalized exactly
-- like the profile's, so garbage never persists on either surface.
local function normalize_card_options(options: any): any
    if type(options) ~= "table" then return {} end
    if (options :: any).retry ~= nil then
        (options :: any).retry = policy.normalize_retry_config((options :: any).retry)
    end
    return options
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
    local open_context = profile and not profile.error and policy.provider_context(profile) or nil

    return {
        id = row.name,
        name = row.name,
        title = row.title ~= "" and row.title or row.name,
        description = row.description or "",
        capabilities = policy.normalize_list(capabilities, {}),
        class = policy.normalize_list(classes, {}),
        priority = tonumber(row.priority) or 0,
        max_tokens = tonumber(row.max_tokens) or 0,
        output_tokens = tonumber(row.output_tokens) or 0,
        pricing = pricing,
        providers = {
            {
                id = row.provider_id,
                provider_model = row.provider_model,
                options = provider_options,
                context = open_context,
                provider_profile_id = row.provider_profile_id,
            }
        },
        dimensions = tonumber(row.dimensions),
        source = row.source or models_types.SOURCE_MANUAL,
        provider_profile_id = row.provider_profile_id,
        enabled = tonumber(row.enabled) ~= 0 and not (profile and profile.error),
        error = profile and profile.error or nil,
        metadata = metadata,
    }
end

local function public_card(card: any): any
    local provider = card.providers and card.providers[1] or {}
    return {
        name = card.name,
        title = card.title or card.name,
        description = card.description or "",
        capabilities = card.capabilities or {},
        class = card.class or {},
        priority = card.priority or 0,
        max_tokens = card.max_tokens or 0,
        output_tokens = card.output_tokens or 0,
        pricing = card.pricing or {},
        dimensions = card.dimensions,
        source = card.source,
        provider_id = provider.id,
        provider_model = provider.provider_model,
        provider_profile_id = card.provider_profile_id or provider.provider_profile_id,
        options = policy.scrub_sensitive(provider.options or {}),
        enabled = card.enabled ~= false,
        error = card.error,
        metadata = policy.scrub_sensitive(card.metadata or {}),
    }
end

-- A save that sends `options` sets them; one that omits them keeps the options
-- of the card it edits, so a UI round trip never wipes a card's provider options.
local function card_options(input: any, base: any?): any
    if type(input.options) == "table" then return policy.scrub_sensitive(input.options) end
    local provider = base and base.providers and base.providers[1]
    if provider and type(provider.options) == "table" then return policy.scrub_sensitive(provider.options) end
    return {}
end

local function clean_card_input(input: any, base: any?): (any?, string?)
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
    elseif base ~= nil then
        enabled = base.enabled ~= false
    else
        enabled = true
    end

    local card = {
        name = name,
        title = input.title or (base and base.title) or name,
        description = input.description or (base and base.description) or "",
        provider_id = provider_id,
        provider_profile_id = input.provider_profile_id or (base and base.provider_profile_id),
        provider_model = provider_model,
        capabilities = policy.normalize_list(input.capabilities, base and base.capabilities or { "generate" }),
        classes = policy.explicit_list(input.class or input.classes, base and base.class or {}),
        priority = tonumber(input.priority or (base and base.priority) or 10) or 10,
        max_tokens = tonumber(input.max_tokens or (base and base.max_tokens) or 0) or 0,
        output_tokens = tonumber(input.output_tokens or (base and base.output_tokens) or 0) or 0,
        dimensions = tonumber(input.dimensions or (base and base.dimensions) or 0) or 0,
        pricing = type(input.pricing) == "table" and input.pricing or (base and base.pricing or {}),
        options = normalize_card_options(card_options(input, base)),
        source = input.source or (base and base.source) or models_types.SOURCE_MANUAL,
        enabled = enabled,
        metadata = type(input.metadata) == "table" and policy.scrub_sensitive(input.metadata) or policy.scrub_sensitive(base and base.metadata or {}),
    }
    if card.enabled and (base == nil or input.enabled == true)
        and not models_types.limits_configured(card.max_tokens, card.output_tokens, card.capabilities) then
        return nil, "enabled models require configured token limits"
    end
    return card
end

M.build_card = build_card
M.public_card = public_card
M.clean_card_input = clean_card_input

return M
