local CATALOG_BINDINGS = {
    {
        id = "kickside.channel.sink:channel_sink",
        kind = "contract.binding",
        meta = { title = "Send Channel Message", icon = "tabler:hash", group = "Channels" },
        data = { contracts = { { contract = "kickside.data:writable", methods = { write = "x:y" } } } },
    },
    {
        id = "kickside.knowledge.sink:kb_embed_sink",
        kind = "contract.binding",
        meta = { title = "Knowledge Base", icon = "tabler:books", group = "Knowledge" },
        data = { contracts = { { contract = "kickside.data:writable", methods = { write = "x:y" } } } },
    },
    {
        id = "kickside.fireflies.source:transcripts_source",
        kind = "contract.binding",
        meta = {
            title = "Fireflies Transcripts", icon = "tabler:microphone",
            provider = "fireflies", group = "Meetings",
            class = { "kickside.meetings" },
        },
        data = { contracts = { { contract = "kickside.data:pullable", methods = { pull = "x:y" } } } },
    },
    {
        id = "kickside.uploads:uploads_component",
        kind = "contract.binding",
        meta = {
            title = "Uploads", class = { "kickside.uploads" }, group = "Files",
            events = { output = {
                { type = "kickside.uploads.events:upload.completed" },
                { type = "kickside.uploads.events:upload.deleted" },
            } },
        },
        data = { contracts = {} },
    },
    {
        id = "provider.flows:destination_kind",
        kind = "contract.binding",
        meta = { title = "Destination", class = { "destination", "automation" } },
        data = { contracts = {} },
    },
}
local CATALOG_PORTS = {
    {
        id = "kickside.channel.sink:channel_post",
        kind = "registry.entry",
        meta = { type = "kickside.automation.port", title = "Send Channel Message", icon = "tabler:hash" },
        binding = "kickside.channel.sink:channel_sink",
        operations = { upsert = {} },
        input_schema = '{ "type": "object", "properties": { "content": { "type": "string" } } }',
        output_schema = '{ "type": "object", "properties": { "success": { "type": "boolean" } }, "required": ["success"] }',
        config_schema = { channel_id = { picker = "wc-channel-picker", required = true } },
    },
    {
        id = "kickside.knowledge.sink:kb_embed",
        kind = "registry.entry",
        meta = { type = "kickside.automation.port", title = "Knowledge Base", icon = "tabler:books" },
        binding = "kickside.knowledge.sink:kb_embed_sink",
        operations = { upsert = {}, delete = { requires_dest_ref = false }, list_keys = { ["function"] = "x:list" } },
        input_schema = '{ "type": "object", "properties": { "content": { "type": "string" } } }',
        config_schema = { kb_id = { picker = "wc-kb-picker", required = true } },
    },
    {
        id = "kickside.fireflies.source:transcripts",
        kind = "registry.entry",
        meta = { type = "kickside.automation.port", title = "Fireflies Transcripts", icon = "tabler:microphone" },
        binding = "kickside.fireflies.source:transcripts_source",
        reconcile = { pull_keys = "kickside.fireflies.source:pull_keys" },
        output_schema = '{ "type": "object", "properties": { "id": { "type": "string" } } }',
        config_schema = { connection_id = { picker = "kickside-connection-trait-picker", required = true } },
    },
    {
        id = "kickside.uploads:upload_completed",
        kind = "registry.entry",
        meta = { type = "kickside.automation.port", title = "Upload Completed", icon = "tabler:upload", comment = "Start after a file finishes processing and is ready to use." },
        binding = "kickside.uploads:uploads_component",
        event = "kickside.uploads.events:upload.completed",
    },
    {
        id = "kickside.webhooks:webhook_received",
        kind = "registry.entry",
        meta = { type = "kickside.automation.port", title = "Webhook Received" },
        binding = "kickside.webhooks:webhook_component",
        event = "kickside.webhooks.events:webhook.inbound",
    },
}
local CATALOG_EVENTS = {
    ["kickside.uploads.events:upload.completed"] = {
        id = "kickside.uploads.events:upload.completed",
        meta = { type = "kickside.core.threads.event" },
        schema = { type = "object", properties = { upload_id = { type = "string" } } },
    },
    ["kickside.webhooks.events:webhook.inbound"] = {
        id = "kickside.webhooks.events:webhook.inbound",
        meta = { type = "kickside.core.threads.event" },
        schema = { type = "object", additionalProperties = true },
    },
}
local function catalog_registry(): any
    return {
        find = function(query: any): (any?, any)
            if (query :: any)["meta.type"] == "kickside.automation.port" then return CATALOG_PORTS, nil end
            return CATALOG_BINDINGS, nil
        end,
        get = function(id: any): (any?, any)
            return CATALOG_EVENTS[tostring(id)], nil
        end,
    }
end


return { registry = catalog_registry }
