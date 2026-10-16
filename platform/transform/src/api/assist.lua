-- POST /transform/assist — negotiate an AI-generated transform for a source->sink
-- shape pair. Body: { source_schema, sink_schema, input_shape, samples, hint?, strategy? }
-- with input_shape the sink's declared record or content input and
-- strategy in { auto, expr(default), llm, code }. Runs the transform generator (via
-- funcs.call, keeping its dataflow/llm closure isolated) and returns
-- { ok, validated, transform:{kind,...}, strategy, rationale, errors } — a validated
-- proposal carrying the ready transform config, or validated:false with the gate
-- errors. The reusable kickside-transform-assist web component calls this; the host
-- confirms the result.

local http = require("http")
local json = require("json")
local security = require("security")
local funcs = require("funcs")

local GENERATE = "kickside.transform:generate_transform"

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ ok = false, validated = false, errors = { "authentication required" } })
        return
    end

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ ok = false, validated = false, errors = { "invalid request body" } })
        return
    end
    local body, berr = json.decode(raw)
    if berr or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ ok = false, validated = false, errors = { "invalid json" } })
        return
    end

    if body.source_schema == nil or body.sink_schema == nil then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ ok = false, validated = false, errors = { "source_schema and sink_schema are required" } })
        return
    end

    local proposal, err = funcs.call(GENERATE, {
        source_schema = body.source_schema,
        sink_schema = body.sink_schema,
        input_shape = body.input_shape,
        samples = type(body.samples) == "table" and body.samples or {},
        hint = body.hint,
        strategy = body.strategy,
    })
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ ok = false, validated = false, errors = { tostring(err) } })
        return
    end

    local p = type(proposal) == "table" and proposal or {}
    res:set_status(http.STATUS.OK)
    res:write_json({
        ok = p.ok == true,
        validated = p.validated == true,
        transform = p.transform,
        strategy = p.strategy,
        rationale = p.rationale,
        errors = p.errors,
    })
end

return { handler = handler }
