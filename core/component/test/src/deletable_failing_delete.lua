-- Harness deletable cleanup that always fails, so the delete stops before the
-- row is removed.
local function handle(_request: any): any
    return { success = false, error = "harness cleanup refuses" }
end

return { handle = handle }
