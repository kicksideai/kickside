local M = {}

type EnsureArgs = {
    session_id: string, user_id: string, kind: string,
    config: table, primary_context_data: table, meta: { [string]: unknown },
}
local initial_ensure: EnsureArgs? = nil
M.last_ensure = initial_ensure
M.deleted = {}
M.delete_error = nil
M.delete_result = nil

function M.ensure(args: EnsureArgs)
    M.last_ensure = args
    return { created = true }, nil
end

function M.delete(args)
    if M.delete_error then return nil, M.delete_error end
    if M.delete_result then return M.delete_result, nil end
    M.deleted[#M.deleted + 1] = args.session_id
    return { deleted = true }, nil
end

return M
