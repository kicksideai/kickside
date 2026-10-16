local repo = require("mcp_repo")

local M = {}

function M.get(args: any): (any?, error?)
    local credential_id = type(args) == "table" and (args :: any).credential_id or nil
    if type(credential_id) ~= "string" or credential_id == "" then
        return nil, (errors.new({ message = "credential_id is required", kind = errors.INVALID,
            retryable = false, details = { error_kind = "declaration" } }) :: error)
    end
    local record, err = repo.restriction_get(credential_id)
    if record then return record, nil end
    return nil, err
end

return M
