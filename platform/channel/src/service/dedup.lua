-- Bounded recent-id set for dropping at-least-once message redeliveries. Turns
-- are routed straight to the hub by provider transports (they do not pass through
-- the kickside_event external-id dedup), so a redelivered message would otherwise
-- produce a duplicate reply. new(max):seen(id) returns true when an id was already
-- seen; ids are pruned past max to bound memory. An empty id is treated as unseen.
-- forget(id) drops an id so its redelivery is retried rather than suppressed: the
-- hub uses it to release a first turn whose bridge aborted startup before recording
-- it.
local M = {}

function M.new(max: any, state: any?): any
    local limit = tonumber(max) or 500
    local set: { [string]: boolean } = state and state.set or {}
    local order: { string } = state and state.order or {}

    local function contains(id: any): boolean
        return type(id) == "string" and id ~= "" and set[id] == true
    end

    local function mark(id: any)
        if type(id) ~= "string" or id == "" or set[id] then return end
        set[id] = true
        order[#order + 1] = id
        if #order > limit then
            local oldest = table.remove(order, 1)
            if oldest then set[oldest] = nil end
        end
    end

    local function seen(id: any): boolean
        if type(id) ~= "string" or id == "" then return false end
        if set[id] then return true end
        mark(id)
        return false
    end

    local function forget(id: any)
        if type(id) ~= "string" or id == "" or not set[id] then return end
        set[id] = nil
        for i = #order, 1, -1 do
            if order[i] == id then
                table.remove(order, i)
                break
            end
        end
    end

    return { seen = seen, contains = contains, mark = mark, forget = forget,
        snapshot = function(): any return { set = set, order = order } end }
end

return M
