-- POST /transform/snippet — publish a confirmed transform as a reusable snippet,
-- keyed by the source/sink shape fingerprints, so a later assist for the same pair
-- can reuse it. Body: { artifact, source_schema, sink_schema, strategy, rationale? }.
-- Invoked via funcs.call under the caller's actor; the generator owns the fingerprint
-- + registry write.

local http = require("http")
local json = require("json")
local security = require("security")
local funcs = require("funcs")

local PUBLISH = "kickside.transform:publish_transform_snippet"

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, berr = json.decode(raw)
    if berr or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid json" })
        return
    end

    if body.artifact == nil or body.source_schema == nil or body.sink_schema == nil or body.strategy == nil then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "artifact, source_schema, sink_schema and strategy are required" })
        return
    end

    local snippet, err = funcs.call(PUBLISH, {
        artifact = body.artifact,
        source_schema = body.source_schema,
        sink_schema = body.sink_schema,
        strategy = body.strategy,
        rationale = body.rationale,
    })
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, snippet = snippet })
end

return { handler = handler }
