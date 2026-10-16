-- kickside.data:writable sink that posts content to the ambient actor's inbox.
-- The inbox owner is the current security actor, matching SubmitToInbox and the
-- per-user autoinit inbox model. Cross-user assignment should be an explicit
-- domain feature, not hidden in this generic sink.

local writer = require("inbox_writer")
local inbox_types = require("inbox_types")
local item_types = require("inbox_item_types")
local writable_sink = require("writable_sink")

local trim, fail = writable_sink.trim, writable_sink.fail

local VALID_PRIORITY = { low = true, normal = true, high = true, urgent = true }

local function first_line(value: string): string
    local line = value:match("^[^\r\n]+") or value
    line = trim(line)
    if #line > 140 then line = line:sub(1, 137) .. "..." end
    return line
end

local function receipt(req: any, result: string, ref: any): any
    local slot = trim(req.map_slot)
    if slot == "" then slot = "default" end
    -- Keep the singular receipt for existing direct callers; Sync owns a map.
    return { success = true, result = result, dest_ref = ref,
        dest_refs = { [slot] = { dest_ref = ref } } }
end

-- The item id is the write's identity_key: the stable name of the record this
-- write owns, carried across deliveries. The idempotency_key is scoped to one
-- delivery, so naming the item after it makes a re-delivery post a second item
-- instead of refreshing the first. A writer that carries no identity_key falls
-- back to it, which is the record name only while nothing scopes it per delivery.
local function record_identity(req: any): string
    local id = trim(req.identity_key)
    if id == "" then id = trim(req.idempotency_key) end
    return id
end

local function metadata_of(input: any, req: any): any
    local metadata: any = {}
    if type(input.metadata) == "table" then
        for k, v in pairs(input.metadata) do metadata[k] = v end
    end
    -- A writer that carries no dedup key of its own falls back to the record
    -- identity, which holds across deliveries; the idempotency_key would move
    -- with every one.
    if metadata.dedup_key == nil then
        local fallback = record_identity(req)
        if fallback ~= "" then metadata.dedup_key = fallback end
    end
    if input.content_type ~= nil and metadata.content_type == nil then metadata.content_type = input.content_type end
    return metadata
end

-- delete: remove the item keyed by the source identity. Upsert creates the item
-- with id = the write's record identity, so the retraction's same key locates it directly;
-- the declared delete input carries dedup_key as the fallback identity. Deleting
-- an already-absent item is a clean idempotent no-op (a retraction may be
-- redelivered after the item was resolved away), so the effect stays
-- result=deleted. Mirrors the kb_embed_sink delete discipline: the source
-- identity locates the item, no dest_ref is required.
local function delete_item(req: any, input: any): any
    local id = record_identity(req)
    if id == "" then id = trim(input.dedup_key) end
    if id == "" then return fail("delete requires the source item identity (identity_key, idempotency_key or dedup_key)") end
    local _, err = writer.delete(id, trim(req.idempotency_key))
    if err ~= nil and not errors.is(err, errors.NOT_FOUND) then
        if errors.is(err, errors.CONFLICT) then return fail(tostring(err), "idempotency_conflict", false, "item") end
        if errors.is(err, errors.PERMISSION_DENIED) then return fail(tostring(err), "permission_denied", false, "item") end
        return fail(tostring(err), "provider_error", true, "provider")
    end
    return receipt(req, "deleted", { item_id = id })
end

local function write(req: any): any
    req = type(req) == "table" and req or {}
    local _, origin_failure = writable_sink.origin(req)
    if origin_failure then return origin_failure end
    local config = type(req.config) == "table" and req.config or {}
    local input = type(req.input) == "table" and req.input or {}

    local sink_op = trim(req.sink_op)
    if sink_op == "" then sink_op = "upsert" end
    if sink_op == "delete" then return delete_item(req, input) end
    if sink_op ~= "upsert" then return fail("unsupported sink operation: " .. sink_op) end

    -- Content is the item body. A data flow supplies it as input.content from its
    -- source; a source-less scheduled action (a recurrent action posting a fixed note)
    -- has no upstream, so it supplies the body through config.content -- which the
    -- recurrent runtime also forwards as input.content. Accept either.
    local content = input.content
    if content == nil or content == "" then content = config.content end
    if content == nil or content == "" then return fail("write requires a body: set input.content or the sink's content config") end
    content = tostring(content)

    local item_type = trim(input.item_type)
    if item_type == "" then item_type = trim(config.item_type) end
    if item_type == "" then item_type = "notice" end
    local descriptor, type_err = item_types.get(item_type)
    if not descriptor then
        return fail(tostring(type_err), "invalid_request", false, "item")
    end

    local priority = trim(input.priority)
    if priority == "" then priority = trim(config.priority) end
    if priority == "" then priority = "normal" end
    if not VALID_PRIORITY[priority] then return fail("priority must be one of low, normal, high, urgent") end

    local title = trim(config.title)
    if title == "" then title = trim(input.title) end
    if title == "" then title = first_line(content) end
    if title == "" then return fail("write input.title or input.content is required") end

    local prefix = type(config.title_prefix) == "string" and config.title_prefix or ""
    if trim(prefix) ~= "" then title = prefix .. title end

    local source_id = trim(input.source_id)
    if source_id == "" then source_id = record_identity(req) end

    local data, err = writer.create({
        id = record_identity(req),
        item_type = item_type,
        title = title,
        content = content,
        priority = priority,
        metadata = metadata_of(input, req),
        source_id = source_id ~= "" and source_id or nil,
        idempotency_key = trim(req.idempotency_key),
        trace_context = type(req.trace_context) == "table" and req.trace_context
            or (type(input.trace_context) == "table" and input.trace_context or nil),
    })
    if err then
        if errors.is(err, errors.CONFLICT) then return fail(tostring(err), "idempotency_conflict", false, "item") end
        if errors.is(err, errors.PERMISSION_DENIED) then return fail(tostring(err), "permission_denied", false, "item") end
        return fail(tostring(err), "provider_error", true, "provider")
    end

    return receipt(req, data.outcome, { item_id = data.id, item_type = item_type })
end


return { write = write }
