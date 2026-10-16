local component = require("component")

local function delete(request: any): any
    local ok, err = component.system_delete(request.component_id)
    return { success = ok, error = err }
end

return { delete = delete }
