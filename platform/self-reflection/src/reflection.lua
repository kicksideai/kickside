local keyset = require("keyset")

local M = {}

local DEFAULT_KINDS = {
    "ns.definition",
    "ns.dependency",
    "registry.entry",
    "contract.definition",
    "contract.binding",
    "function.lua",
    "library.lua",
    "http.endpoint",
    "http.router",
    "security.policy",
    "security.scope",
}

local OVERVIEW_TYPES = {
    { key = "modules", kind = "ns.definition" },
    { key = "dependencies", kind = "ns.dependency" },
    { key = "nav_items", kind = "registry.entry", meta_type = "ui.nav_item" },
    { key = "view_components", kind = "registry.entry", meta_type = "view.component" },
    { key = "agent_traits", kind = "registry.entry", meta_type = "agent.trait" },
    { key = "tools", kind = "function.lua", meta_type = "tool" },
    { key = "endpoints", kind = "http.endpoint" },
    { key = "policies", kind = "security.policy" },
}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function lower(value: any): string
    return string.lower(trim(value))
end

local function limit_of(args: any, fallback: integer, max: integer): integer
    local n = tonumber(args and args.limit)
    if not n or n < 1 then return fallback end
    if n > max then return max end
    return math.floor(n)
end

local function namespace_of(id: any): string
    if type(id) ~= "string" then return "" end
    return id:match("^(.-):") or ""
end

local function increment(map: any, key: string)
    local current = tonumber(map[key]) or 0
    map[key] = current + 1
end

local function text_blob(value: any, depth: integer, parts: any): any
    parts = parts or {}
    if depth <= 0 or value == nil then return parts end
    local t = type(value)
    if t == "string" or t == "number" or t == "boolean" then
        parts[#parts + 1] = tostring(value)
    elseif t == "table" then
        for k, v in pairs(value) do
            parts[#parts + 1] = tostring(k)
            text_blob(v, depth - 1, parts)
        end
    end
    return parts
end

local function matches_query(entry: any, q: string): boolean
    if q == "" then return true end
    local parts = {
        tostring(entry.id or ""),
        tostring(entry.kind or entry[".kind"] or ""),
    }
    text_blob(entry.meta, 3, parts)
    text_blob(entry.data, 2, parts)
    return lower(table.concat(parts, " ")):find(q, 1, true) ~= nil
end

local function matches_namespace(entry: any, namespace: string): boolean
    if namespace == "" then return true end
    local id = tostring(entry.id or "")
    return id:sub(1, #namespace) == namespace
end

local function entry_kind(entry: any): string
    return tostring(entry.kind or entry[".kind"] or "")
end

local function matches_kind(entry: any, kind: string): boolean
    return kind == "" or entry_kind(entry) == kind
end

local function matches_meta_type(entry: any, meta_type: string): boolean
    if meta_type == "" then return true end
    local meta = entry.meta or {}
    return meta.type == meta_type
end

local function find_entries(port: any, query: any): (any, error?)
    local entries, err = port.find(query)
    if err then return nil, err end
    return entries or {}, nil
end

local function all_entries(port: any): (any, error?)
    local out = {}
    local seen = {}
    for _, kind in ipairs(DEFAULT_KINDS) do
        local entries, err = find_entries(port, { [".kind"] = kind })
        if err then return nil, err end
        for _, entry in ipairs(entries) do
            local id = tostring(entry.id or "")
            local key = id .. "\n" .. entry_kind(entry)
            if id ~= "" and not seen[key] then
                seen[key] = true
                out[#out + 1] = entry
            end
        end
    end
    return out, nil
end

function M.summarize_entry(entry: any, opts: any): any
    opts = opts or {}
    local meta = entry.meta or {}
    local data = entry.data or {}
    local id = tostring(entry.id or "")
    local row = {
        id = id,
        namespace = namespace_of(id),
        kind = entry_kind(entry),
        type = meta.type,
        title = meta.title or meta.name or data.title,
        comment = meta.comment or meta.description or data.description,
        icon = meta.icon,
    }
    if opts.include_details then
        row.meta = entry.meta
        row.data = entry.data
    end
    return row
end

function M.search(port: any, args: any): any
    args = args or {}
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local q, namespace, kind, meta_type = lower(args.q), trim(args.namespace), trim(args.kind), trim(args.meta_type)
    local rows, queries, seen = {}, {}, {}
    if kind ~= "" then
        local query = { [".kind"] = kind }; if meta_type ~= "" then query["meta.type"] = meta_type end; queries[#queries + 1] = query
    elseif meta_type ~= "" then queries[#queries + 1] = { ["meta.type"] = meta_type }
    else for _, item_kind in ipairs(DEFAULT_KINDS) do queries[#queries + 1] = { [".kind"] = item_kind } end end
    for _, query in ipairs(queries) do
        local entries, err = find_entries(port, query)
        if err then return nil, err end
        for _, entry in ipairs(entries) do
            local id = tostring(entry.id or "")
            if id ~= "" and not seen[id] and matches_namespace(entry, namespace) and matches_kind(entry, kind)
                and matches_meta_type(entry, meta_type) and matches_query(entry, q) then
                seen[id] = true; rows[#rows + 1] = M.summarize_entry(entry, {})
            end
        end
    end
    local out, next_cursor = keyset.page(rows, keyset.field("id"), limit :: integer, cursor)
    return { success = true, entries = out, count = #out, next_cursor = next_cursor }
end

function M.get_entry(port: any, args: any): any
    local id = trim(args and args.id)
    if id == "" then return nil, errors.new({ message = "id is required", kind = errors.INVALID }) end
    local entry, err = port.get(id)
    if err then return nil, err end
    if not entry then return nil, errors.new({ message = tostring("entry not found: " .. id), kind = errors.NOT_FOUND }) end
    return { success = true, entry = M.summarize_entry(entry, { include_details = true }) }
end

function M.list_namespaces(port: any, args: any): any
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local entries, err = all_entries(port)
    if err then return nil, err end
    local namespaces = {}
    for _, entry in ipairs(entries) do
        local ns = namespace_of(entry.id)
        if ns ~= "" then
            local row = namespaces[ns] or { id = ns, count = 0, kinds = {} }
            row.count = row.count + 1
            increment(row.kinds, entry_kind(entry))
            namespaces[ns] = row
        end
    end
    local out = {}
    for _, row in pairs(namespaces) do
        out[#out + 1] = row
    end
    table.sort(out, function(a, b) return tostring(a.id) < tostring(b.id) end)
    local selected, next_cursor = keyset.page(out, keyset.field("id"), limit :: integer, cursor)
    return { success = true, namespaces = selected, count = #selected, next_cursor = next_cursor }
end

function M.tree(port: any, args: any): any
    args = args or {}
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local entries, err = all_entries(port)
    if err then return nil, err end
    local namespace = trim(args.namespace)
    local root = { name = namespace ~= "" and namespace or "registry", count = 0, children = {}, entries = {} }

    for _, entry in ipairs(entries) do
        if matches_namespace(entry, namespace) then
            local ns = namespace_of(entry.id)
            local remainder = namespace ~= "" and ns:sub(#namespace + 2) or ns
            local child = remainder:match("^[^%.]+")
            root.count = root.count + 1
            if child and child ~= "" then
                local row = root.children[child] or { name = child, count = 0 }
                row.count = row.count + 1
                root.children[child] = row
            end
        end
    end
    local children = {}
    for _, child in pairs(root.children) do children[#children + 1] = child end
    local selected_children, next_cursor = keyset.page(children, keyset.field("name"), limit :: integer, cursor)
    root.children = selected_children
    root.next_cursor = next_cursor
    return { success = true, tree = root }
end

local function collect_refs(value: any, refs: any, depth: integer)
    if depth <= 0 or value == nil then return end
    local t = type(value)
    if t == "string" then
        for ref in string.gmatch(value, "[%w_%.%-]+:[%w_%.%-]+") do
            refs[ref] = true
        end
    elseif t == "table" then
        for _, v in pairs(value) do
            collect_refs(v, refs, depth - 1)
        end
    end
end

function M.related(port: any, args: any): any
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local id = trim(args and args.id)
    if id == "" then return nil, errors.new({ message = "id is required", kind = errors.INVALID }) end
    local current, err = port.get(id)
    if err then return nil, err end
    if not current then return nil, errors.new({ message = tostring("entry not found: " .. id), kind = errors.NOT_FOUND }) end

    local refs = {}
    collect_refs(current.meta, refs, 5)
    collect_refs(current.data, refs, 5)
    local direct = {}
    for ref in pairs(refs) do
        local entry, get_err = port.get(ref)
        if get_err and not errors.is(get_err, errors.NOT_FOUND) then return nil, get_err end
        direct[#direct + 1] = entry and M.summarize_entry(entry, {}) or { id = ref, missing = true }
    end

    local inbound = {}
    local entries, all_err = all_entries(port)
    if all_err then return nil, all_err end
    for _, entry in ipairs(entries) do
        if entry.id ~= id then
            local entry_refs = {}
            collect_refs(entry.meta, entry_refs, 5)
            collect_refs(entry.data, entry_refs, 5)
            if entry_refs[id] then inbound[#inbound + 1] = M.summarize_entry(entry, {}) end
        end
    end
    -- outbound and inbound page together in id order; each row lands in the
    -- list of its own direction.
    local rows = {}
    for _, row in ipairs(direct) do rows[#rows + 1] = { direction = "outbound", row = row } end
    for _, row in ipairs(inbound) do rows[#rows + 1] = { direction = "inbound", row = row } end
    local selected, next_cursor = keyset.page(rows, function(item: any): string
        return tostring(item.row.id) .. "#" .. item.direction
    end, limit :: integer, cursor)
    local outbound_page, inbound_page = {}, {}
    for _, item in ipairs(selected) do
        if item.direction == "outbound" then outbound_page[#outbound_page + 1] = item.row
        else inbound_page[#inbound_page + 1] = item.row end
    end
    return { success = true, related = { entry = M.summarize_entry(current, {}), outbound = outbound_page,
        inbound = inbound_page, next_cursor = next_cursor } }
end

function M.compare_namespaces(port: any, args: any): any
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local wanted = args and args.namespaces
    if type(wanted) ~= "table" or #wanted == 0 then
        local one = trim(args and args.namespace)
        if one == "" then return nil, errors.new({ message = "namespaces is required", kind = errors.INVALID }) end
        wanted = { one }
    end
    local entries, err = all_entries(port)
    if err then return nil, err end
    local rows = {}
    local seen = {}
    for _, ns in ipairs(wanted) do
        local prefix = trim(ns)
        if prefix ~= "" and not seen[prefix] then
            seen[prefix] = true
            local row = { namespace = prefix, count = 0, kinds = {}, types = {}, sample = {} }
            for _, entry in ipairs(entries) do
                if matches_namespace(entry, prefix) then
                    row.count = row.count + 1
                    increment(row.kinds, entry_kind(entry))
                    local typ = entry.meta and entry.meta.type
                    if type(typ) == "string" then increment(row.types, typ) end
                    if #row.sample < 8 then row.sample[#row.sample + 1] = M.summarize_entry(entry, {}) end
                end
            end
            rows[#rows + 1] = row
        end
    end
    local page, next_cursor = keyset.page(rows, keyset.field("namespace"), limit :: integer, cursor)
    return { success = true, comparison = page, count = #page, next_cursor = next_cursor }
end

function M.overview(port: any, args: any): any
    args = args or {}
    local per_bucket = limit_of({ limit = args.per_bucket_limit or args.limit }, 8, 20)
    local overview = {}
    for _, spec in ipairs(OVERVIEW_TYPES) do
        local query = { [".kind"] = spec.kind }
        if spec.meta_type then query["meta.type"] = spec.meta_type end
        local entries, err = find_entries(port, query)
        if err then return nil, err end
        local rows = {}
        for _, entry in ipairs(entries) do
            rows[#rows + 1] = M.summarize_entry(entry, {})
            if #rows >= per_bucket then break end
        end
        overview[spec.key] = { count = #(entries or {}), sample = rows }
    end
    return { success = true, overview = overview }
end

function M.execute(port: any, args: any): any
    args = (type(args) == "table") and args or {}
    local action = trim(args.action)
    if action == "overview" then return M.overview(port, args) end
    if action == "search_registry" then return M.search(port, args) end
    if action == "get_entry" then return M.get_entry(port, args) end
    if action == "list_namespaces" then return M.list_namespaces(port, args) end
    if action == "tree" then return M.tree(port, args) end
    if action == "related" then return M.related(port, args) end
    if action == "compare_namespaces" then return M.compare_namespaces(port, args) end
    return nil, errors.new({ message = "unknown action", kind = errors.INVALID })
end

M._private = {
    matches_query = matches_query,
}

return M
