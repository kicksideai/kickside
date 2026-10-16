-- Pure undo/redo tracker. Each entry pairs the forward events of one applied batch
-- with the inverse events that reverse it. A new batch caps the undo stack at
-- MAX_UNDO (dropping the oldest) and clears the redo stack. The writer commits
-- the tracker and replay in the same transaction.

local types = require("types")

local M = {}

M.MAX_UNDO = types.MAX_UNDO

function M.new(): any
    return { undo = {}, redo = {} }
end

function M.can_undo(t: any): boolean
    return type(t) == "table" and type(t.undo) == "table" and #t.undo > 0
end

function M.can_redo(t: any): boolean
    return type(t) == "table" and type(t.redo) == "table" and #t.redo > 0
end

-- record(t, forward_events, inverse_events): push a new batch. Caps the undo stack
-- and clears redo (the standard linear-history model).
function M.record(t: any, forward_events: any, inverse_events: any)
    local undo_stack = t.undo :: { any }
    undo_stack[#undo_stack + 1] = { forward = forward_events or {}, inverse = inverse_events or {} }
    while #undo_stack > M.MAX_UNDO do table.remove(undo_stack, 1) end
    t.redo = {}
end

function M.take_undo(t: any): any
    local undo_stack = t.undo :: { any }
    if #undo_stack == 0 then return nil end
    return table.remove(undo_stack)
end

function M.finish_undo(t: any, entry: any)
    local redo_stack = t.redo :: { any }
    redo_stack[#redo_stack + 1] = entry
end

function M.restore_undo(t: any, entry: any)
    local undo_stack = t.undo :: { any }
    undo_stack[#undo_stack + 1] = entry
end

function M.take_redo(t: any): any
    local redo_stack = t.redo :: { any }
    if #redo_stack == 0 then return nil end
    return table.remove(redo_stack)
end

function M.finish_redo(t: any, entry: any)
    local undo_stack = t.undo :: { any }
    undo_stack[#undo_stack + 1] = entry
    while #undo_stack > M.MAX_UNDO do table.remove(undo_stack, 1) end
end

function M.restore_redo(t: any, entry: any)
    local redo_stack = t.redo :: { any }
    redo_stack[#redo_stack + 1] = entry
end

return M
