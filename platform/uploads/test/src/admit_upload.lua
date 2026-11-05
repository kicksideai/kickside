local upload_lib = require("upload_lib")
local attachment_ingest = require("attachment_ingest")

local function run(args)
    if args.action == "attachment" then
        local original = attachment_ingest.deps
        attachment_ingest.deps = {
            registry = original.registry, funcs = original.funcs, uploads = original.uploads,
            http = { get = function() return { status_code = 200, body = args.bytes }, nil end },
        }
        local upload, err = attachment_ingest.ingest(args.attachment)
        attachment_ingest.deps = original
        return upload, err
    end
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
