-- One length-prefixed tuple codec for record and delivery identities.
type Map = { [string]: any }
local M = {}
local function tuple(parts: { string }): string
    local encoded: { string } = {}
    for _, part in ipairs(parts) do encoded[#encoded + 1] = tostring(#part) .. ":" .. part end
    return table.concat(encoded)
end
function M.keys(d: Map, item: Map, slot: string?): Map
    local source = tostring(item.source_port or d.source_port or d.source_ref or ("timer:" .. tostring(d.drive_key)))
    local record = tuple({ tostring(d.automation_id), source, tostring(item.item_key), slot or "" })
    return { identity_key = record, idempotency_key = tuple({ record, tostring(item.dedup_key),
        tostring(item.op or "upsert"), tostring(item.delivery_generation or d.delivery_revision or 1),
        tostring(item.attempt_generation or 0) }) }
end
function M.bind(d: Map, item: Map): ()
    item.source_port = item.source_port or d.source_port or d.source_ref or ("timer:" .. tostring(d.drive_key))
    item.delivery_generation = item.delivery_generation or d.delivery_revision or 1
    item.delivery_key = M.keys(d, item).idempotency_key
end
return M
