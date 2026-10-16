-- The current time as a UTC timestamp string in the dialect's textual shape, the
-- single formatter every Lua timestamp writer on the scheduling/projection/thread
-- path routes through.
--
-- Durable ORDER never rides on these strings. Events carry a monotonic per-thread
-- `seq` (UNIQUE(thread_id, seq)) and projections consume strictly ORDER BY seq with a
-- cursor that advances last_seq -> target_seq. These timestamps drive leases,
-- dispatch windows, retention cutoffs and operator-facing history only.
--
-- Precision is MICROSECOND -- what PostgreSQL's TIMESTAMPTZ stores natively, so the
-- same instant round-trips identically on both dialects. Nanosecond is deliberately
-- avoided: PostgreSQL truncates it to microsecond, which would make one instant
-- compare differently across SQLite and PostgreSQL. The fraction is FIXED-WIDTH (six
-- zero-padded digits, never trimmed like RFC3339NANO) so the SQLite TEXT form stays
-- lexically sortable, and a sub-second value still sorts after a second-precision
-- datetime('now') default for the same second.

local time = require("time")
local sql = require("sql")

local clock = {}

-- Go reference layouts with a fixed six-digit (microsecond) fraction. SQLite keeps
-- the space-separated datetime('now') shape; postgres keeps RFC3339 (parsed natively
-- into TIMESTAMPTZ).
local SQLITE_FMT = "2006-01-02 15:04:05.000000"
local POSTGRES_FMT = "2006-01-02T15:04:05.000000Z07:00"

-- format(t, dbtype) -> a given Time as the dialect's UTC timestamp string.
function clock.format(t: any, dbtype: string): string
    if dbtype == sql.type.SQLITE then
        return (t:utc():format(SQLITE_FMT)) :: string
    end
    return (t:utc():format(POSTGRES_FMT)) :: string
end

-- now(dbtype) -> the current UTC time in the dialect's textual shape.
function clock.now(dbtype: string): string
    return clock.format(time.now(), dbtype)
end

function clock.parse(raw: any): (any?, error?)
    if type(raw) ~= "string" or raw == "" then
        return nil, (errors.new({ message = "timestamp is missing", kind = errors.INVALID }) :: error)
    end
    for _, layout in ipairs({
        "2006-01-02 15:04:05.999999999",
        "2006-01-02T15:04:05.000000Z07:00",
        "2006-01-02 15:04:05.999999999Z07:00",
        "2006-01-02T15:04:05.999999999Z07:00",
        "2006-01-02 15:04:05Z07:00",
    }) do
        -- SQLite's unzoned timestamp strings are written by clock.format in UTC.
        -- Explicit offsets still identify their own instant; an absent offset
        -- must not inherit the host's local timezone and delay lease renewal.
        local parsed, err = time.parse(layout, raw, time.utc)
        if parsed and not err then return parsed, nil end
    end
    return nil, (errors.new({ message = "timestamp is invalid", kind = errors.INVALID }) :: error)
end

return clock
