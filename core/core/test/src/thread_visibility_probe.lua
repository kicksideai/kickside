local resource = require("resource")
local state = require("state")
local M = {}
local METHODS: { [string]: (any) -> (any?, error?) } = {
    create = resource.create,
    upsert = resource.upsert,
    ensure_thread = resource.ensure_thread,
}
function M.run(args: table): (any?, error?)
    local method = METHODS[args.method]
    if not method then
        return nil, errors.new({ message = "unknown probe method: " .. tostring(args.method), kind = errors.INVALID })
    end
    state.observations = {}
    local result, err = method(args.args)
    if err then return nil, err end
    return { thread_id = result.thread_id, observations = state.observations }, nil
end
return M
