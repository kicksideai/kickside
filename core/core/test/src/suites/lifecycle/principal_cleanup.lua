local function run(args: any): any
    local principal_id = tostring((type(args) == "table" and args.principal_id) or "")
    if principal_id:find("cleanup-fail-", 1, true) == 1 then
        return { success = false, error = "cleanup down" }
    end
    return { success = true }
end

return { run = run }
