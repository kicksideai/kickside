-- Declarative on-change validation for the harness positive_quota setting. The
-- writer resolves it through the definition's validate_func and rejects the write
-- with this message before anything is persisted.

local function validate(args)
    local value = tonumber(args and args.value)
    if value and value < 0 then
        return { valid = false, error = "must be non-negative" }
    end
    return { valid = true }
end

return { validate = validate }
