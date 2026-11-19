-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M: any = {PROJECTION_ON = {THREAD = "thread"}}

function M.reset(component: table, unrelated: number): ()
    M.component = component
    M.enumerations, M.component_reads = 0, 0
    M.kinds = {}
    for index = 1, unrelated do
        local id = "test:unrelated-" .. tostring(index)
        M.kinds[index] = {impl_id = id, component_impl_id = id, projections = {{worker_ref = "proc://app:worker"}}}
    end
end

function M.declared_kinds(): {table}
    M.enumerations = M.enumerations + 1
    return M.kinds
end

function M.list_system(request: table): ({table}, error?)
    M.component_reads = M.component_reads + 1
    assert(request.component_ids[1] == M.component.component_id)
    return {M.component}, nil
end

return M
