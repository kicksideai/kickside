local ctx = require("ctx")
local component = require("component")
local upload_lib = require("upload_lib")
local upload_query_repo = require("upload_query_repo")
local upload_read_model = require("upload_read_model")

-- kickside.contract:deletable.delete for the per-user uploads component. Tears down
-- every upload the component actor holds -- rows, artifacts, chunks, refcounted
-- blobs, and the stored bytes -- so a reaped uploads component (e.g. on user delete)
-- leaves no orphaned files. delete_upload owns each upload's full teardown including
-- storage; this resolves the component actor and drives it over that actor's uploads.
local function handle(request_dto)
    local component_id, ctx_err = ctx.get("component_id")
    if type(component_id) ~= "string" or component_id == "" then
        return { success = false, error = "no component context: " .. tostring(ctx_err) }
    end

    local actor_id, actor_err = component.component_owner(component_id)
    if actor_err then
        return { success = false, error = "resolve actor: " .. tostring(actor_err) }
    end
    -- No recorded actor means nothing actor-keyed to tear down.
    if type(actor_id) ~= "string" or actor_id == "" then
        return { success = true, deleted = 0 }
    end

    -- Owner deletion is idempotent when another deletion removes a listed upload.
    local page = 200
    local deleted = 0
    while true do
        local rows, list_err = upload_query_repo.list_by_actor(actor_id, page, 0)
        if list_err then
            return { success = false, error = "list uploads: " .. tostring(list_err), deleted = deleted }
        end
        if not rows or #rows == 0 then break end
        for _, u in ipairs(rows) do
            local _, del_err = upload_lib.delete_upload(tostring((u :: any).uuid))
            if del_err and not errors.is(del_err, errors.NOT_FOUND) then
                return { success = false, error = del_err, deleted = deleted }
            end
            deleted = deleted + 1
        end
    end

    local read_rows, read_err = upload_read_model.delete_for_actor(actor_id)
    if read_err or read_rows == nil then
        return { success = false, error = read_err or errors.new({
            message = "upload read-model owner cleanup returned no result",
            kind = errors.INTERNAL, retryable = true }), deleted = deleted }
    end
    return { success = true, deleted = deleted, read_rows_deleted = read_rows }
end

return { handle = handle }
