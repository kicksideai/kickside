local errors = require("errors")

type Map = { [string]: any }

type ClassifiedFailure = {
    kind: string,
    retriable: boolean,
    message: string,
    code: string?,
    scope: string?,
    retry_after_ms: integer?,
    retry_at_ms: integer?,
    details: Map?,
}

local M = {}

local KIND_INTERNAL: string = errors.INTERNAL :: string
local KIND_UNAVAILABLE: string = errors.UNAVAILABLE :: string
local KIND_TIMEOUT: string = errors.TIMEOUT :: string
local KIND_CANCELED: string = errors.CANCELED :: string
local KIND_RATE_LIMITED: string = errors.RATE_LIMITED :: string
local KIND_NOT_FOUND: string = errors.NOT_FOUND :: string
local KIND_PERMISSION_DENIED: string = errors.PERMISSION_DENIED :: string
local KIND_INVALID: string = errors.INVALID :: string
local KIND_ALREADY_EXISTS: string = errors.ALREADY_EXISTS :: string
local KIND_CONFLICT: string = errors.CONFLICT :: string
local WIPPY_KINDS: { string } = {
    KIND_INTERNAL,
    KIND_UNAVAILABLE,
    KIND_TIMEOUT,
    KIND_CANCELED,
    KIND_RATE_LIMITED,
    KIND_NOT_FOUND,
    KIND_PERMISSION_DENIED,
    KIND_INVALID,
    KIND_ALREADY_EXISTS,
    KIND_CONFLICT,
}
local KNOWN_KIND: { [string]: boolean } = {}
for _, kind in ipairs(WIPPY_KINDS) do KNOWN_KIND[kind] = true end

-- The DataError code taxonomy is shared by pullable and writable boundaries.
-- Deterministic source/consumer configuration and identity errors stay terminal
-- even when a provider sets retriable inconsistently. Cursor expiry, unavailable
-- history, and stalled acquisition map to UNAVAILABLE and follow the provider's
-- retriable flag; the table does not decide whether replay can recover them.
local DATA_ERROR_KINDS: { [string]: { kind: string, deterministic: boolean } } = {}
DATA_ERROR_KINDS.auth_expired = { kind = KIND_PERMISSION_DENIED, deterministic = true }
DATA_ERROR_KINDS.conflict = { kind = KIND_CONFLICT, deterministic = false }
DATA_ERROR_KINDS.idempotency_conflict = { kind = KIND_CONFLICT, deterministic = true }
DATA_ERROR_KINDS.cursor_expired = { kind = KIND_UNAVAILABLE, deterministic = false }
DATA_ERROR_KINDS.dependency_missing = { kind = KIND_UNAVAILABLE, deterministic = false }
DATA_ERROR_KINDS.history_unavailable = { kind = KIND_UNAVAILABLE, deterministic = false }
DATA_ERROR_KINDS.invalid_config = { kind = KIND_INVALID, deterministic = true }
DATA_ERROR_KINDS.invalid_request = { kind = KIND_INVALID, deterministic = true }
DATA_ERROR_KINDS.not_found = { kind = KIND_NOT_FOUND, deterministic = true }
DATA_ERROR_KINDS.permission_denied = { kind = KIND_PERMISSION_DENIED, deterministic = true }
DATA_ERROR_KINDS.provider_error = { kind = KIND_INTERNAL, deterministic = false }
DATA_ERROR_KINDS.provider_unavailable = { kind = KIND_UNAVAILABLE, deterministic = false }
DATA_ERROR_KINDS.rate_limited = { kind = KIND_RATE_LIMITED, deterministic = false }
DATA_ERROR_KINDS.stalled = { kind = KIND_UNAVAILABLE, deterministic = false }
DATA_ERROR_KINDS.unknown = { kind = KIND_INTERNAL, deterministic = false }

local KIND_DEFAULT_RETRIABLE: { [string]: boolean } = {}
KIND_DEFAULT_RETRIABLE[KIND_ALREADY_EXISTS] = false
KIND_DEFAULT_RETRIABLE[KIND_INVALID] = false
KIND_DEFAULT_RETRIABLE[KIND_NOT_FOUND] = false
KIND_DEFAULT_RETRIABLE[KIND_PERMISSION_DENIED] = false

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function field(value: any, key: string): any
    if type(value) ~= "table" then return nil end
    return (value :: Map)[key]
end

local function message_of(value: any, typed_kind: string?): string?
    local message = field(value, "message")
    if type(message) == "string" and trim(message) ~= "" then return trim(message) end
    if typed_kind ~= nil and type(value) == "userdata" then
        local resolved = (value :: any):message()
        if type(resolved) == "string" and trim(resolved) ~= "" then return trim(resolved) end
    end
    local code = field(value, "code")
    if type(code) == "string" and trim(code) ~= "" then return trim(code) end
    local rendered = tostring(value or "")
    if rendered ~= "" and not rendered:find("table:", 1, true) then return rendered end
    return nil
end

local function kind_of(value: any): (string?, { kind: string, deterministic: boolean }?, boolean)
    local details: any = field(value, "details")
    if type(value) == "userdata" then details = (value :: any):details() end
    local code = type(details) == "table" and details.code or field(value, "code")
    local mapping = type(code) == "string" and DATA_ERROR_KINDS[trim(code)] or nil
    for _, kind in ipairs(WIPPY_KINDS) do
        if errors.is(value, kind) then return kind :: string, mapping, true end
    end
    local kind = field(value, "kind")
    if type(kind) == "string" and KNOWN_KIND[trim(kind)] == true then return trim(kind), mapping, false end
    if mapping then return mapping.kind, mapping, false end
    return nil, nil, false
end

local function is_failure_envelope(value: any): boolean
    if type(value) ~= "table" then return false end
    local envelope = value :: Map
    return envelope.success == false
        or (envelope.error ~= nil and (envelope.retriable ~= nil or envelope.terminal ~= nil))
end

-- Convert a typed runtime error, a component/result failure envelope, or a
-- contract DataError to the same carrier. Raised strings and unknown values are
-- INTERNAL and retriable; explicit flags are kept, except DataError codes whose
-- taxonomy marks them deterministic. `prefix` adds boundary context without
-- changing the underlying kind or retry verdict.
function M.classify(value: any, prefix: string?): ClassifiedFailure
    local outer: Map? = nil
    if is_failure_envelope(value) then outer = value :: Map end
    local detail: any = value
    if outer ~= nil and outer.error ~= nil then detail = outer.error end
    local kind, mapping, typed = kind_of(detail)
    kind = kind or KIND_INTERNAL

    local explicit: any = nil
    if outer ~= nil then explicit = outer.retryable end
    if type(explicit) ~= "boolean" and outer ~= nil then explicit = outer.retriable end
    if type(explicit) ~= "boolean" then explicit = field(detail, "retryable") end
    if type(explicit) ~= "boolean" then explicit = field(detail, "retriable") end
    if type(explicit) ~= "boolean" and typed and type(detail) == "userdata" then
        local retryable = (detail :: any):retryable()
        if type(retryable) == "boolean" then explicit = retryable end
    end
    local terminal = field(detail, "terminal")
    if outer ~= nil and outer.terminal == true then terminal = true
    elseif type(terminal) ~= "boolean" and outer ~= nil then terminal = outer.terminal end

    local retriable = KIND_DEFAULT_RETRIABLE[kind] ~= false
    if type(explicit) == "boolean" then retriable = explicit end
    if terminal == true or KIND_DEFAULT_RETRIABLE[kind] == false
        or (mapping ~= nil and mapping.deterministic) then retriable = false end

    local message = message_of(detail, typed and kind or nil)
        or message_of(value, nil)
        or "operation failed"
    if type(prefix) == "string" and prefix ~= "" then message = prefix .. message end
    local carried: Map = {}
    if type(detail) == "table" then
        for key, item in pairs(detail :: Map) do carried[key] = item end
    elseif typed and type(detail) == "userdata" then
        local details = (detail :: any):details()
        if type(details) == "table" then
            for key, item in pairs(details :: Map) do carried[key] = item end
            carried.details = details
        end
    end
    if carried.retry_after_ms == nil and outer ~= nil then carried.retry_after_ms = outer.retry_after_ms end
    carried.kind, carried.retriable, carried.message = kind, retriable, message
    return carried :: ClassifiedFailure
end

function M.native(value: any): error
    if type(value) == "userdata" then return value :: error end
    local failure = M.classify(value)
    local details: Map = {}
    for key, item in pairs(failure.details or {}) do details[key] = item end
    for key, item in pairs(failure :: Map) do
        if key ~= "kind" and key ~= "message" and key ~= "retriable" and key ~= "details" and details[key] == nil then
            details[key] = item
        end
    end
    if details.code == nil then details.code = "automation_boundary_failure" end
    return (errors.new({ kind = failure.kind, message = failure.message,
        retryable = failure.retriable, details = details }) :: error)
end

function M.native_result(value: any, failure: any): (any, error?)
    if failure ~= nil then return nil, M.native(failure) end
    if is_failure_envelope(value) then return nil, M.native(value) end
    return value, nil
end

function M.capacity_floor(failure: any): integer?
    local classified = M.classify(failure)
    local floor = tonumber((classified.details or {}).retry_at_ms or classified.retry_at_ms)
    if classified.kind == errors.RATE_LIMITED and ((classified.details or {}).scope or classified.scope) == "capacity"
        and floor ~= nil and floor >= 0 and floor < math.huge and floor == math.floor(floor) then
        return floor :: integer
    end
    return nil
end

return M
