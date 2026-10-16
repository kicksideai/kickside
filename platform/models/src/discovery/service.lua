local models_repo = require("models_repo")
local models_types = require("models_types")
local common = require("discovery_common")
local mapper = require("model_mapper")
local provider_registry = require("provider_registry")
local reference_registry = require("reference_registry")

local M = {}

function M.adapter_for(provider_id: string): any?
    return provider_registry.adapter_for(provider_id)
end

function M.discover(profile_id: string): (any?, any?)
    local profile, profile_err = models_repo.get_profile(profile_id)
    if profile_err then return nil, profile_err end
    if not profile then return nil, "profile not found" end

    local adapter = M.adapter_for(tostring(profile.provider_id or ""))
    if not adapter or not adapter.fetch then
        return nil, "provider does not support model discovery yet"
    end

    local rows, err = adapter.fetch(profile)
    if err then
        local _, status_err = models_repo.set_profile_status(profile_id, "unhealthy", err or "model discovery failed", nil)
        if status_err then return nil, status_err end
        return nil, err
    end

    local saved = {}
    local existing_cards = {}
    local overlays, overlay_err = models_repo.list_card_overlays()
    if overlay_err then return nil, overlay_err end
    for _, card in ipairs(overlays) do
        existing_cards[card.name] = card
    end
    for _, item in ipairs(rows or {}) do
        local provider_id = tostring(profile.provider_id)
        local provider_model = adapter.model_id and adapter.model_id(item) or mapper.provider_model_id(item)
        if provider_model then
            local capabilities = adapter.capabilities and adapter.capabilities(provider_model, item, profile)
                or mapper.infer_capabilities(provider_model, item)
            local classes = mapper.infer_classes(provider_model, capabilities, item)
            local name = mapper.public_name(profile.id, provider_model)
            local existing = existing_cards[name]
            if existing then classes = existing.class end
            -- Fill context window / pricing the provider's own /models API does not
            -- report (OpenAI, Anthropic, Bedrock) from the reference catalog. Only
            -- absent fields are filled -- provider-supplied values always win.
            local has_ctx = tonumber(item.context_length or item.contextLength or item.inputTokenLimit) ~= nil
            local has_price = type(item.pricing) == "table" and next(item.pricing :: any) ~= nil
            if not has_ctx or not has_price then
                local ref, reference_err = reference_registry.lookup(provider_id, provider_model)
                if reference_err then return nil, reference_err end
                if type(ref) == "table" then
                    if not has_ctx and ref.context_length then item.context_length = ref.context_length end
                    if not has_price and ref.pricing then item.pricing = ref.pricing end
                    if ref.output_tokens and not (item.outputTokenLimit or item.max_output_tokens) then
                        item.max_output_tokens = ref.output_tokens
                    end
                end
            end
            local max_tokens, output_tokens, dimensions = mapper.model_limits(item, capabilities)
            if existing then
                if max_tokens == 0 then max_tokens = existing.max_tokens end
                if output_tokens == 0 then output_tokens = existing.output_tokens end
            end
            local enabled = models_types.limits_configured(max_tokens, output_tokens, capabilities)
            if existing then enabled = existing.enabled ~= false end
            local metadata = {
                discovered = mapper.discovered_metadata(item),
                discovery_provider = profile.provider_id,
                discovery_profile_id = profile.id,
            }
            local card_input: any = {
                name = name,
                title = mapper.title_for(provider_model, item),
                description = item.description or "",
                provider_id = provider_id,
                provider_profile_id = profile.id,
                provider_model = provider_model,
                capabilities = capabilities,
                classes = classes,
                priority = common.table_has(capabilities, "embed") and not common.table_has(capabilities, "generate") and 10 or 20,
                max_tokens = max_tokens,
                output_tokens = output_tokens,
                dimensions = dimensions,
                pricing = type(item.pricing) == "table" and item.pricing or {},
                options = mapper.infer_options(provider_model, classes, capabilities),
                source = models_types.SOURCE_DISCOVERED,
                metadata = metadata,
            }
            if not existing then card_input.enabled = enabled end
            local card, save_err = models_repo.upsert_card(card_input)
            if save_err then return nil, save_err end
            table.insert(saved, card)
        end
    end

    local ts = os.time() :: integer
    local _, status_err = models_repo.set_profile_status(profile_id, "healthy", "discovered " .. tostring(#saved) .. " model(s)", ts)
    if status_err then return nil, status_err end
    return {
        success = true,
        profile_id = profile_id,
        count = #saved,
        models = saved,
    }
end

function M.test(profile_id: string, opts: any): (any?, any?)
    local profile, profile_err = models_repo.get_profile(profile_id)
    if profile_err then return nil, profile_err end
    if not profile then return nil, "profile not found" end
    local scoped_model = type(opts) == "table" and type(opts.model) == "string" and opts.model ~= ""

    local adapter = M.adapter_for(tostring(profile.provider_id or ""))
    if not adapter then
        return nil, "provider does not support connection testing yet"
    end

    local result, err
    if adapter.test then
        result, err = adapter.test(profile, opts or {})
    elseif adapter.fetch then
        local rows
        rows, err = adapter.fetch(profile)
        if rows then
            result = {
                success = true,
                mode = "models",
                count = #rows,
                message = "Authenticated model-list request succeeded (" .. tostring(#rows) .. " model(s))",
            }
        end
    else
        err = "provider does not support connection testing yet"
    end

    if result ~= nil and type(result) ~= "table" then
        result = nil
        err = err or "connection test failed"
    end
    if not result then
        if not scoped_model then
            local _, status_err = models_repo.set_profile_status(profile_id, "unhealthy", err or "connection test failed", nil)
            if status_err then return nil, status_err end
        end
        return nil, err or "connection test failed"
    end

    local message = result.message or "Connection test succeeded"
    if not scoped_model then
        local _, status_err = models_repo.set_profile_status(profile_id, "healthy", message, nil)
        if status_err then return nil, status_err end
    end
    result.profile_id = profile_id
    result.success = true
    return result
end

return M
