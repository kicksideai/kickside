local test = require("test")
local enqueue = require("enqueue")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local routes: {{name: string, stages: {string}}} = {
    {name = "encode", stages = {"encode"}}, {name = "decode", stages = {"decode"}},
    {name = "new", stages = {"policy", "trace", "encode", "lookup", "size", "fence", "insert", "parse"}},
    {name = "existing", stages = {"decode"}}, {name = "race", stages = {"conflict", "decode"}},
    {name = "standalone", stages = {"begin", "lookup", "insert", "commit"}},
}
local function invoke(route, dialect): (any?, error?, boolean?)
    if route == "encode" then return enqueue.encode_object({}) end
    if route == "decode" then return enqueue.decode_payload("{}") end
    local params = {owner_locator = {kind = "test", id = "owner"}, job_type = "guard", payload = {},
        job_identity = {namespace = "guard", scope = "scope", key = "key"}}
    if fixture.stage == "parse" then params.scheduled_at = "2026-10-10T00:00:00Z" end
    return enqueue.enqueue_job(route == "standalone" and fixture.database() or fixture.executor(), dialect, params)
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "enqueue guard requires an error"})) end
    return err
end
local function retains(actual: error, source: error): ()
    test.is_true(errors.is(actual, source:kind())); test.eq(actual:retryable(), source:retryable())
    if source:details() then
        test.eq(actual:details().code, "enqueue_dependency"); test.eq(actual:details().nested.marker, "kept")
    else test.is_nil(actual:details()) end
end
local function group(first: integer, last: integer, stage_first: integer?, stage_last: integer?)
    return test.run_cases(function()
        test.describe("native enqueue boundaries", function()
            for _, dialect in ipairs({"sqlite", "postgres"}) do
                for index = first, last do
                    local route = routes[index]
                    for stage_index = stage_first or 1, stage_last or #route.stages do
                        local stage = route.stages[stage_index]
                        for _, kind in ipairs(kinds) do
                            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                                for _, detailed in ipairs({false, true}) do
                                    test.it(dialect .. "/" .. route.name .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                        local source = errors.new({kind = kind, message = "dependency refusal", retryable = policy.retryable,
                                            details = detailed and {code = "enqueue_dependency", nested = {marker = "kept"}} or nil})
                                        fixture.reset(route.name, stage, source)
                                        local _, err = invoke(route.name, dialect)
                                        retains(required(err), source)
                                        if stage == "lookup" then test.eq(fixture.inserts, 0) end
                                    end)
                                end
                            end
                        end
                    end
                    if stage_last == nil or stage_last == #route.stages then test.it("success/" .. dialect .. "/" .. route.name, function()
                        fixture.reset(route.name, "", nil)
                        local value, err, inserted = invoke(route.name, dialect)
                        test.is_nil(err); test.not_nil(value)
                        if route.name == "existing" or route.name == "race" then test.eq(value, "existing"); test.is_false(inserted) end
                        if route.name == "existing" then test.eq(fixture.inserts, 0) end
                    end) end
                end
                if first == 6 then
                    for _, kind in ipairs(kinds) do
                        test.it("rollback/" .. dialect .. "/" .. kind, function()
                            local source = errors.new({kind = kind, message = "rollback refusal", retryable = false,
                                details = {code = "enqueue_dependency", nested = {marker = "kept"}}})
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, message = "read refusal", retryable = false,
                                details = {code = "enqueue_primary", nested = {marker = "primary"}}})
                            fixture.reset("standalone", "rollback", source); fixture.primary = primary
                            local _, err = invoke("standalone", dialect); local actual = required(err)
                            retains(actual, source); test.eq(actual:details().operation_error.kind, primary:kind())
                            test.eq(actual:details().operation_error.retryable, primary:retryable())
                            test.eq(actual:details().operation_error.details.code, "enqueue_primary")
                            test.eq(actual:details().operation_error.details.nested.marker, "primary")
                            test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0)
                        end)
                    end
                    for _, stage in ipairs({"begin", "lookup", "insert", "parse", "encode", "conflict"}) do
                        for index, malformed in ipairs({{}, {value = false}, {value = 0}}) do
                            test.it("proof/" .. dialect .. "/" .. stage .. "/" .. tostring(index), function()
                                fixture.reset(stage == "conflict" and "race" or "standalone", stage, nil)
                                fixture.missing, fixture.value = true, malformed.value
                                local ok, _, err = pcall(function() return invoke(stage == "conflict" and "race" or "standalone", dialect) end)
                                test.is_true(ok); local actual = required(err)
                                test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                                test.eq(actual:details().code, "job_enqueue_response")
                                if stage == "lookup" then test.eq(fixture.inserts, 0) end
                            end)
                        end
                    end
                    for _, count in ipairs({-1, 0.5, 2, "bad"}) do
                        test.it("count/" .. dialect .. "/" .. tostring(count), function()
                            fixture.reset("standalone", "insert", nil); fixture.missing, fixture.value = true, {rows_affected = count}
                            local _, err = invoke("standalone", dialect); local actual = required(err)
                            test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                            test.eq(actual:details().code, "job_enqueue_response"); test.eq(fixture.commits, 0)
                        end)
                    end
                end
            end
        end)
    end)
end
return {run = group(1, 2), fresh = group(3, 3, 1, 4), fresh_tail = group(3, 3, 5, 8), existing = group(4, 4), race = group(5, 5), standalone = group(6, 6)}
