local util = require("util")
local ctx = require("ctx")
local component = require("component")
local thread_ingest = require("thread_ingest")
local source_ref_builder = require("source_ref_builder")

local trim = util.trim

local function shallow_copy(input)
    local out = {}
    if type(input) == "table" then
        for key, value in pairs(input) do out[key] = value end
    end
    return out
end

local function origin_type_for(source_ref)
    if type(source_ref) == "table" and type(source_ref.origin) == "table" then
        local from_object = trim(source_ref.origin.type)
        if from_object ~= "" then return from_object end
    end
    local from_flat = type(source_ref) == "table" and trim(source_ref.origin) or ""
    if from_flat ~= "" then return from_flat end
    return "agent.delete_content"
end

local function origin_id_for(external_id, upload_id, source_url, reference_component_id)
    if external_id ~= "" then return external_id end
    if upload_id ~= "" then return upload_id end
    if source_url ~= "" then return source_url end
    if reference_component_id ~= "" then return reference_component_id end
    return "delete"
end

local function handle(args)
    args = args or {}

    local kb_id_raw = args.kb_id or ctx.get("kb_id")
    if not kb_id_raw then
        return nil, errors.new({ message = "no kb_id available, use SelectKB first or provide kb_id", kind = errors.INVALID })
    end
    local kb_id = kb_id_raw :: string

    local _, access_err = component.open(
        kb_id, component.ACCESS.WRITE, "kickside.contract:embeddable"
    )
    if access_err then
        return nil, errors.new({ message = tostring("cannot access KB: " .. tostring(access_err)), kind = errors.PERMISSION_DENIED })
    end

    local metadata = shallow_copy(args.metadata)
    local source_ref = shallow_copy(args.source_ref)
    metadata.source = trim(metadata.source) ~= "" and metadata.source or "agent.delete_content"
    local external_id = trim(args.external_id)
    if external_id == "" then external_id = trim(source_ref.external_id) end
    local external_version = trim(args.external_version)
    if external_version == "" then external_version = trim(source_ref.external_version) end
    local upload_id = trim(args.upload_id)
    if upload_id == "" then upload_id = trim(source_ref.upload_id) end
    local source_url = trim(args.source_url)
    if source_url == "" then source_url = trim(source_ref.source_url or source_ref.url) end
    local reference_component_id = trim(args.reference_component_id)
    if reference_component_id == "" then
        reference_component_id = trim(source_ref.reference_component_id or source_ref.component_id)
    end
    local reference_context = args.reference_context
    if type(reference_context) ~= "table" then
        reference_context = source_ref.reference_context or source_ref.context
    end

    if external_id ~= "" then metadata.external_id = external_id end
    if external_version ~= "" then metadata.external_version = external_version end
    if upload_id ~= "" then metadata.upload_id = upload_id end
    if source_url ~= "" then metadata.source_url = source_url end
    if reference_component_id ~= "" then metadata.reference_component_id = reference_component_id end
    if type(reference_context) == "table" then metadata.reference_context = reference_context end

    local source_kind = trim(source_ref.kind or source_ref.type)
    if source_kind == "" then source_kind = "manual" end
    if upload_id ~= "" then
        source_kind = "upload"
    elseif source_url ~= "" then
        source_kind = "url"
    elseif reference_component_id ~= "" then
        source_kind = "reference"
    end
    source_ref.kind = source_kind
    if external_id ~= "" then source_ref.external_id = external_id end
    if external_version ~= "" then source_ref.external_version = external_version end
    if upload_id ~= "" then source_ref.upload_id = upload_id end
    if source_url ~= "" then source_ref.source_url = source_url end
    if reference_component_id ~= "" then source_ref.reference_component_id = reference_component_id end
    if type(reference_context) == "table" then source_ref.reference_context = reference_context end

    local built_ref, ref_err = source_ref_builder.build({
        base = source_ref,
        fields = source_ref,
        origin_type = origin_type_for(source_ref),
        origin_id = origin_id_for(external_id, upload_id, source_url, reference_component_id),
    })
    if ref_err or not built_ref then
        return nil, errors.new({ message = tostring("invalid source_ref: " .. tostring(ref_err)), kind = errors.INVALID })
    end
    source_ref = built_ref

    local result, delete_err = thread_ingest.delete_content(kb_id, {
        metadata = metadata,
        external_id = external_id ~= "" and external_id or nil,
        external_version = external_version ~= "" and external_version or nil,
        source_ref = source_ref,
    })
    if delete_err then
        return nil, errors.new({ message = tostring("delete enqueue failed: " .. tostring(delete_err)), kind = errors.INTERNAL })
    end

    return {
        success = true,
        status = "queued",
        kb_id = kb_id,
        thread_id = result and result.thread_id,
        projection_id = result and result.projection_id,
        external_id = result and result.external_id,
        external_version = result and result.external_version,
        trace_context = result and result.trace_context,
    }
end

return { handle = handle }
