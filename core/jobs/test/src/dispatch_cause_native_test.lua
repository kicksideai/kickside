local test = require("test")
local dispatch = require("dispatch")
local fixture = require("fixture")
local function invoke(stage)
    local db: any = {}
    if stage == "registry" then return dispatch.parse_worker_ref("func://fixture-target") end
    if stage == "policy" then return dispatch.unattributed_scope() end
    if stage == "executor" then return dispatch.execute_job(db, "sqlite", {id = "job", worker_ref = "func://fixture-target", payload = "{}"}) end
    return dispatch.run_supervised_proc(db, "sqlite", {id = "job", payload = "{}"},
        {target_id = "fixture-target", worker_ref = "proc://fixture-target"}, nil, nil)
end
return {run = test.run_cases(function()
    test.describe("native worker dispatch dependency causes", function()
        for _, stage in ipairs({"registry", "policy", "executor", "spawn"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, opts in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(opts.retryable), function()
                        local source = errors.new({kind = kind, message = "dispatch dependency refusal", retryable = opts.retryable,
                            details = {code = "dispatch_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source)
                        local output, actual = invoke(stage); test.is_nil(output)
                        if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "dispatch cause guard requires failure"})) end
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(actual:details().code, "dispatch_dependency"); test.eq(actual:details().nested.stage, stage)
                        test.eq(source:details().nested.stage, stage); test.eq(fixture.calls, 0)
                        test.eq(fixture.spawns, stage == "spawn" and 1 or 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"executor", "spawn"}) do
            test.it("healthy dispatch/" .. stage, function()
                fixture.reset("", nil); local output, err = invoke(stage)
                test.is_nil(err); test.eq(output.result.marker, "kept")
                test.eq(fixture.calls, stage == "executor" and 1 or 0); test.eq(fixture.spawns, stage == "spawn" and 1 or 0)
            end)
        end
    end)
end)}
