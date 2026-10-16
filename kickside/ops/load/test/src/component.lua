local M = { ACCESS = { READ = 1 } }
function M.open(id: string, access: integer): (any, string?)
    if id ~= "load-reference" or access ~= M.ACCESS.READ then
        return nil, "unexpected component access"
    end
    return {id = id}, nil
end
return M
