local test = require("test")
local fixture = require("fixture")
local api = require("api")
local sql_boundary = require("sql_boundary")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "cleanup guard requires JSON proof"})) end
    return data
end
local function invoke(): (any?, error?) return api.upsert({thread_class = "class", external_ref = "ref"}) end
return {run = test.run_cases(function()
    test.describe("natural upsert cleanup preserves native causes", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, kind in ipairs(kinds) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("canonical cleanup diagnostic/" .. kind .. "/" .. tostring(policy.retryable), function()
                    local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque release refusal", details = {code = "native_release"}})
                    local primary = errors.new({kind = errors.INVALID, retryable = false, message = "opaque operation refusal", details = {code = "native_operation"}})
                    local db: any = {release = function() return false, source end}
                    local diagnostic: {cleanup_error: error?} = {}
                    local err = sql_boundary.release(db, primary, "release probe", diagnostic)
                    local cleanup = diagnostic.cleanup_error
                    test.not_nil(err); test.not_nil(cleanup)
                    test.eq(encoded(error_envelope.encode(cleanup)), encoded(error_envelope.encode(source)))
                    test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                end)
            end
        end
        test.it("release retains one return and clears reused diagnostics", function()
            local primary = errors.new({kind = errors.INVALID, retryable = false, message = "opaque operation refusal"})
            local db: any = {release = function() return true, nil end}
            local diagnostic: {cleanup_error: error?} = {cleanup_error = primary}
            test.eq(select("#", sql_boundary.release(db, primary, "release probe")), 1)
            test.eq(select("#", sql_boundary.release(db, primary, "release probe", diagnostic)), 1)
            test.is_nil(diagnostic.cleanup_error)
            test.eq(sql_boundary.release(db, primary, "release probe", diagnostic), primary)
        end)
        local paths = {{path = "existing", stage = "resolve_release", releases = 1},
            {path = "created", stage = "read_release", releases = 2},
            {path = "created", stage = "complete_release", releases = 3},
            {path = "winner", stage = "probe_release", releases = 2},
            {path = "winner_v2", stage = "probe_release", releases = 2},
            {path = "winner_legacy", stage = "probe_release", releases = 2}}
        for _, path in ipairs(paths) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(path.path .. "/" .. path.stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque release refusal",
                            details = {code = "natural_release", nested = {marker = "kept"}}})
                        fixture.reset(path.path, path.stage, source, nil)
                        local value, err = invoke()
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind())
                        if path.path == "created" then
                            test.is_false(err:retryable()); test.eq(encoded(err:details().cause.details), encoded(source:details()))
                        else test.eq(err:retryable(), source:retryable()) end
                        test.eq(err:details().code, "natural_release"); test.eq(err:details().nested.marker, "kept")
                        test.eq(fixture.releases, path.releases); test.eq(fixture.emits, 0)
                    end)
                end
            end
        end
        for _, path in ipairs({{path = "existing", stage = "resolve"}, {path = "created", stage = "read"},
            {path = "created", stage = "complete"}, {path = "created", stage = "mark"},
            {path = "winner", stage = "winner_resolve"}, {path = "winner_v2", stage = "winner_resolve"},
            {path = "winner_legacy", stage = "winner_resolve"}}) do
            test.it(path.stage .. " and release", function()
                local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "opaque operation refusal", details = {code = "natural_operation"}})
                local secondary = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "opaque release refusal", details = {code = "natural_release"}})
                fixture.reset(path.path, path.stage, primary, secondary)
                local value, err = invoke()
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), secondary:kind())
                test.eq(err:details().code, "natural_release"); test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                test.eq(fixture.emits, 0)
            end)
        end
        for _, path in ipairs({"existing", "created"}) do
            test.it("healthy/" .. path, function()
                fixture.reset(path, "", nil, nil)
                local value, err = invoke(); test.is_nil(err); test.eq(value.thread_id, "thread")
                test.eq(value.created, path == "created"); test.eq(fixture.releases, path == "created" and 3 or 1)
                test.eq(fixture.registrations, path == "created" and 1 or 0); test.eq(fixture.emits, path == "created" and 1 or 0)
            end)
        end
        test.it("registration conflict reads the committed natural-key winner without polling", function()
            fixture.reset("winner", "", nil, nil)
            local value, err = invoke()
            test.is_nil(err)
            test.eq(value.thread_id, "thread")
            test.is_false(value.created)
            test.eq(fixture.registrations, 1)
            test.eq(fixture.opens, 2)
            test.eq(fixture.releases, 2)
        end)
        test.it("legacy allocation collision registers the resolved v8 identity", function()
            fixture.reset("v2_reallocated", "", nil, nil)
            local value, err = invoke()
            test.is_nil(err)
            test.eq(value.thread_id, "v8")
            test.is_true(value.created)
            test.eq(fixture.registrations, 2)
            test.eq(fixture.opens, 4)
        end)
    end)
end)}
