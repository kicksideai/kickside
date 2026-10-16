local security = require("security")
local records = require("upload_query_repo")
local uploads = require("upload_lib")

local function run(args: any)
    local upload, lookup_err = records.get(args.upload_id)
    if lookup_err then return nil, lookup_err end
    local actor = security.actor()
    if not upload or not actor or upload.actor_id ~= actor:id() then
        return nil, errors.new({ message = "upload deletion actor must be its owner", kind = errors.PERMISSION_DENIED })
    end
    return uploads.delete_upload(args.upload_id)
end

return { run = run }
