local test = require("test")
local fixture = require("fixture")
local access = require("access")
local http = require("http")
local http_errors = require("http_errors")
local canonical_json = require("canonical_json")
local register = require("register")
local adapters = {pause = require("pause"), resume = require("resume"), remove = require("remove"), list = require("list"),
    retention_read = require("retention_read"), retention_write = require("retention_write")}
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "access guard requires JSON proof"})) end
    return data
end
local function invoke(route: string): any
    if route == "register" then
        local status, body = register.register(fixture.id, {kind = "guard", worker_ref = "func://app:guard_worker"})
        return {status = status, body = body}
    end
    local captured = {}
    local request = {param = function() return fixture.id end, body = function() return "{}" end, query = function() return nil end}
    local response = {set_content_type = function() end, set_status = function(_, value) captured.status = value end,
        write_json = function(_, value) captured.body = value end}
    local work = {pause = fixture.work, resume = fixture.work, remove_projection = fixture.work,
        list_projections = fixture.work, find_by_thread = fixture.work, upsert = fixture.work}
    local dependencies = {http = {request = function() return request end, response = function() return response end,
        STATUS = http.STATUS, CONTENT = http.CONTENT}, sql = {get = fixture.get}, thread_access = fixture.gate,
        writer = work, reader = work, repo = work}
    fixture.runtime = dependencies.http
    if route == "resume" or route == "remove" then adapters[route].handler()
    else adapters[route].new(dependencies).handler() end
    return captured
end
return {run = test.run_cases(function()
    test.describe("native thread access diagnostics", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, stage in ipairs({"read", "access"}) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it("gate/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "access_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source, nil)
                        local allowed, status, message, component_id, err = fixture.gate.gate_thread_access({}, fixture.id, 1)
                        test.is_false(allowed); test.eq(status, (http_errors.classify(source))); test.not_nil(message); test.is_nil(component_id); test.not_nil(err)
                        test.eq(err:kind(), source:kind()); test.eq(err:retryable(), source:retryable()); test.eq(encoded(err:details()), encoded(source:details()))
                    end)
                    for _, route in ipairs({"pause", "resume", "remove", "list", "retention_read", "retention_write", "register"}) do
                        test.it(route .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque", details = {code = "access_dependency", nested = {marker = "kept"}}})
                            fixture.reset(stage, source, nil); local result = invoke(route)
                            test.eq(result.status, (http_errors.classify(source))); test.is_false(result.body.success); test.eq(result.body.kind, source:kind())
                            test.eq(result.body.retryable, source:retryable()); test.eq(encoded(result.body.details), encoded(source:details()))
                            test.eq(fixture.releases, 1); test.eq(fixture.writes, 0)
                        end)
                        test.it(route .. "/" .. stage .. " and release/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "operation refuses", details = {code = "access_operation"}})
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "release refuses", details = {code = "access_release", nested = {marker = "kept"}}})
                            fixture.reset(stage, primary, source); local result = invoke(route)
                            test.eq(result.status, (http_errors.classify(source))); test.is_false(result.body.success); test.eq(result.body.kind, source:kind()); test.eq(result.body.retryable, source:retryable())
                            test.eq(result.body.details.code, "access_release"); test.eq(result.body.details.nested.marker, "kept")
                            test.eq(result.body.details.operation_error.kind, primary:kind()); test.eq(result.body.details.operation_error.retryable, primary:retryable())
                            test.eq(result.body.details.operation_error.details.code, "access_operation")
                            test.eq(result.body.details.cause.kind, source:kind()); test.eq(result.body.details.cause.retryable, source:retryable()); test.eq(encoded(result.body.details.cause.details), encoded(source:details()))
                            test.eq(fixture.releases, 1); test.eq(fixture.writes, 0)
                        end)
                    end
                end
            end
        end
        for _, stage in ipairs({"missing_component", "denied"}) do
            test.it("originated/" .. stage, function()
                fixture.reset(stage, nil, nil); local allowed, status, message, id, err = fixture.gate.gate_thread_access({}, fixture.id, 1)
                test.is_false(allowed); test.eq(status, stage == "denied" and 403 or 404); test.not_nil(message); test.is_nil(id); test.not_nil(err)
                test.eq(err:kind(), stage == "denied" and errors.PERMISSION_DENIED or errors.NOT_FOUND); test.is_false(err:retryable()); test.not_nil(err:details().code)
            end)
        end
        test.it("valid authority retains the existing successful tuple", function()
            fixture.reset("", nil, nil); local allowed, status, message, id, err = fixture.gate.gate_thread_access({}, fixture.id, 1)
            test.is_true(allowed); test.eq(status, 200); test.is_nil(message); test.eq(id, "component"); test.is_nil(err)
        end)
        test.it("malformed id refuses with native NotFound", function()
            fixture.reset("", nil, nil); local allowed, status, message, id, err = fixture.gate.gate_thread_access({}, "invalid", 1)
            test.is_false(allowed); test.eq(status, 404); test.not_nil(message); test.is_nil(id); test.not_nil(err); test.eq(err:kind(), errors.NOT_FOUND); test.is_false(err:retryable())
            test.eq(fixture.reads, 0); test.eq(fixture.permissions, 0)
        end)
        for _, route in ipairs({"pause", "resume", "remove", "list", "retention_read", "retention_write", "register"}) do
            for _, stage in ipairs({"missing_release", "false_release"}) do
                test.it(route .. "/" .. stage, function()
                    fixture.reset(stage, nil, nil)
                    fixture.gate = access.new({reader = {get_component_id = function() return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "operation refuses", details = {code = "access_operation"}}) end}})
                    local result = invoke(route)
                    test.eq(result.status, 500); test.eq(result.body.kind, errors.INTERNAL); test.is_false(result.body.retryable); test.not_nil(result.body.details.code)
                    test.eq(result.body.details.operation_error.details.code, "access_operation"); test.eq(fixture.releases, 1); test.eq(fixture.writes, 0)
                end)
            end
        end
    end)
end)}
