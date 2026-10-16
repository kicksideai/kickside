local http = require("http")
local json = require("json")
local llm = require("llm")
local prompt = require("prompt")
local time = require("time")
local model_catalog = require("model_catalog")
local model_discovery = require("model_discovery")

local function has(list: any, value: string): boolean
    if type(list) ~= "table" then return false end
    for _, item in ipairs(list) do
        if item == value then return true end
    end
    return false
end

local function err_message(err: any): string
    if err == nil then return "unknown error" end
    if type(err) == "string" then return err end
    if type(err) == "table" then
        if type(err.message) == "string" then return err.message end
        if type(err.error) == "string" then return err.error end
    end
    local ok, msg = pcall(function()
        if err.message then return err:message() end
        return tostring(err)
    end)
    if ok and msg and msg ~= "" then return tostring(msg) end
    return tostring(err)
end

local function scrub_message(message: string): string
    local out = tostring(message or "")
    out = out:gsub("Bearer%s+[%w%._%-=]+", "Bearer [redacted]")
    out = out:gsub("([Aa]uthorization%s*[:=]%s*)[%w%._%-=]+", "%1[redacted]")
    out = out:gsub("([Aa]pi[_%-]?[Kk]ey%s*[:=]%s*)[%w%._%-=]+", "%1[redacted]")
    out = out:gsub("([Tt]oken%s*[:=]%s*)[%w%._%-=]+", "%1[redacted]")
    return out
end

local function result_text(response: any): string
    if type(response) ~= "table" then return "" end
    if type(response.result) == "string" then return response.result end
    if type(response.result) == "table" and type(response.result.content) == "string" then
        return response.result.content
    end
    return ""
end

local function first_provider(card: any): any
    if type(card) ~= "table" or type(card.providers) ~= "table" then return {} end
    return card.providers[1] or {}
end

local function is_reasoning(card: any, provider: any): boolean
    local options = type(provider) == "table" and provider.options or nil
    return has(card.capabilities, "reasoning")
        or has(card.capabilities, "extended_thinking")
        or (type(options) == "table" and options.reasoning_model_request == true)
end

local function provider_probe_detail(provider: any): string?
    if type(provider) ~= "table" then return nil end
    if type(provider.provider_profile_id) ~= "string" or provider.provider_profile_id == "" then return nil end
    if type(provider.provider_model) ~= "string" or provider.provider_model == "" then return nil end
    local profile_id = tostring(provider.provider_profile_id)
    local provider_model = tostring(provider.provider_model)
    local result, err = model_discovery.test(profile_id, { model = provider_model })
    local message = result and result.message or err
    if type(message) == "string" and message ~= "" then
        return message
    end
    return nil
end

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "Failed to get HTTP context" end
    res:set_content_type(http.CONTENT.JSON)

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local data, decode_err = json.decode(raw)
    if decode_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Invalid JSON: " .. tostring(decode_err) })
        return
    end
    if type(data) ~= "table" or type(data.name) ~= "string" or data.name == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Model name is required" })
        return
    end

    local card, resolve_err = model_catalog.resolve(data.name)
    if not card then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = resolve_err or "model not found" })
        return
    end
    if has(card.capabilities, "embed") and not has(card.capabilities, "generate") then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Model does not support generation", model = card.name })
        return
    end

    local provider = first_provider(card)
    local p = prompt.new()
    p:add_system("You are a model health probe. Reply with exactly: ok")
    p:add_user("ok")

    -- Probe budget: reasoning models need headroom for thinking tokens, and
    -- providers reject tiny limits (OpenAI requires max_output_tokens >= 16).
    local max_out = tonumber(data.max_tokens)
    local floor = is_reasoning(card, provider) and 1024 or 64
    if not max_out or max_out < floor then max_out = floor end

    local started = time.now():unix_nano()
    local response, gen_err = llm.generate(p, {
        model = data.name,
        temperature = 0,
        max_tokens = max_out,
    })
    local elapsed_ms = math.floor((time.now():unix_nano() - started) / 1000000)

    if gen_err or not response then
        local message = scrub_message(err_message(gen_err))
        local provider_detail = provider_probe_detail(provider)
        if provider_detail and provider_detail ~= "" and provider_detail ~= message then
            message = message .. "; provider probe: " .. scrub_message(provider_detail)
        end
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = message,
            model = card.name,
            provider_id = provider.id,
            provider_profile_id = provider.provider_profile_id,
            provider_model = provider.provider_model,
            reasoning = is_reasoning(card, provider),
            elapsed_ms = elapsed_ms,
            max_tokens = max_out,
        })
        return
    end

    local out = result_text(response)
    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        message = "Generation probe succeeded for " .. tostring(card.name),
        model = card.name,
        provider_id = provider.id,
        provider_profile_id = provider.provider_profile_id,
        provider_model = provider.provider_model,
        reasoning = is_reasoning(card, provider),
        elapsed_ms = elapsed_ms,
        max_tokens = max_out,
        finish_reason = type(response) == "table" and response.finish_reason or nil,
        tokens = type(response) == "table" and response.tokens or nil,
        output = out,
    })
end

return { handler = handler }
