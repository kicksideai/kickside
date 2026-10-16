local json = require("json")
local M = {}
local context, concurrent, revision
function M.reset(value, changes)
    context, concurrent, revision = value, changes, 7
end
function M.context() return context end
local service = {}
function service:get_access_context(_args)
    local encoded, encode_err = json.encode(context)
    if encode_err then return nil, encode_err end
    local snapshot, decode_err = json.decode(encoded)
    if decode_err then return nil, decode_err end
    local version = revision
    for key, value in pairs(concurrent or {}) do context[key] = value end
    revision = revision + 1
    return { success = true, context = snapshot, context_revision = version }, nil
end
function service:update(args)
    if args.expected_revision ~= nil and args.expected_revision ~= revision then
        return { success = false, error = "context subject version mismatch", kind = errors.CONFLICT,
            details = { reason = "version_mismatch", version = revision, expected = args.expected_revision } }, nil
    end
    for _, command in ipairs(args.commands) do
        for key, value in pairs(command.payload.patch or {}) do context[key] = value end
    end
    revision = revision + 1
    return { success = true, context_revision = revision }, nil
end
function M.get(_id)
    local def = {}
    function def:with_actor(_actor) return self end
    function def:with_scope(_scope) return self end
    function def:open() return service, nil end
    return def, nil
end
return M
