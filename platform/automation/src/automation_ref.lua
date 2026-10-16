-- Canonical exact identity of one immutable Automation binding revision.

local M = {}

type Map = { [string]: any }
type AutomationRef = { kind: string, id: string, revision: number }

local ALLOWED: { [string]: boolean } = { kind = true, id = true, revision = true }

function M.validate(value: any): (AutomationRef?, string?)
    if type(value) ~= "table" then return nil, "automation_ref must be an object" end
    local ref = value :: Map
    for key, _ in pairs(ref) do
        if type(key) ~= "string" or not ALLOWED[key] then
            return nil, "automation_ref must contain only kind, id, and revision"
        end
    end
    if ref.kind ~= "automation" then return nil, "automation_ref.kind must be automation" end
    if type(ref.id) ~= "string" or ref.id == "" then return nil, "automation_ref.id is required" end
    local trimmed = ref.id:gsub("^%s+", ""):gsub("%s+$", "")
    if trimmed == "" then return nil, "automation_ref.id is required" end
    if trimmed ~= ref.id then return nil, "automation_ref.id must not have surrounding whitespace" end
    if type(ref.revision) ~= "number" or ref.revision < 1 or ref.revision ~= math.floor(ref.revision) then
        return nil, "automation_ref.revision must be a positive integer"
    end
    return { kind = "automation", id = ref.id, revision = ref.revision }, nil
end

return M
