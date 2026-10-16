local test = require("test")
local source = require("source")
local fixture = require("fixture")
local cases = {
    {stage = "claim", registers = 0, subscribes = 0, acquisitions = 0, recoveries = 0, unregisters = 0, unlistens = 1, closes = 0, releases = 0},
    {stage = "register", registers = 1, subscribes = 0, acquisitions = 0, recoveries = 0, unregisters = 2, unlistens = 2, closes = 0, releases = 0},
    {stage = "subscribe", registers = 1, subscribes = 1, acquisitions = 0, recoveries = 0, unregisters = 2, unlistens = 2, closes = 0, releases = 0},
    {stage = "acquire", registers = 1, subscribes = 1, acquisitions = 1, recoveries = 0, unregisters = 2, unlistens = 2, closes = 1, releases = 0},
    {stage = "recover", registers = 1, subscribes = 1, acquisitions = 1, recoveries = 1, unregisters = 2, unlistens = 2, closes = 1, releases = 1},
}
return {run = test.run_cases(function()
    test.describe("native retention process dependencies", function()
        for _, case in ipairs(cases) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(case.stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local native = errors.new({kind = kind, message = "retention process refusal", retryable = options.retryable,
                            details = {code = "retention_process_dependency", nested = {stage = case.stage}}})
                        fixture.reset(case.stage, native)
                        local result, err = source.main()
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), native:kind())
                        test.eq(err:retryable(), native:retryable())
                        test.eq(err:details().code, "retention_process_dependency")
                        test.eq(err:details().nested.stage, case.stage)
                        test.eq(fixture.claims, 1)
                        for _, field in ipairs({"registers", "subscribes", "acquisitions", "recoveries", "unregisters", "unlistens", "closes", "releases"}) do
                            test.eq(fixture[field], case[field], field)
                        end
                        test.eq(fixture.selects, 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"cancel", ""}) do
            test.it("retains cancellation and cleanup/" .. stage, function()
                fixture.reset(stage, nil)
                local result, err = source.main()
                test.is_nil(result)
                test.is_nil(err)
                test.eq(fixture.claims, 1)
                test.eq(fixture.selects, stage == "cancel" and 0 or 1)
                test.eq(fixture.recoveries, stage == "cancel" and 0 or 1)
                test.eq(fixture.releases, stage == "cancel" and 0 or 1)
                test.eq(fixture.closes, stage == "cancel" and 0 or 1)
                test.eq(fixture.unlistens, stage == "cancel" and 1 or 2)
                test.eq(fixture.unregisters, stage == "cancel" and 0 or 2)
            end)
        end
    end)
end)}
