local util = require("util")
local security = require("security")
local contract = require("contract")
local uuid = require("uuid")
local hash = require("hash")
local json = require("json")
local component = require("component")
local trace_context = require("trace_context")
local source_ref_builder = require("source_ref_builder")

local M = {}

-- The KB's primary thread IS the injection thread: thread_id == component_id ==
-- kb_id. Content events are emitted here and the source/digest/graph_meta
-- projections -- declared on the kb10 engine binding's meta.projections and
-- provisioned on this thread when the KB is created -- materialize them. This
-- module is only the canonical event PRODUCER plus a lookup-based control plane;
-- it never registers a projection (that is the declared path).
local THREAD_CLASS = "kickside.knowledge.injection"
local EXTERNAL_SOURCE = "knowledge.kb"
local GRAPH_EXTERNAL_SOURCE = "knowledge.graph"
local COMPONENT_SERVICE = "kickside.component:component_service"
local THREADS_CONTRACT = "kickside.core:threads"
local KB_STORE_CONTRACT = "kickside.knowledge:kb_store_lifecycle"
local PRIVATE_UPLOAD_LOCATOR_KEYS = {
    storage_id = true,
    storage_path = true,
    original_storage_id = true,
    original_storage_path = true,
}

-- The source projection's identity on the primary thread. Used only to LOOK UP the
-- ingestion cursor for status/pause/resume -- never to register it (the engine
-- binding declares it). Kept in sync with the kb10 engine binding's meta.projections.
local SOURCE_PROJECTION_KIND = "knowledge.injection.source"
local SOURCE_PROJECTION_KEY = "source"
local SOURCE_CURSOR_KEY = "source"

M.EVENT_CONTENT_UPSERTED = "kickside.knowledge.events:content.upserted"
M.EVENT_CONTENT_DELETED = "kickside.knowledge.events:content.deleted"
M.EVENT_DELIVERY_CLAIMED = "kickside.knowledge.events:delivery.claimed"
M.EVENT_GRAPH_CHANGED = "kickside.knowledge.events:graph.changed"

-- ─── helpers ───────────────────────────────────────────────────────────

local trim = util.trim

local function shallow_copy(input: any): { [string]: any }
    local out: { [string]: any } = {}
    if type(input) == "table" then
        for key, value in pairs(input) do out[key] = value end
    end
    return out
end

-- Storage locators are implementation-private. Content events are durable and
-- broadly consumable by projections, so never copy upload backend coordinates
-- from an arbitrary caller-provided metadata or source_ref payload into them.
local function strip_private_upload_locators(target: { [string]: any }): ()
    for key in pairs(PRIVATE_UPLOAD_LOCATOR_KEYS) do target[key] = nil end
end

local function decode_object(value: any): ({ [string]: any }?, any?)
    if type(value) == "table" then return value :: { [string]: any } end
    if type(value) ~= "string" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "knowledge body must be an object" })
    end
    local decoded, err = json.decode(value)
    if err then return nil, err end
    if type(decoded) ~= "table" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "knowledge body must be an object" })
    end
    return decoded :: { [string]: any }
end

local function execution_scope(): (any?, string?)
    local scope = security.scope()
    if scope then
        return scope, nil
    end
    return nil, "security scope unavailable"
end

local function current_executor(): (any?, string?)
    local actor = security.actor()
    if not actor then
        return nil, "security actor unavailable"
    end
    local scope, scope_err = execution_scope()
    if scope_err or not scope then
        return nil, scope_err or "security scope unavailable"
    end
    -- The threads contract instance is opened under the caller's actor + scope, so
    -- every write and read runs as the current frame; it does not synthesize or
    -- re-bind identity.
    local def, get_err = contract.get(THREADS_CONTRACT)
    if get_err or not def then
        return nil, "threads contract unavailable: " .. tostring(get_err)
    end
    local inst, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err or not inst then
        return nil, "threads open failed: " .. tostring(open_err)
    end
    return inst, nil
end

local function current_component_service(): (any?, string?)
    local actor = security.actor()
    if not actor then
        return nil, "security actor unavailable"
    end
    local scope, scope_err = execution_scope()
    if scope_err or not scope then
        return nil, scope_err or "security scope unavailable"
    end
    local service_contract, get_err = contract.get(COMPONENT_SERVICE)
    if get_err or not service_contract then
        return nil, "component service unavailable: " .. tostring(get_err or "not found")
    end
    local svc, open_err = service_contract:with_actor(actor):with_scope(scope):open()
    if open_err or not svc then
        return nil, "component service open failed: " .. tostring(open_err)
    end
    return svc, nil
end

local function call_threads(exec: any, method: string, args: any): (any, any)
    local result, call_err = (exec :: any)[method]((exec :: any), args)
    if call_err then
        return nil, call_err
    end
    return result, nil
end

local function validate_kb_access(kb_id: string, access: any): any?
    local access_mask = access :: integer
    local actor = security.actor()
    if not actor then
        return errors.new({ message = "access denied: security actor unavailable", kind = errors.PERMISSION_DENIED, retryable = false })
    end
    local scope, scope_err = execution_scope()
    if scope_err or not scope then
        return errors.new({ message = "access denied: " .. tostring(scope_err or "security scope unavailable"), kind = errors.PERMISSION_DENIED, retryable = false })
    end

    local svc, svc_err = current_component_service()
    if svc_err or not svc then
        return errors.new({ message = "component service unavailable: " .. tostring(svc_err), kind = errors.UNAVAILABLE, retryable = true })
    end

    local result, access_err = svc:get_access_context({
        component_id = kb_id,
        access_mask = access_mask,
        include_context = false,
    })
    if access_err or type(result) ~= "table" or result.success ~= true then
        if access_err and errors.is(access_err, errors.UNAVAILABLE) then return access_err end
        return errors.new({ message = "access denied: " .. tostring(access_err or (result and result.error) or "component not found"),
            kind = errors.PERMISSION_DENIED, retryable = false })
    end
    return nil
end

local function current_actor_id()
    local actor = security.actor()
    if not actor then return nil end
    local id = trim(actor:id())
    if id == "" then return nil end
    return id
end

local function content_sha(content: any): string?
    local digest = hash.sha256(content or "")
    if type(digest) == "string" and digest ~= "" then return digest end
    return nil
end

local function source_input(params: any, metadata: any): { [string]: any }
    local raw: any = {}
    if type(params.source_ref) == "table" then raw = params.source_ref
    elseif type(params.source) == "table" then raw = params.source
    elseif type(metadata) == "table" and type(metadata.source_ref) == "table" then raw = metadata.source_ref
    end
    local source = shallow_copy(raw)
    strip_private_upload_locators(source)
    return source
end

local function context_digest(value: any): string
    if type(value) ~= "table" then return "default" end
    local encoded = "{}"
    local result = json.encode(value)
    if type(result) == "string" and result ~= "" then encoded = result end
    local digest = content_sha(encoded)
    return digest and digest:sub(1, 32) or "default"
end

local function natural_external_id_for(params: any, metadata: any): string?
    local explicit = trim(params.external_id)
    if explicit ~= "" then return explicit end

    local meta_external = trim(metadata.external_id)
    if meta_external ~= "" then return meta_external end

    local source = source_input(params, metadata)
    local source_external = trim(source.external_id)
    if source_external ~= "" then return source_external end

    local upload_id = trim(metadata.upload_id)
    if upload_id == "" then upload_id = trim(source.upload_id) end
    if upload_id ~= "" then return "upload:" .. upload_id end

    local source_url = trim(metadata.source_url)
    if source_url == "" then source_url = trim(source.source_url or source.url) end
    if source_url ~= "" then return "url:" .. source_url end

    local reference_component_id = trim(metadata.reference_component_id)
    if reference_component_id == "" then reference_component_id = trim(source.reference_component_id or source.component_id) end
    if reference_component_id ~= "" then
        return "reference:" .. reference_component_id .. ":" .. context_digest(metadata.reference_context or source.reference_context or source.context)
    end

    return nil
end

local function external_id_for(params: any, metadata: any): string
    return natural_external_id_for(params, metadata) or "content:" .. uuid.v7()
end

local function external_version_for(params: any, metadata: any, content: string): string
    local explicit = trim(params.external_version)
    if explicit ~= "" then return explicit end

    local meta_version = trim(metadata.external_version)
    if meta_version ~= "" then return meta_version end

    local source = source_input(params, metadata)
    local source_version = trim(source.external_version)
    if source_version ~= "" then return source_version end

    local content_hash = trim(metadata.content_hash or metadata.sha256)
    if content_hash ~= "" then return content_hash end

    return content_sha(content) or "v1"
end

local function trace_for(kind: string, kb_id: string, external_id: string, raw_context: any): (table?, error?)
    local correlation_key, corr_err = trace_context.pack_correlation("kb", { kb_id, "source", external_id })
    if corr_err then return nil, corr_err end

    local ctx, ctx_err = trace_context.normalize(raw_context)
    if ctx_err then return nil, ctx_err end
    if ctx then
        if not (ctx :: table).correlation_key then
            (ctx :: table).correlation_key = correlation_key
        end
        return (ctx :: table), nil
    end
    return (trace_context.begin(kind, correlation_key) :: table), nil
end

local function put_str(target: { [string]: any }, key: string, value: any): ()
    local s = trim(value)
    if s ~= "" then target[key] = s end
end

local function origin_type_for(input: any, metadata: any): string
    if type(input) == "table" and type((input :: any).origin) == "table" then
        local from_object = trim(((input :: any).origin :: any).type)
        if from_object ~= "" then return from_object end
    end
    local from_input = type(input) == "table" and trim((input :: any).origin) or ""
    if from_input ~= "" then return from_input end
    local from_metadata = type(metadata) == "table" and trim((metadata :: any).source) or ""
    if from_metadata ~= "" then return from_metadata end
    return "manual"
end

local function source_ref_for(
    params: any,
    metadata: any,
    content_type: any,
    title: any,
    external_id: string,
    external_version: string
): ({ [string]: any }?, string?)
    local input = source_input(params, metadata)
    local fields: { [string]: any } = {}

    local upload_id = trim(metadata.upload_id)
    if upload_id == "" then upload_id = trim(input.upload_id) end
    local source_url = trim(metadata.source_url)
    if source_url == "" then source_url = trim(input.source_url or input.url) end
    local reference_component_id = trim(metadata.reference_component_id)
    if reference_component_id == "" then reference_component_id = trim(input.reference_component_id or input.component_id) end

    local kind = trim(input.kind or input.type)
    if kind == "" then
        if upload_id ~= "" then
            kind = "upload"
        elseif source_url ~= "" then
            kind = "url"
        elseif reference_component_id ~= "" then
            kind = "reference"
        else
            kind = "manual"
        end
    end
    fields.kind = kind
    fields.external_source = EXTERNAL_SOURCE
    fields.external_id = external_id
    fields.external_version = external_version

    put_str(fields, "content_type", content_type)
    put_str(fields, "title", title or metadata.title)
    put_str(fields, "content_hash", metadata.content_hash or metadata.sha256)
    put_str(fields, "upload_id", upload_id)
    put_str(fields, "source_url", source_url)
    put_str(fields, "filename", metadata.filename or input.filename)
    put_str(fields, "original_filename", metadata.original_filename or input.original_filename)
    put_str(fields, "reference_component_id", reference_component_id)

    local reference_context = metadata.reference_context or input.reference_context or input.context
    if type(reference_context) == "table" then fields.reference_context = reference_context end

    return source_ref_builder.build({
        base = input,
        fields = fields,
        origin_type = origin_type_for(input, metadata),
        origin_id = external_id,
    })
end

-- ─── primary-thread lookup (control plane) ───────────────────────────────

-- find_primary_thread returns the KB's primary thread row (thread_id == kb_id) or
-- nil. It never creates the thread -- provisioning is the KB create path.

-- Shared producer helpers; the public API remains thread_ingest.
M.THREAD_CLASS = THREAD_CLASS
M.KB_STORE_CONTRACT = KB_STORE_CONTRACT
M.EXTERNAL_SOURCE = EXTERNAL_SOURCE
M.GRAPH_EXTERNAL_SOURCE = GRAPH_EXTERNAL_SOURCE
M.SOURCE_PROJECTION_KIND = SOURCE_PROJECTION_KIND
M.SOURCE_PROJECTION_KEY = SOURCE_PROJECTION_KEY
M.SOURCE_CURSOR_KEY = SOURCE_CURSOR_KEY
M.trim = trim
M.shallow_copy = shallow_copy
M.strip_private_upload_locators = strip_private_upload_locators
M.decode_object = decode_object
M.execution_scope = execution_scope
M.current_executor = current_executor
M.current_component_service = current_component_service
M.call_threads = call_threads
M.validate_kb_access = validate_kb_access
M.current_actor_id = current_actor_id
M.content_sha = content_sha
M.source_input = source_input
M.context_digest = context_digest
M.natural_external_id_for = natural_external_id_for
M.external_id_for = external_id_for
M.external_version_for = external_version_for
M.trace_for = trace_for
M.put_str = put_str
M.origin_type_for = origin_type_for
M.source_ref_for = source_ref_for

return M
