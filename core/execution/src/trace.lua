-- Trace context of an execution: the canonical trace_id / run_id /
-- caused_by_event_id / correlation_key vocabulary, its row codec and the
-- opaque correlation token. Pure: no storage, no KickSide dependency.

local uuid = require("uuid")

local M = {}

local function invalid(message: string, code: string): error
    return (errors.new({
        message = message,
        kind = errors.INVALID,
        retryable = false,
        details = { code = code },
    }) :: error)
end

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function optional(value: any): string?
    local s = trim(value)
    if s == "" then return nil end
    return s
end

local TRACE_KEYS = {
    trace_id = true,
    run_id = true,
    caused_by_event_id = true,
    correlation_key = true,
}

local function encode_segment(value: any): string
    return tostring(value):gsub("([^A-Za-z0-9_.~-])", function(ch)
        return string.format("%%%02X", string.byte(ch))
    end)
end

local function decode_segment(value: string): string
    return value:gsub("%%(%x%x)", function(hex)
        return string.char((tonumber(hex, 16) or 0) :: integer)
    end)
end

local function sorted_string_keys(values: table): { string }
    local keys: { string } = {}
    for key, _ in pairs(values) do
        if type(key) == "string" and key ~= "" then keys[#keys + 1] = key end
    end
    table.sort(keys)
    return keys
end

-- pack_correlation keeps correlation_key as one opaque/indexable token while
-- giving callers one canonical way to pack component/source identifiers into it.
-- Array parts preserve order: pack_correlation("kb", {"123", "source", "abc"})
-- -> "kb:123:source:abc". Map parts sort keys and encode as key=value.
function M.pack_correlation(kind: any, parts: any?): (string?, error?)
    local k = trim(kind)
    if k == "" then return nil, invalid("correlation kind is required", "correlation_kind_required") end
    local token = encode_segment(k)
    local function append_segment(segment: string)
        token = token .. ":" .. segment
    end
    local function append(value: any)
        append_segment(encode_segment(value))
    end
    if parts == nil then
        return token, nil
    end
    if type(parts) ~= "table" then
        append(parts)
        return token, nil
    end
    local p = parts :: table
    if #p > 0 then
        for i = 1, #p do
            local value = p[i]
            if value ~= nil then append(value) end
        end
    else
        for _, key in ipairs(sorted_string_keys(p)) do
            local value = p[key]
            if value ~= nil then
                append_segment(encode_segment(key) .. "=" .. encode_segment(value))
            end
        end
    end
    return token, nil
end

function M.unpack_correlation(token: any): (table?, error?)
    local raw = trim(token)
    if raw == "" then return nil, invalid("correlation token is required", "correlation_token_required") end
    local segments: { string } = {}
    for segment in (raw .. ":"):gmatch("(.-):") do
        segments[#segments + 1] = segment
    end
    if #segments == 0 or segments[1] == "" then
        return nil, invalid("correlation token is invalid", "correlation_token_invalid")
    end
    local out: { [string]: any } = { kind = decode_segment(segments[1]), parts = {}, fields = {} }
    local out_parts = out.parts :: { string }
    local out_fields = out.fields :: { [string]: string }
    for i = 2, #segments do
        local segment = segments[i]
        out_parts[#out_parts + 1] = decode_segment(segment)
        local eq_at = segment:find("=", 1, true)
        if eq_at and eq_at > 1 then
            local key = decode_segment(segment:sub(1, eq_at - 1))
            local value = decode_segment(segment:sub(eq_at + 1))
            out_fields[key] = value
        end
    end
    return out, nil
end

function M.normalize(raw: any): (table?, error?)
    if raw == nil then return nil, nil end
    if type(raw) ~= "table" then return nil, invalid("trace_context must be an object", "trace_context_invalid_type") end
    local ctx = raw :: table
    for key, _ in pairs(ctx) do
        if type(key) == "string" and not TRACE_KEYS[key] then
            return nil, invalid("trace_context." .. key .. " is not canonical", "trace_context_noncanonical_field")
        end
    end
    local trace_id = trim(ctx.trace_id)
    local run_id = trim(ctx.run_id)
    local caused_by_event_id = optional(ctx.caused_by_event_id)
    local correlation_key = optional(ctx.correlation_key)
    if trace_id == "" and run_id == "" and caused_by_event_id == nil and correlation_key == nil then
        return nil, nil
    end
    if trace_id == "" then return nil, invalid("trace_context.trace_id is required", "trace_context_trace_id_required") end
    if run_id == "" then run_id = trace_id end
    local out: { [string]: any } = { trace_id = trace_id, run_id = run_id }
    if caused_by_event_id then out.caused_by_event_id = caused_by_event_id end
    if correlation_key then out.correlation_key = correlation_key end
    return out, nil
end

function M.begin(_kind: string?, correlation_key: string?): table
    local id = uuid.v7()
    local out: { [string]: any } = {
        trace_id = id,
        run_id = id,
    }
    local key = optional(correlation_key)
    if key then out.correlation_key = key end
    return out
end

function M.from_row(row: any): table?
    if type(row) ~= "table" then return nil end
    local ctx = {
        trace_id = (row :: table).trace_id,
        run_id = (row :: table).run_id,
        caused_by_event_id = (row :: table).caused_by_event_id,
        correlation_key = (row :: table).correlation_key,
    }
    local normalized = M.normalize(ctx)
    return normalized
end

function M.attach_to_event(row: table): table
    local ctx = M.from_row(row)
    if ctx then row.trace_context = ctx end
    row.trace_id = nil
    row.run_id = nil
    row.caused_by_event_id = nil
    row.correlation_key = nil
    return row
end

function M.apply_to_row(row: table, raw_context: any): (table?, error?)
    local ctx, err = M.normalize(raw_context)
    if err then return nil, err end
    if not ctx then return row, nil end
    row.trace_id = ctx.trace_id
    row.run_id = ctx.run_id
    if ctx.caused_by_event_id then row.caused_by_event_id = ctx.caused_by_event_id end
    if ctx.correlation_key then row.correlation_key = ctx.correlation_key end
    return row, nil
end

function M.inherit(event: any, overrides: any?): (table?, error?)
    local base = nil
    if type(event) == "table" then
        local ev = event :: table
        if type(ev.trace_context) == "table" then
            base = M.normalize(ev.trace_context)
        else
            base = M.from_row(ev)
        end
    end
    local out: { [string]: any } = {}
    if base then
        for key, value in pairs(base :: table) do out[key] = value end
    end
    if type(event) == "table" and optional((event :: table).id) then
        out.caused_by_event_id = optional((event :: table).id)
    end
    if type(overrides) == "table" then
        for _, key in ipairs({ "trace_id", "run_id", "caused_by_event_id", "correlation_key" }) do
            if (overrides :: table)[key] ~= nil then out[key] = (overrides :: table)[key] end
        end
    end
    return M.normalize(out)
end

function M.common(events: any): table?
    if type(events) ~= "table" then return nil end
    local trace_id: string? = nil
    local run_id: string? = nil
    local correlation_key: string? = nil
    local correlation_set = false
    local cause_id: string? = nil
    local count = 0
    for _, ev in ipairs(events :: { any }) do
        local ctx = nil
        if type(ev) == "table" then
            if type((ev :: table).trace_context) == "table" then
                ctx = M.normalize((ev :: table).trace_context)
            else
                ctx = M.from_row(ev)
            end
        end
        if not ctx then return nil end
        local c = ctx :: table
        if trace_id and (trace_id ~= c.trace_id or run_id ~= c.run_id) then return nil end
        trace_id = c.trace_id :: string?
        run_id = c.run_id :: string?
        local corr = optional(c.correlation_key)
        if count == 0 then
            correlation_key = corr
            correlation_set = corr ~= nil
        elseif correlation_set and correlation_key ~= corr then
            correlation_key = nil
            correlation_set = false
        end
        cause_id = optional((ev :: table).id)
        count = count + 1
    end
    if count == 0 or not trace_id then return nil end
    local out: { [string]: any } = { trace_id = trace_id, run_id = run_id or trace_id }
    if correlation_key then out.correlation_key = correlation_key end
    if count == 1 and cause_id then out.caused_by_event_id = cause_id end
    return out
end

return M
