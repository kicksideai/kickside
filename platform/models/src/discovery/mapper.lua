local common = require("discovery_common")
local models_types = require("models_types")

local M = {}

local DISCOVERED_METADATA_FIELDS = {
    "id",
    "name",
    "model",
    "modelId",
    "modelName",
    "display_name",
    "displayName",
    "description",
    "object",
    "owned_by",
    "created",
    "context_length",
    "contextLength",
    "inputTokenLimit",
    "outputTokenLimit",
    "max_output_tokens",
    "capabilities",
    "supported_parameters",
    "supportedParameters",
    "supports_reasoning",
    "supportsReasoning",
    "reasoning",
    "reasoning_supported",
    "reasoningSupported",
    "extended_thinking",
    "extendedThinking",
    "dimensions",
    "pricing",
    "inputModalities",
    "input_modalities",
    "outputModalities",
    "output_modalities",
    "supportedActions",
    "supported_actions",
}

local function titleize(id: string): string
    local title = tostring(id):gsub("^models/", ""):gsub("[_%-/%.:]+", " ")
    title = title:gsub("(%a)([%w']*)", function(a, b) return a:upper() .. b end)
    return title
end

function M.provider_model_id(item: any): string?
    local raw_id = item.id or item.name or item.model or item.modelId
    if type(raw_id) ~= "string" or raw_id == "" then return nil end
    return tostring(raw_id)
end

function M.title_for(provider_model: string, item: any): string
    return item.display_name or item.displayName or item.modelName or item.name_display or titleize(provider_model)
end

local function truthy(value: any): boolean
    return value == true or value == 1 or value == "true" or value == "1"
end

local function each_value(value: any, fn: (string) -> ())
    if type(value) == "string" then
        fn(value)
        return
    end
    if type(value) ~= "table" then return end
    for k, v in pairs(value) do
        if type(k) == "number" then
            if type(v) == "string" then
                fn(v)
            end
        elseif truthy(v) then
            fn(tostring(k))
        end
    end
end

local function copy_explicit_capabilities(out: { string }, item: any)
    each_value(item.capabilities or item.capability, function(raw)
        local value = tostring(raw):lower():gsub("%s+", "_"):gsub("-", "_")
        if value == "generate" or value == "chat" or value == "completion" or value == "text_generation" then
            common.add_unique(out, "generate")
        elseif value == "embed" or value == "embedding" or value == "embeddings" then
            common.add_unique(out, "embed")
        elseif value == "tool" or value == "tools" or value == "tool_use" or value == "function_calling" then
            common.add_unique(out, "tool_use")
        elseif value == "vision" or value == "image_input" then
            common.add_unique(out, "vision")
        elseif value == "structured_output" or value == "json_schema" then
            common.add_unique(out, "structured_output")
        elseif value == "reasoning" then
            common.add_unique(out, "reasoning")
        elseif value == "extended_thinking" then
            common.add_unique(out, "extended_thinking")
        end
    end)
end

local function copy_supported_parameters(out: { string }, item: any)
    each_value(item.supported_parameters or item.supportedParameters, function(raw)
        local value = tostring(raw):lower():gsub("%s+", "_"):gsub("-", "_")
        if value == "tools" or value == "tool_choice" or value == "functions" then
            common.add_unique(out, "tool_use")
        elseif value == "response_format" or value == "json_schema" or value == "structured_output" then
            common.add_unique(out, "structured_output")
        elseif value == "reasoning" or value == "reasoning_effort" then
            common.add_unique(out, "reasoning")
        elseif value == "thinking" or value == "thinking_budget" then
            common.add_unique(out, "extended_thinking")
        end
    end)
end

local function copy_modality_capabilities(out: { string }, item: any)
    local input = item.inputModalities or item.input_modalities
    local output = item.outputModalities or item.output_modalities
    if common.has_modality(input, "image") or common.has_modality(input, "IMAGE") then
        common.add_unique(out, "vision")
    end
    if common.has_modality(output, "text") or common.has_modality(output, "TEXT") then
        common.add_unique(out, "generate")
    end
    if common.has_modality(output, "embedding") or common.has_modality(output, "EMBEDDING") then
        common.add_unique(out, "embed")
    end
end

function M.declared_capabilities(item: any): { string }
    local out: { string } = {}

    copy_explicit_capabilities(out, item)
    copy_supported_parameters(out, item)
    copy_modality_capabilities(out, item)

    if truthy(item.supports_reasoning) or truthy(item.supportsReasoning)
        or truthy(item.reasoning) or truthy(item.reasoning_supported)
        or truthy(item.reasoningSupported) then
        common.add_unique(out, "reasoning")
    end
    if truthy(item.extended_thinking) or truthy(item.extendedThinking) then
        common.add_unique(out, "extended_thinking")
    end

    return out
end

function M.infer_capabilities(model_id: string, item: any): { string }
    local id = model_id:lower()
    local out = M.declared_capabilities(item)
    if #out == 0 and (id:find("embed", 1, true) or id:find("embedding", 1, true)) then
        common.add_unique(out, "embed")
    elseif not common.table_has(out, "embed") then
        common.add_unique(out, "generate")
    end
    if #out == 0 then common.add_unique(out, "generate") end
    return out
end

function M.infer_classes(model_id: string, capabilities: { string }, item: any): { string }
    local out: { string } = {}
    if common.table_has(capabilities, "embed") and not common.table_has(capabilities, "generate") then
        common.add_unique(out, "embed")
    end
    local explicit = item.class or item.classes
    if type(explicit) == "string" then
        common.add_unique(out, explicit)
    elseif type(explicit) == "table" then
        for _, class_name in ipairs(explicit) do
            common.add_unique(out, tostring(class_name))
        end
    end
    return out
end

function M.infer_options(_model_id: string, _classes: { string }, capabilities: { string }?): any
    local options = {}
    if common.table_has(capabilities, "reasoning") or common.table_has(capabilities, "extended_thinking") then
        options.reasoning_model_request = true
    end
    return options
end

function M.public_name(profile_id: string, provider_model: string): string
    return models_types.slug(profile_id) .. "/" .. tostring(provider_model)
end

-- Platform convention: every embedding card runs at 512 dimensions regardless
-- of the size the provider reports or omits.
local EMBEDDING_DIMENSIONS = 512

function M.model_limits(item: any, capabilities: { string }?): (number, number, number)
    local max_tokens = tonumber(item.context_length or item.contextLength or item.inputTokenLimit or 0) or 0
    local output_tokens = tonumber(item.outputTokenLimit or item.max_output_tokens or 0) or 0
    local dimensions = tonumber(item.dimensions or 0) or 0
    if max_tokens < 0 then max_tokens = 0 end
    if output_tokens < 0 then output_tokens = 0 end
    if common.table_has(capabilities, "embed") then
        dimensions = EMBEDDING_DIMENSIONS
    end
    return max_tokens, output_tokens, dimensions
end

function M.discovered_metadata(item: any): any
    if type(item) ~= "table" then return {} end
    local out = {}
    for _, key in ipairs(DISCOVERED_METADATA_FIELDS) do
        local value = item[key]
        if value ~= nil then out[key] = value end
    end
    return out
end

return M
