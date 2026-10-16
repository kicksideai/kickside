local llm = require("llm")
local funcs = require("funcs")
local kb_search = require("kb_search")
local model_failure = require("model_failure")

local AGENTIC_QUERY = "kickside.knowledge.retrieval:agentic_query"

-- KB answering (the "Ask" path), in the control plane. Retrieval is the engine's
-- job (kb_search.query); answering is ours: the KB's query_driver selects how the
-- answer is produced — the agentic dataflow driver (a tool-calling agent) or a
-- single-shot synthesis over the retrieved passages. The ranked passages are
-- returned as sources either way. Driver failures return errors. Without an
-- analysis model the result contains passages only.
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

local ANSWER_PROMPT = [[Answer the question using ONLY the passages below. State nothing the passages do not support; if they do not contain the answer, say so plainly. Cite each supported statement with the passage number in square brackets, such as [1]. Use one number per bracket pair: for multiple sources write [1][2]; never combine numbers inside one pair. Use only numbers from the supplied passages. Be concise and direct.%s

QUESTION: "%s"

PASSAGES:
%s]]

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
        local content = items[i].content or ""
        table.insert(passages, string.format("[%d] %s", i, content:sub(1, math.min(#content, PREVIEW_LENGTH))))
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
    if type(answer) ~= "string" or answer == "" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "answer generation returned empty content" })
    end
    return answer :: string
end

-- The analysis model controls answering independently of document summarization.
local function resolve_answer_model(config: table): string?
    local configured = config.analysis_model
    if type(configured) ~= "string" or configured == "" then
        return nil
    end
    return configured
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

-- ask(kb_id, { query, limit? }) -> (result, err). result is
-- { success, query, answer, items, count }; answer may be nil when no model is
-- configured anywhere (the UI then shows the ranked sources alone).
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
    local answer_model = resolve_answer_model(config)

    local result, q_err = M._kb_search.query(kb_id, { query = query_text, limit = opts.limit or DEFAULT_LIMIT })
    if q_err then
        return nil, q_err
    end
    local items = (result and result.items) or {}

    local answer: string? = nil
    if answer_model and config.query_driver == "agentic" then
        -- Seed the agent with the passages already retrieved here (slimmed) so it
        -- starts informed and spends its iterations exploring/refining, not
        -- rediscovering the KB.
        local seed_items = {}
        for i = 1, math.min(#items, 5) do
            local item = type(items[i]) == "table" and items[i] or {}
            table.insert(seed_items, { id = item.id, content = (item.content or ""):sub(1, 600) })
        end
        -- Run the dataflow agent in its own pool (funcs.call) so its dataflow
        -- runtime never enters this control-plane/HTTP import closure.
        local r, ferr = M._funcs.call(AGENTIC_QUERY, { kb_id = kb_id, query = query_text, config = config, seed_items = seed_items })
        if ferr then return nil, model_failure.wrap("agentic answer", ferr) end
        if type(r) ~= "table" or type((r :: any).answer) ~= "string" or (r :: any).answer == "" then
            return nil, errors.new({ kind = errors.INTERNAL, message = "agentic answer returned empty content" })
        end
        answer = (r :: any).answer
    elseif answer_model then
        local synthesis_err: any = nil
        answer, synthesis_err = synthesize(query_text, items, answer_model, config.extra_prompt)
        if synthesis_err then return nil, synthesis_err end
    end

    return {
        success = true,
        query = query_text,
        answer = answer,
        results = normalize(items),
        count = #items,
    }, nil
end

M._synthesize = synthesize
M._resolve_answer_model = resolve_answer_model

return M
