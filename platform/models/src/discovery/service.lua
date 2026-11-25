local models_repo = require("models_repo")
local models_types = require("models_types")
local logger = require("logger")
local common = require("discovery_common")
local mapper = require("model_mapper")
local provider_registry = require("provider_registry")
local reference_registry = require("reference_registry")
local registry = require("registry")
local funcs = require("funcs")

local M = {}
local log = logger:named("kickside.models.discovery")

function M.adapter_for(provider_id: string): any?
    return provider_registry.adapter_for(provider_id)
end

-- unresolved fails a provider call of the profile whose *_env reference does not
-- resolve, before the adapter runs, naming the reference: the adapters read an
-- unresolved reference as an unset setting, and their failures reach the caller
-- only classified. record marks the profile unhealthy with the message.
local function unresolved(profile_id: string, profile: any, label: string, record: boolean): (string?, any?)
    local reason = common.unresolved_env(profile)
    if not reason then return nil end
    local message = label .. ": " .. reason
    if record then
        local _, status_err = models_repo.set_profile_status(profile_id, "unhealthy", message, nil)
        if status_err then return nil, status_err end
    end
    return message
end

function M.discover(profile_id: string): (any?, any?, any?)
    local profile, profile_err = models_repo.get_profile(profile_id)
    if profile_err then return nil, profile_err end
    if not profile then return nil, "profile not found" end

    local refused, refused_err = unresolved(profile_id, profile, "model discovery failed", true)
    if refused_err then return nil, refused_err end
    if refused then return nil, refused end

    local adapter = M.adapter_for(tostring(profile.provider_id or ""))
    if not adapter or not adapter.fetch then
        return nil, "provider does not support model discovery yet"
    end

    local rows, err, diagnostics = adapter.fetch(profile)
    if err then
        if not diagnostics then
            local _, classified = common.transport_error(err)
            diagnostics = classified
        end
        err = common.failure_message("model discovery failed", diagnostics)
        local _, status_err = models_repo.set_profile_status(profile_id, "unhealthy", err, nil)
        if status_err then return nil, status_err end
        return nil, err, diagnostics
    end

    local saved = {}
    local reference_error
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
            local capabilities = mapper.capabilities(adapter, provider_model, item, profile)
            local classes = mapper.infer_classes(provider_model, capabilities, item)
            local name = mapper.public_name(profile.id, provider_model)
            local existing = existing_cards[name]
            if existing then classes = existing.class end
            local has_ctx = mapper.context_limit(item) ~= nil
            local has_output = mapper.output_limit(item) ~= nil
            local has_price = type(item.pricing) == "table" and next(item.pricing :: any) ~= nil
            if not reference_error and
                (not has_ctx or not has_price or (not has_output and common.table_has(capabilities, "generate"))) then
                local ref
                ref, reference_error = reference_registry.lookup(provider_id, provider_model)
                if reference_error then
                    log:warn("model reference catalog enrichment failed", {
                        profile_id = profile_id,
                        provider_id = provider_id,
                        error = tostring(reference_error),
                    })
                elseif type(ref) == "table" then
                    if not has_ctx then item.context_length = ref.context_length end
                    if not has_price and ref.pricing then item.pricing = ref.pricing end
                    if not has_output then item.max_output_tokens = ref.output_tokens end
                end
            end
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
                pricing = type(item.pricing) == "table" and item.pricing or {},
                options = mapper.infer_options(provider_model, classes, capabilities),
                source = models_types.SOURCE_DISCOVERED,
                metadata = metadata,
            }
            local card, save_err = models_repo.upsert_card(card_input, nil, capabilities)
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

-- declared_list answers the model list the profile's provider declares (its llm.provider
-- entry's meta.model_list names a function called with { profile_id } and answering
-- { models = { provider_model, ... } }), or nil when it declares none.
local function declared_list(profile_id: string, provider_id: string): ({ string }?, any?, boolean)
    local entry = registry.get(provider_id)
    local fn = entry and entry.meta and entry.meta.model_list
    if type(fn) ~= "string" or fn == "" then return nil, nil, false end
    local answer, err = funcs.new():call(fn, { profile_id = profile_id })
    if err then return nil, "model list failed: " .. tostring(err), true end
    local invalid = "provider returned an invalid model list"
    if type(answer) ~= "table" or type(answer.models) ~= "table" then return nil, invalid, true end
    local count, last = 0, 0
    for index, model in pairs(answer.models) do
        if type(index) ~= "number" or index < 1 or index % 1 ~= 0 or type(model) ~= "string" or model == "" then
            return nil, invalid, true
        end
        count = count + 1
        last = math.max(last, index)
    end
    if last ~= count then return nil, invalid, true end
    return answer.models, nil, true
end

-- served answers the provider models profile_id serves now, as the provider's model list
-- answers them, in the list's order: through the profile's discovery adapter, else the model
-- list the provider's entry declares (meta.model_list). It records nothing: neither cards nor
-- the profile status change.
function M.served(profile_id: string): ({ string }?, any?, any?)
    local profile, profile_err = models_repo.get_profile(profile_id)
    if profile_err then return nil, profile_err end
    if not profile then return nil, "profile not found" end

    local refused, refused_err = unresolved(profile_id, profile, "model list failed", false)
    if refused_err then return nil, refused_err end
    if refused then return nil, refused end

    local provider_id = tostring(profile.provider_id or "")
    local adapter = M.adapter_for(provider_id)
    if not adapter or not adapter.fetch then
        local listed, list_err, declared = declared_list(profile_id, provider_id)
        if declared then return listed, list_err end
        return nil, "provider has no model list: it has no discovery adapter and declares no meta.model_list"
    end

    local rows, err, diagnostics = adapter.fetch(profile, true)
    if err then
        if not diagnostics then
            local _, classified = common.transport_error(err)
            diagnostics = classified
        end
        return nil, common.failure_message("model list failed", diagnostics), diagnostics
    end
    local out: { string } = {}
    for _, item in ipairs(rows or {}) do
        if type(item) ~= "table" then return nil, "provider returned an invalid model row" end
        local model_id = adapter.model_id or mapper.provider_model_id
        local provider_model = model_id(item)
        if type(provider_model) ~= "string" or provider_model == "" then return nil, "provider returned an invalid model ID" end
        out[#out + 1] = provider_model
    end
    return out
end

function M.test(profile_id: string, opts: any): (any?, any?, any?)
    local profile, profile_err = models_repo.get_profile(profile_id)
    if profile_err then return nil, profile_err end
    if not profile then return nil, "profile not found" end
    local scoped_model = type(opts) == "table" and type(opts.model) == "string" and opts.model ~= ""

    local refused, refused_err = unresolved(profile_id, profile, "connection test failed", not scoped_model)
    if refused_err then return nil, refused_err end
    if refused then return nil, refused end

    local adapter = M.adapter_for(tostring(profile.provider_id or ""))
    if not adapter then
        return nil, "provider does not support connection testing yet"
    end

    local result, err, diagnostics
    if adapter.test then
        result, err, diagnostics = adapter.test(profile, opts or {})
    elseif adapter.fetch then
        local rows
        rows, err, diagnostics = adapter.fetch(profile)
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
        if not diagnostics then
            local _, classified = common.transport_error(err)
            diagnostics = classified
        end
        err = common.failure_message("connection test failed", diagnostics)
        if not scoped_model then
            local _, status_err = models_repo.set_profile_status(profile_id, "unhealthy", err or "connection test failed", nil)
            if status_err then return nil, status_err end
        end
        return nil, err, diagnostics
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
