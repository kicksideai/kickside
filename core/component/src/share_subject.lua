local contract = require("contract")
local access_policy = require("access_policy")

local M = {}

local function directory_failure(message: string, cause: error?): error
    if cause then return errors.wrap(cause, message) end
    return errors.new({ message = message, kind = errors.UNAVAILABLE })
end

function M.find(subject_id: string, subject_type: string): (string?, error?)
    if subject_type ~= "user" or not subject_id:find("@", 1, true) then return subject_id, nil end
    local def, get_err = contract.get("kickside.contract:directory")
    if get_err or not def then return nil, directory_failure("principal directory is unavailable", get_err) end
    local directory, open_err = def:open()
    if open_err or not directory then return nil, directory_failure("principal directory does not open", open_err) end
    local result, resolve_err = directory:resolve({ refs = { { type = "user", id = subject_id } } })
    if resolve_err then return nil, directory_failure("principal directory resolution fails", resolve_err) end
    local principal = type(result) == "table" and type(result.principals) == "table" and result.principals[1] or nil
    if type(principal) ~= "table" or principal.type ~= "user" or type(principal.id) ~= "string" or principal.id == "" then
        return nil, directory_failure("principal directory returns no user identity", nil)
    end
    local exists, exists_err = directory:exists({ type = "user", id = principal.id })
    if exists_err then return nil, directory_failure("principal directory existence check fails", exists_err) end
    if type(exists) ~= "table" or type(exists.exists) ~= "boolean" then
        return nil, directory_failure("principal directory returns no existence result", nil)
    end
    if not exists.exists then return nil, nil end
    return principal.id, nil
end

function M.resolve(subject_id: string, subject_type: string): (string?, error?)
    local id, err = M.find(subject_id, subject_type)
    if err then return nil, err end
    if not id then return nil, errors.new({ message = "share subject does not exist", kind = errors.INVALID }) end
    return id, nil
end

function M.normalize(subject)
    if type(subject) ~= "table" then
        return nil, nil, errors.new({message = "subject must be a table with subject_id", kind = errors.INVALID, retryable = false,
            details = {code = "component_share_subject_invalid", field = "subject"}})
    end
    local subject_id = subject.subject_id
    if type(subject_id) ~= "string" or subject_id == "" then
        return nil, nil, errors.new({message = "subject must contain a non-empty subject_id", kind = errors.INVALID, retryable = false,
            details = {code = "component_share_subject_invalid", field = "subject.subject_id"}})
    end
    local subject_type, type_err = access_policy.normalize_subject_type(subject.subject_type)
    if type_err then
        return nil, nil, type_err
    end
    local canonical_id, resolve_err = M.resolve(subject_id, subject_type)
    if resolve_err or not canonical_id then return nil, nil, resolve_err end
    return canonical_id, subject_type, nil
end

return M
