local util = require("util")
local ctx = require("ctx")
local contract = require("contract")
local security = require("security")
local component = require("component")
local canonical_json = require("canonical_json")
local source_ref_builder = require("source_ref_builder")

local trim = util.trim

local function shallow_copy(input)
    local out = {}
    if type(input) == "table" then
        for key, value in pairs(input) do out[key] = value end
    end
    return out
end

local function reference_external_id(reference)
    local component_id = trim(reference.component_id)
    local digest, err = canonical_json.hash(reference.context or {})
    if err then return nil, err end
    return "reference:" .. component_id .. ":" .. (digest :: string):sub(1, 32), nil
end

local function current_runtime_identity()
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, nil, "security actor and scope are required"
    end
    return actor, scope, nil
end

local function handle(request)
    request = type(request) == "table" and request or {}

    local component_id = ctx.get("component_id") :: string
    if not component_id then
        return { success = false, error = "component_id not found in context" }
    end

    local reference = request.reference
    if not reference or not reference.component_id then
        return { success = false, error = "reference with component_id is required" }
    end

    local content_provider, err = contract.get("kickside.contract:content_provider")
    if err then
        return { success = false, error = "failed to get content provider contract: " .. err }
    end

    assert(content_provider, "content_provider contract required")
    local actor, scope, security_err = current_runtime_identity()
    if security_err then
        return { success = false, error = security_err }
    end
    local cp = content_provider :: any
    local provider, open_err = cp:with_actor(actor):with_scope(scope):open(nil, { component_id = reference.component_id :: string })
    if open_err then
        return { success = false, error = "failed to open content provider: " .. open_err }
    end

    local content_result, content_err = provider:get_content(reference.context or {})
    if content_err then
        return { success = false, error = "failed to get content from provider: " .. content_err }
    end

    if not content_result or not content_result.success then
        return { success = false, error = "content provider returned failure" }
    end

    local engine, access_err = component.open(component_id, component.ACCESS.WRITE, "kickside.contract:embeddable")
    if access_err then
        return { success = false, error = "cannot access KB: " .. tostring(access_err) }
    end

    local metadata = shallow_copy(request.metadata)
    metadata.source = trim(metadata.source) ~= "" and metadata.source or "embed_reference"
    metadata.reference_component_id = reference.component_id
    if type(reference.context) == "table" then
        metadata.reference_context = reference.context
    end

    local external_id = trim(request.external_id)
    if external_id == "" then external_id = trim(metadata.external_id) end
    if external_id == "" then external_id = trim(content_result.external_id) end
    if external_id == "" then
        local generated, id_err = reference_external_id(reference)
        if id_err then return { success = false, error = tostring(id_err) } end
        external_id = generated
    end

    local external_version = trim(request.external_version)
    if external_version == "" then external_version = trim(metadata.external_version) end
    if external_version == "" then external_version = trim(content_result.external_version or content_result.content_hash) end

    local source_ref, ref_err = source_ref_builder.build({
        origin_type = "embed_reference",
        origin_id = external_id,
        fields = {
            kind = "reference",
            reference_component_id = reference.component_id,
            reference_context = reference.context,
            title = content_result.title or metadata.title,
            content_type = content_result.content_type or "text/plain",
        },
    })
    if ref_err or not source_ref then
        return { success = false, error = "invalid source_ref: " .. tostring(ref_err) }
    end

    assert(engine, "embeddable binding required")
    local queued, ingest_err = engine:embed_content({
        content = content_result.content,
        content_type = content_result.content_type or "text/plain",
        title = content_result.title or metadata.title,
        metadata = metadata,
        external_id = external_id,
        external_version = external_version,
        source_ref = source_ref,
    })
    if ingest_err or not queued or queued.success ~= true then
        ingest_err = ingest_err or (queued and queued.error)
        return { success = false, error = "failed to queue reference ingest: " .. tostring(ingest_err) }
    end

    return {
        success = true,
        status = "queued",
        kb_id = component_id,
        thread_id = queued.thread_id,
        projection_id = queued.projection_id,
        run_id = queued.run_id,
        external_id = queued.external_id,
        external_version = queued.external_version,
        trace_context = queued.trace_context,
    }
end

return { handle = handle }
