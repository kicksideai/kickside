local registry = require("registry")

-- Upload Type Library - For discovering and validating upload types
local upload_type = {}

local function data(entry: any): { [string]: any }
    if type(entry) ~= "table" then return {} end
    if type(entry.data) == "table" then return entry.data :: { [string]: any } end
    return entry :: { [string]: any }
end

local function meta(entry: any): { [string]: any }
    if type(entry) == "table" and type(entry.meta) == "table" then
        return entry.meta :: { [string]: any }
    end
    return {}
end

local function priority(entry)
    local d = data(entry)
    local m = meta(entry)
    return tonumber(d.priority or m.priority) or 0
end

local function type_key(entry)
    local d = data(entry)
    local m = meta(entry)
    if d.type_key ~= nil then return tostring(d.type_key) end
    if m.type_key ~= nil then return tostring(m.type_key) end

    local id = tostring(entry and entry.id or "")
    local suffix = id:match(":types%.(.+)$")
    if suffix and suffix ~= "" then return suffix end
    return id
end

local function clone_entry(entry)
    local out = {}
    for k, v in pairs(entry or {}) do out[k] = v end
    if type(entry and entry.data) == "table" then
        out.data = {}
        for k, v in pairs(entry.data) do out.data[k] = v end
    end
    if type(entry and entry.meta) == "table" then
        out.meta = {}
        for k, v in pairs(entry.meta) do out.meta[k] = v end
    end
    return out
end

local function sort_by_priority(entries)
    table.sort(entries, function(a, b)
        local ap, bp = priority(a), priority(b)
        if ap ~= bp then return ap > bp end
        return tostring(a.id or "") < tostring(b.id or "")
    end)
end

local function find_upload_types()
    return registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = "upload.type"
    })
end

local function mime_matches(entry, mime_type)
    local d = data(entry)
    if type(d.mime_types) ~= "table" then return false end
    for _, mime in ipairs(d.mime_types) do
        if mime == mime_type or string.match(mime_type :: string, mime :: string) then
            return true
        end
    end
    return false
end

local function extension_matches(entry, file_ext)
    local d = data(entry)
    if type(d.extensions) ~= "table" then return false end
    local wanted = string.lower(tostring(file_ext or ""))
    for _, ext in ipairs(d.extensions) do
        if string.lower(tostring(ext)) == wanted then
            return true
        end
    end
    return false
end

local function best_match(types, predicate)
    local matches = {}
    for _, entry in ipairs(types) do
        if predicate(entry) then table.insert(matches, entry) end
    end
    if #matches == 0 then return nil end
    sort_by_priority(matches)
    return matches[1]
end

local function append_unique(list, seen, values)
    if type(values) ~= "table" then return end
    for _, value in ipairs(values) do
        local key = string.lower(tostring(value))
        if not seen[key] then
            seen[key] = true
            table.insert(list, value)
        end
    end
end

local function merge_group(entries)
    sort_by_priority(entries)

    local primary = entries[1]
    local merged = clone_entry(primary)
    merged.data = merged.data or {}
    merged.data.type_key = type_key(primary)
    merged.data.priority = priority(primary)

    local extensions, seen_ext = {}, {}
    local mime_types, seen_mime = {}, {}
    local fragments = {}
    for _, entry in ipairs(entries) do
        local d = data(entry)
        append_unique(extensions, seen_ext, d.extensions)
        append_unique(mime_types, seen_mime, d.mime_types)
        table.insert(fragments, {
            id = entry.id,
            priority = priority(entry),
            pipeline = d.pipeline,
        })
    end

    merged.data.extensions = extensions
    merged.data.mime_types = mime_types
    merged.data.fragments = fragments
    return merged
end

-- Find an upload type by MIME type or file extension
function upload_type.find_by_mime_or_ext(mime_type, file_ext)
    if not mime_type and not file_ext then
        return nil, "Either MIME type or file extension is required"
    end

    local types, err = find_upload_types()
    if err then
        return nil, "Failed to find upload types: " .. err
    end

    local extension_entry = nil
    if file_ext and file_ext ~= "" then
        extension_entry = best_match(types, function(candidate)
            return extension_matches(candidate, file_ext)
        end)
    end

    if mime_type and mime_type ~= "" then
        local entry = best_match(types, function(candidate)
            return mime_matches(candidate, mime_type)
        end)
        if entry and (not extension_entry or type_key(entry) ~= "generic") then
            return entry
        end
    end

    if extension_entry then
        return extension_entry
    end

    return nil, "No matching upload type found"
end

-- Get a specific upload type by ID
function upload_type.get_by_id(type_id)
    if not type_id or type_id == "" then
        return nil, "Type ID is required"
    end

    -- Get the entry directly
    local entry, err = registry.get(type_id)
    if not entry then
        return nil, "Upload type not found: " .. (err or "unknown error")
    end

    -- Validate that it's an upload type
    if not entry.meta or entry.meta.type ~= "upload.type" then
        return nil, "Invalid upload type: " .. type_id
    end

    return entry
end

-- Get complete pipeline stages with all properties for a type
-- Universal stages are dropped in declaratively by any module: a registry.entry with
-- the given meta.type and scope = universal. meta.type "upload.stage" runs after a
-- type's own processing on EVERY upload; "upload.delete_stage" runs on EVERY upload
-- delete -- so a module can observe completed/deleted uploads (e.g. file or reap a
-- workspace component) without the uploads module knowing it exists. Priority desc.
local function discover_universal(meta_type: string, function_field: string?)
    local entries, err = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = meta_type })
    if err then return nil, err end
    local field = function_field or "func"
    local stages = {}
    for _, e in ipairs(entries or {}) do
        local d = data(e)
        local scope = tostring(d.scope or meta(e).scope or "")
        local func = d[field] or meta(e)[field]
        if (scope == "universal" or scope == "all") and func then
            stages[#stages + 1] = { id = tostring(e.id or ""), func = tostring(func), title = d.title or "stage", priority = priority(e) }
        end
    end
    table.sort(stages, function(a, b)
        if a.priority ~= b.priority then return a.priority > b.priority end
        return a.id < b.id
    end)
    return stages
end

function upload_type.get_pipeline(type_id)
    local entry, err = upload_type.get_by_id(type_id)
    if not entry then
        return nil, err
    end

    -- A type's own stages first, then the universally-dropped-in stages. A type may
    -- carry no stages of its own (a catch-all): universal stages still run.
    local pipeline = {}
    if entry.data and type(entry.data.pipeline) == "table" then
        for _, s in ipairs(entry.data.pipeline) do pipeline[#pipeline + 1] = s end
    end
    local universal, universal_err = discover_universal("upload.stage")
    if universal_err then return nil, universal_err end
    for _, s in ipairs(universal) do
        pipeline[#pipeline + 1] = { func = s.func, title = s.title }
    end
    return pipeline
end

-- Optional archive preparation on existing universal stages runs before fan-out.
function upload_type.get_archive_preparers()
    return discover_universal("upload.stage", "prepare_archive")
end

-- Get on_delete lifecycle stages for a type
function upload_type.get_on_delete(type_id)
    local list = {}
    local entry = upload_type.get_by_id(type_id)
    if entry and entry.data and type(entry.data.on_delete) == "table" then
        for _, s in ipairs(entry.data.on_delete) do list[#list + 1] = s end
    end
    -- Universally-dropped-in delete stages run on every upload delete (e.g. reap the
    -- workspace file component that pointed at it).
    local universal, universal_err = discover_universal("upload.delete_stage")
    if universal_err then return nil, universal_err end
    for _, s in ipairs(universal) do
        list[#list + 1] = { func = s.func, title = s.title }
    end
    return list
end

function upload_type.declared_ids(): ({ string }?, string?)
    local entries, err = find_upload_types()
    if err then return nil, "Failed to list upload types: " .. tostring(err) end
    local ids: { string } = {}
    for _, entry in ipairs(entries or {}) do ids[#ids + 1] = tostring(entry.id) end
    table.sort(ids)
    return ids, nil
end

-- Get all available upload types
function upload_type.list_all()
    local types, err = find_upload_types()
    if err then
        return nil, "Failed to list upload types: " .. err
    end

    local groups = {}
    for _, entry in ipairs(types) do
        local key = type_key(entry)
        groups[key] = groups[key] or {}
        table.insert(groups[key], entry)
    end

    local merged = {}
    for _, entries in pairs(groups) do
        table.insert(merged, merge_group(entries))
    end
    sort_by_priority(merged)
    return merged
end

return upload_type
