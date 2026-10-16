local M = {}
function M.get(): any
    local service = {}
    function service:with_actor() return self end
    function service:with_scope() return self end
    function service:open() return self, nil end
    function service:upsert()
        return nil, errors.new({ kind = errors.CONFLICT, message = "peer owns provisioning", retryable = true })
    end
    return service, nil
end
return M
