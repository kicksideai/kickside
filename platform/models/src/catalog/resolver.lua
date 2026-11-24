local model_catalog = require("model_catalog")
local providers = require("providers")
local route_policy = require("route_policy")

local M = {}

local function resolved_card(card: any): any
    local resolved = {}
    for key, value in pairs(card) do resolved[key] = value end
    resolved.providers = {}
    for index, route in ipairs(card.providers or {}) do
        local provider = {}
        for key, value in pairs(route) do provider[key] = value end
        if route.provider_profile_id then
            -- Resolve the native driver's legacy option before the credential
            -- wrapper hides the binding from the LLM route normalizer.
            if route.options and route.options.reasoning_model_request == true
                and providers.driver_declares_legacy_reasoning_flag(route.id) then
                -- Wippy reports invalid fields when it tries this particular route.
                local accepts = route_policy.accepts(route, {}, "resolved", true)
                for key, value in pairs(accepts or {}) do provider[key] = value end
            end
            -- The context names the route this entry stands for, so the managed
            -- driver calls it among the card's routes.
            provider.context = { card = card.name, provider_route_index = index, provider_id = route.id,
                provider_model = route.provider_model, provider_profile_id = route.provider_profile_id }
            provider.id = "kickside.models:provider"
        end
        table.insert(resolved.providers, provider)
    end
    if card.candidates then
        resolved.candidates = {}
        for _, candidate in ipairs(card.candidates) do
            table.insert(resolved.candidates, resolved_card(candidate))
        end
    end
    return resolved
end

function M.resolve(input: any): (any?, any?)
    local model = input and input.model
    if type(model) ~= "string" or model == "" then return nil end
    local card, err = model_catalog.resolve(model)
    if not card then return nil, err end
    return resolved_card(card)
end

return M
