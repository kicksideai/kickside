-- Edge and binding assist previews; graph mutation stays with the caller.
type Map = { [string]: any }
type EdgeAssist = {
    assist_edge_intent: (any, any?) -> Map,
    assist_edge: (any, any?) -> Map,
    assist_binding: (any, any?) -> Map,
}
return function(I: any): EdgeAssist
local M: Map = { validate_transform = I.validate_transform }
local trim, unfence, decode_schema = I.trim, I.unfence, I.decode_schema
local default_generate, default_edge_intent_generate = I.default_generate, I.default_edge_intent_generate
local validate_condition_predicate = I.validate_condition_predicate
local MAX_AVAILABLE_BLOCKS, MAX_CONFIG_BLOCK_ID_BYTES = I.MAX_AVAILABLE_BLOCKS, I.MAX_CONFIG_BLOCK_ID_BYTES
local MAX_CONFIG_BLOCK_TITLE_BYTES, MAX_EDGE_INTENT_SUMMARY_BYTES = I.MAX_CONFIG_BLOCK_TITLE_BYTES, I.MAX_EDGE_INTENT_SUMMARY_BYTES
local MAX_ASSIST_INTENT_BYTES, ASSIST_UNAVAILABLE = I.MAX_ASSIST_INTENT_BYTES, I.ASSIST_UNAVAILABLE
local EMPTY_INPUT_GUIDANCE = I.EMPTY_INPUT_GUIDANCE
local function available_steps(value: any): ({ Map }?, Map?, string?)
    if type(value) ~= "table" then return {}, {}, nil end
    local source = value :: { any }
    if #source > MAX_AVAILABLE_BLOCKS then return nil, nil, "too many available Flow Blocks" end
    local list: { Map } = {}
    local by_kind: Map = {}
    for _, raw in ipairs(source) do
        if type(raw) ~= "table" then return nil, nil, "available Flow Blocks must be objects" end
        local item = raw :: Map
        local kind = trim(item.kind)
        local title = trim(item.title)
        if kind == "" or #kind > MAX_CONFIG_BLOCK_ID_BYTES then
            return nil, nil, "available Flow Block id is invalid"
        end
        if #title > MAX_CONFIG_BLOCK_TITLE_BYTES then return nil, nil, "available Flow Block title is invalid" end
        if by_kind[kind] == nil then
            local normalized = { kind = kind, title = title ~= "" and title or kind }
            list[#list + 1] = normalized
            by_kind[kind] = normalized
        end
    end
    return list, by_kind, nil
end

-- Classify a connection request before any graph mutation. Mapping delegates to the
-- existing validated transform family; every topology result is only a preview over
-- vocabulary the builder already declares (Condition node / Failed port / palette kind).
function M.assist_edge_intent(args: any, opts: any?): Map
    local a = type(args) == "table" and (args :: Map) or {}
    local intent = trim(a.intent)
    if intent == "" then return { success = false, error = "Describe what this connection should do." } end
    if #intent > MAX_ASSIST_INTENT_BYTES then return { success = false, error = "The connection description is too long." } end

    local upstream = decode_schema(a.upstream_schema)
    local downstream = decode_schema(a.downstream_schema)
    local kinds, kinds_by_id, kinds_err = available_steps(a.available_steps)
    if kinds_err or not kinds or not kinds_by_id then
        return { success = false, error = "Could not validate available Flow Blocks: " .. tostring(kinds_err) .. "." }
    end

    local o = type(opts) == "table" and (opts :: Map) or {}
    local classify = type(o.classify) == "function" and o.classify or function(ctx: any): (any?, any?)
        return default_edge_intent_generate(ctx, o)
    end
    local generated, generation_err = (classify :: any)({
        intent = intent,
        edge = type(a.edge) == "table" and a.edge or {},
        upstream_schema = upstream,
        downstream_schema = downstream,
        source_failure_available = a.source_failure_available == true,
        available_steps = kinds,
    })
    if generation_err then
        if type(generation_err) == "table" and (generation_err :: Map).error == ASSIST_UNAVAILABLE then return generation_err :: Map end
        return { success = false, error = "Could not understand this connection." }
    end
    if type(generated) ~= "table" then return { success = false, error = "The assistant returned no usable connection preview." } end

    local draft = generated :: Map
    local kind = trim(draft.kind)
    local summary = trim(draft.summary)
    if #summary > MAX_EDGE_INTENT_SUMMARY_BYTES then
        return { success = false, error = "The assistant returned an invalid connection summary." }
    end

    if kind == "mapping" then
        local mapped = M.assist_edge({
            edge = a.edge,
            upstream_schema = upstream,
            downstream_schema = downstream,
            upstream_sample = a.upstream_sample,
            downstream_sample = a.downstream_sample,
            intent = intent,
        }, o)
        if mapped.success ~= true then return mapped end
        mapped.kind = "mapping"
        mapped.summary = summary
        return mapped
    elseif kind == "condition" then
        local predicate = unfence(trim(draft.predicate))
        local predicate_err = validate_condition_predicate(predicate, upstream, a.upstream_sample)
        if predicate_err then return { success = false, error = predicate_err .. "." } end
        return {
            success = true,
            kind = "condition",
            predicate = predicate,
            summary = summary ~= "" and summary or "Add a visible Condition step on this path.",
        }
    elseif kind == "failure_route" then
        local available = a.source_failure_available == true
        return {
            success = true,
            kind = "failure_route",
            available = available,
            source_port = "failed",
            summary = available
                and (summary ~= "" and summary or "Use this step’s Failed route.")
                or "This step does not expose a Failed route.",
        }
    elseif kind == "insert_node" then
        local block_id = trim(draft.block_id)
        local declared = kinds_by_id[block_id]
        if type(declared) ~= "table" then
            return { success = false, error = "The assistant suggested a step that is not available in this Flow." }
        end
        return {
            success = true,
            kind = "insert_node",
            block_id = block_id,
            block_title = tostring((declared :: Map).title or block_id),
            summary = summary ~= "" and summary or "Add this step between the connected steps.",
        }
    end
    return { success = false, error = "The assistant returned an unsupported connection action." }
end

function M.assist_edge(args: any, opts: any?): Map
    local a = type(args) == "table" and (args :: Map) or {}
    local upstream = decode_schema(a.upstream_schema)
    local downstream = decode_schema(a.downstream_schema)
    local upstream_sample = a.upstream_sample
    local downstream_sample = a.downstream_sample
    local has_upstream = upstream_sample ~= nil or type(upstream) == "table"
    local has_downstream = downstream_sample ~= nil or type(downstream) == "table"
    if not has_upstream and not has_downstream then
        return { success = false, error = EMPTY_INPUT_GUIDANCE }
    end

    local o = type(opts) == "table" and (opts :: Map) or {}
    local generate = type(o.generate) == "function" and o.generate or function(ctx: any): (any?, any?)
        return default_generate(ctx, o)
    end
    local generated, err = (generate :: any)({
        edge = a.edge,
        upstream_schema = upstream,
        downstream_schema = downstream,
        upstream_sample = upstream_sample,
        downstream_sample = downstream_sample,
        intent = trim(a.intent),
    })
    if err then
        if type(err) == "table" and (err :: Map).error == ASSIST_UNAVAILABLE then return err :: Map end
        return { success = false, error = "Could not generate a transform: " .. tostring(err) .. "." }
    end
    local transform = type(generated) == "table" and (generated :: Map).transform or generated
    transform = unfence(trim(transform))
    local verr = M.validate_transform(transform, upstream, downstream, upstream_sample)
    if verr then return { success = false, error = verr .. "." } end
    return { success = true, transform = transform }
end

-- Binding assist is the same mapping family as canvas-edge assist. Its explicit
-- names prevent a trigger payload from being confused with the target workflow's
-- Start input at the cross-module boundary.
function M.assist_binding(args: any, opts: any?): Map
    local a = type(args) == "table" and (args :: Map) or {}
    return M.assist_edge({
        edge = { surface = "binding", target = "Start" },
        upstream_schema = a.source_context_schema,
        downstream_schema = a.target_start_schema,
        upstream_sample = a.source_context_sample,
        downstream_sample = a.target_start_sample,
        intent = a.intent,
    }, opts)
end

return {
    assist_edge_intent = M.assist_edge_intent,
    assist_edge = M.assist_edge,
    assist_binding = M.assist_binding,
}
end
