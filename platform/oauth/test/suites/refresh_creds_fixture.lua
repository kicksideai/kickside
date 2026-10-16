local M = {}
function M.resolve(field: string): string?
    if field == "id" then return "adapter-client" end
    return nil
end
return M
