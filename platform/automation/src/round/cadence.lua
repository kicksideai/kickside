-- Pure UTC cadence. The caller owns occurrence persistence and invokes this
-- only after a successful round commit (v4 §§2, 4.2).
local time = require("time")

local M = {}

local function invalid(message)
    return errors.new({ kind = errors.INVALID, message = message })
end

local function parse_instant(value, label)
    if type(value) ~= "string" or value == "" then
        return nil, invalid(label .. " must be an RFC3339 timestamp")
    end
    local parsed, err = time.parse(time.RFC3339, value)
    if err or not parsed then return nil, invalid(label .. " must be an RFC3339 timestamp") end
    return parsed:utc(), nil
end

local function number(value)
    if not value:match("^%d+$") then return nil end
    return tonumber(value)
end

local function field(source, low, high, sunday)
    if type(source) ~= "string" or source == "" then return nil, invalid("empty cron field") end
    local selected = {}
    for part in source:gmatch("[^,]+") do
        local base, stride_text = part:match("^([^/]+)/(%d+)$")
        local stride = stride_text and number(stride_text) or 1
        if not stride or stride < 1 then return nil, invalid("invalid cron step: " .. part) end
        if not base then
            if part:find("/", 1, true) then return nil, invalid("invalid cron step: " .. part) end
            base = part
        end
        local first, last
        if base == "*" then
            first, last = low, high
        else
            local left, right = base:match("^(%d+)%-(%d+)$")
            if left then
                first, last = number(left), number(right)
            else
                first = number(base)
                last = stride_text and high or first
            end
        end
        if not first or not last or first < low or last > high or first > last then
            return nil, invalid("invalid cron field: " .. part)
        end
        for n = first, last, stride do selected[tostring(sunday and n == 7 and 0 or n)] = true end
    end
    if next(selected) == nil or source:match("^,") or source:match(",$") or source:find(",,", 1, true) then
        return nil, invalid("invalid cron field: " .. source)
    end
    local values = {}
    for key in pairs(selected) do values[#values + 1] = tonumber(key) end
    table.sort(values)
    selected.values = values
    return selected, nil
end

local function parse_cron(expression)
    if type(expression) ~= "string" then return nil, invalid("cron expression must be a string") end
    local pieces = {}
    for piece in expression:gmatch("%S+") do pieces[#pieces + 1] = piece end
    if #pieces ~= 5 then return nil, invalid("cron requires exactly five fields") end
    local limits = { {0, 59}, {0, 23}, {1, 31}, {1, 12}, {0, 7} }
    local fields = {}
    for i = 1, 5 do
        local value, err = field(pieces[i], limits[i][1], limits[i][2], i == 5)
        if err then return nil, err end
        fields[i] = value
    end
    fields.day_wild = pieces[3] == "*"
    fields.week_wild = pieces[5] == "*"
    return fields, nil
end

local function day_matches(fields, day, weekday)
    local dom = fields[3][tostring(day)] == true
    local dow = fields[5][tostring(weekday)] == true
    if not fields.day_wild and not fields.week_wild then return dom or dow end
    return dom and dow
end

local function next_cron(fields, from)
    local start_year = from:year()
    for year = start_year, start_year + 99 do
        for month = (year == start_year and from:month() or 1), 12 do
            if fields[4][tostring(month)] then
                local last_day = time.date(year, month + 1, 1, 0, 0, 0, 0, time.utc):add(-24 * time.HOUR):day()
                local first_day = year == start_year and month == from:month() and from:day() or 1
                for day = first_day, last_day do
                    local weekday = time.date(year, month, day, 0, 0, 0, 0, time.utc):weekday()
                    if day_matches(fields, day, weekday) then
                        for _, hour in ipairs(fields[2].values) do
                            for _, minute in ipairs(fields[1].values) do
                                local candidate = time.date(year, month, day, hour, minute, 0, 0, time.utc)
                                if candidate:after(from) then
                                    return candidate:format(time.RFC3339), nil
                                end
                            end
                        end
                    end
                end
            end
        end
    end
    return nil, invalid("cron schedule has no occurrence within 100 years")
end

function M.next_after(schedule, now)
    if type(schedule) ~= "table" or schedule.timezone ~= "UTC" then
        return nil, invalid("schedule.timezone must be UTC")
    end
    local instant, time_err = parse_instant(now, "now")
    if time_err then return nil, time_err end
    if schedule.type == "once" then
        local due, err = parse_instant(schedule.expression, "once expression")
        if err then return nil, err end
        if due:after(instant) then return due:format(time.RFC3339), nil end
        return nil, nil
    end
    if schedule.type == "interval" or schedule.type == "ticker" then
        if type(schedule.expression) ~= "string" or schedule.expression == "" then
            return nil, invalid("interval expression must be a positive duration")
        end
        local duration, err = time.parse_duration(schedule.expression)
        if err or not duration then return nil, invalid("invalid interval duration") end
        local due = instant:add(duration)
        if not due:after(instant) then return nil, invalid("interval duration must be positive") end
        return due:format(time.RFC3339), nil
    end
    if schedule.type == "cron" then
        local fields, err = parse_cron(schedule.expression)
        if err then return nil, err end
        return next_cron(fields, instant)
    end
    return nil, invalid("unsupported schedule type")
end

return M
