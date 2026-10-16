-- The transform generator: a durable dataflow that proposes a validated
-- transform for a (source_schema -> sink_schema) pairing, plus the callable API
-- the UI / sync-create seam invokes.
--
-- Node graph (minimal, 3 nodes; the cycle is terminal):
--   with_input -> snippet_search -> analyze -> cycle(iterate)
--
--   snippet_search  gate a confirmed snippet on the current request before reuse.
--   analyze         honor the chosen strategy or analyze an explicit auto request.
--   cycle(iterate)  regenerate primitive AND terminal node: each iteration drafts
--                   an artifact and runs it through the HARD validation gate; the
--                   attempt cap is owned by generator.advance (state.max_attempts). continue drives
--                   the cycle; max_iterations is the engine-level safety bound. When
--                   the cycle stops it emits its last iteration's compact `result`
--                   (the gate's durable verdict) as the flow output. A downstream
--                   :func does NOT receive the cycle output -- the cycle must be the
--                   last node -- so the attachable-vs-failure shaping runs here in the
--                   API wrapper over that durable outcome, not as a separate node.

local flow = require("flow")
local generator = require("generator")
local snippet = require("snippet")

local M = {}

type Map = { [string]: any }
type GenerationError = error | string

local function invalid(field: string, message: string): (nil, error)
    return nil, (errors.new({kind = errors.INVALID, retryable = false, message = message,
        details = {code = "transform_generation_invalid", field = field}}) :: error)
end

local NODE_SNIPPET_SEARCH = "kickside.transform:node_snippet_search"
local NODE_ANALYZE = "kickside.transform:node_analyze"
local NODE_ITERATE = "kickside.transform:node_iterate"

local DEFAULT_MAX_ATTEMPTS = 3

-- Only explicit auto invokes strategy analysis.
local function resolve_strategy(strategy: any): string
    if strategy == nil or strategy == "expr" then return generator.STRATEGY_EXPRESSION end
    if strategy == "auto" or strategy == generator.STRATEGY_LLM or strategy == generator.STRATEGY_CODE then return strategy end
    return ""
end
M.resolve_strategy = resolve_strategy

-- Shape the cycle's durable outcome into the proposal. The gate is the sole
-- authority: an artifact is attachable ONLY when validated == true (which generation
-- and snippet reuse set only after the gate passed on every sample, and only
-- alongside an artifact).
-- Every other case -- attempts exhausted, no artifact -- is a hard failure carrying
-- the gate errors and NO artifact. The attachable proposal also carries the ready
-- transform config { kind, ... } (via generator.to_transform) the UI/SyncCreate
-- persist directly; strategy echoes that kind (expr|llm|code).
function M.shape_proposal(outcome: any): Map
    local o = type(outcome) == "table" and (outcome :: Map) or {}
    if o.validated == true and o.artifact ~= nil then
        local config = generator.to_transform(tostring(o.strategy or ""), o.artifact)
        return {
            ok = true,
            validated = true,
            strategy = tostring(config.kind),
            transform = config,
            artifact = o.artifact,
            rationale = tostring(o.rationale or ""),
            from_snippet = o.from_snippet == true,
        }
    end
    return {
        ok = false,
        validated = false,
        strategy = tostring(o.strategy or ""),
        errors = o.errors or { "generation did not validate on all samples" },
        rationale = tostring(o.rationale or ""),
    }
end

-- generate_transform(args) -> (proposal, err?). args:
--   source_schema, sink_schema : the shape pair (table or JSON string),
--   input_shape                : the sink's declared input shape (record | content),
--   samples                    : real source items to validate against (required),
--   hint?                      : freeform steer for the model,
--   strategy?                  : expr (default) | llm | code | auto; auto invokes
--                                the strategy judge before generation,
--   model?                     : generator reasoning model (default class:fast),
--   sync_or_source_id?         : informational, echoed back.
-- proposal on success: { validated = true, strategy, transform, artifact, rationale }.
-- On a generation that never validates: { validated = false, errors = {...} }.
function M.generate_transform(args: any): (Map?, GenerationError?)
    local a = type(args) == "table" and (args :: Map) or {}
    if a.source_schema == nil then return invalid("source_schema", "source_schema is required") end
    if a.sink_schema == nil then return invalid("sink_schema", "sink_schema is required") end
    if a.input_shape ~= "record" and a.input_shape ~= "content" then
        return invalid("input_shape", "input_shape is required: the sink's declared record or content input")
    end
    local samples = type(a.samples) == "table" and (a.samples :: {any}) or {}
    if #samples == 0 then return invalid("samples", "real source samples are required") end
    for _, sample in ipairs(samples) do
        if type(sample) ~= "table" or sample.payload == nil then
            return invalid("samples", "each source sample requires a payload")
        end
    end
    local strategy = resolve_strategy(a.strategy)
    if strategy == "" then return invalid("strategy", "strategy must be expr, llm, code or auto") end
    local max_attempts = tonumber(a.max_attempts) or DEFAULT_MAX_ATTEMPTS

    local input: Map = {
        source_schema = a.source_schema,
        sink_schema = a.sink_schema,
        input_shape = a.input_shape,
        samples = samples,
        hint = a.hint,
        model = a.model,
        max_attempts = max_attempts,
        strategy = strategy,
    }

    local result, err = flow.create()
        :with_title("Generate Transform")
        :with_input(input)
        :func(NODE_SNIPPET_SEARCH)
        :func(NODE_ANALYZE)
        :cycle({
            func_id = NODE_ITERATE,
            max_iterations = (max_attempts * 2) + 2,
            continue_condition = "result.continue == true",
        })
        :run()

    if err then return nil, "transform generation failed: " .. tostring(err) end
    local proposal = M.shape_proposal(result)
    if a.sync_or_source_id ~= nil then proposal.sync_or_source_id = a.sync_or_source_id end
    return proposal, nil
end

-- publish_transform_snippet(args) -> (snippet, err?). Persists a confirmed
-- transform as a reusable snippet keyed by the two schema fingerprints. args:
--   artifact, source_schema, sink_schema, strategy (required), rationale?
function M.publish_transform_snippet(args: any): (Map?, error?)
    local a = type(args) == "table" and (args :: Map) or {}
    return snippet.publish_snippet(a.artifact, a.source_schema, a.sink_schema, {
        strategy = a.strategy,
        rationale = a.rationale,
    })
end

return M
