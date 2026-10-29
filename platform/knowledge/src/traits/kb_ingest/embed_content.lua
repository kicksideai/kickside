local util = require("util")
local ctx = require("ctx")
local component = require("component")

local trim = util.trim

local function shallow_copy(input: any): { [string]: any }
    local out: { [string]: any } = {}
    if type(input) == "table" then
        for key, value in pairs(input) do out[key] = value end
    end
    return out
end

local function put_default(target: { [string]: any }, key: string, value: any): ()
    if target[key] == nil or (type(target[key]) == "string" and target[key] == "") then
        target[key] = value
    end
end

local function source_ref_for(args: any, metadata: { [string]: any }, content_type: string, title: string): { [string]: any }
    local ref = shallow_copy(args.source_ref)
    if next(ref) == nil then ref = shallow_copy(metadata.source_ref) end

    local kind = trim(ref.kind or ref.type)
    if kind == "" then kind = trim(metadata.kind or metadata.source_kind) end
    if kind == "" then
        if trim(metadata.upload_id) ~= "" then
            kind = "upload"
        elseif trim(metadata.source_url) ~= "" then
            kind = "url"
        elseif trim(metadata.reference_component_id) ~= "" then
            kind = "reference"
        else
            kind = "manual"
        end
    end
    ref.kind = kind
    put_default(ref, "origin", "agent.embed_content")
    put_default(ref, "title", title)
    put_default(ref, "content_type", content_type)
    put_default(ref, "upload_id", metadata.upload_id)
    put_default(ref, "source_url", metadata.source_url)
    put_default(ref, "reference_component_id", metadata.reference_component_id)
    if type(ref.reference_context) ~= "table" and type(metadata.reference_context) == "table" then
        ref.reference_context = metadata.reference_context
    end
    return ref
end

local function handle(args)
    args = args or {}

    local content = args.content
    if not content or content == "" then
        return nil, errors.new({ message = "content is required", kind = errors.INVALID })
    end

    local kb_id_raw = args.kb_id or ctx.get("kb_id")
    if not kb_id_raw then
        return nil, errors.new({ message = "no kb_id available, use SelectKB first or provide kb_id", kind = errors.INVALID })
    end
    local kb_id = kb_id_raw :: string

    local engine, access_err = component.open(
        kb_id, component.ACCESS.WRITE, "kickside.contract:embeddable"
    )
    if access_err then
        return nil, errors.new({ message = tostring("cannot access KB: " .. tostring(access_err)), kind = errors.PERMISSION_DENIED })
    end

    local content_type = trim(args.content_type)
    if content_type == "" then content_type = "text/plain" end
    local metadata = shallow_copy(args.metadata)
    if trim(args.title) ~= "" then metadata.title = args.title end
    metadata.source = trim(metadata.source) ~= "" and metadata.source or "agent.embed_content"
    local title = trim(args.title or metadata.title or metadata.filename or metadata.source_url)

    assert(engine, "embeddable binding required")
    local result, ingest_err = engine:embed_content({
        content = content,
        content_type = content_type,
        title = title ~= "" and title or nil,
        metadata = metadata,
        external_id = args.external_id,
        external_version = args.external_version,
        source_ref = source_ref_for(args, metadata, content_type, title),
        trace_context = type(args.trace_context) == "table" and args.trace_context or nil,
    })
    if ingest_err or not result or result.success ~= true then
        ingest_err = ingest_err or (result and result.error)
        return nil, errors.new({ message = tostring("ingest enqueue failed: " .. tostring(ingest_err)), kind = errors.INTERNAL })
    end

    return {
        success = true,
        status = "queued",
        kb_id = kb_id,
        thread_id = result and result.thread_id,
        projection_id = result and result.projection_id,
        run_id = result and result.run_id,
        external_id = result and result.external_id,
        external_version = result and result.external_version,
        trace_context = result and result.trace_context,
        source_ref = result and result.source_ref,
        content_length = #content,
    }
end

return { handle = handle }
