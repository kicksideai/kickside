local util = require("util")
local component = require("component")
local ctx = require("ctx")
local security = require("security")
local upload_query_repo = require("upload_query_repo")
local ingest_upload = require("ingest_upload")

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
    put_default(ref, "origin", "trait.kb_embed")
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

-- The trait's configured kb_ids arrive via the runtime context module (the
-- compiler binds trait_contexts onto the tool ctx); the context param serves
-- unit-test injection. An explicit kb_id from FindKnowledgeBases is also valid:
-- component access is the authority, while configured ids act only as an
-- optional narrowing when the trait was pinned to specific KBs.
local function configured_kb_ids(context: any): { string }?
    local from_ctx = ctx.get("kb_ids")
    if type(from_ctx) == "table" and #from_ctx > 0 then return from_ctx :: { string } end
    if type(context.kb_ids) == "table" and #context.kb_ids > 0 then return context.kb_ids :: { string } end
    return nil
end

local function contains_kb_id(kb_ids: { string }?, kb_id: string): boolean
    if not kb_ids then return false end
    for _, id in ipairs(kb_ids) do
        if id == kb_id then return true end
    end
    return false
end

local function resolve_kb_id(args: any, context: any): (string?, error?)
    local kb_ids = configured_kb_ids(context)
    local explicit = trim(args.kb_id)
    if explicit ~= "" then
        if kb_ids and #kb_ids > 0 and not contains_kb_id(kb_ids, explicit) then
            return nil, errors.new({ kind = errors.INVALID, message = "kb_id not in configured knowledge bases" })
        end
        return explicit, nil
    end

    if not kb_ids or #kb_ids == 0 then
        return nil, errors.new({ kind = errors.INVALID, message = "no knowledge bases configured for this trait" })
    end
    if #kb_ids > 1 then
        return nil, errors.new({ kind = errors.INVALID, message = "kb_id is required when multiple knowledge bases are configured" })
    end
    return kb_ids[1], nil
end

local function handle(args: any, context: any)
    args = args or {}
    context = context or {}

    local upload_id = trim(args.upload_id)
    if upload_id == "" and (not args.content or args.content == "") then
        return nil, errors.new({ message = "content is required unless upload_id is provided", kind = errors.INVALID })
    end

    local kb_id, kb_err = resolve_kb_id(args, context)
    if kb_err then return nil, kb_err end
    if not kb_id then return nil, errors.new({ kind = errors.INVALID, message = "kb_id is required" }) end

    local svc, svc_err = component.get_service()
    if svc_err or not svc then
        return nil, errors.new({ message = tostring("component service unavailable: " .. tostring(svc_err)), kind = errors.INTERNAL })
    end
    local comp, comp_err = svc:get({ component_id = kb_id })
    if not comp or not comp.success then
        return nil, errors.new({ message = tostring("knowledge base not found: " .. tostring(comp_err)), kind = errors.NOT_FOUND })
    end

    local engine, access_err = component.open(
        kb_id, component.ACCESS.WRITE, "kickside.contract:embeddable"
    )
    if access_err then
        return nil, errors.new({ message = tostring("cannot access KB: " .. tostring(access_err)), kind = errors.PERMISSION_DENIED })
    end

    -- Ingest a file the user already uploaded (e.g. dropped into chat) by its
    -- upload id, without the agent needing the file bytes in-context. The upload
    -- must belong to the acting user; the shared core reads its processed content.
    if upload_id ~= "" then
        local rec, rec_err = upload_query_repo.get(upload_id)
        local actor = security.actor()
        local actor_id = actor and actor:id() or ""
        if rec_err or not rec or actor_id == "" or tostring(rec.actor_id) ~= tostring(actor_id) then
            return nil, errors.new({ message = "upload not found", kind = errors.NOT_FOUND })
        end
        local result, ingest_err = ingest_upload.ingest(kb_id, upload_id, {
            mime_type = rec.mime_type,
            size = rec.size,
            metadata = rec.metadata,
        })
        if ingest_err or not result then
            return nil, errors.new({ message = tostring("ingest enqueue failed: " .. tostring(ingest_err)), kind = errors.INTERNAL })
        end
        return {
            success = true,
            status = "queued",
            kb_id = kb_id,
            upload_id = upload_id,
            thread_id = result.thread_id,
            projection_id = result.projection_id,
            run_id = result.run_id,
            external_id = result.external_id,
            external_version = result.external_version,
            trace_context = result.trace_context,
            source_ref = result.source_ref,
        }
    end

    if not args.content or args.content == "" then
        return nil, errors.new({ message = "content is required", kind = errors.INVALID })
    end

    local content_type = trim(args.content_type)
    if content_type == "" then content_type = "text/plain" end
    local metadata = shallow_copy(args.metadata)
    metadata.source = trim(metadata.source) ~= "" and metadata.source or "trait.kb_embed"
    if trim(args.title) ~= "" then metadata.title = args.title end
    local title = trim(args.title or metadata.title or metadata.filename or metadata.source_url)
    assert(engine, "embeddable binding required")
    local result, ingest_err = engine:embed_content({
        content = args.content,
        content_type = content_type,
        title = title ~= "" and title or nil,
        metadata = metadata,
        external_id = args.external_id,
        external_version = args.external_version,
        source_ref = source_ref_for(args, metadata, content_type, title),
    })

    if ingest_err or not result or result.success ~= true then
        ingest_err = ingest_err or (result and result.error)
        return nil, errors.new({ message = tostring("ingest enqueue failed: " .. tostring(ingest_err)), kind = errors.INTERNAL })
    end

    -- The durable enqueue identity (thread_id + external_id/version + source_ref) is
    -- the tool's contract: callers and the ingest regression suite read it back to
    -- confirm idempotent replacement. Return the named fields only; the raw `result`
    -- blob duplicated them and only bloated the agent-visible payload.
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
    }
end

return { handle = handle }
