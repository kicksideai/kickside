local M = {}

function M.validate(args: any): any
    if args.value == true and args.old_value ~= false then
        return { valid = false, error = "true requires a previous false value" }
    end
    return { valid = true }
end

return M
