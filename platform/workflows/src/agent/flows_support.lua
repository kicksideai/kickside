-- Shared identifier validation helpers for Workflow agent tools.

type Map = { [string]: any }

local M = {}

local function require_id(args: Map): (string?, error?)
    local id = args.id
    if type(id) ~= "string" or id == "" then
        return nil, errors.new({ message = "id is required", kind = errors.INVALID })
    end
    return id, nil
end

M.require_id = require_id

return M
