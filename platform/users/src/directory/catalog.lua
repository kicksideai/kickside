local contract = require("contract")
local security = require("security")
local M = {}

function M.label(id: string): string
    local short = (id:match("[^:]+$") or id):gsub("[_%-]", " ")
    if short == "" then return id end
    return short:sub(1, 1):upper() .. short:sub(2)
end

function M.groups(): (any?, any?)
    local def, def_err = contract.get("kickside.contract:security_scopes")
    if def_err then return nil, def_err end
    if not def then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "security scopes catalog unavailable" }) end
    local builder: any = def
    local actor = security.actor()
    if actor then builder = builder:with_actor(actor):with_scope(security.scope()) end
    local inst, open_err = builder:open()
    if open_err then return nil, open_err end
    if not inst then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "security scopes catalog cannot open" }) end
    local result, list_err = inst:list({ include_internal = false })
    if list_err then return nil, list_err end
    if type(result) ~= "table" or type(result.scopes) ~= "table" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "security scopes catalog returns no scopes" })
    end
    local groups, seen = {}, {}
    for _, scope in ipairs(result.scopes) do
        if type(scope.id) == "string" and scope.id ~= "" and not seen[scope.id] then
            seen[scope.id] = true
            groups[#groups + 1] = { id = scope.id,
                label = type(scope.label) == "string" and scope.label ~= "" and scope.label or M.label(scope.id) }
        end
    end
    table.sort(groups, function(a, b) return a.id < b.id end)
    return groups, nil
end

return M
