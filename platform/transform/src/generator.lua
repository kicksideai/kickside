-- Transform generation core: the validation gate, the schema-similarity strategy
-- call, and the generate/regenerate orchestration. Pure logic, no LLM or
-- dataflow imports, so the whole safety spine runs in the standalone transform
-- harness. The durable dataflow (gen_flow) and the LLM-backed generate/analyze
-- nodes call into this module.
--
-- The gate is the invariant: a candidate artifact is executed over EVERY sample
-- through the real strategy apply (kickside.transform:apply) and the one sink
-- input normalization (kickside.transform:sink_input) -- the same code the
-- automation round runs -- and every output is validated against the sink
-- input_schema. A generation that does not validate on all samples is never
-- returned as attachable.

local apply = require("transform_apply")
local strategies = require("transform_strategies")
local sink_input = require("sink_input")
local component = require("component")
local schema_validate = require("schema_validate")

local M = {}

type Map = { [string]: any }

M.STRATEGY_EXPRESSION = "expression"
M.STRATEGY_LLM = "llm"
M.STRATEGY_CODE = "code"

-- Map a generated artifact to the transform config the shared apply understands.
-- expression -> the expr kind (artifact is the expr string that constructs the
-- sink-shaped object); llm -> the llm kind (artifact is a table carrying the
-- prompt and optional model, or a bare prompt string); code -> the code kind
-- (artifact is the sandboxed Lua source, or a table carrying code + optional
-- tool_ids).
local function to_transform(strategy: string, artifact: any): Map
    if strategy == M.STRATEGY_LLM then
        if type(artifact) == "table" then
            local a = artifact :: Map
            return { kind = "llm", prompt = a.prompt, model = a.model }
        end
        return { kind = "llm", prompt = artifact }
    end
    if strategy == M.STRATEGY_CODE then
        if type(artifact) == "table" then
            local a = artifact :: Map
            return { kind = "code", code = a.code, tool_ids = a.tool_ids }
        end
        return { kind = "code", code = artifact }
    end
    return { kind = "expr", expr = artifact }
end
M.to_transform = to_transform

-- caller_authorization(strategy, config) -> the authorization the gate runs a
-- strategy under: the calling actor is both its operator and its principal,
-- holding its own access mask on every resource the configuration declares.
local function caller_authorization(strategy: string, config: Map): (Map?, string?)
    local references, describe_err = strategies.describe(strategy, config)
    if describe_err or not references then
        return nil, "transform " .. strategy .. " declares no enforceable resources: " .. tostring(describe_err)
    end
    local grants: { Map } = {}
    for _, ref in ipairs(references :: { Map }) do
        local id = tostring(ref.resource_id)
        local level, access_err = component.validate_access(id, ref.required_mask)
        if access_err then return nil, "the caller lacks access to " .. id .. ": " .. tostring(access_err) end
        grants[#grants + 1] = { resource_id = id, mask = level }
    end
    return { operator_grants = grants, principal_grants = grants }, nil
end

-- apply_strategy(config, sample, index) -> ({ present, value? }?, err?): one
-- sample through its strategy, the sample's payload as the strategy input.
-- Explicit skip reasons pass through with absent outcomes.
function M.apply_strategy(config: Map, sample: any, index: integer): (Map?, string?)
    local item = type(sample) == "table" and (sample :: Map) or {}
    local payload = item.payload
    local strategy = tostring(config.kind or "")
    local authorization, auth_err = caller_authorization(strategy, config)
    if auth_err or not authorization then return nil, auth_err end
    local key = type(item.item_key) == "string" and item.item_key or ("sample-" .. tostring(index))
    local answer, request_err = apply.apply({ strategy = strategy, config = config, authorization = authorization,
        item = { item_key = key, envelope = { item_key = key }, input = payload } })
    if request_err or not answer then return nil, tostring(request_err) end
    if type(answer.error) == "table" then return nil, tostring(answer.error.message) end
    return { present = answer.present == true, value = answer.value, skip = answer.skip }, nil
end

-- validate_transform(config, sink_schema, samples, opts) -> (ok, errors, outputs).
-- Runs a ready transform config over each sample through its strategy
-- (opts.apply_fn(config, sample, index) -> { present, value? } replaces it),
-- normalizes each value into the sink's declared opts.input_shape (record or
-- content) and validates it against sink_schema. ok is true only when there is
-- at least one sample and every one produces a schema-valid output or an
-- explicit skip; outputs
-- carries the produced items, shaped where they could be (for a UI preview). This is the single
-- execute+validate loop; run_gate and the /validate endpoint both go through it.
function M.validate_transform(config: any, sink_schema: any, samples: any, opts: any?): (boolean, {string}, {any})
    local errors: {string} = {}
    local outputs: {any} = {}
    local o = type(opts) == "table" and (opts :: Map) or {}
    if o.input_shape ~= sink_input.RECORD and o.input_shape ~= sink_input.CONTENT then
        return false, { "the sink input shape must be record or content" }, outputs
    end
    if type(config) ~= "table" then return false, { "transform config must be an object" }, outputs end
    local run = type(o.apply_fn) == "function" and o.apply_fn or M.apply_strategy
    local list = type(samples) == "table" and (samples :: {any}) or {}
    if #list == 0 then
        return false, { "no sample items to validate against" }, outputs
    end

    for i, item in ipairs(list) do
        local answer, err = run(config, item, i)
        if err or not answer then
            errors[#errors + 1] = "sample " .. i .. ": " .. tostring(err or "produced no answer")
        elseif answer.skip ~= nil then
            outputs[#outputs + 1] = { present = false, skip = answer.skip }
        elseif answer.present ~= true then
            errors[#errors + 1] = "sample " .. i .. ": produced no output"
        else
            local out, shape_err = sink_input.normalize(answer.value, o.input_shape, o.configured_content)
            if shape_err or not out then
                errors[#errors + 1] = "sample " .. i .. ": " .. tostring(shape_err)
                -- The value the transform produced still rides out for the preview.
                outputs[#outputs + 1] = answer.value
            else
                local verr = schema_validate.check(out, sink_schema)
                if verr then
                    errors[#errors + 1] = "sample " .. i .. ": " .. tostring(verr)
                end
                outputs[#outputs + 1] = out
            end
        end
    end

    return #errors == 0, errors, outputs
end

-- run_gate(strategy, artifact, sink_schema, samples, opts) -> (ok, errors).
-- The generation gate: build the config from strategy+artifact and run it through
-- validate_transform with opts { input_shape, apply_fn? }. ok is true only when
-- every sample produces a schema-valid output.
function M.run_gate(strategy: string, artifact: any, sink_schema: any, samples: any, opts: any?): (boolean, {string})
    local ok, errors = M.validate_transform(to_transform(strategy, artifact), sink_schema, samples, opts)
    return ok, errors
end

-- Leaf property names declared under a schema's properties (recursively), used
-- for a cheap field-name overlap between source and sink shapes.
local function leaf_names(node: any, out: { [string]: boolean })
    if type(node) ~= "table" then return end
    local n = node :: Map
    if type(n.properties) == "table" then
        for k, prop in pairs(n.properties :: Map) do
            out[tostring(k):lower()] = true
            leaf_names(prop, out)
        end
    end
    if type(n.items) == "table" then leaf_names(n.items, out) end
end

local function decode(schema: any): any
    if type(schema) == "string" then
        local json = require("json")
        local d = json.decode(schema :: string)
        return type(d) == "table" and d or {}
    end
    return type(schema) == "table" and schema or {}
end

-- example_of(schema_node) -> a representative zero-value for a JSON-schema node.
-- Structural, not semantic: objects recurse their declared properties; scalars get
-- type-appropriate empties. A node with no declared shape yields {} / "".
local function example_of(node: any): any
    local n = type(node) == "table" and (node :: Map) or {}
    local t: any = n.type
    if type(t) == "table" then t = (t :: {any})[1] end
    if t == "object" or type(n.properties) == "table" then
        local o: Map = {}
        if type(n.properties) == "table" then
            for k, prop in pairs(n.properties :: Map) do o[tostring(k)] = example_of(prop) end
        end
        return o
    elseif t == "array" then
        return {}
    elseif t == "number" or t == "integer" then
        return 0
    elseif t == "boolean" then
        return false
    end
    return ""
end

-- synthesize_sample(source_schema) -> one representative item { payload = <example> }
-- derived from the declared payload schema (the event body for event sources). This lets generation + the gate run for any
-- schema-bearing source without the caller fabricating data; a schema with no declared
-- shape yields { payload = {} }, so the gate degrades gracefully instead of hard-failing.
function M.synthesize_sample(source_schema: any): any
    return { payload = example_of(decode(source_schema)) }
end

-- Only strategies declaring safe install evaluation execute a synthetic sample.
function M.validate_install(config: any, source_schema: any, sink_schema: any, opts: any?): (boolean, {string})
    if type(config) ~= "table" then return false, { "transform config must be an object" } end
    local binding, binding_err = strategies.resolve(tostring(config.kind or ""))
    if binding_err or not binding then return false, { tostring(binding_err) } end
    if binding.validate_at_install ~= true or type(source_schema) ~= "table" or sink_schema == nil then
        return true, {}
    end
    local valid, failures = M.validate_transform(config, sink_schema, { M.synthesize_sample(source_schema) }, opts)
    return valid, failures
end

-- schema_similarity(source_schema, sink_schema) -> 0..1 Jaccard overlap of field
-- names. A high overlap means a plain field mapping (expression) is likely to
-- suffice; a low overlap signals that a semantic (llm) mapping is needed.
function M.schema_similarity(source_schema: any, sink_schema: any): number
    local a: { [string]: boolean } = {}
    local b: { [string]: boolean } = {}
    leaf_names(decode(source_schema), a)
    leaf_names(decode(sink_schema), b)
    local inter, union = 0, 0
    local seen: { [string]: boolean } = {}
    for k in pairs(a) do
        seen[k] = true
        union = union + 1
        if b[k] then inter = inter + 1 end
    end
    for k in pairs(b) do
        if not seen[k] then union = union + 1 end
    end
    if union == 0 then return 0 end
    return inter / union
end

M.SIMILARITY_EXPRESSION_THRESHOLD = 0.34

-- analyze_strategy(source_schema, sink_schema, opts) -> (strategy, rationale).
-- Cheap schema-similarity plus an optional LLM judgment (opts.judge_fn). Prefers
-- expression: it is chosen whenever similarity clears the threshold, and the
-- judge is consulted only for the ambiguous low-overlap case. judge_fn returning
-- anything other than "llm" keeps expression.
function M.analyze_strategy(source_schema: any, sink_schema: any, opts: any): (string, string)
    local o = type(opts) == "table" and (opts :: Map) or {}
    local sim = M.schema_similarity(source_schema, sink_schema)
    if sim >= M.SIMILARITY_EXPRESSION_THRESHOLD then
        return M.STRATEGY_EXPRESSION, string.format("field overlap %.2f clears the expression threshold", sim)
    end
    if type(o.judge_fn) == "function" then
        local verdict = (o.judge_fn :: any)(source_schema, sink_schema, sim)
        if verdict == M.STRATEGY_LLM then
            return M.STRATEGY_LLM, string.format("low field overlap %.2f; judge selected semantic mapping", sim)
        end
        return M.STRATEGY_EXPRESSION, string.format("low field overlap %.2f; judge kept expression", sim)
    end
    return M.STRATEGY_EXPRESSION, string.format("field overlap %.2f; defaulting to expression", sim)
end

-- One generation attempt against the current strategy: produce an artifact via
-- generate_fn, then run the gate. State carries strategy, attempt count, and the
-- errors from the previous try so generate_fn can correct. Exhausting
-- max_attempts terminates as a hard failure. Returns the next state;
-- state.continue drives the cycle, state.ok marks a validated result.
function M.advance(state: any): Map
    local s = type(state) == "table" and (state :: Map) or {}
    local strategy = tostring(s.strategy or M.STRATEGY_EXPRESSION)
    local max_attempts = tonumber(s.max_attempts) or 3
    local attempt = (tonumber(s.attempt) or 0) + 1

    local generate_fn = s.generate_fn
    if type(generate_fn) ~= "function" then
        return { ok = false, continue = false, strategy = strategy, errors = { "no generate_fn supplied" }, validated = false }
    end

    local artifact = (generate_fn :: any)({
        strategy = strategy,
        attempt = attempt,
        last_errors = s.last_errors or {},
        source_schema = s.source_schema,
        sink_schema = s.sink_schema,
        samples = s.samples,
        hint = s.hint,
    })

    local ok, errors = M.run_gate(strategy, artifact, s.sink_schema, s.samples,
        { input_shape = s.input_shape, apply_fn = s.apply_fn })

    local next_state: Map = {
        strategy = strategy,
        attempt = attempt,
        max_attempts = max_attempts,
        source_schema = s.source_schema,
        sink_schema = s.sink_schema,
        input_shape = s.input_shape,
        samples = s.samples,
        hint = s.hint,
        generate_fn = generate_fn,
        apply_fn = s.apply_fn,
        rationale = s.rationale,
    }

    if ok then
        next_state.ok = true
        next_state.continue = false
        next_state.validated = true
        next_state.artifact = artifact
        next_state.last_errors = {}
        return next_state
    end

    next_state.ok = false
    next_state.validated = false
    next_state.last_errors = errors

    if attempt >= max_attempts then
        next_state.continue = false
        next_state.errors = errors
        return next_state
    end

    next_state.continue = true
    return next_state
end

-- generate(opts) -> proposal. Drives advance until a strategy validates or all
-- attempts are exhausted. opts:
--   source_schema, sink_schema, input_shape (record|content), samples, hint,
--   strategy?          -- expression by default; auto requests analysis,
--   generate_fn(ctx)   -- produces the artifact for ctx.strategy,
--   apply_fn?          -- gate execution (defaults to the strategy apply),
--   max_attempts=3, analyze_opts?
-- A validated result is { strategy, artifact, rationale, validated=true,
-- attempts }. A failure is { validated=false, ok=false, strategy, errors } and
-- carries no attachable artifact.
function M.generate(opts: any): Map
    local o = type(opts) == "table" and (opts :: Map) or {}
    local strategy = tostring(o.strategy or M.STRATEGY_EXPRESSION)
    local rationale = ""
    if strategy == "auto" then
        strategy, rationale = M.analyze_strategy(o.source_schema, o.sink_schema, o.analyze_opts)
    else
        rationale = "strategy forced by caller: " .. strategy
    end

    local max_attempts = tonumber(o.max_attempts) or 3
    local state: Map = {
        strategy = strategy,
        attempt = 0,
        max_attempts = max_attempts,
        source_schema = o.source_schema,
        sink_schema = o.sink_schema,
        input_shape = o.input_shape,
        samples = o.samples,
        hint = o.hint,
        generate_fn = o.generate_fn,
        apply_fn = o.apply_fn,
        rationale = rationale,
        continue = true,
    }

    -- The attempt cap terminates generation within the existing safety bound.
    local guard = (max_attempts * 2) + 2
    while state.continue and guard > 0 do
        state = M.advance(state)
        guard = guard - 1
    end

    local final = state :: Map
    if final.ok == true then
        return {
            ok = true,
            validated = true,
            strategy = tostring(final.strategy),
            artifact = final.artifact,
            rationale = rationale,
            attempts = final.attempt,
        }
    end

    return {
        ok = false,
        validated = false,
        strategy = tostring(final.strategy),
        errors = final.errors or final.last_errors or { "generation did not validate" },
        rationale = rationale,
    }
end

return M
