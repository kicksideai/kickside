local M = {}

function M.configure(input)
    M.stage = input.stage
    M.source = errors.new({message = "directory dependency failure", kind = input.kind,
        retryable = input.retryable, details = {code = "directory_dependency", nested = {stage = input.stage}}})
    M.calls = {}
end

function M.get(id)
    table.insert(M.calls, "get")
    if M.stage == "get" then return nil, M.source end
    if M.stage == "missing_definition" then return nil, nil end
    return {open = function()
        table.insert(M.calls, "open")
        if M.stage == "open" then return nil, M.source end
        if M.stage == "missing_instance" then return nil, nil end
        return {
            resolve = function(self, input)
                table.insert(M.calls, "resolve")
                if M.stage == "resolve" then return nil, M.source end
                if M.stage == "missing_principal" then return {principals = {}}, nil end
                return {principals = {{type = "user", id = "canonical-user"}}}, nil
            end,
            exists = function(self, input)
                table.insert(M.calls, "exists")
                if M.stage == "exists" then return nil, M.source end
                if M.stage == "missing_existence" then return {}, nil end
                return {exists = M.stage ~= "absent"}, nil
            end,
        }, nil
    end}, nil
end

return M
