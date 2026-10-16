local test = require("test")
local reader = require("reader")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function invoke(route: string): (any, error?)
    local instance = reader.new():with_user("user-1")
    if route == "all" then return instance:all() end
    if route == "one" then return instance:one() end
    if route == "count" then return instance:count() end
    return instance:exists()
end
local function native(actual: any, source: error)
    test.eq(type(actual), "userdata"); test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    test.eq(actual:details().code, "reader_dependency"); test.eq(actual:details().nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native component reader dependencies", function()
        for _, route in ipairs({"all", "one", "count", "exists"}) do
            local stages = {"open", "narrow", "query", "release"}
            if route == "all" or route == "one" then stages[#stages + 1] = "build"; stages[#stages + 1] = "metadata" end
            for _, stage in ipairs(stages) do
                for _, kind in ipairs(kinds) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(route .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, retryable = options.retryable, message = "reader dependency refuses",
                                details = {code = "reader_dependency", nested = {marker = "kept"}}})
                            fixture.reset(route, stage, source); local result, err = invoke(route)
                            if route == "exists" then test.is_false(result) else test.is_nil(result) end
                            native(err, source)
                            test.eq(fixture.opens, stage == "build" and 0 or 1)
                            test.eq(fixture.releases, (stage == "build" or stage == "open") and 0 or 1)
                            if stage == "narrow" then test.eq(fixture.queries, 0) end
                        end)
                    end
                end
            end
            test.it(route .. "/candidate/propagates before opening the database", function()
                local source = errors.new({kind = errors.UNAVAILABLE, retryable = true,
                    message = "candidate query refuses",
                    details = {code = "reader_dependency", nested = {marker = "kept"}}})
                fixture.reset(route, "candidate", source)
                local ok, thrown = pcall(invoke, route)
                test.is_false(ok)
                native(thrown, source)
                test.eq(fixture.opens, 0)
                test.eq(fixture.releases, 0)
            end)
            for _, stage in ipairs({"narrow", "query", "metadata"}) do
                if stage ~= "metadata" or route == "all" or route == "one" then
                    for _, kind in ipairs(kinds) do
                        for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                            test.it(route .. "/secondary/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                                local primary = errors.new({kind = errors.INVALID, retryable = false, message = "reader query refuses",
                                    details = {code = "reader_primary", nested = {marker = "primary"}}})
                                local cleanup = errors.new({kind = kind, retryable = options.retryable, message = "reader release refuses",
                                    details = {code = "reader_dependency", nested = {marker = "kept"}}})
                                fixture.reset(route, stage, primary); fixture.release_source = cleanup
                                local result, err = invoke(route)
                                if route == "exists" then test.is_false(result) else test.is_nil(result) end
                                native(err, cleanup); local cause = err:details().operation_error
                                test.eq(cause.kind, primary:kind()); test.is_false(cause.retryable)
                                test.eq(cause.details.code, "reader_primary"); test.eq(cause.details.nested.marker, "primary"); test.eq(fixture.releases, 1)
                            end)
                        end
                    end
                end
            end
            test.it("healthy/" .. route, function()
                fixture.reset(route, "", nil); local result, err = invoke(route); test.is_nil(err); test.eq(fixture.releases, 1)
                test.eq(fixture.candidates, 1)
                if route == "all" then
                    if type(result) ~= "table" or type(result[1]) ~= "table" then error("missing component array") end
                    test.eq(#result, 1); test.eq(result[1].meta.title, "kept")
                elseif route == "one" then
                    if type(result) ~= "table" then error("missing component row") end
                    test.eq(result.meta.title, "kept")
                elseif route == "count" then test.eq(result, 1) else test.is_true(result) end
            end)
            test.it("empty/" .. route, function()
                fixture.reset(route, "", nil); fixture.empty = true
                local result, err = invoke(route); test.is_nil(err); test.eq(fixture.releases, 1)
                if route == "all" then
                    if type(result) ~= "table" then error("missing empty component array") end
                    test.eq(#result, 0)
                elseif route == "one" then test.is_nil(result)
                elseif route == "count" then test.eq(result, 0) else test.is_false(result) end
            end)
        end
    end)
end)}
