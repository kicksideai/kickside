local M = {}
function M.new(): any
    local p: any = {}
    function p:add_system(text: string): () self.system = text end
    function p:add_user(text: string): () self.user = text end
    return p
end
function M.generate(p: any): any
    if not tostring(p.user):find("multiply crates by two", 1, true) then
        error("requested mapping hint is absent from the generation prompt")
    end
    return { result = "{ reserved: payload.crates * 2 }" }
end
function M.search_snippet(): any
    return { id = "cached", strategy = "expression", artifact = "{ reserved: payload.crates }" }
end
return M
