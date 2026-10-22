local thread_ingest = require("thread_ingest")

local function handle(args)
    args = args or {}
    if args.check_delivery then
        return thread_ingest.check_delivery(args.kb_id,args.external_id,args.delivery_key,args.content,args.sink_write)
    end
    return thread_ingest.append_content(args.kb_id, {
        content = args.content or "hello from agent",
        content_type = "text/plain",
        title = args.title or "Agent write",
        metadata = {
            source = "thread_ingest_identity_test",
        },
        source_ref = args.source_ref,
        external_id = args.external_id,
        external_version = args.external_version,
    })
end

return { handle = handle }
