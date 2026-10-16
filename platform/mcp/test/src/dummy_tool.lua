-- A harness tool (meta.type=tool) the suite grants to a credential so the surface
-- has something to expose + call. Echoes its args back; runs under the synthesized
-- MCP principal, proving the dispatcher invokes a surfaced tool.
local ctx = require("ctx")

local function handler(args)
    if type(args) == "table" and args.fail == true then
        return nil, errors.new({
            message = "requested fixture failure " .. tostring(args.kind or errors.INVALID),
            kind = args.kind or errors.INVALID,
            retryable = args.retryable,
            details = { code = "PROBE_MCP", nested = { marker = "kept" } },
        })
    end
    if type(args) == "table" and args.reject == true then
        return { success = false, error = "fixture access denied", code = "fixture_denied" }
    end
    if type(args) == "table" and args.unserializable == true then
        local result = { ok = true }
        result.loop = result
        return result
    end
    return { ok = true, echoed = args or {}, fixture_context = ctx.get("fixture_context"), configured_tool_ids = ctx.get("tool_ids"), connection_id = ctx.get("connection_id"), mcp_session_id = ctx.get("mcp_session_id") }
end

return { handler = handler }
