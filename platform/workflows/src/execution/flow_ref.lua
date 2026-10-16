-- Canonical exact reference to one immutable published Flow version.

local M = {}

type Map = { [string]: any }
type FlowRef = { kind: string, id: string, version: number }

local ALLOWED: { [string]: boolean } = { kind = true, id = true, version = true }

function M.validate(value: any): (FlowRef?, error?)
    if type(value) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "flow_ref must be an object" }) end
    local ref = value :: Map
    for key, _ in pairs(ref) do
        if type(key) ~= "string" or not ALLOWED[key] then
            return nil, errors.new({ kind = errors.INVALID, message = "flow_ref must contain only kind, id, and version" })
        end
    end
    if ref.kind ~= "flow" then return nil, errors.new({ kind = errors.INVALID, message = "flow_ref.kind must be flow" }) end
    if type(ref.id) ~= "string" or ref.id == "" then return nil, errors.new({ kind = errors.INVALID, message = "flow_ref.id is required" }) end
    local trimmed = ref.id:gsub("^%s+", ""):gsub("%s+$", "")
    if trimmed == "" then return nil, errors.new({ kind = errors.INVALID, message = "flow_ref.id is required" }) end
    if trimmed ~= ref.id then return nil, errors.new({ kind = errors.INVALID, message = "flow_ref.id must not have surrounding whitespace" }) end
    if type(ref.version) ~= "number" or ref.version < 1 or ref.version ~= math.floor(ref.version) then
        return nil, errors.new({ kind = errors.INVALID, message = "flow_ref.version must be a positive integer" })
    end
    return { kind = "flow", id = ref.id, version = ref.version }, nil
end

return M
