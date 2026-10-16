local upload_lib = require("upload_lib")

local function run(args)
    if args.action == "upload" then
        return upload_lib.upload_file(args.actor_id, args.bytes, args.filename, args.size,
            args.mime_type, args.storage_id, args.metadata)
    end
    if args.action == "delete" then
        return upload_lib.delete_upload(args.upload_id)
    end
    if args.action == "complete" then
        return upload_lib.complete_presigned_url(args.actor_id, args.upload_id, args.etag, args.metadata)
    end
    return nil, errors.new({ message = "unknown upload test action", kind = errors.INVALID })
end

return { run = run }
