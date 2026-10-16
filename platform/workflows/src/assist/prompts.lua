-- Prompt construction and structured LLM calls for authoring assist.
type Map = { [string]: any }
type PromptAssist = {
    default_generate: (any, any?) -> (any?, any?),
    default_schema_generate: (any, any?) -> (any?, any?),
    default_config_generate: (any, any?) -> (any?, any?),
    default_edge_intent_generate: (any, any?) -> (any?, any?),
}
return function(I: any): PromptAssist
local json, prompt, mapping, llm, time = I.json, I.prompt, I.mapping, I.llm, I.time
local MODEL, LLM_TIMEOUT_SECONDS = I.MODEL, I.LLM_TIMEOUT_SECONDS
local LLM_RETRY_BACKOFF_MS, LLM_ATTEMPTS = I.LLM_RETRY_BACKOFF_MS, I.LLM_ATTEMPTS
local TRANSFORM_SCHEMA, SCHEMA_ASSIST_SCHEMA = I.TRANSFORM_SCHEMA :: Map, I.SCHEMA_ASSIST_SCHEMA :: Map
local CONFIG_ASSIST_SCHEMA, EDGE_INTENT_SCHEMA = I.CONFIG_ASSIST_SCHEMA :: Map, I.EDGE_INTENT_SCHEMA :: Map
local schema_json, retryable_error, unavailable_error = I.schema_json, I.retryable_error, I.unavailable_error
local function build_prompt(ctx: Map): any
    local p = prompt.new()
    p:add_system([[Generate one workflow edge transform in expr-lang. Return a single expression string only in the structured field `transform`.
Rules:
]] .. mapping.AUTHORING_GRAMMAR .. [[
- Build the downstream node input shape exactly.
- Use expr-lang map literals like { field: output.value }.
- Use optional chaining `?.` and null fallback `??` when a parent may be absent.
- Do not use JavaScript, Lua, JSONPath, function bodies, markdown, or prose.]])
    p:add_user("INTENT:\n" .. tostring(ctx.intent or "")
        .. "\n\nEDGE:\n" .. tostring(json.encode(ctx.edge or {}) or "{}")
        .. "\n\nUPSTREAM OUTPUT SAMPLE:\n" .. tostring(json.encode(ctx.upstream_sample) or "null")
        .. "\n\nUPSTREAM OUTPUT JSON SCHEMA:\n" .. tostring(json.encode(ctx.upstream_schema) or "{}")
        .. "\n\nDOWNSTREAM INPUT SAMPLE:\n" .. tostring(json.encode(ctx.downstream_sample) or "null")
        .. "\n\nDOWNSTREAM INPUT JSON SCHEMA:\n" .. tostring(json.encode(ctx.downstream_schema) or "{}"))
    return p
end

local function build_edge_intent_prompt(ctx: Map): any
    local p = prompt.new()
    p:add_system([[Classify one plain-language request made while connecting two Flow steps. Return exactly one authoring action.
Actions:
- mapping: the request only describes which upstream fields/values become downstream input.
- condition: the request gates or branches execution. Return a boolean expr-lang `predicate` over `output`; the UI will insert a visible Condition step. Never encode it on the edge.
- failure_route: the request explicitly handles an error or failed step. The UI will use the existing Failed output port.
- insert_node: the request needs another semantic processing Block. `block_id` MUST be one of AVAILABLE_BLOCKS. This is a suggestion only.
Rules:
- Prefer mapping for ordinary renaming, reshaping, copying, summarizing field selection, or choosing input values.
- Use condition only for if/when/unless branching or gating.
- Use failure_route only for explicit failure, error, exception, or recovery language.
- Never invent a Block id. Never return edge conditions, runtime primitives, hidden graph state, code blocks, or markdown.
- Unused `predicate` and `block_id` fields must be empty strings.
- `summary` is one short, user-facing sentence describing the preview.]])
    p:add_user("INTENT:\n" .. tostring(ctx.intent or "")
        .. "\n\nEDGE:\n" .. tostring(json.encode(ctx.edge or {}) or "{}")
        .. "\n\nUPSTREAM OUTPUT JSON SCHEMA:\n" .. tostring(json.encode(ctx.upstream_schema) or "{}")
        .. "\n\nDOWNSTREAM INPUT JSON SCHEMA:\n" .. tostring(json.encode(ctx.downstream_schema) or "{}")
        .. "\n\nSOURCE_HAS_FAILED_ROUTE:\n" .. tostring(ctx.source_failure_available == true)
        .. "\n\nAVAILABLE_BLOCKS:\n" .. tostring(json.encode(ctx.available_steps or {}) or "[]"))
    return p
end

local function build_schema_prompt(ctx: Map): any
    local p = prompt.new()
    p:add_system([[Draft or edit one JSON Schema for a shared schema editor. Return the schema only in the structured field `schema`, with optional short `notes`.
Rules:
- Return a valid JSON Schema object; prefer draft 2020-12 compatible keywords.
- For object payloads, use type "object" and a properties object. Empty properties must be {}.
- Preserve useful fields from CURRENT_SCHEMA unless the intent asks to change them.
- Use required only for fields the intent clearly makes mandatory.
- Do not return markdown, prose outside the structured fields, JavaScript, or Lua.]])
    p:add_user("INTENT:\n" .. tostring(ctx.intent or "")
        .. "\n\nCURRENT_SCHEMA:\n" .. tostring(json.encode(schema_json.normalize_schema(ctx.current_schema or schema_json.empty_object())) or "{}")
        .. "\n\nCONTEXT:\n" .. tostring(json.encode(ctx.context or {}) or "{}"))
    return p
end

local function build_config_prompt(ctx: Map): any
    local p = prompt.new()
    p:add_system([[Draft one complete Flow Block configuration as JSON. Return the configuration only in the structured field `config`, with optional short `notes`.
Rules:
- Use only fields declared by CONFIG_SCHEMA. Never invent fields or component ids.
- Satisfy every required field and every declared type, enum, minimum, and maximum.
- Preserve useful values from CURRENT_CONFIG unless the intent asks to change them.
- A field whose schema type is object must be a JSON object, not JSON encoded as a string.
- Return no markdown, prose outside the structured fields, JavaScript, or Lua.]])
    p:add_user("INTENT:\n" .. tostring(ctx.intent or "")
        .. "\n\nBLOCK_ID:\n" .. tostring(ctx.block_id or "")
        .. "\n\nBLOCK_TITLE:\n" .. tostring(ctx.block_title or "")
        .. "\n\nCONFIG_SCHEMA:\n" .. tostring(json.encode(ctx.config_schema or {}) or "{}")
        .. "\n\nPREVIOUS_STEP_OUTPUT_SCHEMA:\n" .. tostring(json.encode(ctx.upstream_schema or {}) or "{}")
        .. "\n\nCURRENT_CONFIG:\n" .. tostring(json.encode(ctx.current_config or {}) or "{}"))
    return p
end

local function structured_generate(output_schema: Map, prompt_value: any, missing_error: string, opts: any?): (any?, any?)
    local o = type(opts) == "table" and (opts :: Map) or {}
    local client = type(o.llm) == "table" and o.llm or llm
    local sleep = type(o.sleep) == "function" and o.sleep or function(ms: number)
        time.sleep(tostring(ms) .. "ms")
    end

    local resp: any = nil
    local err: any = nil
    for attempt = 1, LLM_ATTEMPTS do
        resp, err = (client :: any).structured_output(output_schema, prompt_value, {
            model = MODEL,
            temperature = 0,
            timeout = LLM_TIMEOUT_SECONDS,
        })
        if not err then break end
        if attempt < LLM_ATTEMPTS and retryable_error(err) then
            sleep(tonumber(LLM_RETRY_BACKOFF_MS) or 250)
        else
            return nil, unavailable_error()
        end
    end

    if err then return nil, unavailable_error() end
    local result = type(resp) == "table" and (resp :: Map).result or nil
    if type(result) == "string" then
        local decoded, derr = json.decode(result :: string)
        if derr then return nil, "model returned invalid JSON" end
        result = decoded
    end
    if type(result) ~= "table" then return nil, missing_error end
    return result, nil
end

local function default_generate(ctx: any, opts: any?): (any?, any?)
    local c = type(ctx) == "table" and (ctx :: Map) or {}
    return structured_generate(TRANSFORM_SCHEMA, build_prompt(c :: Map), "model returned no transform", opts)
end

local function default_schema_generate(ctx: any, opts: any?): (any?, any?)
    local c = type(ctx) == "table" and (ctx :: Map) or {}
    return structured_generate(SCHEMA_ASSIST_SCHEMA, build_schema_prompt(c :: Map), "model returned no schema", opts)
end

local function default_config_generate(ctx: any, opts: any?): (any?, any?)
    local c = type(ctx) == "table" and (ctx :: Map) or {}
    return structured_generate(CONFIG_ASSIST_SCHEMA, build_config_prompt(c :: Map), "model returned no configuration", opts)
end

local function default_edge_intent_generate(ctx: any, opts: any?): (any?, any?)
    local c = type(ctx) == "table" and (ctx :: Map) or {}
    return structured_generate(EDGE_INTENT_SCHEMA, build_edge_intent_prompt(c :: Map), "model returned no edge intent", opts)
end


return { default_generate = default_generate, default_schema_generate = default_schema_generate,
    default_config_generate = default_config_generate, default_edge_intent_generate = default_edge_intent_generate }
end
