-- Reusable transform snippets: a confirmed (source_schema -> sink_schema)
-- transform, keyed by a structural fingerprint of the two schemas so the same
-- shape pairing reuses a proven artifact instead of regenerating it.
--
-- A snippet is a registry.entry with meta.type = SNIPPET_TYPE carrying the two
-- fingerprints (for lookup) and the confirmed strategy + artifact (in data).
-- There is no central list: search resolves purely by fingerprint via
-- registry.find.

local json = require("json")
local production_registry = require("registry")
local error_envelope = require("error_envelope")

local function construct(dependencies: any): any
local registry = dependencies.registry

local M = {}

type Map = { [string]: any }

M.SNIPPET_TYPE = "kickside.transform:snippet"
local SNIPPET_NS = "kickside.transform.snippets"

-- Structural signature: the set of "path:type" pairs a JSON schema declares,
-- walked over properties/items recursively, with keys sorted so the same shape
-- always yields the same signature regardless of declaration order. type-less
-- nodes contribute their path with type "any".
local function collect(node: any, path: string, out: {string})
    if type(node) ~= "table" then return end
    local n = node :: Map
    local t = type(n.type) == "string" and (n.type :: string) or "any"
    out[#out + 1] = path .. ":" .. t
    if type(n.properties) == "table" then
        local keys: {string} = {}
        for k, _ in pairs(n.properties :: Map) do keys[#keys + 1] = tostring(k) end
        table.sort(keys)
        for _, k in ipairs(keys) do
            collect((n.properties :: Map)[k], path .. "." .. k, out)
        end
    end
    if type(n.items) == "table" then
        collect(n.items, path .. "[]", out)
    end
end

local function decode_schema(schema: any, field: string): (any, error?)
    if type(schema) == "string" then
        if (schema :: string) == "" then return {} end
        local d, derr = json.decode(schema :: string)
        if derr then
            return nil, (errors.new({kind = errors.INVALID, retryable = false, message = "invalid schema JSON",
                details = {code = "transform_schema_invalid", field = field, cause = error_envelope.encode(derr)}}) :: error)
        end
        return d
    end
    return type(schema) == "table" and schema or {}
end

-- fingerprint(schema) -> stable hex string. FNV-1a over the sorted structural
-- signature: deterministic, dependency-free, and short enough for a registry id
-- fragment.
function M.fingerprint(schema: any, field: string?): (string?, error?)
    local decoded, decode_err = decode_schema(schema, field or "schema")
    if decode_err then return nil, decode_err end
    local parts: {string} = {}
    collect(decoded, "$", parts)
    table.sort(parts)
    local sig = table.concat(parts, "|")

    local hash: number = 2166136261
    for i = 1, #sig do
        hash = (hash ~ sig:byte(i)) & 0xFFFFFFFF
        hash = (hash * 16777619) & 0xFFFFFFFF
    end
    return string.format("%08x", hash)
end

local function entry_data(entry: any): Map
    if type(entry) ~= "table" then return {} end
    local e = entry :: Map
    if type(e.data) == "table" then return e.data :: Map end
    return e
end

-- search_snippet(source_schema, sink_schema) -> (snippet | nil, err?). Resolves by
-- the two fingerprints; returns the confirmed { strategy, artifact, source_fp,
-- sink_fp } or nil when none is published for this shape pair.
function M.search_snippet(source_schema: any, sink_schema: any): (Map?, error?)
    local source_fp, source_err = M.fingerprint(source_schema, "source_schema")
    if source_err then return nil, source_err end
    local sink_fp, sink_err = M.fingerprint(sink_schema, "sink_schema")
    if sink_err then return nil, sink_err end
    local found, err = registry.find({
        ["meta.type"] = M.SNIPPET_TYPE,
        ["meta.source_fp"] = source_fp,
        ["meta.sink_fp"] = sink_fp,
    })
    if err then return nil, err end
    if type(found) ~= "table" or #(found :: {any}) == 0 then return nil, nil end
    local d = entry_data((found :: {any})[1])
    return {
        id = tostring(((found :: {any})[1] :: Map).id or ""),
        source_fp = source_fp,
        sink_fp = sink_fp,
        strategy = tostring(d.strategy or ""),
        artifact = d.artifact,
        rationale = tostring(d.rationale or ""),
    }, nil
end

-- publish_snippet(artifact, source_schema, sink_schema, opts) -> (snippet, err?).
-- Declares (or overwrites) the registry entry so a confirmed transform becomes
-- reusable for its shape pair. opts carries strategy (required) and rationale.
function M.publish_snippet(artifact: any, source_schema: any, sink_schema: any, opts: any): (Map?, error?)
    local o = type(opts) == "table" and (opts :: Map) or {}
    local strategy = tostring(o.strategy or "")
    if strategy == "" then return nil, (errors.new({kind = errors.INVALID, retryable = false,
        message = "publish_snippet requires opts.strategy", details = {code = "transform_snippet_invalid", field = "strategy"}}) :: error) end
    if artifact == nil then return nil, (errors.new({kind = errors.INVALID, retryable = false,
        message = "publish_snippet requires an artifact", details = {code = "transform_snippet_invalid", field = "artifact"}}) :: error) end

    local source_fp, source_err = M.fingerprint(source_schema, "source_schema")
    if source_err then return nil, source_err end
    local sink_fp, sink_err = M.fingerprint(sink_schema, "sink_schema")
    if sink_err then return nil, sink_err end
    local id = SNIPPET_NS .. ":" .. (source_fp :: string) .. "_" .. (sink_fp :: string)

    local entry = {
        id = id,
        kind = "registry.entry",
        meta = {
            type = M.SNIPPET_TYPE,
            source_fp = source_fp,
            sink_fp = sink_fp,
            strategy = strategy,
            comment = "Confirmed Data Sync transform, reusable for this source/sink shape pair.",
        },
        data = {
            strategy = strategy,
            artifact = artifact,
            rationale = tostring(o.rationale or ""),
            source_fp = source_fp,
            sink_fp = sink_fp,
        },
    }

    local snap, serr = registry.snapshot()
    if serr then return nil, serr end
    if not snap then return nil, (errors.new({kind = errors.UNAVAILABLE, retryable = true,
        message = "registry snapshot unavailable", details = {code = "registry_snapshot_missing"}}) :: error) end
    local changes = snap:changes()
    local existing, ferr = registry.find({ ["meta.type"] = M.SNIPPET_TYPE, ["meta.source_fp"] = source_fp, ["meta.sink_fp"] = sink_fp })
    if ferr then return nil, ferr end
    if type(existing) == "table" and #(existing :: {any}) > 0 then
        changes:update(entry)
    else
        changes:create(entry)
    end
    local _, aerr = changes:apply()
    if aerr then return nil, aerr end

    return { id = id, source_fp = source_fp, sink_fp = sink_fp, strategy = strategy, artifact = artifact }, nil
end

M.new = construct
return M
end
return construct({registry = production_registry})
