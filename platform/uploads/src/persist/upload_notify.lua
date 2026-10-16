local contract = require("contract")
local upload_query_repo = require("upload_query_repo")
local types = require("types")

-- Owner upload notification. The uploads projection names one committed upload
-- transition of its component; the recipient is the stored upload owner, never a
-- caller argument. Delivery runs under the realtime notify authority declared on
-- this function, so the projection keeps its owner identity and carries no
-- security frame of its own.
local M = {}

function M.run(input: any): (any?, error?)
    input = type(input) == "table" and input or {}
    local component_id, upload_id = input.component_id, input.upload_id
    if type(component_id) ~= "string" or component_id == "" or type(upload_id) ~= "string" or upload_id == "" then
        return nil, errors.new({ message = "component_id and upload_id are required", kind = errors.INVALID })
    end
    local upload, read_err = upload_query_repo.get(upload_id)
    if read_err or type(upload) ~= "table" then
        return nil, errors.new({ message = "upload notification target unavailable: " .. tostring(read_err),
            kind = errors.NOT_FOUND })
    end
    if types.component_id_for_owner(upload.actor_id) ~= component_id then
        return nil, errors.new({ message = "upload notification owner does not match component",
            kind = errors.PERMISSION_DENIED })
    end
    local definition, definition_err = contract.get("kickside.contract:realtime")
    if definition_err or not definition then return nil, definition_err end
    local realtime, open_err = definition:open()
    if open_err or not realtime then return nil, open_err end
    local result, notify_err = realtime:notify({
        user_id = upload.actor_id,
        topic = "upload:" .. upload_id,
        data = input.data,
    })
    if notify_err then return nil, notify_err end
    if type(result) ~= "table" or result.success ~= true then
        return nil, errors.new({ message = "upload notification refused: "
            .. tostring(type(result) == "table" and result.error or "no result"), kind = errors.PERMISSION_DENIED })
    end
    return { success = true }, nil
end

return M
