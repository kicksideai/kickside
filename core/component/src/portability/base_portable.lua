-- Pure domain for component portability. Turns a component's shell into a portable
-- envelope (the component.json record) and reconstructs the import-time
-- private_context from one. No I/O: callers (the contract impls and the coordinator)
-- own storage, the registry, and component lifecycle.
--
-- Security model (the reason this is its own tested unit):
--   * The exported envelope NEVER contains credential_schema keys, at ANY nesting
--     depth (deep strip).
--   * On import, the TRUSTED, locally-installed binding metadata (portable_schema +
--     credential_schema) — never the blob's own claims — decides what is allowed:
--     the envelope context is re-filtered through the trusted allowlist, and the
--     slots come from the trusted schema. A hostile blob cannot inject extra keys,
--     declare new slots, or write to arbitrary private_context paths.
--   * component_ref slots resolve strictly through the coordinator's id_map; an
--     unresolved reference errors rather than persisting a dead/foreign id.

local M = {}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID }) :: error)
end

M.SCHEMA_VERSION = 1
local OWNER_META_KEY = "owner"

-- Display metadata that is always safe to carry. A binding may extend this with
-- reconstruction config via portable_schema.meta (e.g. KB declares kb_type,
-- embedding_model). Everything else (owner, access, internal flags) is dropped.
local SAFE_META: { [string]: boolean } = {
    title = true, name = true, class = true, provider = true,
    group = true, icon = true, comment = true, tags = true,
}

-- Credential field keys declared by a binding's credential_schema. Always excluded
-- from the envelope and always surfaced as credential slots to fill on import.
function M.credential_keys(credential_schema: any): { string }
    if type(credential_schema) ~= "table" then return {} end
    local fields = (credential_schema :: any).fields
    if type(fields) ~= "table" then return {} end
    local out: { string } = table.create(#(fields :: { any }), 0)
    for _, f in ipairs(fields :: { any }) do
        if type(f) == "table" and type((f :: any).key) == "string" and (f :: any).key ~= "" then
            out[#out + 1] = (f :: any).key :: string
        end
    end
    return out
end

-- Deep copy a value, recursively dropping any string key present in cred. Used so a
-- credential nested inside the context (e.g. { settings = { api_key = "x" } }) can
-- never ride along.
local function deep_clean(v: any, cred: { [string]: boolean }): any
    if type(v) ~= "table" then return v end
    local out: { [string]: any } = {}
    for k, val in pairs(v :: { [string]: any }) do
        if not (type(k) == "string" and cred[k]) then
            (out :: any)[k] = deep_clean(val, cred)
        end
    end
    return out
end

-- Remove the value at a "/a/b/c" pointer if present. No-op on a missing/scalar path.
local function delete_path(t: any, path: any)
    if type(t) ~= "table" or type(path) ~= "string" or path == "" then return end
    local parts: { string } = {}
    for seg in string.gmatch(path, "[^/]+") do parts[#parts + 1] = seg end
    if #parts == 0 then return end
    local node: any = t
    for i = 1, #parts - 1 do
        if type(node[parts[i]]) ~= "table" then return end
        node = node[parts[i]]
    end
    node[parts[#parts]] = nil
end

-- The portable subset of private_context per portable_schema.context (true = every
-- key; { keys } = only those; absent = nothing), deep-copied and recursively stripped
-- of credential keys at every level.
function M.portable_context(private_context: any, portable_schema: any, cred_keys: { string }): { [string]: any }
    if type(private_context) ~= "table" then return {} end
    local cred: { [string]: boolean } = {}
    for _, k in ipairs(cred_keys) do cred[k] = true end

    local rule: any = type(portable_schema) == "table" and (portable_schema :: any).context or nil
    local picked: { [string]: any } = {}
    if rule == true then
        for k, v in pairs(private_context :: { [string]: any }) do
            if type(k) == "string" and not cred[k] then picked[k] = v end
        end
    elseif type(rule) == "table" then
        for _, k in ipairs(rule :: { any }) do
            if type(k) == "string" and not cred[k] and (private_context :: any)[k] ~= nil then
                picked[k] = (private_context :: any)[k]
            end
        end
    end
    local cleaned = deep_clean(picked, cred) :: { [string]: any }
    -- Declared references travel ONLY as slots (re-bound on import), never as raw
    -- context, so a dead/foreign source id can never persist.
    if type(portable_schema) == "table" and type((portable_schema :: any).refs) == "table" then
        for _, r in ipairs((portable_schema :: any).refs :: { any }) do
            if type(r) == "table" then
                delete_path(cleaned, (r :: any).path or ("/" .. tostring((r :: any).key)))
            end
        end
    end
    return cleaned
end

-- meta filtered to the safe display set plus any binding-declared portable_schema.meta
-- keys. owner/access/internal keys never travel.
function M.portable_meta(meta: any, portable_schema: any): { [string]: any }
    local out: { [string]: any } = {}
    if type(meta) ~= "table" then return out end
    local allow: { [string]: boolean } = {}
    for k in pairs(SAFE_META) do allow[k] = true end
    if type(portable_schema) == "table" and type((portable_schema :: any).meta) == "table" then
        for _, k in ipairs((portable_schema :: any).meta :: { any }) do
            if type(k) == "string" then allow[k] = true end
        end
    end
    for k, v in pairs(meta :: { [string]: any }) do
        if type(k) == "string" and k ~= OWNER_META_KEY and allow[k] then out[k] = v end
    end
    return out
end

-- The slots an importer must fill: one credential slot per credential key, plus the
-- declared component_ref slots from portable_schema.refs.
function M.slots(portable_schema: any, cred_keys: { string }): { any }
    local out: { any } = {}
    for _, k in ipairs(cred_keys) do
        out[#out + 1] = { key = k, kind = "credential", required = true }
    end
    if type(portable_schema) == "table" and type((portable_schema :: any).refs) == "table" then
        for _, r in ipairs((portable_schema :: any).refs :: { any }) do
            if type(r) == "table" and type((r :: any).key) == "string" then
                out[#out + 1] = {
                    key = (r :: any).key,
                    kind = "component_ref",
                    path = (r :: any).path,
                    contract = (r :: any).contract,
                    required = (r :: any).required == true,
                }
            end
        end
    end
    return out
end

-- Build the component.json envelope for one component from its live shell + the
-- binding's static schema.
function M.build_envelope(opts: any): { [string]: any }
    local cred_keys = M.credential_keys((opts :: any).credential_schema)
    return {
        schema_version = M.SCHEMA_VERSION,
        source_component_id = (opts :: any).source_component_id,
        impl_id = (opts :: any).impl_id,
        meta = M.portable_meta((opts :: any).meta, (opts :: any).portable_schema),
        context = M.portable_context((opts :: any).private_context, (opts :: any).portable_schema, cred_keys),
        slots = M.slots((opts :: any).portable_schema, cred_keys),
    }
end

-- Parse + validate an envelope table. Returns (envelope, nil) or (nil, err).
function M.parse_envelope(t: any): (any, error?)
    if type(t) ~= "table" then return nil, invalid("envelope is not a table") end
    if (t :: any).schema_version ~= M.SCHEMA_VERSION then
        return nil, invalid("unsupported envelope schema_version " .. tostring((t :: any).schema_version))
    end
    if type((t :: any).impl_id) ~= "string" or (t :: any).impl_id == "" then
        return nil, invalid("envelope missing impl_id")
    end
    return t, nil
end

-- Set a value at a "/a/b/c" pointer inside a table. Strict: rejects empty/root paths
-- and refuses to overwrite a non-table intermediate. Returns (true) or (false, err).
function M.set_path(t: any, path: any, value: any): (boolean, error?)
    if type(t) ~= "table" then return false, invalid("set_path: target is not a table") end
    if type(path) ~= "string" or path == "" or path == "/" then return false, invalid("set_path: empty or root path") end
    local parts: { string } = {}
    for seg in string.gmatch(path, "[^/]+") do parts[#parts + 1] = seg end
    if #parts == 0 then return false, invalid("set_path: no path segments") end
    local node: any = t
    for i = 1, #parts - 1 do
        local k = parts[i]
        if node[k] == nil then
            node[k] = {}
        elseif type(node[k]) ~= "table" then
            return false, invalid("set_path: non-table at segment `" .. k .. "`")
        end
        node = node[k]
    end
    node[parts[#parts]] = value
    return true, nil
end

-- Build the private_context for a NEW component from an envelope, driven by the
-- TRUSTED locally-installed schema (portable_schema + credential_schema), never the
-- blob's own slot claims. The envelope context is re-filtered through the trusted
-- allowlist; slot_values fill the trusted slots; component_ref slots resolve strictly
-- through id_map.components. Returns (context, nil) or (nil, err).
function M.resolve_context(portable_schema: any, credential_schema: any, envelope: any, slot_values: any, id_map: any): (any, error?)
    local cred_keys = M.credential_keys(credential_schema)
    local env_ctx: any = type(envelope) == "table" and (envelope :: any).context or nil
    local ctx = M.portable_context(env_ctx, portable_schema, cred_keys)

    local declared: { [string]: any } = {}
    for _, s in ipairs(M.slots(portable_schema, cred_keys)) do declared[(s :: any).key] = s end

    local values: { [string]: any } = type(slot_values) == "table" and (slot_values :: { [string]: any }) or {}
    for k in pairs(values) do
        if not declared[k] then return nil, invalid("unknown slot `" .. tostring(k) .. "`") end
    end

    local comp_map: { [string]: any } = {}
    if type(id_map) == "table" and type((id_map :: any).components) == "table" then
        comp_map = (id_map :: any).components :: { [string]: any }
    end
    for key, s in pairs(declared) do
        local provided: any = values[key]
        if (s :: any).kind == "component_ref" then
            if provided ~= nil then
                local mapped: any = comp_map[provided]
                if mapped == nil then
                    return nil, invalid("component_ref `" .. tostring(key) .. "` -> `" .. tostring(provided) .. "` is not resolved (absent from id_map)")
                end
                local ok, err = M.set_path(ctx, (s :: any).path or ("/" .. key), mapped)
                if not ok then return nil, err end
            elseif (s :: any).required then
                return nil, invalid("required ref slot `" .. tostring(key) .. "` not provided")
            end
        else
            if provided ~= nil then
                ctx[key] = provided
            elseif (s :: any).required then
                return nil, invalid("required credential slot `" .. tostring(key) .. "` not provided")
            end
        end
    end

    return ctx, nil
end

return M
