-- Registered callee for the proc -> execution_identity.run_as regression test.
-- Return only the fields needed to prove that a nested envelope/item survived
-- the funcs call boundary.

local M = {}

function M.echo(args: any): table
    local a = type(args) == "table" and args or {}
    local envelopes = type(a.envelopes) == "table" and a.envelopes or {}
    local first = type(envelopes[1]) == "table" and envelopes[1] or {}
    return {
        trigger_id = a.trigger_id,
        envelope_count = #envelopes,
        item = first.item,
        dedup_key = first.dedup_key,
    }
end

return M
