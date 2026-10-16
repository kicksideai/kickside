-- Read layer over the event-sourced inbox. State is reduced on read from the
-- owner's inbox projection body, then filtered/sorted/paginated in memory. The
-- public API is query/get; callers that need counts derive them from the same
-- current item list or component public meta, not a separate count endpoint.

local inbox_types = require("inbox_types")
local inbox_events = require("inbox_events")

local reader = {}

local MAX_LIMIT = 200
local DEFAULT_LIMIT = 20

local PRIORITY_RANK = { urgent = 4, high = 3, normal = 2, low = 1 }
local function rank(p: any): integer return PRIORITY_RANK[tostring(p)] or 0 end

local function summarize_items(map: any): any
    local counts = {
        item_count = 0,
        pending_count = 0,
        resolved_count = 0,
        urgent_count = 0,
        high_count = 0,
    }
    if type(map) ~= "table" then return counts end
    for _, item in pairs(map) do
        if type(item) == "table" then
            counts.item_count = counts.item_count + 1
            if item.status == inbox_types.STATUS.PENDING then
                counts.pending_count = counts.pending_count + 1
            else
                counts.resolved_count = counts.resolved_count + 1
            end
            if item.priority == inbox_types.PRIORITY.URGENT then
                counts.urgent_count = counts.urgent_count + 1
            elseif item.priority == inbox_types.PRIORITY.HIGH then
                counts.high_count = counts.high_count + 1
            end
        end
    end
    return counts
end

-- Reduce the current actor's items into an array.
local function items_array(): ({ any }?, string?, any?)
    local map, err, counts = inbox_events.reduce()
    if err then return nil, err end
    local out: { any } = {}
    for _, it in pairs(map) do out[#out + 1] = it end
    if type(counts) ~= "table" then counts = summarize_items(map) end
    return out, nil, counts
end

local function sort_priority_created(a: any, b: any): boolean
    local ra, rb = rank(a.priority), rank(b.priority)
    if ra ~= rb then return ra > rb end
    return (tonumber(a.created_at) or 0) > (tonumber(b.created_at) or 0)
end

-- Fluent in-memory query builder that mirrors the SQL-builder API shape.
local function new_query(): any
    local q: any = {
        _status = nil,
        _id = nil,
        _type = nil,
        _priority = nil,
        _resolved_only = false,
        _limit = nil,
        _offset = nil,
        _filtered = nil,
        _counts = nil,
    }

    local function invalidate(self: any): any
        self._filtered = nil
        self._counts = nil
        return self
    end

    function q.by_status(self: any, status: string): any self._status = status; return invalidate(self) end
    function q.by_id(self: any, id: string): any self._id = id; return invalidate(self) end
    function q.by_type(self: any, item_type: string): any self._type = item_type; return invalidate(self) end
    function q.by_priority(self: any, priority: string): any self._priority = priority; return invalidate(self) end
    function q.resolved(self: any): any self._resolved_only = true; return invalidate(self) end

    function q.limit(self: any, n: any): any
        local v = tonumber(n) or DEFAULT_LIMIT
        if v > MAX_LIMIT then v = MAX_LIMIT end
        if v < 1 then v = 1 end
        self._limit = math.floor(v); return self
    end
    function q.page(self: any, page_num: any, per_page: any): any
        local pp = tonumber(per_page) or DEFAULT_LIMIT
        if pp > MAX_LIMIT then pp = MAX_LIMIT end
        if pp < 1 then pp = 1 end
        local pn = tonumber(page_num) or 1
        if pn < 1 then pn = 1 end
        self._limit = math.floor(pp); self._offset = math.floor((pn - 1) * pp); return self
    end

    local function filtered(self: any): ({ any }?, string?)
        if type(self._filtered) == "table" then return (self._filtered :: { any }), nil end
        local arr, err, counts = items_array()
        if err then return nil, err end
        local out: { any } = {}
        for _, it in ipairs(arr) do
            local ok = true
            if self._id and it.id ~= self._id then ok = false end
            if self._resolved_only and it.status == inbox_types.STATUS.PENDING then ok = false end
            if ok and self._status and it.status ~= self._status then ok = false end
            if ok and self._type and it.item_type ~= self._type then ok = false end
            if ok and self._priority and it.priority ~= self._priority then ok = false end
            if ok then out[#out + 1] = it end
        end
        table.sort(out, sort_priority_created)
        self._filtered = out
        self._counts = counts
        return out, nil
    end

    function q.all(self: any): ({ any }?, string?)
        local out, err = filtered(self)
        if err then return nil, err end
        local offset = self._offset or 0
        if offset > 0 or self._limit then
            local sliced: { any } = {}
            local stop = self._limit and (offset + self._limit) or #out
            for i = offset + 1, math.min(stop, #out) do sliced[#sliced + 1] = out[i] end
            return sliced, nil
        end
        return out, nil
    end

    function q.one(self: any): (any, string?)
        local out, err = filtered(self)
        if err then return nil, err end
        return out[1], nil
    end

    function q.count(self: any): (integer?, string?)
        local out, err = filtered(self)
        if err then return nil, err end
        return #out, nil
    end

    function q.counts(self: any): (any, string?)
        if type(self._counts) == "table" then return self._counts, nil end
        local _, err = filtered(self)
        if err then return nil, err end
        return type(self._counts) == "table" and self._counts or {}, nil
    end

    return q
end

function reader.query(): any return new_query() end

function reader.counts(): (any, string?)
    local map, err, counts = inbox_events.reduce()
    if err then return nil, err end
    if type(counts) == "table" then return counts, nil end
    return summarize_items(map), nil
end

function reader.get(id: string): (any, string?)
    if type(id) ~= "string" or id == "" then return nil, nil end
    return inbox_events.get(id)
end

return reader
