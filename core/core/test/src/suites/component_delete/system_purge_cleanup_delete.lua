local deletion_worker = require("deletion_worker")
local component = require("component")

local function delete(request: any): any
    local ok, err = component.system_delete(request.component_id)
    if ok then return {success = true} end
    if not err or not err:details().cleanup_pending then return {success = false, error = err} end
    local finished, finish_err = deletion_worker.run(request.component_id)
    return {success = finished ~= nil and finished.deleted == true, error = finish_err}
end

return { delete = delete }
