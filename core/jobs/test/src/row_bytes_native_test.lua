local test = require("test")
local bytes = require("bytes")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "row byte guard requires an error"})) end
    return err
end
local function invoke(route, stage): error?
    if route == "measure" then local _, err = bytes.measure({payload = "data"}); return err end
    if route == "check" then return bytes.check({payload = "data"}, 4096, "scope", "guard") end
    local changes: any = {payload_json = "{}"}
    if stage == "build" then changes = function(row) return nil, fixture.source end end
    return bytes.check_update(fixture.executor(), "kickside_job", "job", changes, 4096, "guard")
end
local routes = {"measure", "check", "update"}
local function group(first: integer, last: integer)
    return test.run_cases(function()
    test.describe("native retained row boundaries", function()
        for _, dialect in ipairs({"sqlite", "postgres"}) do
            for route_index = first, last do
                local route = routes[route_index]
                local stages = route == "update" and {"encode", "dialect", "query", "build"} or {"encode"}
                for _, stage in ipairs(stages) do
                    for _, kind in ipairs(kinds) do
                        for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                            for _, detailed in ipairs({false, true}) do
                                test.it(dialect .. "/" .. route .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                    local source = errors.new({kind = kind, message = "dependency refusal", retryable = policy.retryable,
                                        details = detailed and {code = "row_bytes_dependency", nested = {marker = "kept"}} or nil})
                                    fixture.reset(stage, source, dialect)
                                    local actual = required(invoke(route, stage))
                                    test.is_true(errors.is(actual, source:kind()))
                                    test.eq(actual:retryable(), source:retryable())
                                    if detailed then
                                        test.eq(actual:details().code, "row_bytes_dependency")
                                        test.eq(actual:details().nested.marker, "kept")
                                    else test.is_nil(actual:details()) end
                                end)
                            end
                        end
                    end
                end
                test.it("success/" .. dialect .. "/" .. route, function()
                    fixture.reset("", nil, dialect); test.is_nil(invoke(route, ""))
                end)
            end
            if first == 3 then
            for _, stage in ipairs({"encode", "dialect", "query"}) do
                for index, malformed in ipairs({{}, {value = false}, {value = 0}}) do
                    test.it("proof/" .. dialect .. "/" .. stage .. "/" .. tostring(index), function()
                        fixture.reset(stage, nil, dialect); fixture.missing, fixture.value = true, malformed.value
                        local ok, err = pcall(function() return invoke("update", stage) end)
                        test.is_true(ok)
                        local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                        test.eq(actual:details().code, "job_row_bytes_response")
                    end)
                end
            end
            end
        end
    end)
end)
end
return {run = group(1, 1), check = group(2, 2), update = group(3, 3)}
