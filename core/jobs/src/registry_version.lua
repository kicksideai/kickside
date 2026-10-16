local M = {}

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "Jobs registry version response is invalid",
        details = {code = "job_registry_response", field = field}})
end

function M.id(reader: any): (string?, error?)
    local version, err = reader.current_version()
    if err then return nil, errors.wrap(err, "Jobs registry version unavailable") end
    local value: any = version
    if (type(value) ~= "table" and type(value) ~= "userdata") or type(value.id) ~= "function" then
        return nil, response_error("version.id")
    end
    local id = value:id()
    if type(id) == "number" then
        if id ~= id or id == math.huge or id == -math.huge or id < 0 or id % 1 ~= 0 then
            return nil, response_error("version.identity")
        end
    elseif type(id) ~= "string" or id == "" then
        return nil, response_error("version.identity")
    end
    return tostring(id), nil
end

return M
