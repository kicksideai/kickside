local test = require("test")
local lifecycle = require("lifecycle")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("native lifecycle persistence dependencies", function()
        for _, method in ipairs({"ensure", "ensure_tx", "append", "append_tx"}) do
            local ensuring = method == "ensure" or method == "ensure_tx"
            local function invoke(): (any, error?)
                if ensuring then return lifecycle[method]({} :: any, "owner", "component") end
                if method == "append_tx" then
                    return lifecycle.append_tx({} :: any, "sqlite", "owner", "updated", "key", {value = 1})
                end
                return lifecycle.append({} :: any, "owner", "updated", "key", {value = 1})
            end
            for _, stage in ipairs(ensuring and {"read", "insert", "encode"} or {"encode", "append"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                    errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                    errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(method .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local native = errors.new({kind = kind, message = "lifecycle dependency refusal",
                                retryable = options.retryable, details = {code = "lifecycle_dependency", nested = {stage = stage}}})
                            fixture.reset(stage, native)
                            local result, err = invoke()
                            test.is_nil(result)
                            test.eq(type(err), "userdata")
                            test.eq(err:kind(), native:kind())
                            test.eq(err:retryable(), native:retryable())
                            test.eq(err:details().code, "lifecycle_dependency")
                            test.eq(err:details().nested.stage, stage)
                            test.eq(fixture.writes, stage == "insert" and 1 or 0)
                            test.eq(fixture.appends, stage == "append" and 1 or 0)
                        end)
                    end
                end
            end
            test.it(method .. "/missing encoder proof prevents durable work", function()
                fixture.reset("encode", nil)
                local result, err = invoke()
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.is_false(err:retryable())
                test.eq(err:details().code, "lifecycle_response")
                test.eq(err:details().field, ensuring and "attrs" or "event_body")
                test.eq(fixture.writes, 0)
                test.eq(fixture.appends, 0)
            end)
            if ensuring then
                test.it(method .. "/missing row proof prevents durable work", function()
                    fixture.reset("read", nil)
                    local result, err = invoke()
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.is_false(err:retryable())
                    test.eq(err:details().code, "lifecycle_response")
                    test.eq(err:details().field, "rows")
                    test.eq(fixture.writes, 0)
                end)
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                    errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                    errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(method .. "/recheck/" .. kind .. "/" .. tostring(options.retryable), function()
                            local insertion = errors.new({kind = errors.UNAVAILABLE, message = "insert refusal", retryable = false,
                                details = {code = "insert_dependency", nested = {value = 2}}})
                            local refusal = errors.new({kind = kind, message = "recheck refusal", retryable = options.retryable,
                                details = {code = "recheck_dependency", nested = {value = 3}}})
                            fixture.reset("insert", insertion)
                            fixture.recheck_source = refusal
                            local result, err = invoke()
                            test.is_nil(result)
                            test.eq(err:kind(), refusal:kind())
                            test.eq(err:retryable(), refusal:retryable())
                            test.eq(err:details().code, "recheck_dependency")
                            test.eq(err:details().nested.value, 3)
                            test.eq(err:details().operation_error.kind, insertion:kind())
                            test.is_false(err:details().operation_error.retryable)
                            test.eq(err:details().operation_error.details.code, "insert_dependency")
                            test.eq(err:details().operation_error.details.nested.value, 2)
                            test.eq(fixture.writes, 1)
                            test.eq(fixture.queries, 2)
                        end)
                    end
                end
            end
            test.it(method .. "/valid result preserves persistence semantics", function()
                fixture.reset("", nil)
                local result, err = invoke()
                test.is_nil(err)
                if ensuring then test.eq(result, lifecycle.thread_id("owner"))
                else test.eq(result.inserted, 1) end
                test.eq(fixture.writes, ensuring and 1 or 0)
                test.eq(fixture.appends, ensuring and 0 or 1)
            end)
        end
        test.it("an existing lifecycle thread requires no insert or encoding", function()
            fixture.reset("existing", nil)
            local result, err = lifecycle.ensure({} :: any, "owner", "component")
            test.is_nil(err)
            test.eq(result, lifecycle.thread_id("owner"))
            test.eq(fixture.encodes, 0)
            test.eq(fixture.writes, 0)
        end)
        test.it("concurrent deterministic insertion remains idempotent", function()
            fixture.reset("race", errors.new({kind = errors.ALREADY_EXISTS, message = "concurrent insertion"}))
            local result, err = lifecycle.ensure({} :: any, "owner", "component")
            test.is_nil(err)
            test.eq(result, lifecycle.thread_id("owner"))
            test.eq(fixture.writes, 1)
            test.eq(fixture.queries, 2)
        end)
    end)
end)}
