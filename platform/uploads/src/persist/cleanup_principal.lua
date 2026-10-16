-- The principal lifecycle reaper retries this contract until every upload and
-- its provider bytes have passed through the upload owner's delete path.
local upload_lib = require("upload_lib")
local upload_query_repo = require("upload_query_repo")
local upload_read_model = require("upload_read_model")

local M = {}
local BATCH = 100

function M.run(request: any): any
    local actor_id = type(request) == "table" and (request.principal_id or request.user_id) or nil
    if type(actor_id) ~= "string" or actor_id == "" then
        return { success = false, error = errors.new({ message = "principal_id is required", kind = errors.INVALID }) }
    end
    local removed = 0
    while true do
        local uploads, list_err = upload_query_repo.list_by_actor(actor_id, BATCH, 0)
        if list_err or type(uploads) ~= "table" then
            return { success = false, error = list_err or errors.new({
                message = "upload owner scan returned no rows result", kind = errors.INTERNAL }) }
        end
        if #uploads == 0 then
            local read_rows, read_err = upload_read_model.delete_for_actor(actor_id)
            if read_err or read_rows == nil then
                return { success = false, error = read_err or errors.new({
                    message = "upload read-model owner deletion returned no result", kind = errors.INTERNAL }) }
            end
            return { success = true, deleted = removed, read_rows_deleted = read_rows }
        end
        for _, upload in ipairs(uploads) do
            local result, delete_err = upload_lib.delete_upload(upload.uuid)
            if delete_err or not result then
                return { success = false, error = delete_err or errors.new({
                    message = "upload owner deletion returned no result", kind = errors.INTERNAL }) }
            end
            removed = removed + 1
        end
    end
end

return M
