-- Harness embeddable binding for test.kb KBs. It gives the test_engine_wiki descriptor
-- (impl_id: test.kb:embeddable) a real kickside.contract:embeddable method so the
-- kb_embed_sink writable can open it and drive the canonical producer. It mirrors the
-- kb10 embed_func seam: forward the request into kickside.knowledge.injection:thread_ingest,
-- carrying external_id through so the source-provided identity reaches the content event.

local ctx = require("ctx")
local thread_ingest = require("thread_ingest")

type Map = { [string]: any }

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function shallow_copy(input: any): Map
    local out: Map = {}
    if type(input) == "table" then
        for key, value in pairs(input) do out[key] = value end
    end
    return out
end

local function handle(request: any): any
    local req = (type(request) == "table" and request or {}) :: Map

    local component_id = trim(ctx.get("component_id"))
    if component_id == "" then
        return { success = false, error = "component_id not found in context" }
    end

    local content = req.content
    if type(content) ~= "string" or trim(content) == "" then
        return { success = false, error = "content is required" }
    end

    local content_type = trim(req.content_type)
    if content_type == "" then content_type = "text/plain" end

    local metadata = shallow_copy(req.metadata)
    metadata.source = trim(metadata.source) ~= "" and metadata.source or "test.kb.embed"
    local title = trim(req.title or metadata.title)

    local queued, ingest_err = thread_ingest.append_content(component_id, {
        content = content,
        content_type = content_type,
        metadata = metadata,
        title = title ~= "" and title or nil,
        external_id = req.external_id,
        external_version = req.external_version,
    })
    if ingest_err or not queued then
        return { success = false, error = "ingest enqueue failed: " .. tostring(ingest_err) }
    end

    return {
        success = true,
        status = "queued",
        kb_id = component_id,
        thread_id = queued.thread_id,
        external_id = queued.external_id,
        external_version = queued.external_version,
        source_ref = queued.source_ref,
    }
end

-- embed_reference is part of the embeddable contract but unused by the sink path;
-- the harness binding provides it so the contract is fully bound.
local function handle_reference(_request: any): any
    return { success = false, error = "embed_reference is not supported in the knowledge harness" }
end

return { handle = handle, handle_reference = handle_reference }
