local llm = require("llm")
local env = require("env")
local registry = require("registry")

local M = {}

local SAFETY_MARGIN_RATIO = 0.10

local function positive_number(value: any): number?
    local n = tonumber(value)
    if not n or n <= 0 then return nil end
    return n
end

local function session_cap(): (number?, any?)
    local id = "wippy.session.env:token_checkpoint_threshold"
    local entry, lookup_err = registry.get(id)
    if lookup_err and not errors.is(lookup_err, errors.NOT_FOUND) then return nil, lookup_err end
    if not entry then return nil end
    local value, read_err = env.get(id)
    if read_err then return nil, read_err end
    return positive_number(value)
end

local function copy_map(value: any): { [string]: any }
    local copied = {}
    if type(value) ~= "table" then return copied end
    for key, item in pairs(value) do copied[key] = item end
    return copied
end

local function model_limits(context_window: number?, output_reservation: number?): number?
    if not context_window or not output_reservation then return nil end
    -- Usage context tokens exclude the completed output. Reserve that output and
    -- the next request's output before splitting the remaining safety margin.
    local available = context_window - 2 * output_reservation
    if available <= 0 then return nil end
    local margin = math.ceil(available * SAFETY_MARGIN_RATIO)
    return available - margin
end

local function output_reservation(spec: any, card: any): number?
    local requested = positive_number(spec.max_tokens)
    local card_limit = positive_number(card.output_tokens)
    return requested or card_limit
end

-- Apply limits only when the selected card declares a usable context window.
-- Existing checkpoint settings retain lower values when the selected model
-- declares a usable context window.
function M.apply(spec: any): (any, any?)
    if type(spec) ~= "table" then return spec end

    local options = copy_map(spec.agent_options)
    local checkpoint = copy_map(options.checkpoint)
    local card, resolve_err = nil, nil
    if type(spec.model) == "string" and spec.model ~= "" then
        card, resolve_err = llm.resolve_model(spec.model)
    end
    if resolve_err then return nil, resolve_err end
    local context_window = type(card) == "table" and positive_number(card.max_tokens) or nil
    local reservation = type(card) == "table" and output_reservation(spec, card) or nil
    local derived_threshold = model_limits(context_window, reservation)
    local configured_threshold = positive_number(checkpoint.token_threshold)
    if not configured_threshold then
        local existing_cap, cap_err = session_cap()
        if cap_err then return nil, cap_err end
        configured_threshold = existing_cap
    end

    if derived_threshold then
        checkpoint.token_threshold = configured_threshold and math.min(configured_threshold, derived_threshold) or derived_threshold
    end

    options.checkpoint = checkpoint
    spec.agent_options = options
    return spec, nil
end

return M
