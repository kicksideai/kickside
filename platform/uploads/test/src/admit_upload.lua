local upload_lib = require("upload_lib")
local attachment_ingest = require("attachment_ingest")
local resources = require("uploads_resources")
local channel = require("channel")

local function run(args)
    if args.action == "concurrent" then
        local get_storage = resources.get_storage
        local storage = assert(get_storage())
        local arrived, done = channel.new(2), channel.new(2)
        local release = { channel.new(1), channel.new(1) }
        local writes = 0
        resources.get_storage = function()
            writes = writes + 1
            local index = writes
            return {
                writefile = function(_, path, bytes)
                    local ok, err = storage:writefile(path, bytes)
                    arrived:send(index)
                    release[index]:receive()
                    return ok, err
                end,
                remove = function(_, path) return storage:remove(path) end,
            }
        end
        for index = 1, 2 do
            coroutine.spawn(function()
                local bytes = args.bytes[index]
                local upload, err = upload_lib.upload_file(args.actor_id, bytes, args.filename, #bytes,
                    args.mime_type, nil, { __upload_token = args.token })
                done:send({ upload = upload, kind = err and err:kind(), message = err and tostring(err) })
            end)
            arrived:receive()
        end
        release[1]:send(true)
        local winner = done:receive()
        release[2]:send(true)
        local loser = done:receive()
        resources.get_storage = get_storage
        local bytes, read_err = storage:readfile(winner.upload.storage_path)
        return { winner = winner, loser = loser, bytes = bytes, read_error = read_err and tostring(read_err) }
    end
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
