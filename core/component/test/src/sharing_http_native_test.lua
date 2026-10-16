local test = require("test")
local http = require("http")
local canonical_json = require("canonical_json")
local http_errors = require("http_errors")
local share = require("share")
local adopt = require("adopt")
local list = require("list")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "sharing HTTP guard requires JSON proof"})) end
    return data
end
local function invoke(route: string, stage: string, source: error?): any
    local captured = {effects = 0}
    local request = {param = function() return "component" end,
        body = function() return route == "revoke" and '{"subject_id":"subject","subject_type":"user","action":"revoke"}' or '{"subject_id":"subject","subject_type":"user","access_mask":1}' end}
    local runtime = {CONTENT = http.CONTENT, STATUS = http.STATUS, request = function() return request end,
        response = function() return {set_content_type = function() end, set_status = function(_, value) captured.status = value end,
            write_json = function(_, value) captured.body = value end} end}
    local function apply(): (any, error?)
        if stage == "apply" or stage == "missing_apply" then return nil, source end
        if stage == "reply" then
            if not source then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "sharing guard requires a source error"})) end
            return {success = false, error = source:message(), kind = source:kind(), retryable = source:retryable(), details = source:details()}, nil
        end
        captured.effects = captured.effects + 1
        return {success = true}, nil
    end
    local dependency = {ACCESS = {ADMIN = 8, READ = 1},
        adopt = function(): (any, error?)
            if stage == "adopt" or stage == "missing_adopt" then return nil, source end
            captured.effects = captured.effects + 1
            return {component_id = "component", adopted_by = "actor", identity_generation = 1, prior_access = {}}, nil
        end,
        validate_access = function(): (any, error?) return true, stage == "gate" and source or nil end,
        list_access = function(): (any, any, error?) if stage == "missing_list" then return nil, nil, nil end; return {}, nil, stage == "list" and source or nil end,
        get_service = function(): (any, error?)
            if stage == "service" or stage == "missing_service" then return nil, source end
            return {grant_subtree = apply, revoke_subtree = apply}, nil
        end}
    local adapter = route == "adopt" and adopt or (route == "list" and list or share)
    adapter.new({http = runtime, component = dependency, security = {actor = function() return {} end}}).handler()
    return captured
end
return {run = test.run_cases(function()
    test.describe("native component sharing and adoption HTTP operations", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED, errors.UNAVAILABLE,
            errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, kind in ipairs(kinds) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, detailed in ipairs({false, true}) do
                    for _, case in ipairs({{route = "adopt", stage = "adopt"}, {route = "list", stage = "list"}, {route = "grant", stage = "gate"}, {route = "grant", stage = "list"},
                        {route = "grant", stage = "service"}, {route = "grant", stage = "apply"}, {route = "revoke", stage = "apply"},
                        {route = "grant", stage = "reply"}, {route = "revoke", stage = "reply"}}) do
                        test.it(case.route .. "/" .. case.stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque sharing refusal",
                                details = detailed and {code = "sharing_dependency", nested = {marker = "kept"}} or nil})
                            local result = invoke(case.route, case.stage, source)
                            test.eq(result.status, (http_errors.classify(source))); test.is_false(result.body.success)
                            test.eq(result.body.kind, source:kind()); test.eq(result.body.retryable, source:retryable()); test.eq(encoded(result.body.details), encoded(source:details()))
                            test.eq(result.body.error, case.stage == "service" and "component service unavailable" or (case.stage == "reply" and source:message() or tostring(source)))
                            test.eq(result.effects, 0)
                        end)
                    end
                end
            end
        end
        for _, case in ipairs({{route = "adopt", stage = "missing_adopt"}, {route = "list", stage = "missing_list"}, {route = "grant", stage = "missing_service"},
            {route = "grant", stage = "missing_apply"}, {route = "revoke", stage = "missing_apply"}}) do
            test.it(case.route .. "/" .. case.stage, function()
                local result = invoke(case.route, case.stage, nil)
                test.eq(result.status, 500); test.is_false(result.body.success); test.eq(result.body.kind, errors.INTERNAL); test.is_false(result.body.retryable)
                test.eq(result.body.details.code, "component_http_operation_response"); test.eq(result.effects, 0)
            end)
        end
        for _, route in ipairs({"grant", "revoke", "adopt", "list"}) do
            test.it(route .. "/healthy", function()
                local result = invoke(route, "", nil); test.eq(result.status, 200); test.is_true(result.body.success); test.eq(result.effects, route == "list" and 0 or 1)
                local fields = route == "adopt" and {component_id = "component", adopted_by = "actor", identity_generation = 1, prior_access = {}}
                    or {component_id = "component", subject_id = "subject", subject_type = "user", action = route}
                test.eq(encoded(result.body), encoded(route == "list" and {success = true, count = 0, access = {}} or {success = true, result = fields}))
            end)
        end
    end)
end)}
