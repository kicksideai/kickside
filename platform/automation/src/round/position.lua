-- Source-page positions and bounded collection-pass continuation.
local outcome = require("round_outcome")
local M = {}
type Map = { [string]: any }

-- event_position(page, d) -> the event sequence an event page advanced to, or
-- the deterministic failure of a page whose next position is not a sequence.
function M.event_position(page: Map, d: Map): (integer?, Map?)
    local next_cursor = page.next_cursor
    if next_cursor == nil then return d.event_seq, nil end
    if type(next_cursor) ~= "number" or next_cursor ~= math.floor(next_cursor) or next_cursor < 0 then
        return nil, outcome.declaration_failure("the events source answered a next position that is not a sequence: " .. tostring(next_cursor))
    end
    return math.floor(next_cursor) :: integer, nil
end

-- The collection pass after a pulled page (design v5 §8): it continues at once
-- while the source has more within round.max_pages and round.max_items, and
-- otherwise ends, resetting its count for the next due pass.
function M.pass_after(d: Map, page: Map, pulled: boolean, rp: Map): (Map, boolean)
    local pages = (d.pass_pages :: integer) + (pulled and 1 or 0)
    local items = (d.pass_items :: integer) + #(page.items :: { Map })
    local within = pages < rp.max_pages and (rp.max_items == 0 or items < rp.max_items)
    if pulled and page.has_more and within then return { pages = pages, items = items }, true end
    return { pages = 0, items = 0 }, false
end

return M
