local M = {}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false }) :: error)
end

local function response_error(field: string): error
    return errors.new({message = "subject version response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "subject_version_response", field = field}})
end

function M.validate_subject(value: any): error?
    if value == nil then return nil end
    if type(value) ~= "string" or #value == 0 or #value > 256 or value:find("[%c]") then
        return invalid("subject must be a non-empty string of at most 256 bytes without control characters")
    end
    return nil
end

function M.validate_expect(value: any): error?
    if value == nil then return nil end
    if type(value) ~= "table" then return invalid("expect must be an object") end
    for key in pairs(value) do
        if key ~= "head" and key ~= "subject" and key ~= "version" then
            return invalid("unknown expect field: " .. tostring(key))
        end
    end
    if value.head == nil and value.subject == nil then return invalid("expect requires head or subject and version") end
    if value.head ~= nil and (type(value.head) ~= "number" or value.head < 0
        or value.head ~= math.floor(value.head) or value.head == math.huge) then
        return invalid("expect.head must be a non-negative integer")
    end
    if value.subject ~= nil or value.version ~= nil then
        if value.subject == nil or value.version == nil then return invalid("expect requires subject and version together") end
        local subject_err = M.validate_subject(value.subject)
        if subject_err then return subject_err end
        if type(value.version) ~= "number" or value.version < 0
            or value.version ~= math.floor(value.version) or value.version == math.huge then
            return invalid("expect.version must be a non-negative integer")
        end
    end
    return nil
end

function M.version(tx: any, thread_id: string, subject: string): (integer?, error?)
    local rows, err = tx:query("SELECT version FROM kickside_thread_subject WHERE thread_id=$1 AND subject=$2",
        { thread_id, subject })
    if err then
        return nil, errors.wrap(err, "subject version read failed")
    end
    if type(rows) ~= "table" then return nil, response_error("rows") end
    if #rows == 0 then return 0, nil end
    local row = rows[1]
    if type(row) ~= "table" or (type(row.version) ~= "number" and type(row.version) ~= "string") then
        return nil, response_error("version")
    end
    local version = math.tointeger(row.version)
    if version == nil or version < 0 then return nil, response_error("version") end
    return version, nil
end

function M.check(tx: any, thread_id: string, head: integer, expect: any): error?
    if expect == nil then return nil end
    if expect.head ~= nil and head ~= expect.head then
        return (errors.new({ message = "thread head mismatch", kind = errors.CONFLICT, retryable = false,
            details = { reason = "head_mismatch", head = head, expected_head = expect.head } }) :: error)
    end
    if expect.subject ~= nil then
        local version, read_err = M.version(tx, thread_id, expect.subject)
        if read_err then return read_err end
        if version ~= expect.version then
            return (errors.new({ message = "subject version mismatch", kind = errors.CONFLICT, retryable = false,
                details = { reason = "version_mismatch", subject = expect.subject, version = version, expected = expect.version } }) :: error)
        end
    end
    return nil
end

return M
