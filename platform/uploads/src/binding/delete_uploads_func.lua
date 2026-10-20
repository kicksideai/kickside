local ctx = require("ctx")
local component = require("component")
local upload_lib = require("upload_lib")
local upload_query_repo = require("upload_query_repo")
local upload_read_model = require("upload_read_model")
local logger = require("logger"):named("kickside.uploads.delete")

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

    -- list_by_actor shrinks as uploads are deleted, so re-list from offset 0 each pass
    -- (mirrors the reaper's idempotent drain). Stop on an empty page or a page that
    -- makes no progress, so a persistent per-upload failure never loops forever.
    local page = 200
    local deleted = 0
    while true do
        local rows, list_err = upload_query_repo.list_by_actor(actor_id, page, 0)
        if list_err then
            return { success = false, error = "list uploads: " .. tostring(list_err), deleted = deleted }
        end
        if not rows or #rows == 0 then break end
        local before = deleted
        for _, u in ipairs(rows) do
            local upload_id = tostring((u :: any).uuid)
            local _, del_err = upload_lib.delete_upload(upload_id)
            if del_err then
                -- Another teardown, such as the retention sweeper, can remove the same
                -- upload first. An upload that is already gone counts as deleted.
                local _, get_err = upload_query_repo.get(upload_id)
                if get_err == "Upload not found" then
                    deleted = deleted + 1
                else
                    logger:warn("upload teardown failed", { upload_id = upload_id, error = del_err })
                end
            else
                deleted = deleted + 1
            end
        end
        if deleted == before then
            return { success = false, error = "no progress tearing down uploads for actor " .. actor_id, deleted = deleted }
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
