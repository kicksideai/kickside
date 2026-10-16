-- Test-only callable wrapper over the POST /threads/{id}/projections request
-- logic. The endpoint reads http.request; this exposes its request function to
-- a scoped test runner under an actor, so identity capture and the thread
-- gate resolve that caller. Returns { status, body }.

local request = require("register_projection_request")

local M = {}

function M.register(args: any): (any, any?)
    args = type(args) == "table" and args or {}
    local status, body = request.register(tostring(args.thread_id), args.body)
    return { status = status, body = body }, nil
end

return M
