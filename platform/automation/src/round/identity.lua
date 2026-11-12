-- One length-prefixed tuple codec for record and delivery identities.
type Map = { [string]: any }
local M = {}
local function tuple(parts: { string }): string
    local encoded: { string } = {}
    for _, part in ipairs(parts) do encoded[#encoded + 1] = tostring(#part) .. ":" .. part end
    return table.concat(encoded)
end
local function record_key(d: Map, item: Map, slot: string?): string
    local source = tostring(item.source_port or d.source_port or d.source_ref or ("timer:" .. tostring(d.drive_key)))
    return tuple({tostring(d.automation_id),source,tostring(item.item_key),slot or ""})
end
function M.keys(d: Map, item: Map, slot: string?): Map
    local record=record_key(d,item,slot)
    return {identity_key=record,idempotency_key=tuple({record,tostring(item.dedup_key),
        tostring(item.op or "upsert"),tostring(item.delivery_generation or d.delivery_revision or 1),
        tostring(item.attempt_generation or 0)})}
end
local function part(value: string, at: integer): (string?,integer)
    local colon=value:find(":",at,true)
    if colon == nil then return nil,at end
    local size=tonumber(value:sub(at,colon-1))
    if size == nil or size < 0 or size ~= math.floor(size) or colon+size > #value then return nil,at end
    return value:sub(colon+1,colon+size),math.floor(colon+size+1)
end
-- The delivery key contains the record tuple, including its item primary key.
function M.item_key(delivery_key: string): string?
    local record=part(delivery_key,1)
    if record == nil then return nil end
    local at=1
    for index=1,3 do
        local value,next_at=part(record,at)
        if value == nil then return nil end
        if index == 3 then return value end
        at=next_at
    end
    return nil
end
function M.bind(d: Map, item: Map): ()
    item.source_port = item.source_port or d.source_port or d.source_ref or ("timer:" .. tostring(d.drive_key))
    item.delivery_generation = item.delivery_generation or d.delivery_revision or 1
    item.delivery_key = M.keys(d, item).idempotency_key
end
return M
