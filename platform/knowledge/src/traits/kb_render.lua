local ctx = require("ctx")
local component = require("component")

-- Shared presentation/resolution helpers for the KB agent tools: id/label
-- rendering, limit normalization, kb_id resolution from args + tool context, and the
-- access gate. Used by both the generic dispatch tools (kb_tools) and the node/graph
-- tools (kb10 node_tools) so every KB tool renders the same vocabulary and gates the
-- same way.
local M = {}

local MAX_LIMIT = 50
M.MAX_LIMIT = MAX_LIMIT

-- The id, verbatim. Node lookups (GetKBNode / TraverseKBGraph) are EXACT, so result
-- rows must carry the full id for the agent to drill — a truncated prefix lets it read
-- snippets but never follow up. Leanness comes from dropping the JSON envelope + unused
-- keys, not from shortening ids.
local function id_str(id: any): string
    return (type(id) == "string") and (id :: string) or tostring(id)
end

-- A node's human label: title, label or name from metadata, verbatim; a node
-- without one is labelled by its whole content.
local function node_label(node: any): string
    local n = (type(node) == "table") and (node :: { metadata: any, content: any }) or {}
    local meta = (type(n.metadata) == "table") and (n.metadata :: { [string]: any }) or {}
    for _, key in ipairs({ "title", "label", "name" }) do
        local v = meta[key]
        if type(v) == "string" and v ~= "" then return v :: string end
    end
    return (type(n.content) == "string") and (n.content :: string) or ""
end

-- The one canonical result row every KB tool renders, so the agent sees a single
-- `<id> [<type>] · <title>` vocabulary everywhere; node_type is optional.
local function result_line(id: any, title: any, node_type: string?): string
    local line = "- " .. id_str(id)
    if node_type and node_type ~= "" then line = line .. " [" .. node_type .. "]" end
    local t = (type(title) == "string") and (title :: string) or ""
    if t ~= "" then line = line .. " · " .. t end
    return line
end

-- A modest default the tool layer applies when the agent omits a limit, so every
-- store read is bounded here rather than relying on the store's own fallback (which
-- would fetch up to 50 rows with content). MAX_LIMIT stays the hard ceiling.
local DEFAULT_LIMIT = 25
local function norm_limit(v: any): integer
    if type(v) ~= "number" or v ~= math.floor(v) then return DEFAULT_LIMIT end
    local n = v :: integer
    if n < 1 then return 1 end
    if n > MAX_LIMIT then return MAX_LIMIT end
    return n
end

-- The kb_id(s) a tool acts on: an explicit arg wins, else the KBs pinned via the
-- KB picker (the kb_reader trait). The agent runtime delivers the trait/tool
-- context through the ctx module (the compiler binds trait_contexts onto the
-- executor ctx), so pinned ids are read via ctx.get — the positional context is
-- the unit-test injection seam.
local function single_id(v: any): string?
    if type(v) == "table" and #v == 1 and type(v[1]) == "string" and v[1] ~= "" then return v[1] :: string end
    return nil
end

-- Every non-empty string id in a list, in order (the full pinned set).
local function list_ids(v: any): { string }
    local out: { string } = {}
    if type(v) == "table" then
        for _, x in ipairs(v :: { any }) do
            if type(x) == "string" and x ~= "" then out[#out + 1] = x :: string end
        end
    end
    return out
end

-- The full set of KBs a search/survey acts on: an explicit kb_id (one) wins, else
-- a single pinned kb_id (one), else the full pinned kb_ids list (one OR many),
-- else the unit-test context fallbacks. SearchKB/SurveyKB span every id returned.
local function pick_kb_ids(args: any, context: any): { string }
    local a = (type(args) == "table") and (args :: { kb_id: any }) or {}
    if type(a.kb_id) == "string" and a.kb_id ~= "" then return { a.kb_id :: string } end
    local from_ctx = ctx.get("kb_id")
    if type(from_ctx) == "string" and from_ctx ~= "" then return { from_ctx :: string } end
    local from_ids = list_ids(ctx.get("kb_ids"))
    if #from_ids > 0 then return from_ids end
    local c = (type(context) == "table") and (context :: { kb_id: any, kb_ids: any }) or {}
    if type(c.kb_id) == "string" and c.kb_id ~= "" then return { c.kb_id :: string } end
    return list_ids(c.kb_ids)
end

-- The single kb_id a node-targeted tool acts on: an explicit arg wins, else the
-- lone configured KB. Several configured with no kb_id is unambiguous only to the
-- caller, so it resolves to nil and the tool surfaces the ambiguity (require_kb).
local function pick_kb_id(args: any, context: any): string?
    local a = (type(args) == "table") and (args :: { kb_id: any }) or {}
    if type(a.kb_id) == "string" and a.kb_id ~= "" then return a.kb_id :: string end
    local from_ctx = ctx.get("kb_id")
    if type(from_ctx) == "string" and from_ctx ~= "" then return from_ctx :: string end
    local from_ids = single_id(ctx.get("kb_ids"))
    if from_ids then return from_ids end
    local c = (type(context) == "table") and (context :: { kb_id: any, kb_ids: any }) or {}
    if type(c.kb_id) == "string" and c.kb_id ~= "" then return c.kb_id :: string end
    return single_id(c.kb_ids)
end

-- Node-targeted tools (GetKBNode / BrowseKB / TraverseKBGraph) read ONE node or
-- subtree, so they need exactly one KB. Returns (kb_id, nil) when a single KB
-- resolves, else (nil, err): a requirement when none is configured, and a
-- choice-naming reason when several are — never an unhelpful bare line for the
-- multi-KB case, since the agent must know which @kbid (from QueryKB rows) to pass.
local function require_kb(args: any, context: any): (string?, error?)
    local id = pick_kb_id(args, context)
    if id then return id, nil end
    local ids = pick_kb_ids(args, context)
    if #ids >= 2 then
        return nil, errors.new({ kind = errors.INVALID, message = "kb_id is required — several KBs are configured: "
            .. table.concat(ids, ", ")
            .. ". Pass kb_id (the @kbid from QueryKB results)." })
    end
    return nil, errors.new({ kind = errors.INVALID, message = "kb_id is required" })
end

-- Read gate preserves the component access failure and returns nil on access.
local function deny(kb_id: any): error?
    if type(kb_id) ~= "string" or kb_id == "" then return errors.new({ kind = errors.INVALID, message = "kb_id is required" }) end
    local _, err = component.validate_access(kb_id :: string, component.ACCESS.READ)
    if err then return err end
    return nil
end

local function requested_fields(value: any): ({ [string]: boolean }?, error?)
    if value == nil then return {}, nil end
    if type(value) ~= "table" then
        return nil, errors.new({ kind = errors.INVALID, message = "fields must be an array of field names" })
    end
    local fields: { [string]: boolean } = {}
    for _, field in ipairs(value :: { any }) do
        if type(field) ~= "string" or field == "" then
            return nil, errors.new({ kind = errors.INVALID, message = "fields must contain non-empty field names" })
        end
        fields[field] = true
    end
    return fields, nil
end

local function selected(summary: any, source: any, fields: { [string]: boolean }): any
    local out = summary
    local row = type(source) == "table" and source or {}
    for field, _ in pairs(fields) do
        if row[field] ~= nil then out[field] = row[field] end
    end
    return out
end

local function result_summary(raw: any, kb_id: string?, fields: { [string]: boolean }): any
    local row = type(raw) == "table" and raw or {}
    local meta = type(row.meta) == "table" and row.meta or {}
    local metadata = type(row.metadata) == "table" and row.metadata
        or (type(meta.metadata) == "table" and meta.metadata or {})
    local title = row.title or metadata.title or metadata.label or metadata.name
    local result: any = { id = row.id }
    if kb_id then result.kb_id = kb_id end
    if title ~= nil then result.title = title end
    local score = row.score or row.similarity or meta.score or meta.similarity
    if score ~= nil then result.score = score end
    if row.snippet ~= nil then result.snippet = row.snippet end
    return selected(result, row, fields)
end

M.id_str = id_str
M.node_label = node_label
M.result_line = result_line
M.norm_limit = norm_limit
M.pick_kb_ids = pick_kb_ids
M.pick_kb_id = pick_kb_id
M.require_kb = require_kb
M.deny = deny
M.requested_fields = requested_fields
M.selected = selected
M.result_summary = result_summary

return M
