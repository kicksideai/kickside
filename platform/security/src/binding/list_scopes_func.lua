local security = require("security")
local funcs = require("funcs")
local scope_catalog = require("scope_catalog")

-- kickside.contract:security_scopes binding impl. Projects the merged scope
-- catalog (built-in roles + DB-backed custom scopes) to the normalized shape
-- consumers assign from. Any authenticated actor may list the NON-internal
-- catalog: shareable group/role names are not sensitive and the directory share
-- picker reads them through this port, so Security reads that catalog under its
-- own authority. include_internal exposes system scopes and stays admin-gated to
-- the scopes admin resource under the caller's authority; an actorless call
-- lists nothing.
local LIST_GATE = "kickside.security.api:list_scopes.endpoint"
local READ_ASSIGNABLE = "kickside.security.binding:read_assignable_scopes"

local function list(args: any): (any?, error?)
    if not security.actor() then
        return { scopes = {} }
    end
    args = type(args) == "table" and args or {}
    local catalog, catalog_err
    if args.include_internal == true then
        if not security.can("access", LIST_GATE) then
            return { scopes = {} }
        end
        catalog, catalog_err = scope_catalog.scopes({ include_internal = true })
    else
        catalog, catalog_err = funcs.call(READ_ASSIGNABLE)
    end
    if catalog_err then return nil, catalog_err end
    local scopes: { any } = {}
    for _, s in ipairs(catalog :: { any }) do
        local scope = s :: any
        scopes[#scopes + 1] = {
            id = scope.id,
            label = scope.label,
            description = scope.description,
            source = scope.source,
            internal = scope.internal == true,
            enabled = scope.enabled ~= false,
        }
    end
    return { scopes = scopes }
end

return { list = list }
