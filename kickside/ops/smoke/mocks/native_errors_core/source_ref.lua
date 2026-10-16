local http = require("http")
local source_ref = require("source_ref")

local function rejection(args: any): { kind: string, retryable: boolean?, code: string? }
    local ref, err = source_ref.build(args)
    assert(ref == nil, "source_ref accepts an invalid value")
    assert(err ~= nil, "source_ref omits a validation error")
    return {
        kind = err:kind(),
        retryable = err:retryable(),
        code = err:details().code,
    }
end

local function source_ref_errors()
    local response = assert(http.response())
    response:set_content_type(http.CONTENT.JSON)
    response:write_json({
        args = rejection("not an object"),
        origin_type = rejection({ origin_id = "item-1" }),
        origin_id = rejection({ origin_type = "sync" }),
    })
end

return {source_ref_errors = source_ref_errors}
