local binding_errors = require("binding_errors")
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
        return { success = false, error = binding_errors.new(errors.INVALID, "no component context: " .. tostring(ctx_err), "component_context_required", false, ctx_err) }
    end

    local actor_id, actor_err = component.component_owner(component_id)
    if actor_err then
        return { success = false, error = binding_errors.from(actor_err, errors.UNAVAILABLE, "component_owner_failed", "resolve actor") }
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
            return { success = false, error = binding_errors.from(list_err, errors.UNAVAILABLE, "upload_list_failed", "list uploads"), deleted = deleted }
        end
        if not rows or #rows == 0 then break end
        for _, u in ipairs(rows) do
            local _, del_err = upload_lib.delete_upload(tostring((u :: any).uuid))
            if del_err then
                if not errors.is(del_err, errors.NOT_FOUND) then
                    return { success = false, error = binding_errors.from(del_err, errors.UNAVAILABLE, "upload_delete_failed"), deleted = deleted }
                end
                -- A delete stage may itself return NOT_FOUND while retaining the
                -- upload. Only an absent upload proves a concurrent teardown.
                local remaining, read_err = upload_query_repo.get(tostring((u :: any).uuid))
                if remaining or not errors.is(read_err, errors.NOT_FOUND) then
                    return { success = false, error = binding_errors.from(del_err, errors.UNAVAILABLE, "upload_delete_failed"), deleted = deleted }
                end
            end
            deleted = deleted + 1
        end
    end

    local read_rows, read_err = upload_read_model.delete_for_actor(actor_id)
    if read_err or read_rows == nil then
        return { success = false, error = read_err and binding_errors.from(read_err, errors.UNAVAILABLE, "read_model_cleanup_failed")
            or binding_errors.new(errors.INTERNAL, "upload read-model owner cleanup returned no result",
                "read_model_cleanup_missing", true), deleted = deleted }
    end
    return { success = true, deleted = deleted, read_rows_deleted = read_rows }
end

return { handle = handle }
