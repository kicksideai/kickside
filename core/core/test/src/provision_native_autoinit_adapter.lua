local fixture = require("fixture")
return {SCOPE = {USER = "user", SYSTEM = "system"}, SYSTEM_SCOPE_KEY = "system", declarations = fixture.declarations, declared_kinds = fixture.declared_kinds, component_id = function(scope: string, class: string): string return scope .. ":" .. class end, thread_for_impl = function(impl: string): (table?, error?)
    if fixture.stage == "thread_declaration" then return nil, fixture.source end
    return {}, nil
end}
