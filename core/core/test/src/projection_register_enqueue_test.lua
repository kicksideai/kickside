local test = require("test")
local sql = require("sql")
local writer = require("writer")
local fixture = require("fixture")
local function dialect(): string
    local db, err = sql.get("app:db")
    if err then error(err) end
    if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "enqueue guard requires a database"})) end
    local value, type_err = db:type()
    db:release()
    if type_err then error(type_err) end
    if type(value) ~= "string" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "enqueue guard requires a dialect"})) end
    return value
end
local params = {kind = "model", worker_ref = "func://app:test_count_worker", system_identity = true}
local function invoke(transaction: boolean): (any, error?)
    if transaction then
        local tx, err = fixture.database():begin()
        if err then return nil, err end
        return writer.register_projection_tx(tx, fixture.dbtype, "thread", params)
    end
    return writer.register_projection(fixture.database(), "thread", params)
end
return {run = test.run_cases(function()
    test.describe("projection slot enqueue boundary", function()
        local dbtype = dialect()
        for _, transaction in ipairs({false, true}) do
            for _, existing in ipairs({false, true}) do
                for index, response in ipairs({{}, {value = false}, {value = 1}, {value = {}}, {value = ""}}) do
                    test.it("missing slot proof/" .. tostring(transaction) .. "/" .. tostring(existing) .. "/" .. tostring(index), function()
                        fixture.reset(dbtype, "enqueue", nil, existing)
                        fixture.enqueue_value = response.value
                        local result, err = invoke(transaction)
                        test.is_nil(result)
                        test.is_true(errors.is(err, errors.INTERNAL))
                        if not err then error(errors.new({kind = errors.INTERNAL, message = "slot proof guard requires an error", retryable = false})) end
                        test.is_false(err:retryable())
                        test.eq(err:details().code, "projection_registration_response")
                        test.eq(err:details().field, "job_id")
                        test.eq(fixture.writes, 2)
                        test.eq(fixture.commits, 0)
                        test.eq(fixture.rollbacks, transaction and 0 or 1)
                        test.eq(fixture.notifications, 0)
                    end)
                end
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it("native enqueue/" .. tostring(transaction) .. "/" .. tostring(existing) .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local source = errors.new({kind = kind, retryable = policy.retryable, message = "slot dependency refusal",
                                    details = detailed and {code = "slot_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(dbtype, "enqueue", source, existing)
                                local result, err = invoke(transaction)
                                test.is_nil(result)
                                test.is_true(errors.is(err, kind))
                                if not err then error(errors.new({kind = errors.INTERNAL, message = "slot dependency guard requires an error", retryable = false})) end
                                test.eq(err:retryable(), source:retryable())
                                if detailed then test.eq(err:details().code, "slot_dependency"); test.eq(err:details().nested.marker, "kept")
                                else test.is_nil(err:details()) end
                                test.eq(fixture.commits, 0)
                                test.eq(fixture.rollbacks, transaction and 0 or 1)
                                test.eq(fixture.notifications, 0)
                            end)
                        end
                    end
                end
                test.it("valid slot/" .. tostring(transaction) .. "/" .. tostring(existing), function()
                    fixture.reset(dbtype, "enqueue", nil, existing)
                    local result, err = invoke(transaction)
                    test.is_nil(err); test.not_nil(result); test.eq(result.job_id, "job")
                    test.eq(fixture.commits, transaction and 0 or 1)
                    test.eq(fixture.rollbacks, 0)
                end)
            end
        end
    end)
end)}
