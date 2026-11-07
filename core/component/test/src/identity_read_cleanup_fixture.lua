local json = require("json")
local M: any = {}
function M.reset(route: string, source: error?, primary: error?)
    M.route, M.source, M.primary, M.releases, M.queries, M.checks = route, source, primary, 0, 0, 0
    M.context = '{"_execution_identity":{"principal":{"kind":"user","id":"user-1"}}}'
    M.dialect, M.statement = "sqlite", nil
end
-- The receipt columns the engine projects out of the stored private_context: the
-- _execution_identity key as JSON text when the context is an object or array,
-- the whole value otherwise.
local function projected(context: any): any
    local decoded: any = context
    if type(context) == "string" then decoded = json.decode(context) end
    if type(decoded) ~= "table" then return {context_readable = false, unreadable_context = context} end
    local identity = decoded._execution_identity
    return {context_readable = true, execution_identity = identity ~= nil and json.encode(identity) or nil}
end
function M.get(...)
    return {release = function(): (any, error?)
        M.releases = M.releases + 1; return true, M.source
    end, type = function(): (string, error?)
        return M.dialect, nil
    end, query = function(_, statement: string)
        M.queries = M.queries + 1
        M.statement = statement
        if M.primary then return nil, M.primary end
        local row = projected(M.context)
        row.identity_generation, row.identity_hash = 2, "identity-hash"
        row.declaration_hash, row.declaration_command_generation = "declaration-hash", 3
        return {row}, nil
    end}, nil
end
function M.check(...)
    M.checks = M.checks + 1
    if M.primary then return false, M.primary end
    return true, nil
end
return M
