-- Dataflow node functions for transform generation. Each is a func.lua the
-- generator dataflow (gen_flow) routes through. The durable logic (gate, strategy
-- policy, regenerate) lives in the generator library; these nodes are the
-- LLM-backed edges: snippet reuse, strategy analysis, and per-iteration artifact
-- production wrapped around generator.advance.
--
-- The generator's own reasoning calls default to class:fast (cheap: a strategy
-- pick and a mapping draft); the model is threaded from the flow input so it stays
-- tunable.

local json = require("json")
local production_prompt = require("prompt")
local production_llm = require("llm")
local generator = require("generator")
local production_snippet = require("snippet")

local function construct(deps: any): any
local prompt = deps.prompt
local llm = deps.llm
local snippet = deps.snippet
local M = {}

type Map = { [string]: any }

local DEFAULT_MODEL = "class:fast"

local function trim(v: any): string
    if type(v) ~= "string" then return "" end
    return ((v :: string):gsub("^%s+", ""):gsub("%s+$", ""))
end

-- Strip markdown code fences an LLM may wrap around a bare expression/prompt.
local function unfence(text: string): string
    local t = trim(text)
    local body = t:match("^```[%w]*%s*(.-)%s*```$")
    if body then return trim(body) end
    return t
end

local function resp_text(resp: any, err: any): string
    if err then error(err) end
    if type(resp) ~= "table" or type(resp.result) ~= "string" then error("generation model returned no text result") end
    return resp.result
end

local function first_sample_payload(samples: any): any
    if type(samples) ~= "table" or type(samples[1]) ~= "table" or samples[1].payload == nil then
        error("real source sample payload is required")
    end
    return samples[1].payload
end

-- snippet_search: validate a confirmed snippet on the current request before it
-- short-circuits generation. Passes the full working state forward either way.
function M.snippet_search(input: any): (Map?, error?)
    local i = type(input) == "table" and (input :: Map) or {}
    if trim(i.hint) ~= "" then i.done = false; return i end
    local hit, search_err = snippet.search_snippet(i.source_schema, i.sink_schema)
    if search_err then return nil, search_err end
    local requested = trim(i.strategy) ~= "" and i.strategy or generator.STRATEGY_EXPRESSION
    if hit and requested ~= "auto" and hit.strategy ~= requested then i.done = false; return i end
    if hit then
        local valid, gate_errors = generator.run_gate(hit.strategy, hit.artifact, i.sink_schema, i.samples,
            {input_shape = i.input_shape})
        if not valid then
            return {
                done = true,
                ok = false,
                validated = false,
                from_snippet = true,
                strategy = hit.strategy,
                errors = gate_errors,
                rationale = "reused confirmed snippet " .. tostring(hit.id),
                source_schema = i.source_schema,
                sink_schema = i.sink_schema,
                samples = i.samples,
                hint = i.hint,
                model = i.model,
            }
        end
        return {
            done = true,
            ok = true,
            validated = true,
            from_snippet = true,
            strategy = hit.strategy,
            artifact = hit.artifact,
            rationale = "reused confirmed snippet " .. tostring(hit.id),
            source_schema = i.source_schema,
            sink_schema = i.sink_schema,
            samples = i.samples,
            hint = i.hint,
            model = i.model,
        }
    end
    i.done = false
    return i
end

-- analyze: pick expression or llm. Schema similarity decides directly; only the
-- ambiguous low-overlap case asks the model (a one-word judgment). Prefers
-- expression.
function M.analyze(input: any): Map
    local i = type(input) == "table" and (input :: Map) or {}
    if i.done == true then return i end

    -- A caller-forced strategy (expression|llm|code) bypasses analysis; the cycle
    -- iterates that strategy directly without strategy changes.
    if i.strategy ~= "auto" then
        i.strategy = trim(i.strategy) ~= "" and i.strategy or generator.STRATEGY_EXPRESSION
        i.rationale = "strategy forced by caller: " .. tostring(i.strategy)
        i.attempt = 0
        i.max_attempts = tonumber(i.max_attempts) or 3
        i.continue = true
        return i
    end

    local model = trim(i.model) ~= "" and tostring(i.model) or DEFAULT_MODEL
    local judge_fn = function(source: any, sink: any, sim: number): string
        local p = prompt.new()
        p:add_system("You decide how to map one data shape to another. Answer with exactly one word: 'expression' if a plain field-to-field mapping suffices, or 'llm' if the target needs semantic rewriting/summarization of the source. Prefer 'expression'.")
        p:add_user("SOURCE SCHEMA:\n" .. json.encode(source) .. "\n\nTARGET SCHEMA:\n" .. json.encode(sink) .. "\n\nField-name overlap: " .. string.format("%.2f", sim))
        local resp, err = llm.generate(p, { model = model, temperature = 0 })
        local verdict = trim(resp_text(resp, err)):lower()
        if verdict ~= "llm" and verdict ~= "expression" then error("strategy judge must return expression or llm") end
        return verdict
    end

    local strategy, rationale = generator.analyze_strategy(i.source_schema, i.sink_schema, { judge_fn = judge_fn })
    i.strategy = strategy
    i.rationale = rationale
    i.attempt = 0
    i.max_attempts = tonumber(i.max_attempts) or 3
    i.continue = true
    return i
end

-- Produce an artifact for ctx.strategy via the model, incorporating the previous
-- attempt's gate errors. expression -> a bare expr string constructing the
-- sink-shaped object; llm -> a { prompt, model } the transform's llm kind runs.
local function llm_generate(ctx: any, model: string): any
    local c = type(ctx) == "table" and (ctx :: Map) or {}
    local sample = first_sample_payload(c.samples)
    local hint = trim(c.hint) ~= "" and ("\n\nREQUESTED MAPPING:\n" .. trim(c.hint)) or ""
    local errors = type(c.last_errors) == "table" and #(c.last_errors :: {any}) > 0
        and ("\n\nThe previous attempt failed validation with:\n" .. json.encode(c.last_errors) .. "\nFix these.")
        or ""

    if tostring(c.strategy) == generator.STRATEGY_LLM then
        local p = prompt.new()
        p:add_system("Write a concise instruction (2-4 sentences) for an assistant that turns one source item into the TARGET object. It must set every required target field. Output only the instruction text." .. errors)
        p:add_user("TARGET SCHEMA:\n" .. json.encode(c.sink_schema) .. "\n\nSAMPLE SOURCE ITEM:\n" .. json.encode(sample) .. hint)
        local resp, err = llm.generate(p, { model = model, temperature = 0 })
        return { prompt = unfence(resp_text(resp, err)), model = model }
    end

    if tostring(c.strategy) == generator.STRATEGY_CODE then
        local p = prompt.new()
        p:add_system([[Write a Lua snippet, run in a sandbox, that maps one source item to the TARGET object. Rules:
- The item is the global `__cx_args`; its structured body is `__cx_args.payload`. Reference NOTHING else from the environment.
- `return` a table matching the TARGET schema and set every required field (e.g. `return { content = __cx_args.payload.summary.overview }`).
- The ONLY libraries available are `json` and the standard `string`, `table`, and `math`. No require, no fs/db/net/process.
- Guard optional nested fields so a missing parent never errors (e.g. `local s = __cx_args.payload.summary or {}`).
- Output ONLY the Lua source. No prose, no code fences.]] .. errors)
        p:add_user("TARGET SCHEMA:\n" .. json.encode(c.sink_schema) .. "\n\nSOURCE SCHEMA:\n" .. json.encode(c.source_schema) .. "\n\nSAMPLE payload:\n" .. json.encode(sample) .. hint)
        local resp, err = llm.generate(p, { model = model, temperature = 0 })
        return unfence(resp_text(resp, err))
    end

    local p = prompt.new()
    p:add_system([[Write a single expr-lang expression that builds the TARGET object from a source item. Rules:
- The only variables in scope are `item` and `payload` (payload is the source item's structured body). Reference NOTHING else.
- Build a map literal { field: value, ... } matching the TARGET schema; set every required field.
- Use optional chaining `?.` for any nested field that may be absent (e.g. payload.summary?.overview) and `??` to supply a fallback, so no access ever hits a missing parent.
- Output ONLY the expression. No prose, no code fences.]] .. errors)
    p:add_user("TARGET SCHEMA:\n" .. json.encode(c.sink_schema) .. "\n\nSOURCE SCHEMA:\n" .. json.encode(c.source_schema) .. "\n\nSAMPLE payload:\n" .. json.encode(sample) .. hint)
    local resp, err = llm.generate(p, { model = model, temperature = 0 })
    return unfence(resp_text(resp, err))
end

-- Strip non-serializable function fields before a state crosses a node boundary.
local function serializable(state: any): Map
    local s = type(state) == "table" and (state :: Map) or {}
    local out: Map = {}
    for k, v in pairs(s) do
        if k ~= "generate_fn" and k ~= "apply_fn" and type(v) ~= "function" then out[k] = v end
    end
    return out
end

-- iterate: one durable regenerate step. Reads the working state from the cycle
-- envelope (or the upstream analyze output on the first pass), attaches an
-- LLM-backed generate_fn, and delegates the attempt + gate + strategy policy to
-- generator.advance. Returns the { state, result, continue } envelope the cycle
-- node consumes.
function M.iterate(context: any): Map
    local ctx = type(context) == "table" and (context :: Map) or {}
    -- Iteration 1 receives the upstream analyze output on `input`; later
    -- iterations receive the prior envelope's state on `state`.
    local state: Map
    if type(ctx.state) == "table" and next(ctx.state :: Map) ~= nil then
        state = ctx.state :: Map
    elseif type(ctx.input) == "table" then
        state = ctx.input :: Map
    else
        state = ctx
    end
    -- Snippet lookup has already produced its terminal gate outcome.
    if state.done == true then
        return M.build_envelope(state)
    end

    local model = trim(state.model) ~= "" and tostring(state.model) or DEFAULT_MODEL
    state.generate_fn = function(gctx: any): any return llm_generate(gctx, model) end
    return M.build_envelope(generator.advance(state))
end

-- Package one iteration's working state into the cycle envelope. The cycle carries
-- `state` into the next iteration and, when it stops, emits `result` as the flow
-- output (the cycle is the terminal node). The validated/ok signal therefore lives
-- in a compact, explicit `result` -- the gate's durable verdict -- not buried in the
-- fat working state, whose schemas/samples must not ride out as the proposal.
-- continue drives the cycle.
function M.build_envelope(s: any): Map
    local st = type(s) == "table" and (s :: Map) or {}
    local outcome: Map = {
        ok = st.ok == true,
        validated = st.validated == true,
        strategy = tostring(st.strategy or ""),
        artifact = st.artifact,
        rationale = tostring(st.rationale or ""),
        errors = st.errors or st.last_errors or {},
        continue = st.continue == true,
        from_snippet = st.from_snippet == true,
    }
    return { state = serializable(st), result = outcome, continue = outcome.continue }
end

M.new = construct
return M
end
return construct({ prompt = production_prompt, llm = production_llm, snippet = production_snippet })
