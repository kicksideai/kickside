local llm = require("llm")
local funcs = require("funcs")
local kb_search = require("kb_search")
local analysis_model = require("analysis_model")
local model_failure = require("model_failure")

local AGENTIC_QUERY = "kickside.knowledge.retrieval:agentic_query"

-- KB answering (the "Ask" path), in the control plane. Retrieval is the engine's
-- job (kb_search.query); answering is ours: the KB's query_driver selects how the
-- answer is produced — the agentic dataflow driver (a tool-calling agent) or a
-- single-shot synthesis over the retrieved passages. The ranked passages are
-- returned as sources either way. Driver failures return errors.
local M = {}

-- Injectable LLM seam so the synthesis path is unit-testable without a live
-- provider.
M._llm = llm
M._funcs = funcs
M._kb_search = kb_search

local DEFAULT_LIMIT = 8
local MAX_SOURCES = 6
local PREVIEW_LENGTH = 1200
local ANSWER_MAX_TOKENS = 1024
local ANSWER_TIMEOUT_SECONDS = 30
local NO_ANSWER_FOUND = "No answer found. No source passages matched the question."

local ANSWER_PROMPT = [[Answer the question using ONLY the passages below. State nothing the passages do not support; if they do not contain the answer, say so plainly. Cite each supported statement with the passage number in square brackets, such as [1]. Use one number per bracket pair: for multiple sources write [1][2]; never combine numbers inside one pair. Use only numbers from the supplied passages. A passage may start with its source in parentheses; when that source names a page or slide, give it with the citation, such as "(Guide.pdf, p. 47) [1]". Be concise and direct.%s

QUESTION: "%s"

PASSAGES:
%s]]

-- The chunk metadata of a retrieved item: engine items nest it under meta,
-- normalized sources carry it at the top level.
local function item_metadata(item: any): { [string]: any }
    local row = type(item) == "table" and item or {}
    if type(row.metadata) == "table" then return row.metadata end
    local meta = type(row.meta) == "table" and row.meta or {}
    return type(meta.metadata) == "table" and meta.metadata or {}
end

-- The page or slide range a chunk covers, from the locators KB engines record
-- at ingest (page_start/page_end, slide_start/slide_end).
local function locator(metadata: { [string]: any }): string?
    for _, kind in ipairs({ "page", "slide" }) do
        local first, last = metadata[kind .. "_start"], metadata[kind .. "_end"]
        if type(first) == "number" then
            local one = kind == "page" and "p. " or "slide "
            if type(last) ~= "number" or last <= first then
                return one .. tostring(math.floor(first))
            end
            local many = kind == "page" and "pp. " or "slides "
            return many .. tostring(math.floor(first)) .. "-" .. tostring(math.floor(last))
        end
    end
    return nil
end

-- A passage's source as a reader cites it ("Guide.pdf, p. 47"), or nil when
-- the item names neither a file nor a page.
function M.source_label(item: any): string?
    local metadata = item_metadata(item)
    local parts = {}
    for _, key in ipairs({ "original_filename", "filename", "title" }) do
        local name = metadata[key]
        if type(name) == "string" and string.find(name, "%S") then
            parts[#parts + 1] = name
            break
        end
    end
    local where = locator(metadata)
    if where then parts[#parts + 1] = where end
    if #parts == 0 then return nil end
    return table.concat(parts, ", ")
end

-- One numbered passage line, led by its source when the item has one.
function M.passage(index: integer, item: any, max_length: integer?): string
    local content = tostring((type(item) == "table" and item.content) or "")
    if max_length then content = content:sub(1, max_length) end
    local label = M.source_label(item)
    if label then return string.format("[%d] (%s) %s", index, label, content) end
    return string.format("[%d] %s", index, content)
end

-- The answer is free-form prose the UI renders verbatim, so it is produced with
-- a plain generation. Strict structured output (response_format json_schema) is
-- avoided here: many OpenAI-compatible endpoints (vLLM-style gateways) silently
-- ignore it and return empty content. The prompt
-- carries the grounding instruction, so no schema is needed.
local function synthesize(query_text: string, items: any, model: any, extra_prompt: any): (string?, any)
    if type(model) ~= "string" or model == "" or #items == 0 then
        return nil
    end
    local passages = {}
    for i = 1, math.min(#items, MAX_SOURCES) do
        table.insert(passages, M.passage(i, items[i], PREVIEW_LENGTH))
    end
    local extra = ""
    if type(extra_prompt) == "string" and extra_prompt ~= "" then
        extra = "\n\nAdditional instructions:\n" .. extra_prompt
    end
    local response, err = M._llm.generate(string.format(ANSWER_PROMPT, extra, query_text, table.concat(passages, "\n\n")), {
        model = model,
        temperature = 0.2,
        max_tokens = ANSWER_MAX_TOKENS,
        timeout = ANSWER_TIMEOUT_SECONDS,
    })
    if err or not response then
        return nil, model_failure.wrap("answer generation", err or "no response")
    end
    local answer: any = response.result
    if type(answer) == "table" then
        answer = (answer :: { content: any }).content
    end
    if type(answer) ~= "string" or not string.find(answer, "%S") then
        return nil, errors.new({ kind = errors.INTERNAL, message = "answer generation returned empty content" })
    end
    return answer :: string
end

-- Flatten the retrieval envelope (engine items carry a meta sub-table) into the
-- ranked-source shape the UI renders.
local function normalize(items: any): any
    local out = {}
    for _, item in ipairs(items or {}) do
        local meta = (type(item.meta) == "table" and item.meta or {}) :: table
        table.insert(out, {
            id = item.id,
            content = item.content or "",
            node_type = meta.node_type or item.node_type,
            parent_id = meta.parent_id or item.parent_id,
            score = meta.similarity or item.similarity,
            similarity = meta.similarity or item.similarity,
            llm_score = meta.llm_score or item.llm_score,
            metadata = meta.metadata or item.metadata,
        })
    end
    return out
end

local function query_only(response: any, reason: string): any
    response.mode = "query"
    response.answer = reason .. (response.count == 0 and " " .. NO_ANSWER_FOUND or " Returning query results.")
    return response
end

-- ask(kb_id, { query, limit? }) -> (result, err). result is
-- { success, query, answer, results, count, mode? }. In query mode, answer
-- describes why the response contains passages without a generated answer.
function M.ask(kb_id: any, opts: any): (any, any)
    opts = opts or {}
    local query_text = opts.query
    if type(kb_id) ~= "string" or kb_id == "" then
        return nil, "knowledge base id is required"
    end
    if type(query_text) ~= "string" or query_text == "" then
        return nil, "query is required"
    end

    local config, _, config_err = M._kb_search.config(kb_id)
    if config_err then return nil, config_err end
    if type(config) ~= "table" then return nil, "knowledge base config is missing" end
    local setting = config.analysis_model
    local answer_model = analysis_model.configured(config)
    if not answer_model and (setting == nil or type(setting) == "string") then
        answer_model = analysis_model.DEFAULT
    end

    local result, q_err = M._kb_search.query(kb_id, { query = query_text, limit = opts.limit or DEFAULT_LIMIT })
    if q_err then
        return nil, q_err
    end
    local analysis = result and result.retrieval and result.retrieval.analysis
    local items = (result and result.items) or {}
    local response: any = { success = true, query = query_text, results = normalize(items), count = #items }
    if not answer_model then
        local reason = setting == false and "Answers are disabled." or "No answer model is available."
        return query_only(response, reason), nil
    end
    local unavailable = analysis and analysis.model == answer_model
        and analysis.status == "unavailable" and analysis.reason == "no_models_for_class"
    if answer_model == analysis_model.DEFAULT then
        if not unavailable then
            local available, lookup_err = analysis_model.class_available(answer_model)
            if lookup_err then return nil, model_failure.wrap("answer model lookup", lookup_err) end
            unavailable = not available
        end
        if unavailable then
            return query_only(response, "No answer model is available."), nil
        end
    elseif unavailable then
        return nil, errors.new({ kind = errors.UNAVAILABLE,
            message = "answer generation failed: No models found for class: " .. answer_model:sub(7),
            details = { retrieval = result.retrieval } })
    end

    if config.query_driver == "agentic" then
        -- Seed the agent with the passages already retrieved here (slimmed) so it
        -- starts informed and spends its iterations exploring/refining, not
        -- rediscovering the KB.
        local seed_items = {}
        for i = 1, math.min(#items, 5) do
            local item = type(items[i]) == "table" and items[i] or {}
            local content = (item.content or ""):sub(1, 600)
            local label = M.source_label(item)
            if label then content = "(" .. label .. ") " .. content end
            table.insert(seed_items, { id = item.id, content = content })
        end
        -- Run the dataflow agent in its own pool (funcs.call) so its dataflow
        -- runtime never enters this control-plane/HTTP import closure.
        local agent_config = {}
        for key, value in pairs(config) do agent_config[key] = value end
        agent_config.analysis_model = answer_model
        local r, ferr = M._funcs.call(AGENTIC_QUERY, { kb_id = kb_id, query = query_text, config = agent_config, seed_items = seed_items })
        if ferr then return nil, model_failure.wrap("agentic answer", ferr) end
        local answer = type(r) == "table" and (r :: any).answer or nil
        if type(answer) ~= "string" or not string.find(answer, "%S") then
            return nil, errors.new({ kind = errors.INTERNAL, message = "agentic answer returned empty content" })
        end
        response.answer = answer
    elseif #items == 0 then
        response.answer = NO_ANSWER_FOUND
    else
        local answer, synthesis_err = synthesize(query_text, items, answer_model, config.extra_prompt)
        if synthesis_err then return nil, synthesis_err end
        response.answer = answer
    end

    return response, nil
end

M._synthesize = synthesize

return M
