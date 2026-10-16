local json = require("json")
local canonical_json = require("canonical_json")

local M = {}

local DEFAULT_MAX_STRING_CHARS = 8192
local DEFAULT_MAX_ARRAY_ITEMS = 200
local DEFAULT_MAX_OBJECT_KEYS = 64
local DEFAULT_MAX_DEPTH = 4
local DEFAULT_MAX_NODES = 512
local MAX_REPORTED_MISMATCHES = 20
local MAX_SUMMARY_FIELDS = 24
local MAX_SUMMARY_TITLE_CHARS = 160

local function trim(s: any): string
    return tostring(s or ""):match("^%s*(.-)%s*$") or ""
end

local function schema_properties(schema: any): any
    if type(schema) ~= "table" then return {} end
    local props = (schema :: any).properties
    if type(props) ~= "table" then return {} end
    return props
end

local function required_set(schema: any): { [string]: boolean }
    local out: { [string]: boolean } = {}
    if type(schema) ~= "table" then return out end
    local req = (schema :: any).required
    if type(req) == "table" then
        for _, name in ipairs(req :: { any }) do
            local key = trim(name)
            if key ~= "" then out[key] = true end
        end
    end
    for key, prop in pairs(schema_properties(schema)) do
        if type(prop) == "table" and (prop :: any).required == true then
            out[tostring(key)] = true
        end
    end
    return out
end

local function actual_type(value: any): string
    local t = type(value)
    if t == "number" and value == math.floor(value) then return "integer" end
    if t == "table" then
        local max = 0
        local count = 0
        for k, _ in pairs(value :: any) do
            if type(k) ~= "number" then return "object" end
            if k > max then max = k end
            count = count + 1
        end
        if max == count then return "array" end
        return "object"
    end
    return t
end

local function expected_label(prop: any): string
    if type(prop) ~= "table" then return "any" end
    local expected = (prop :: any).type
    if type(expected) == "table" then
        local parts: { string } = {}
        for _, e in ipairs(expected :: { any }) do parts[#parts + 1] = tostring(e) end
        return table.concat(parts, " or ")
    end
    return tostring(expected or "any")
end

local function add_mismatch(mismatched: { any }, row: any)
    if #mismatched < MAX_REPORTED_MISMATCHES then
        mismatched[#mismatched + 1] = row
    elseif #mismatched == MAX_REPORTED_MISMATCHES then
        mismatched[#mismatched + 1] = {
            field = "...",
            expected = "fewer invalid fields",
            actual = "additional validation errors omitted",
        }
    end
end

local function scan_limits(value: any, field: string, depth: number, seen: any, budget: any, mismatched: { any })
    if budget.count >= budget.max then
        if budget.reported ~= true then
            add_mismatch(mismatched, {
                field = field,
                expected = "at most " .. tostring(budget.max) .. " context values",
                actual = "too many values",
            })
            budget.reported = true
        end
        return
    end
    budget.count = budget.count + 1

    local max_depth = DEFAULT_MAX_DEPTH
    if depth > max_depth then
        add_mismatch(mismatched, {
            field = field,
            expected = "depth <= " .. tostring(max_depth),
            actual = "depth > " .. tostring(max_depth),
        })
        return
    end

    if type(value) == "string" then
        local text = value :: string
        local length = string.len(text)
        local max_len = DEFAULT_MAX_STRING_CHARS
        if length > max_len then
            add_mismatch(mismatched, {
                field = field,
                expected = "length <= " .. tostring(max_len),
                actual = "length " .. tostring(length),
            })
        end
        return
    end

    if type(value) ~= "table" then return end

    local identity = tostring(value)
    if seen[identity] then
        add_mismatch(mismatched, {
            field = field,
            expected = "acyclic context value",
            actual = "cycle",
        })
        return
    end
    seen[identity] = true

    local kind = actual_type(value)
    local count = 0
    for k, child in pairs(value :: any) do
        count = count + 1
        if kind == "array" and count > DEFAULT_MAX_ARRAY_ITEMS then
            add_mismatch(mismatched, {
                field = field,
                expected = "at most " .. tostring(DEFAULT_MAX_ARRAY_ITEMS) .. " items",
                actual = tostring(count) .. " or more items",
            })
            break
        elseif kind ~= "array" and count > DEFAULT_MAX_OBJECT_KEYS then
            add_mismatch(mismatched, {
                field = field,
                expected = "at most " .. tostring(DEFAULT_MAX_OBJECT_KEYS) .. " fields",
                actual = tostring(count) .. " or more fields",
            })
            break
        end
        scan_limits(child, field .. "." .. tostring(k), depth + 1, seen, budget, mismatched)
    end

    seen[identity] = nil
end

function M.validate(schema: any, context: any): any
    local missing: { string } = {}
    local mismatched: { any } = {}
    if context ~= nil and type(context) ~= "table" then
        add_mismatch(mismatched, {
            field = "context",
            expected = "object",
            actual = actual_type(context),
        })
        return { ok = false, missing = missing, mismatched = mismatched }
    end

    if type(schema) ~= "table" then
        return { ok = true, missing = missing, mismatched = mismatched }
    end

    local ctx: any = type(context) == "table" and context or {}
    local context_fields = 0
    for _, _ in pairs(ctx) do
        context_fields = context_fields + 1
        if context_fields > DEFAULT_MAX_OBJECT_KEYS then
            add_mismatch(mismatched, {
                field = "context",
                expected = "at most " .. tostring(DEFAULT_MAX_OBJECT_KEYS) .. " fields",
                actual = tostring(context_fields) .. " or more fields",
            })
            break
        end
    end

    local props = schema_properties(schema)
    local required = required_set(schema)
    for key, _ in pairs(required) do
        if ctx[key] == nil then missing[#missing + 1] = key end
    end

    if (schema :: any).additionalProperties == false then
        for key, _ in pairs(ctx) do
            if props[key] == nil then
                add_mismatch(mismatched, {
                    field = tostring(key),
                    expected = "declared context field",
                    actual = "extra",
                })
            end
        end
    end

    local limit_errors = #mismatched
    for key, prop in pairs(props) do
        local value = ctx[key]
        if value ~= nil then
            scan_limits(value, tostring(key), 1, {},
                { count = 0, max = DEFAULT_MAX_NODES }, mismatched)
        end
    end
    if #mismatched > limit_errors then
        return { ok = false, missing = missing, mismatched = mismatched }
    end

    local valid, validation_err = json.validate(canonical_json.normalize_schema(schema), canonical_json.object(ctx))
    if not valid then
        for key, prop in pairs(props) do
            if ctx[key] ~= nil then
                local field_valid = json.validate(canonical_json.normalize_schema(prop), ctx[key])
                if not field_valid then
                    add_mismatch(mismatched, { field = tostring(key), expected = expected_label(prop),
                        actual = actual_type(ctx[key]) })
                end
            end
        end
        if #mismatched == 0 then
            add_mismatch(mismatched, { field = "context", expected = "declared JSON Schema",
                actual = tostring(validation_err) })
        end
    end

    return { ok = #missing == 0 and #mismatched == 0, missing = missing, mismatched = mismatched }
end

function M.summary(schema: any): string
    if type(schema) ~= "table" then return "" end
    local props = schema_properties(schema)
    local required = required_set(schema)
    local rows: { string } = {}
    for key, prop in pairs(props) do
        local title = type(prop) == "table" and trim((prop :: any).title) or ""
        local description = type(prop) == "table" and trim((prop :: any).description) or ""
        if title == "" then
            title = description
        elseif description ~= "" and description ~= title then
            title = title .. ": " .. description
        end
        if #title > MAX_SUMMARY_TITLE_CHARS then
            title = title:sub(1, MAX_SUMMARY_TITLE_CHARS) .. "..."
        end
        local role = type(prop) == "table" and trim((prop :: any).role) or ""
        local suffix = required[tostring(key)] and "required" or "optional"
        if role ~= "" then suffix = suffix .. ", " .. role end
        if title ~= "" then
            rows[#rows + 1] = tostring(key) .. " (" .. suffix .. ") - " .. title
        else
            rows[#rows + 1] = tostring(key) .. " (" .. suffix .. ")"
        end
    end
    table.sort(rows)
    if #rows == 0 then return "" end
    if #rows > MAX_SUMMARY_FIELDS then
        local limited: { string } = {}
        for i = 1, MAX_SUMMARY_FIELDS do limited[#limited + 1] = rows[i] end
        limited[#limited + 1] = "... " .. tostring(#rows - MAX_SUMMARY_FIELDS) .. " more"
        rows = limited
    end
    return "Context: " .. table.concat(rows, "; ")
end

function M.error_message(validation: any): string
    if type(validation) ~= "table" or validation.ok == true then return "" end
    local parts: { string } = {}
    if type(validation.missing) == "table" and #validation.missing > 0 then
        parts[#parts + 1] = "missing " .. table.concat(validation.missing, ", ")
    end
    if type(validation.mismatched) == "table" then
        for _, row in ipairs(validation.mismatched :: { any }) do
            parts[#parts + 1] = tostring(row.field) .. " expected " ..
                tostring(row.expected) .. ", got " .. tostring(row.actual)
        end
    end
    if #parts == 0 then return "invalid context" end
    return table.concat(parts, "; ")
end

local function trait_id_of(value: any): string
    if type(value) == "string" then return trim(value) end
    if type(value) == "table" then return trim((value :: any).id) end
    return ""
end

function M.validate_trait_contexts(traits: any, trait_contexts: any, get_entry: any): any
    local missing: { string } = {}
    local mismatched: { any } = {}
    local selected: { [string]: boolean } = {}
    local ids: { string } = {}

    if trait_contexts ~= nil and type(trait_contexts) ~= "table" then
        add_mismatch(mismatched, {
            field = "trait_contexts",
            expected = "object",
            actual = actual_type(trait_contexts),
        })
        return { ok = false, missing = missing, mismatched = mismatched }
    end

    if type(traits) == "table" then
        for _, item in ipairs(traits :: { any }) do
            local id = trait_id_of(item)
            if id ~= "" and not selected[id] then
                selected[id] = true
                ids[#ids + 1] = id
            end
        end
    end

    local contexts = type(trait_contexts) == "table" and trait_contexts or {}
    for key, _ in pairs(contexts :: any) do
        local id = tostring(key)
        if not selected[id] then
            add_mismatch(mismatched, {
                field = id,
                expected = "selected capability",
                actual = "unselected context",
            })
        end
    end

    for _, id in ipairs(ids) do
        local entry, err = get_entry(id)
        if err or type(entry) ~= "table" then
            add_mismatch(mismatched, {
                field = id,
                expected = "agent.trait",
                actual = "missing",
            })
        else
            local meta = ((entry :: any).meta or {}) :: any
            if meta.type ~= "agent.trait" then
                add_mismatch(mismatched, {
                    field = id,
                    expected = "agent.trait",
                    actual = tostring(meta.type or (entry :: any).kind or "entry"),
                })
            elseif meta.private == true then
                add_mismatch(mismatched, {
                    field = id,
                    expected = "public capability",
                    actual = "private",
                })
            else
                local result = M.validate(meta.context_schema, (contexts :: any)[id])
                for _, row in ipairs(result.missing or {}) do
                    missing[#missing + 1] = id .. "." .. tostring(row)
                end
                for _, row in ipairs(result.mismatched or {}) do
                    local r = row :: any
                    add_mismatch(mismatched, {
                        field = id .. "." .. tostring(r.field),
                        expected = r.expected,
                        actual = r.actual,
                    })
                end
            end
        end
    end

    return { ok = #missing == 0 and #mismatched == 0, missing = missing, mismatched = mismatched }
end

return M
