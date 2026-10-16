local api_errors = require("api_errors")
local json = require("json")
local handlers = {
    list_scopes = require("list_scopes"),
    list_policies = require("list_policies"),
    save_scope = require("save_scope"),
    delete_scope = require("delete_scope"),
}

local function run(args)
    local counts = {headers = 0, statuses = 0, writes = 0}
    local source = errors.new({kind = args.retryable and errors.UNAVAILABLE or errors.RATE_LIMITED, retryable = args.retryable == true,
        message = "HTTP output dependency", details = {code = "http_output_dependency",
            stage = args.stage, nested = {marker = "retained"}}})
    local output = {
        set_content_type = function()
            counts.headers = counts.headers + 1
            if args.stage == "header" then return source end
        end,
        set_status = function(_, status)
            counts.statuses = counts.statuses + 1
            assert(status == 200)
            if args.stage == "status" then return source end
        end,
        write_json = function(_, payload)
            counts.writes = counts.writes + 1
            assert(payload.success == true)
            if args.stage == "json" then return source end
        end,
    }
    local request = {
        query = function(_, key) if key == "slug" then return args.slug end end,
        body = function() return assert(json.encode({slug = args.slug, policies = {}})) end,
    }
    local original = api_errors.context
    api_errors.context = function() return output, request, nil end
    local ok, result, err = pcall(handlers[args.handler].handler)
    api_errors.context = original
    if not ok then error(result) end
    return result, err, counts
end
return {run = run}
