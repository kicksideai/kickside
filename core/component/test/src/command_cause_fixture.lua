local M: any = {}
function M.reset(operation, stage, source)
    M.operation, M.stage, M.source = operation, stage, source
    M.opens, M.releases, M.rollbacks, M.commits, M.effects, M.verifications = 0, 0, 0, 0, 0, 0
    M.rollback_source, M.work_source = nil, nil
end
function M.result(stage, value)
    if stage == M.stage then return nil, M.source end
    return value, nil
end
function M.get()
    M.opens = M.opens + 1
    local db: any = {}
    function db:begin() return M.result("begin", M.transaction()) end
    function db:release()
        M.releases = M.releases + 1
        return M.result("release" .. tostring(M.releases), true)
    end
    function db:type() return M.result("dialect", "sqlite") end
    return M.result("open" .. tostring(M.opens), db)
end
function M.transaction(): any
    return {rollback = function() M.rollbacks = M.rollbacks + 1; return true, M.rollback_source end,
        commit = function() M.commits = M.commits + 1; return M.result("commit", true) end}
end
function M.contract_get()
    local definition: any = {}
    function definition:open()
        local instance: any = {}
        function instance:verify_identity_command(request)
            M.verifications = M.verifications + 1
            return M.result("owner_verify", {confirmed = true})
        end
        return M.result("owner_open", instance)
    end
    return M.result("owner_contract", definition)
end
function M.declaration_owner(...) return M.result("owner_read", "automation") end
function M.prepare(stage, input, owner)
    if owner then local confirmed, err = owner.verify(input); if err then return nil, err end end
    return M.result(stage, {})
end
function M.work()
    M.effects = M.effects + 1
    if M.work_source then return nil, M.work_source end
    local value = {component_id = "component", impl_id = "fixture:implementation", operator_id = "operator", meta = {}}
    return M.result("work", value)
end
function M.created(...) return select(2, M.result("lifecycle", true)) end
function M.committed(...) return select(2, M.result("committed", true)) end
return M
