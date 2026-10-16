-- kickside.data:writable sink that embeds content into a knowledge base.
-- Data flows write through the generic writable ABI; this binding
-- bridges to kickside.contract:embeddable on the KB selected in config.kb_id
-- (config.kb_ids[1] when the wc-kb-picker multi shape is used). Idempotency is
-- delegated to the embeddable layer via the carried dedup metadata.
--
-- Two operations are declared on the port: upsert (embed content) and delete
-- (remove the document keyed by the source identity). Both flow through the same
-- knowledge ingest thread -- upsert via embeddable.embed_content, delete via
-- thread_ingest.delete_content -- so the injection worker materializes and reaps
-- through one durable event path.

local component = require("component")
local stores = require("stores")
local thread_ingest = require("thread_ingest")
local writable_sink = require("writable_sink")

local trim, fail = writable_sink.trim, writable_sink.fail

local EMBEDDABLE_CONTRACT = "kickside.contract:embeddable"

local function upsert_error(err: any, delivery_check: boolean?): any
    if errors.is(err, errors.CONFLICT) then
        return fail(tostring(err), delivery_check and "idempotency_conflict" or "conflict",
            delivery_check ~= true, delivery_check and "item" or "provider")
    end
    if errors.is(err, errors.PERMISSION_DENIED) then return fail(tostring(err), "permission_denied", false, "item") end
    if errors.is(err, errors.UNAVAILABLE) then return fail(tostring(err), "provider_unavailable", true, "provider") end
    return fail(tostring(err), "provider_error", true, "provider")
end

local function shallow_copy(input: any): { [string]: any }
    local out: { [string]: any } = {}
    if type(input) == "table" then
        for k, v in pairs(input :: any) do out[k] = v end
    end
    return out
end

local function resolve_kb_id(config: any): string?
    if type(config) ~= "table" then return nil end
    if type(config.kb_id) == "string" and config.kb_id ~= "" then return config.kb_id end
    local ids = config.kb_ids
    if type(ids) == "table" and type(ids[1]) == "string" and ids[1] ~= "" then return ids[1] end
    return nil
end

-- The sync destination map keys every returned reference by the request's
-- map_slot ("default" when the sync does not slot its destinations).
local function resolve_map_slot(req: any): string
    local slot = trim(req.map_slot)
    if slot == "" then return "default" end
    return slot
end

-- upsert: embed the written content into the KB through the embeddable contract.
local function upsert(kb_id: string, req: any, input: any, deps: any?): any
    local content = input.content
    if content == nil or content == "" then return fail("write input.content is required") end
    local component_mod = deps and deps.component or component
    local ingestion = deps and deps.thread_ingest or thread_ingest

    -- embeddable is a per-component binding (kb10 binds it with context_required
    -- component_id), so it is opened through the component module by KB id, not as
    -- a default contract binding.
    local inst, oerr = component_mod.open(kb_id, component.ACCESS.WRITE, EMBEDDABLE_CONTRACT)
    if oerr or not inst then
        if oerr and errors.is(oerr, errors.PERMISSION_DENIED) then
            return fail("embeddable open: " .. tostring(oerr), "permission_denied", false, "item")
        end
        return fail("embeddable open: " .. tostring(oerr), "provider_unavailable", true, "provider")
    end

    local metadata = shallow_copy(input.metadata)
    -- A writer that carries no dedup key of its own falls back to the record
    -- identity, which holds across deliveries; the idempotency_key would move
    -- with every one.
    if metadata.dedup_key == nil then
        local fallback = trim(req.identity_key)
        if fallback == "" then fallback = trim(req.idempotency_key) end
        if fallback ~= "" then metadata.dedup_key = fallback end
    end
    -- The identity_key NAMES the destination document. Project it into the
    -- highest-precedence external_id so redelivery reconciles to the same KB document
    -- (natural_external_id_for reads external_id first); without it every redelivery
    -- mints a random content:<uuid> and appends a duplicate. A writer that carries no
    -- identity_key falls back to the idempotency_key, which is the document name only
    -- while nothing scopes it per delivery.
    local external_id = trim(req.identity_key)
    if external_id == "" then external_id = trim(req.idempotency_key) end
    if external_id == "" then external_id = nil end
    local source_label = trim(type(req.config) == "table" and (req.config :: any).source_label or nil)
    if source_label ~= "" then
        if metadata.source_label == nil then metadata.source_label = source_label end
        if trim(metadata.source) == "" then metadata.source = source_label end
    end

    local delivery_key = trim(req.idempotency_key)
    local sink_write = { external_id = external_id, content_type = input.content_type or "text/plain",
        metadata = shallow_copy(input.metadata), source_label = source_label }
    if delivery_key ~= "" then
        local _, claim_err = ingestion.claim_delivery(kb_id, delivery_key, tostring(content), sink_write)
        if claim_err then return upsert_error(claim_err, true) end
        local exists, check_err = ingestion.check_delivery(kb_id, external_id, delivery_key, tostring(content), sink_write)
        if check_err then return upsert_error(check_err, true) end
        if exists then
            local ref = { kb_id = kb_id, external_id = external_id }
            local version = "delivery:" .. delivery_key
            return { success = true, result = "noop", dest_ref = ref, dest_version = version,
                dest_refs = { [resolve_map_slot(req)] = { dest_ref = ref, dest_version = version } } }
        end
        metadata.sink_write = sink_write
    end

    local res, eerr = (inst :: any):embed_content({
        content = content,
        content_type = input.content_type or "text/plain",
        external_id = external_id,
        external_version = delivery_key ~= "" and ("delivery:" .. delivery_key) or nil,
        idempotency_key = delivery_key ~= "" and delivery_key or nil,
        metadata = metadata,
        trace_context = type(req.trace_context) == "table" and req.trace_context or nil,
    })
    if eerr then return upsert_error(eerr) end
    if type(res) == "table" and res.success == false then
        if type(res.error) == "table" or type(res.error) == "userdata" then return upsert_error(res.error) end
        if res.kind == errors.PERMISSION_DENIED then return fail(tostring(res.error), "permission_denied", false, "item") end
        if res.kind == errors.UNAVAILABLE then return fail(tostring(res.error), "provider_unavailable", true, "provider") end
        return fail(tostring(res.error or "embed failed"), "provider_error", true, "provider")
    end

    if delivery_key ~= "" then
        local verified, check_err = ingestion.check_delivery(kb_id, external_id, delivery_key, tostring(content), sink_write)
        if check_err then return upsert_error(check_err, true) end
        if not verified then return fail("embed did not commit the requested delivery", "provider_error", true, "provider") end
    end

    local ref = { kb_id = kb_id, external_id = external_id }
    local version = type(res) == "table" and res.external_version or nil
    return {
        success = true,
        result = "created",
        dest_ref = ref,
        dest_version = version,
        dest_refs = { [resolve_map_slot(req)] = { dest_ref = ref, dest_version = version } },
    }
end

-- delete: remove the document named by the request's identity_key. The key IS the
-- document external_id (upsert projects it there), so a content.deleted event on the
-- same knowledge ingest thread reconciles to that document and the injection worker
-- cascades the subtree (chunks + embeddings). Mirrors the /content DELETE API and
-- uploads deletion: one event-driven write path, no direct store call. Deleting an
-- absent key is a clean queued no-op downstream, so the effect stays result=deleted.
local function delete_document(kb_id: string, req: any, input: any): any
    local metadata = shallow_copy(input.metadata)
    local external_id = trim(req.identity_key)
    if external_id == "" then external_id = trim(req.idempotency_key) end
    if external_id == "" then external_id = trim(metadata.external_id) end
    if external_id ~= "" then metadata.external_id = external_id end
    local source_ref = type(metadata.source_ref) == "table" and (metadata.source_ref :: any) or nil

    local delivery_key = trim(req.idempotency_key)
    if delivery_key ~= "" then
        local _, claim_err = thread_ingest.claim_delivery(kb_id, delivery_key, "", {
            operation = "delete", external_id = external_id,
            metadata = shallow_copy(input.metadata),
        })
        if claim_err then
            if errors.is(claim_err, errors.CONFLICT) then return fail(tostring(claim_err), "idempotency_conflict", false, "item") end
            if errors.is(claim_err, errors.PERMISSION_DENIED) then return fail(tostring(claim_err), "permission_denied", false, "item") end
            return fail(tostring(claim_err), "provider_error", true, "provider")
        end
    end
    local res, derr = thread_ingest.delete_content(kb_id, {
        external_id = external_id ~= "" and external_id or nil,
        external_version = delivery_key ~= "" and ("delete:" .. delivery_key) or nil,
        metadata = metadata,
        source_ref = source_ref,
        trace_context = type(req.trace_context) == "table" and req.trace_context or nil,
    })
    if derr or not res then
        if derr and errors.is(derr, errors.PERMISSION_DENIED) then
            return fail("delete: " .. tostring(derr), "permission_denied", false, "item")
        end
        if derr and errors.is(derr, errors.UNAVAILABLE) then
            return fail("delete: " .. tostring(derr), "provider_unavailable", true, "provider")
        end
        return fail("delete: " .. tostring(derr), "provider_error", true, "provider")
    end

    local ref = { kb_id = kb_id, external_id = external_id ~= "" and external_id or nil }
    local version = type(res) == "table" and res.external_version or nil
    return {
        success = true,
        result = "deleted",
        dest_ref = ref,
        dest_version = version,
        dest_refs = { [resolve_map_slot(req)] = { dest_ref = ref, dest_version = version } },
    }
end

local function write(req: any, deps: any?): any
    req = type(req) == "table" and req or {}
    local _, origin_failure = writable_sink.origin(req)
    if origin_failure then return origin_failure end
    local kb_id = resolve_kb_id(req.config)
    if not kb_id then return fail("sink config.kb_id is required", "invalid_config", false, "flow") end

    local input = type(req.input) == "table" and req.input or {}
    local sink_op = trim(req.sink_op)
    if sink_op == "" then sink_op = "upsert" end

    if sink_op == "delete" then return delete_document(kb_id, req, input) end
    if sink_op ~= "upsert" then return fail("unsupported sink operation: " .. sink_op) end
    return upsert(kb_id, req, input, deps)
end


return { write = write }
