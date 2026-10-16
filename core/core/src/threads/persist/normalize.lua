-- Input normalization for the thread/event writers: string trimming, created_at
-- coercion to the dialect's textual shape, event-body encoding, and the small
-- value coercions the batch ingest path needs. Pure functions, no db, no service.
-- Errors are returned as typed values so the writer maps them to a status.

local json = require("json")
local time = require("time")
local consts = require("threads_consts")
local clock = require("clock")

local M = {}

-- trim returns value with surrounding whitespace removed, or "" for a non-string.
function M.trim(value: any): string
    if type(value) ~= "string" then
        return ""
    end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- to_int coerces value to an integer, returning fallback when it is not numeric.
function M.to_int(value: any, fallback: integer?): integer?
    local n = tonumber(value)
    if not n then
        return fallback
    end
    return math.floor(n) :: integer
end

-- append_unique_user_id appends user_id to list when it is a non-empty string not
-- already present (compared after trimming). list is open JSON, so it is typed as a
-- bare table. Returns the list.
function M.append_unique_user_id(list: table, user_id: string): table
    if type(list) ~= "table" or type(user_id) ~= "string" or user_id == "" then
        return list
    end
    for _, existing in ipairs(list) do
        if type(existing) == "string" and M.trim(existing) == user_id then
            return list
        end
    end
    list[#list + 1] = user_id
    return list
end

-- normalize_created_at coerces a caller-supplied created_at into a textual UTC
-- timestamp the row can store. A number is treated as a unix timestamp; a string is
-- trimmed and length-checked; nil passes through as nil so the column default
-- applies. Returns (value, nil) or (nil, error).
function M.normalize_created_at(value: any, field_name: string?, dbtype: string?): (string?, error?)
    local field = field_name or "created_at"
    if value == nil then
        return nil, nil
    end
    if type(value) == "number" then
        local ts = math.floor(value)
        if ts < 0 then
            return nil, (errors.new({ message = field .. " must be >= 0", kind = errors.INVALID }) :: error)
        end
        -- Format through the shared clock so a caller-supplied unix timestamp lands in
        -- the SAME dialect shape as the column default (SQLite space-form vs RFC3339),
        -- keeping created_at lexically comparable on SQLite.
        return clock.format(time.unix(ts, 0), dbtype :: string), nil
    end
    if type(value) ~= "string" then
        return nil, (errors.new({ message = field .. " must be a string or unix timestamp", kind = errors.INVALID }) :: error)
    end
    local normalized = M.trim(value)
    if normalized == "" then
        return nil, nil
    end
    if #normalized > consts.LIMITS.CREATED_AT_MAX_LEN then
        return nil, (errors.new({ message = field .. " is too long (max " .. tostring(consts.LIMITS.CREATED_AT_MAX_LEN) .. ")", kind = errors.INVALID }) :: error)
    end
    return normalized, nil
end

-- The content metadata an event row carries, after defaults are filled.
type EventContent = {
    content_type: string,
    content_mode: string,
    content_ref_json: string?,
    content_hash: string?,
    content_bytes: integer?,
}

-- The external-identity triple used for dedup.
type EventExternal = {
    external_source: string?,
    external_id: string?,
    external_version: string?,
}

local function validate_strings(raw: any, fields: {string}, name: string): error?
    if raw == nil then return nil end
    if type(raw) ~= "table" then
        return errors.new({message = name .. " must be an object", kind = errors.INVALID, retryable = false})
    end
    for _, field in ipairs(fields) do
        if raw[field] ~= nil and type(raw[field]) ~= "string" then
            return errors.new({message = name .. "." .. field .. " must be a string", kind = errors.INVALID, retryable = false})
        end
    end
    return nil
end

function M.normalize_content(raw: any): (EventContent?, error?)
    local err = validate_strings(raw, {"content_type", "content_mode", "content_ref_json", "content_hash"}, "content")
    if err then return nil, err end
    local content = raw or {}
    local bytes = content.content_bytes
    if bytes ~= nil and (type(bytes) ~= "number" or bytes < 0 or bytes == math.huge or bytes % 1 ~= 0) then
        return nil, errors.new({message = "content.content_bytes must be a non-negative integer", kind = errors.INVALID, retryable = false})
    end
    return {
        content_type = content.content_type or consts.CONTENT_DEFAULT.TYPE,
        content_mode = content.content_mode or consts.CONTENT_DEFAULT.MODE,
        content_ref_json = content.content_ref_json,
        content_hash = content.content_hash,
        content_bytes = bytes,
    } :: EventContent, nil
end

-- normalize_external returns the external-identity triple from a caller's external
-- sub-object (each field nil when absent).
function M.normalize_external(raw: any): (EventExternal?, error?)
    local err = validate_strings(raw, {"external_source", "external_id", "external_version"}, "external")
    if err then return nil, err end
    local external = raw or {}
    return {
        external_source = external.external_source,
        external_id = external.external_id,
        external_version = external.external_version,
    } :: EventExternal, nil
end

-- encode_message_body builds the JSON body for a posted message: the caller's
-- body_table merged with the required text field. Returns (json, nil) or
-- (nil, error) when the table is not serializable.
function M.encode_message_body(text: string, body_table: any): (string?, error?)
    local body = type(body_table) == "table" and body_table or {}
    body.text = text
    local encoded, encode_err = json.encode(body)
    if encode_err or not encoded then
        return nil, (errors.new({ message = "body must be JSON serializable", kind = errors.INVALID }) :: error)
    end
    return encoded, nil
end

-- encode_attrs serializes thread attrs to JSON. Returns (json, nil) or
-- (nil, error).
function M.encode_attrs(attrs: any): (string?, error?)
    local value = type(attrs) == "table" and attrs or {}
    local encoded, encode_err = json.encode(value)
    if encode_err or not encoded then
        return nil, (errors.new({ message = "attrs must be JSON serializable", kind = errors.INVALID }) :: error)
    end
    return encoded, nil
end

return M
