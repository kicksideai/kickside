local M = {}

function M.configure(input)
    M.input = input
    M.source = errors.new({message = "cleanup dependency failure", kind = input.kind,
        retryable = input.retryable, details = {code = "cleanup_dependency", nested = {stage = input.stage}}})
    M.calls = {scan = 0, delete = 0, discovery = 0, dispatch = 0}
end

function M.list_system(request)
    M.calls.scan = M.calls.scan + 1
    if request.meta.owner ~= "owner" then return {}, nil end
    if M.input.stage == "scan" then return nil, M.source end
    if M.input.stage == "continuation" then
        if M.calls.delete == 50 then return nil, M.source end
        local rows = {}
        for i = 1, 50 do rows[i] = {component_id = "child-" .. i} end
        return rows, nil
    end
    if M.input.stage == "delete" then return {{component_id = "child"}}, nil end
    return {}, nil
end

function M.system_delete(id, mode)
    M.calls.delete = M.calls.delete + 1
    if M.input.stage == "delete" then return nil, M.source end
    return true, nil
end

function M.find(query)
    M.calls.discovery = M.calls.discovery + 1
    if M.input.stage == "discovery" then return nil, M.source end
    return {{id = "fixture:cleanup"}}, nil
end

function M.call(target, payload)
    M.calls.dispatch = M.calls.dispatch + 1
    if M.input.stage == "dispatch" then return nil, M.source end
    if M.input.stage == "envelope" then
        return {success = false, error = M.source:message(), kind = M.source:kind(),
            retryable = M.source:retryable(), details = M.source:details()}, nil
    end
    return {success = true}, nil
end

return M
