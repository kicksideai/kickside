local utils = require("utils")
local trim = utils.trim

local config = {}

config.DEFAULTS = {
    max_content_chars = 50000,
    max_iterations = 15,
    batch_title_prefix = "Thread events batch",
    instructions = "",
}

local DEFAULT_AGENT_REF = "kickside.knowledge.injection.agents:injection_agent"

type InjectionConfig = {
    target_kb_ids: {string},
    instructions: string,
    extract_prompt: string,
    model: string?,
    agent_ref: string,
    max_content_chars: number,
    max_iterations: number,
    batch_title_prefix: string,
    plugin_id: string,
    testing: table?,
}

function config.normalize_worker_config(raw: any, plugin_id: any): (InjectionConfig?, string?)
    if type(raw) ~= "table" then
        return nil, "worker_config must be a table"
    end

    local target_kb_ids = {}
    if type(raw.target_kb_ids) == "table" then
        for _, id in ipairs(raw.target_kb_ids) do
            local kb_id = trim(tostring(id))
            if kb_id ~= "" then
                target_kb_ids[#target_kb_ids + 1] = kb_id
            end
        end
    end
    if #target_kb_ids == 0 then
        return nil, "at least one target_kb_id is required"
    end

    local instructions = trim(raw.instructions or config.DEFAULTS.instructions)
    local extract_prompt = trim(raw.extract_prompt or "")
    local model = trim(raw.model or "")
    local agent_ref = trim(raw.agent_ref or DEFAULT_AGENT_REF)
    if agent_ref == "" then agent_ref = DEFAULT_AGENT_REF end

    local max_content_chars = tonumber(raw.max_content_chars) or config.DEFAULTS.max_content_chars
    if max_content_chars < 1000 then max_content_chars = 1000 end
    if max_content_chars > 200000 then max_content_chars = 200000 end

    local max_iterations = tonumber(raw.max_iterations) or config.DEFAULTS.max_iterations
    if max_iterations < 1 then max_iterations = 1 end
    if max_iterations > 50 then max_iterations = 50 end

    local batch_title_prefix = trim(raw.batch_title_prefix or config.DEFAULTS.batch_title_prefix)
    if batch_title_prefix == "" then
        batch_title_prefix = config.DEFAULTS.batch_title_prefix
    end

    return ({
        target_kb_ids = target_kb_ids,
        instructions = instructions,
        extract_prompt = extract_prompt,
        model = model ~= "" and model or nil,
        agent_ref = agent_ref,
        max_content_chars = max_content_chars,
        max_iterations = max_iterations,
        batch_title_prefix = batch_title_prefix,
        plugin_id = trim(plugin_id or ""),
        testing = type(raw.testing) == "table" and raw.testing or nil,
    } :: InjectionConfig), nil
end

return config
