local M = {}
local pending_unlinks: { [string]: any } = {}

local function key(provider: string, external_id: string): string
    return provider .. "\0" .. external_id
end

function M.cleanup_conversation(args: any): any
    local id = key(args.provider, args.external_id)
    local counts = pending_unlinks[id] or { reply_uncertain = 0, unappended = 0 }
    counts.link_pending = args.retain_counts == true
    pending_unlinks[id] = counts
    return { success = true,
        discarded = { reply_uncertain = counts.reply_uncertain, unappended = counts.unappended } }
end

function M.complete_unlink(args: any): any
    local id = key(args.provider, args.external_id)
    local counts = pending_unlinks[id]
    if counts and counts.link_pending ~= true then
        return { success = false, error = errors.new({ message = "channel test unlink pointer is not pending",
            kind = errors.CONFLICT, retryable = true }) }
    end
    local discarded = counts and { reply_uncertain = counts.reply_uncertain,
        unappended = counts.unappended } or { reply_uncertain = 0, unappended = 0 }
    pending_unlinks[id] = nil
    return { success = true, discarded = discarded }
end

return M
