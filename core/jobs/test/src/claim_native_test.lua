local test = require("test")
local claim = require("claim")
local fixture = require("fixture")
local function invoke(route: string): (any?, error?)
    local db = fixture.database()
    if route == "keys" then return claim.reserve_keys(function(statement: string, params: table?): (table[]?, error?) return db:query(statement, params) end, "postgres", {"key"}) end
    if route == "backlog" then return claim.due_backlog(db, "postgres", 1) end
    if route == "lease" then return claim.lease_row(db, "postgres", "job", "token", "future", "now") end
    if route == "lock" then return claim.lock_candidates(db, "postgres", {"job"}, "now") end
    if route == "batch" then
        local result, err, _, refused = claim.claim_batch(db, "postgres", 1, nil, nil, "worker")
        if err then return result, err end
        if refused and refused[1] then return result, refused[1].error end
        return result, nil
    end
    return claim.claim_job(db, "postgres")
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "claim guard requires an error"})) end
    return err
end
local function retained(actual: error, source: error, secondary: boolean?)
    test.is_true(errors.is(actual, source:kind())); test.eq(actual:retryable(), source:retryable())
    if source:details() then test.eq(actual:details().code, "claim_dependency"); test.eq(actual:details().nested.marker, "kept")
    elseif not secondary then test.is_nil(actual:details()) end
end
local routes = {keys = {"keylock", "keyrecheck"}, backlog = {"backlog"}, lease = {"lease"}, lock = {"joblock"},
    single = {"policy", "begin", "select", "keylock", "keyrecheck", "size", "lease", "commit"},
    batch = {"policy", "candidates", "begin", "fence", "joblock", "cancel", "keylock", "keyrecheck", "savepoint", "size", "lease", "mark", "history", "undo", "release", "commit"}}
return {run = test.run_cases(function()
    for route, phases in pairs(routes) do
        test.describe("native claim/" .. route, function()
            for _, phase in ipairs(phases) do
                for _, kind in ipairs({errors.INVALID, errors.UNAVAILABLE, errors.CONFLICT}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        for _, detailed in ipairs({false, true}) do
                            test.it(phase .. "/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(detailed), function()
                                local source = errors.new({kind = kind, retryable = policy.retryable, message = "claim dependency refusal",
                                    details = detailed and {code = "claim_dependency", nested = {marker = "kept"}} or nil})
                                fixture.reset(route, phase, source); local _, err = invoke(route); retained(required(err), source)
                                local committed_refusal = route == "batch" and (phase == "size" or phase == "history")
                                test.eq(fixture.commits, (phase == "commit" or committed_refusal) and 1 or 0)
                                test.is_true(fixture.updates <= 1)
                            end)
                        end
                    end
                end
            end
            if route == "single" or route == "batch" then
                local rollback_phases = route == "single" and {"select", "keylock", "keyrecheck", "size", "lease"}
                    or {"fence", "joblock", "cancel", "keylock", "keyrecheck", "savepoint", "lease", "mark", "history", "undo", "release"}
                for _, phase in ipairs(rollback_phases) do
                    test.it("rollback/" .. phase, function()
                        local primary = errors.new({kind = errors.INTERNAL, retryable = false, message = "claim primary refusal", details = {code = "claim_primary"}})
                        local source = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "claim rollback refusal", details = {code = "claim_dependency", nested = {marker = "kept"}}})
                        fixture.reset(route, phase, primary); fixture.rollback_error = source
                        local _, err = invoke(route); local actual = required(err); retained(actual, source, true)
                        test.eq(actual:details().operation_error.kind, primary:kind()); test.is_false(actual:details().operation_error.retryable)
                        test.eq(actual:details().operation_error.details.code, "claim_primary"); test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0)
                    end)
                end
            end
            test.it("successful boundary", function()
                fixture.reset(route, "", nil); local result, err = invoke(route); test.is_nil(err); test.not_nil(result)
                if route == "single" or route == "batch" then test.eq(fixture.commits, 1); test.eq(fixture.updates, 1) end
            end)
            if route == "single" then
                test.it("empty selection commit retains native fields", function()
                    local source = errors.new({kind = errors.UNAVAILABLE, retryable = false, message = "empty claim commit refusal", details = {code = "claim_dependency", nested = {marker = "kept"}}})
                    fixture.reset(route, "commit", source); fixture.empty = true
                    local result, err = invoke(route); test.is_nil(result); retained(required(err), source); test.eq(fixture.updates, 0)
                end)
            end
        end)
    end
end)}
