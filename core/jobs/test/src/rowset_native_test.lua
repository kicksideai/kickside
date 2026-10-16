local test = require("test")
local boundary = require("boundary")
local health = require("health")
local health_fixture = require("health_fixture")
local lease = require("lease")
local lease_fixture = require("lease_fixture")
local sql = require("sql")
local function response(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "SQL rowset is invalid", details = {code = "rowset_response", field = field}})
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "rowset guard requires an error"})) end
    return err
end
return {run = test.run_cases(function()
    test.describe("native SQL rowset proof", function()
        for index, case in ipairs({{}, {value = false}, {value = 0}, {value = ""}, {value = {false}}, {value = {"bad"}},
            {value = {{}, false}}, {value = {[0] = {}}}, {value = {named = {}}}, {value = {[1] = {}, [3] = {}}}, {value = {[0.5] = {}}}}) do
            test.it("invalid collection/" .. tostring(index), function()
                local rows, err = boundary.rows(case.value, nil, "SQL read failed", "rows", response)
                test.is_nil(rows); local actual = required(err)
                test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                test.eq(actual:details().code, "rowset_response"); test.eq(actual:details().field, "rows")
            end)
        end
        for _, rows in ipairs({{}, {{}}, {{id = "one"}, {id = "two", nullable = nil}}}) do
            test.it("valid dense rows/" .. tostring(#rows), function()
                local result, err = boundary.rows(rows, nil, "SQL read failed", "rows", response)
                test.is_nil(err); test.eq(result, rows)
            end)
        end
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, detailed in ipairs({false, true}) do
                    test.it("dependency/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(detailed), function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "rowset dependency refusal",
                            details = detailed and {code = "rowset_dependency", nested = {marker = "kept"}} or nil})
                        local rows, err = boundary.rows({false}, source, "SQL read failed", "rows", response)
                        test.is_nil(rows); local actual = required(err); test.is_true(errors.is(actual, source:kind())); test.eq(actual:retryable(), source:retryable())
                        if detailed then test.eq(actual:details().code, "rowset_dependency"); test.eq(actual:details().nested.marker, "kept") else test.is_nil(actual:details()) end
                    end)
                end
            end
        end
    end)
    test.describe("rowset proof reaches production consumers", function()
        for index, value in ipairs({{false}, {"bad"}, {0}, {named = {}}, {[1] = {}, [3] = {}}}) do
            for _, phase in ipairs({"workers", "fresh"}) do
                test.it("health/" .. phase .. "/" .. tostring(index), function()
                    health_fixture.reset(phase, nil); health_fixture.missing, health_fixture.value = true, value
                    local ok, result, err = pcall(health.health); test.is_true(ok); test.is_nil(result); local actual = required(err)
                    test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                    test.eq(actual:details().code, "job_scope_response"); test.eq(actual:details().field, "health." .. phase)
                    test.eq(health_fixture.releases, 1)
                end)
            end
            test.it("dispatch/" .. tostring(index), function()
                lease_fixture.reset("dispatch", "read", nil); lease_fixture.missing, lease_fixture.value = true, value
                local ok, result, err = pcall(function() return lease.validate_for_dispatch(lease_fixture.database(), sql.type.SQLITE,
                    {id = "job", lease_token = "token", execution_seq = 1}) end)
                test.is_true(ok); test.is_false(result); local actual = required(err)
                test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                test.eq(actual:details().code, "job_lease_response"); test.eq(actual:details().field, "read")
            end)
        end
    end)
end)}
