local M: any = {}
function M.reset(stage, source)
    M.stage, M.source = stage, source
    M.missing, M.proof, M.deletes, M.releases = false, nil, {}, 0
    M.rows, M.results = {{component_id = "owner"}}, {}
end
function M.result(stage, value): (any, error?)
    if M.stage == stage then
        if M.missing then return M.proof, nil end
        if M.source then return nil, M.source end
    end
    return value, nil
end
function M.database(): any
    return {
        query = function(self, query, args)
            M.query, M.args = query, args
            return M.result("scan", M.rows)
        end,
        release = function() M.releases = M.releases + 1 end,
    }
end
function M.get(): (any, error?) return M.result("database", M.database()) end
function M.delete(id, policy): (any, error?)
    M.deletes[#M.deletes + 1] = {id = id, policy = policy}
    local result = M.results[id]
    if result then return result.ok, result.err, result.busy end
    return M.result("delete", true)
end
return M
