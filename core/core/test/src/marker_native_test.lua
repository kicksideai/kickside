local test = require("test")
local events = require("events")
local fixture = require("fixture")
local function run(marked: any, primary: error?, cleanup: error?): error?
    fixture.marked, fixture.mark_error, fixture.purge_error, fixture.calls = marked, primary, cleanup, 0
    local db = {}
    local err = events.stamp_thread_markers(db, "thread", "class", "owner")
    test.eq(fixture.id, "thread")
    test.eq(fixture.attrs.type, "thread")
    test.eq(fixture.attrs.thread_class, "class")
    test.eq(fixture.calls, (primary or not marked) and 1 or 0)
    if fixture.calls == 1 then
        test.eq(fixture.db, db)
        test.eq(fixture.purge_id, "thread")
        test.eq(fixture.owner, "owner")
    end
    return err
end
local function require_error(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "marker guard requires an error"})) end
    return err
end
local function retains(actual: any, source: error): ()
    test.eq(actual.kind, source:kind())
    test.eq(actual.message, source:message())
    test.eq(actual.retryable, source:retryable())
    if source:details() then
        test.eq(actual.details.code, source:details().code)
        test.eq(actual.details.nested.marker, "kept")
    else test.is_nil(actual.details) end
end
return {run = test.run_cases(function()
    test.describe("native thread marker cleanup errors", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
            errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, detailed in ipairs({false, true}) do
                    test.it(kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(detailed), function()
                        local details = detailed and {code = "marker_cleanup_dependency", nested = {marker = "kept"}} or nil
                        local secondary = errors.new({kind = kind, message = "cleanup dependency refusal", retryable = options.retryable, details = details})
                        local primary = errors.new({kind = errors.PERMISSION_DENIED, message = "marker refusal", retryable = false,
                            details = {code = "marker_dependency", nested = {marker = "kept"}}})
                        local err = require_error(run(nil, primary, secondary))
                        test.eq(err:kind(), secondary:kind())
                        test.eq(err:retryable(), secondary:retryable())
                        retains(err:details().cause, secondary)
                        retains(err:details().operation_error, primary)
                        test.eq(primary:details().nested.marker, "kept")
                        if detailed then test.eq(secondary:details().nested.marker, "kept") end
                    end)
                end
            end
        end
        test.it("marker failure survives successful cleanup unchanged", function()
            local source = errors.new({kind = errors.CONFLICT, message = "marker refusal", retryable = true,
                details = {code = "marker_dependency"}})
            test.eq(run(false, source, nil), source)
        end)
        for _, absent in ipairs({"false", "nil"}) do
            test.it("missing marker proof/" .. absent, function()
                local value: any = nil
                if absent == "false" then value = false end
                local err = require_error(run(value, nil, nil))
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "thread_marker_response")
            end)
        end
        test.it("cleanup failure retains the missing-marker proof as its operation", function()
            local source = errors.new({kind = errors.TIMEOUT, message = "cleanup dependency refusal", retryable = true})
            local err = require_error(run(nil, nil, source))
            test.is_true(errors.is(err, errors.TIMEOUT))
            test.is_true(err:retryable())
            retains(err:details().cause, source)
            local operation = err:details().operation_error
            test.eq(operation.kind, errors.INTERNAL)
            test.is_false(operation.retryable)
            test.eq(operation.details.code, "thread_marker_response")
        end)
        test.it("successful marker write requires no cleanup", function()
            test.is_nil(run(true, nil, nil))
        end)
    end)
end)}
