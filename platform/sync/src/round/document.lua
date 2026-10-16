-- The content document a sync writes to a content-shaped sink: the transform
-- output's content under metadata naming the source item (item_key,
-- dedup_key, source_version), the owning sync (sync_origin) and its provenance
-- source_ref; a delete carries the item identity and metadata alone.

local source_ref_builder = require("source_ref_builder")

local M = {}

type Map = { [string]: any }

local function trim(v: any): string
    if type(v) ~= "string" then return "" end
    return ((v :: string):gsub("^%s+", ""):gsub("%s+$", ""))
end

local function copy(input: any): Map
    local out: Map = {}
    if type(input) == "table" then
        for k, v in pairs(input :: Map) do out[k] = v end
    end
    return out
end

local function origin_type(source_ref: Map): string
    if type(source_ref.origin) == "table" then
        local from_object = trim((source_ref.origin :: any).type)
        if from_object ~= "" then return from_object end
    end
    local from_flat = trim(source_ref.origin)
    if from_flat ~= "" then return from_flat end
    return "sync"
end

local function origin_id(source_ref: Map, item_key: string, source_external_id: string): string
    if type(source_ref.origin) == "table" then
        local from_object = trim((source_ref.origin :: any).id)
        if from_object ~= "" then return from_object end
    end
    local from_flat = trim(source_ref.id)
    if from_flat ~= "" then return from_flat end
    if item_key ~= "" then return item_key end
    return source_external_id
end

-- build(out, item, owner, sink_op) -> the document input. out is the content
-- transform output ({ content, content_type?, metadata?, ... }); item is the
-- source item ({ item_key, dedup_key, source_version? }); owner is the sync's
-- automation id.
function M.build(out: Map, item: Map, owner: string, sink_op: string): (Map?, error?)
    local md = copy(out.metadata)
    md.item_key = item.item_key
    md.dedup_key = item.dedup_key
    if type(item.source_version) == "string" and item.source_version ~= "" then md.source_version = item.source_version end
    if owner ~= "" then md.sync_origin = owner end
    local source_ref_input: Map = copy(md.source_ref)
    local item_key = trim(item.item_key)
    local dedup_key = trim(item.dedup_key)
    local source_external_id = trim(source_ref_input.external_id)
    if source_external_id == "" then source_external_id = dedup_key ~= "" and dedup_key or item_key end
    local source_ref, ref_err = source_ref_builder.build({
        base = source_ref_input,
        fields = { external_id = source_external_id },
        origin_type = origin_type(source_ref_input),
        origin_id = origin_id(source_ref_input, item_key, source_external_id),
        sync_id = owner ~= "" and owner or nil,
    })
    if ref_err or not source_ref then return nil, ref_err end
    md.source_ref = source_ref
    if sink_op == "delete" then
        return { item_key = item.item_key, dedup_key = item.dedup_key, metadata = md }, nil
    end
    local input: Map = { content = out.content, content_type = out.content_type or "text/plain", metadata = md }
    for k, v in pairs(out) do if input[k] == nil then input[k] = v end end
    return input, nil
end

return M
