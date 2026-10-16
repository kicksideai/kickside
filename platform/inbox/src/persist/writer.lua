-- Write facade over the event-sourced inbox. Each mutation appends an immutable
-- thread event. Public summary counts and realtime invalidation are maintained by
-- the inbox projection via canonical component public meta.

local inbox_types = require("inbox_types")
local inbox_events = require("inbox_events")

local writer = { _events = nil :: any? }

local function events()
    return writer._events or inbox_events
end

function writer.create(params: any): (any, any?)
    local id, err, outcome = events().create(params)
    if not id then return nil, err end
    local data = { id = id, item_type = params.item_type, title = params.title, outcome = outcome }
    return data, nil
end

function writer.delete(id: string, idempotency_key: string?): (any, any?)
    local ok, err = events().delete(id, idempotency_key)
    if not ok then return nil, err end
    local data = { id = id }
    return data, nil
end

-- Discard pending items whose metadata contains every supplied key/value. This is
-- a lifecycle cleanup seam for owners that created correlated inbox work (for
-- example, a deleted import session). It folds the owner's current projection and
-- emits the normal item.deleted event for each match; it never reaches across
-- inbox owners or mutates a resolved item.
function writer.discard_by_metadata(match: any): (any, string?)
    if type(match) ~= "table" or next(match) == nil then return nil, "metadata match is required" end
    local all, read_err = events().reduce()
    if read_err then return nil, read_err end
    local discarded = 0
    for id, item in pairs(type(all) == "table" and all or {}) do
        local metadata = type((item :: any).metadata) == "table" and (item :: any).metadata or {}
        local matches = (item :: any).status == inbox_types.STATUS.PENDING
        if matches then
            for key, value in pairs(match) do
                if metadata[key] ~= value then matches = false; break end
            end
        end
        if matches then
            local ok, err = events().delete(id)
            if not ok then return nil, err end
            discarded = discarded + 1
        end
    end
    return { discarded = discarded }, nil
end

return writer
