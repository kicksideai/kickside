local process = require("process")
local io = require("io")
local json = require("json")

local function main(): (boolean?, error?)
    local consistent_error: error? = nil
    local scopes: { { label: string, scope: number } } = {
        { label = "LOCAL", scope = process.registry.LOCAL },
        { label = "EVENTUAL", scope = process.registry.EVENTUAL },
        { label = "CONSISTENT", scope = process.registry.CONSISTENT },
        { label = "STRONG", scope = process.registry.STRONG },
    }
    for _, entry in ipairs(scopes) do
        local label = entry.label
        local scope = entry.scope
        local name = "cluster_test:scope_" .. label
        local registered, register_err = process.registry.register(name, process.pid(), scope)
        local owner: any = nil
        local lookup_err: any = nil
        local removed: any = nil
        local remove_err: any = nil
        if registered then
            owner, lookup_err = process.registry.lookup(name)
            removed, remove_err = process.registry.unregister(name, scope)
        end
        io.print("SCOPE_RESULT " .. json.encode({
            scope = label,
            registered = registered == true,
            error = tostring(register_err),
            resolves_to_self = owner == process.pid(),
            lookup_error = tostring(lookup_err),
            removed = removed == true,
            remove_error = tostring(remove_err),
        }))
        if label == "CONSISTENT" then consistent_error = register_err end
    end
    if consistent_error then return nil, consistent_error end
    return true, nil
end

return { main = main }
