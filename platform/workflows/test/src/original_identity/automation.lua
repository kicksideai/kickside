local function get_runtime(args: any): (any, nil)
    return {execution_identity = {version = 2,
        principal = {kind = "user", id = "current-automation-owner"},
        authorized_by = {kind = "user", id = "current-automation-owner"},
        component_id = args.id, captured_at = "2026-10-02T00:00:00Z"}}, nil
end
return {get_runtime = get_runtime}
