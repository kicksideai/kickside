local test = require("test")
local claim = require("claim")
local fixture = require("fixture")
local function invoke(route: string): (any?, error?)
    local db = fixture.database()
    if route == "keys" then return claim.reserve_keys(function(statement: string, params: table?): (table[]?, error?) return db:query(statement, params) end, "postgres", {"key"}) end
    if route == "backlog" then return claim.due_backlog(db, "postgres", 1) end
    if route == "lease" then return claim.lease_row(db, "postgres", "job", "token", "future", "now") end
    if route == "lock" then return claim.lock_candidates(db, "postgres", {"job"}, "now") end
    if route == "batch" then return claim.claim_batch(db, "postgres", 1, nil, nil, "worker") end
    return claim.claim_job(db, "postgres")
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "claim proof requires an error"})) end
    return err
end
local function proof(route: string, phase: string, value: any, field: string)
    fixture.reset(route, phase, nil); fixture.missing, fixture.value = true, value
    local ok, _, err = pcall(function() return invoke(route) end); test.is_true(ok)
    local actual = required(err); test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
    test.eq(actual:details().code, "job_claim_response"); test.eq(actual:details().field, field); test.eq(fixture.commits, 0)
end
return {run = test.run_cases(function()
    test.describe("claim successful response proof", function()
        local routes = {keys = {keylock = "keys", keyrecheck = "keys.running"}, backlog = {backlog = "backlog"},
            lease = {lease = "lease"}, lock = {joblock = "locked"}, single = {policy = "policy", begin = "transaction", select = "selected"},
            batch = {policy = "policy", begin = "transaction", candidates = "candidates", fence = "fences", joblock = "locked", keylock = "keys", keyrecheck = "keys.running", savepoint = "savepoint", mark = "worker.rows_affected", history = "run"}}
        for route, phases in pairs(routes) do
            test.describe(route, function()
                for phase, field in pairs(phases) do
                    for index, case in ipairs({{}, {value = false}, {value = 0}, {value = ""}}) do
                        test.it(phase .. "/invalid type/" .. tostring(index), function() proof(route, phase, case.value, field) end)
                    end
                    if phase == "keylock" or phase == "keyrecheck" or phase == "backlog" or phase == "lease" or phase == "joblock" or phase == "select" or phase == "candidates" then
                        for index, value in ipairs({{false}, {"bad"}, {[2] = {}}, {named = {}}}) do
                            test.it(phase .. "/invalid rows/" .. tostring(index), function() proof(route, phase, value, field) end)
                        end
                    end
                end
                test.it("successful response remains", function()
                    fixture.reset(route, "", nil); local result, err = invoke(route); test.is_nil(err); test.not_nil(result)
                end)
            end)
        end
        for _, field in ipairs({"attempts", "execution_seq"}) do
            for index, case in ipairs({{}, {value = false}, {value = -1}, {value = 0}, {value = 0.5}, {value = "bad"}}) do
                test.it("invalid lease counter/" .. field .. "/" .. tostring(index), function()
                    local row: any = {attempts = 1, execution_seq = 1}; row[field] = case.value
                    proof("lease", "lease", {row}, "lease." .. field)
                end)
            end
        end
        for _, field in ipairs({"n", "overdue"}) do
            for index, case in ipairs({{}, {value = false}, {value = -1}, {value = 0.5}, {value = "bad"}}) do
                test.it("invalid backlog count/" .. field .. "/" .. tostring(index), function()
                    local row: any = {n = 0, overdue = 0}; row[field] = case.value
                    proof("backlog", "backlog", {row}, "backlog." .. field)
                end)
            end
        end
        for _, value in ipairs({false, "bad"}) do
            test.it("invalid backlog age/" .. tostring(value), function() proof("backlog", "backlog", {{n = 0, overdue = 0, age_ms = value}}, "backlog.age_ms") end)
        end
        for _, phase in ipairs({"select", "candidates", "joblock"}) do
            for index, case in ipairs({{}, {value = false}, {value = 0}, {value = ""}}) do
                test.it("invalid identity/" .. phase .. "/" .. tostring(index), function()
                    local row: any = fixture.job(); row.id = case.value
                    proof(phase == "select" and "single" or "batch", phase, {row}, (phase == "select" and "selected" or phase == "candidates" and "candidates" or "locked") .. ".id")
                end)
            end
        end
        test.it("invalid candidate tier", function()
            local row: any = fixture.job(); row.queue_tier = "unknown"
            proof("batch", "candidates", {row}, "candidates.queue_tier")
        end)
        for index, case in ipairs({{}, {value = "true"}, {value = 2}}) do
            test.it("invalid reservation flag/" .. tostring(index), function() proof("keys", "keylock", {{concurrency_key = "key", acquired = case.value}}, "keys.acquired") end)
        end
        for _, phase in ipairs({"keylock", "keyrecheck"}) do
            for index, case in ipairs({{}, {value = 0}, {value = "other"}}) do
                test.it("invalid reserved key/" .. phase .. "/" .. tostring(index), function() proof("keys", phase, {{concurrency_key = case.value, acquired = true}}, (phase == "keylock" and "keys" or "keys.running") .. ".concurrency_key") end)
            end
        end
        for _, value in ipairs({-1, 0.5, 2, "bad"}) do
            test.it("invalid worker marker count/" .. tostring(value), function() proof("batch", "mark", {rows_affected = value}, "worker.rows_affected") end)
        end
        test.it("missing run identity", function() proof("batch", "history", {}, "run.id") end)
        for _, phase in ipairs({"lease", "select", "candidates", "joblock", "keyrecheck"}) do
            test.it("valid empty rows/" .. phase, function()
                local route = phase == "lease" and "lease" or phase == "select" and "single" or phase == "keyrecheck" and "keys" or "batch"
                fixture.reset(route, phase, nil); fixture.missing, fixture.value = true, {}
                local _, err = invoke(route); test.is_nil(err)
            end)
        end
        test.it("numeric string lease counters remain", function()
            fixture.reset("lease", "lease", nil); fixture.missing, fixture.value = true, {{attempts = "1", execution_seq = "2"}}
            local result, err = invoke("lease"); test.is_nil(err); test.eq(result.attempts, 1); test.eq(result.execution_seq, 2)
        end)
        for _, age in ipairs({{},{value = -0.5},{value = "1.9"}}) do
            test.it("valid SQL backlog metrics/" .. tostring(age.value), function()
                fixture.reset("backlog", "backlog", nil); fixture.missing, fixture.value = true, {{n = "0", overdue = "0", age_ms = age.value}}
                local result, err = invoke("backlog"); test.is_nil(err); test.eq(result.count, 0); test.eq(result.overdue, 0)
                test.eq(result.oldest_age_ms, age.value == "1.9" and 1 or 0)
            end)
        end
    end)
end)}
