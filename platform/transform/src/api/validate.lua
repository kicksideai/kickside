-- POST /transform/validate — run a ready transform config over sample items and
-- validate each output against the sink input_schema. Body:
-- { transform:{kind,...}, sink_schema, input_shape, samples } with
-- input_shape the sink's declared record or content input. Requires real samples. Returns
-- { ok, valid, errors, outputs } where valid is true only when every sample
-- produces a schema-valid output and outputs carries the produced items for a UI
-- preview. Shares the generator's single execute+validate loop (the same gate the
-- generator runs); runs the strategy under the caller's own actor and access, so a
-- code-kind transform reaches the sandbox as the caller.

local http = require("http")
local json = require("json")
local security = require("security")

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ ok = false, valid = false, errors = { "authentication required" } })
        return
    end

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ ok = false, valid = false, errors = { "invalid request body" } })
        return
    end
    local body, berr = json.decode(raw)
    if berr or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ ok = false, valid = false, errors = { "invalid json" } })
        return
    end

    if type(body.transform) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ ok = false, valid = false, errors = { "transform config is required" } })
        return
    end
    if body.sink_schema == nil then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ ok = false, valid = false, errors = { "sink_schema is required" } })
        return
    end

    local generator = require("generator")
    local samples = type(body.samples) == "table" and body.samples or {}
    local valid, errors, outputs = generator.validate_transform(body.transform, body.sink_schema, samples,
        { input_shape = body.input_shape })

    res:set_status(http.STATUS.OK)
    res:write_json({ ok = true, valid = valid, errors = errors, outputs = outputs })
end

return { handler = handler }
