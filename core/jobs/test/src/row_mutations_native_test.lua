local test = require("test")
local mutations = require("mutations")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local selectors = {{id = "job", identity = "", job_type = ""}, {id = "", identity = "identity", job_type = "type"},
    {id = "", identity = "identity", job_type = ""}}
local executor = {}
local function invoke(selector): error?
    return mutations.cancel(executor, selector.id, selector.identity, selector.job_type, "reason", "finished", 4096)
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "row mutation guard requires an error"})) end
    return err
end
local function retains(actual: error, source: error): ()
    test.is_true(errors.is(actual, source:kind()))
    test.eq(actual:retryable(), source:retryable())
    if source:details() then
        test.eq(actual:details().code, "row_mutation_dependency")
        test.eq(actual:details().nested.marker, "kept")
        test.eq(source:details().nested.marker, "kept")
    else test.is_nil(actual:details()) end
end
return {run = test.run_cases(function()
    test.describe("native cancellation row checks", function()
        for index, selector in ipairs(selectors) do
            for _, stage in ipairs({"query", "check"}) do
                for _, kind in ipairs(kinds) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it(tostring(index) .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local source = errors.new({kind = kind, message = "dependency refusal", retryable = policy.retryable,
                                    details = detailed and {code = "row_mutation_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(stage, source)
                                retains(required(invoke(selector)), source)
                                test.eq(fixture.queries, 1)
                                test.eq(#fixture.checked, stage == "query" and 0 or 1)
                            end)
                        end
                    end
                end
            end
            test.it("missing candidates/" .. tostring(index), function()
                fixture.reset("query", nil)
                fixture.missing = true
                local actual = required(invoke(selector))
                test.is_true(errors.is(actual, errors.INTERNAL))
                test.is_false(actual:retryable())
                test.eq(actual:details().code, "job_row_mutation_response")
                test.eq(actual:details().field, "candidates.rows")
                test.eq(#fixture.checked, 0)
            end)
            for _, empty in ipairs({false, true}) do
                test.it("success/" .. tostring(index) .. "/" .. tostring(empty), function()
                    fixture.reset("", nil)
                    if empty then fixture.rows = {} end
                    test.is_nil(invoke(selector))
                    test.eq(fixture.queries, 1)
                    test.eq(fixture.table_name, "kickside_job")
                    test.eq(fixture.filters[1], "status IN ('pending','running')")
                    if selector.id ~= "" then test.eq(fixture.filters[2].id, selector.id)
                    else
                        test.eq(fixture.filters[2].job_identity, selector.identity)
                        if selector.job_type ~= "" then test.eq(fixture.filters[3].job_type, selector.job_type)
                        else test.eq(#fixture.filters, 2) end
                    end
                    test.eq(#fixture.checked, empty and 0 or 2)
                    for row, checked in ipairs(fixture.checked) do
                        test.eq(checked.id, fixture.rows[row].id)
                        test.eq(checked.name, "kickside_job")
                        test.eq(checked.operation, "cancel_jobs")
                        test.eq(checked.cap, 4096)
                        test.eq(checked.changes.status, "cancelled")
                        test.eq(checked.changes.last_error, "reason")
                        test.eq(checked.changes.finished_at, "finished")
                        test.eq(checked.changes.lease_token, fixture.NULL)
                        test.eq(checked.changes.lease_until, fixture.NULL)
                        test.eq(checked.changes.heartbeat_at, fixture.NULL)
                    end
                end)
            end
        end
    end)
end)}
