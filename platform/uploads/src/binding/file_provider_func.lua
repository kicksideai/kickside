local binding_errors = require("binding_errors")
local upload_query_repo = require("upload_query_repo")
local upload_response = require("upload_response")

local M = {}

-- get_info implements wippy.session:file_provider.get_info -- resolve a file_uuid to its
-- public upload fields (size, mime_type, filename) so the session renders message
-- attachments without the session coupling to this uploads module. Returns nil when the
-- upload is absent, which the session treats as an unresolved attachment.
function M.get_info(args)
    local file_uuid = type(args) == "table" and args.file_uuid or nil
    if type(file_uuid) ~= "string" or file_uuid == "" then
        return nil
    end
    local upload, err = upload_query_repo.get(file_uuid)
    if err and not errors.is(err, errors.NOT_FOUND) then
        return nil, binding_errors.from(err, errors.UNAVAILABLE, "upload_lookup_failed")
    end
    if type(upload) ~= "table" then
        return nil
    end
    local public = upload_response.format_get_upload(upload)
    public.meta.upload_id = public.uuid
    return {
        file_uuid = public.uuid,
        uuid = public.uuid,
        filename = public.meta.filename,
        mime_type = public.mime_type,
        size = public.size,
        created_at = public.created_at,
        updated_at = public.updated_at,
        metadata = public.meta,
        meta = public.meta,
    }
end

return M
