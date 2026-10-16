local test = require("test")
local wake = require("wake")
local fixture = require("fixture")
local function invoke(route: string): (any?, error?)
    if route == "continue" then return wake.continue_job(fixture.database(), "sqlite", {id = "continuation", payload = "{}"}) end
    if route == "fanout" then return wake.wake_tx(fixture.transaction(), "key", nil) end
    if route == "nudge" then return wake.nudge_workers() end
    return wake.wake_job(fixture.database(), "job", route == "addressed" and {control = true, ensure_due = true} or {}, "sqlite")
end
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "wake proof requires an error"})) end
    return err
end
local function proof(route: string, phase: string, value: any, field: string)
    fixture.reset(route, phase, nil); fixture.missing, fixture.value = true, value
    local ok, _, err = pcall(function() return invoke(route) end); test.is_true(ok)
    local actual = required(err); test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
    test.eq(actual:details().code, "job_wake_response"); test.eq(actual:details().field, field); test.eq(fixture.commits, 0)
end
return {run = test.run_cases(function()
    test.describe("wake response proof", function()
    local routes = {wake = {begin = "transaction", policy = "policy", update = "update.rows_affected", read = "read"},
        addressed = {begin = "transaction", addressed = "addressed", policy = "policy", dispatch = "dispatch.rows_affected"},
        fanout = {dialect = "dialect", policy = "policy", demand = "demand", identity = "identity", discovery = "discovery", prelock = "prelock", update = "update.rows_affected", ack = "ack.rows_affected"},
        continue = {payload = "payload", begin = "transaction", fanout = "fanout", policy = "policy", candidates = "candidates", prelock = "prelock", update = "update.rows_affected", ack = "ack.rows_affected"}, nudge = {nudge = "nudge"}}
    for route, phases in pairs(routes) do
        test.describe("wake successful response proof/" .. route, function()
            for phase, field in pairs(phases) do
                for index, case in ipairs({{}, {value = false}, {value = 0}, {value = ""}}) do
                    if phase ~= "nudge" or index ~= 3 then
                        test.it(phase .. "/invalid type/" .. tostring(index), function() proof(route, phase, case.value, field) end)
                    end
                end
                if phase == "demand" or phase == "discovery" or phase == "fanout" or phase == "candidates" or phase == "prelock" or phase == "addressed" or phase == "read" then
                    for index, value in ipairs({{false}, {"bad"}, {[2] = {}}, {named = {}}}) do
                        test.it(phase .. "/invalid rows/" .. tostring(index), function() proof(route, phase, value, field) end)
                    end
                elseif phase == "update" or phase == "ack" or phase == "dispatch" then
                    for _, value in ipairs({-1, 0.5, 2, "bad"}) do
                        test.it(phase .. "/invalid count/" .. tostring(value), function() proof(route, phase, {rows_affected = value}, field) end)
                    end
                end
            end
            test.it("valid response remains", function()
                fixture.reset(route, "", nil); local result, err = invoke(route); test.is_nil(err); test.not_nil(result)
            end)
        end)
    end
    for _, route in ipairs({"continue", "fanout"}) do
        local phase = route == "continue" and "fanout" or "demand"
        for index, case in ipairs({{}, {value = false}, {value = -1}, {value = 0.5}, {value = "bad"}}) do
            test.it(route .. "/invalid generation/" .. tostring(index), function() proof(route, phase, {{demand_generation = case.value}}, phase .. ".demand_generation") end)
        end
    end
    for _, phase in ipairs({"candidates", "prelock"}) do
        for index, case in ipairs({{}, {value = false}, {value = 0}, {value = ""}}) do
            test.it("invalid row identity/" .. phase .. "/" .. tostring(index), function() proof("continue", phase, {{id = case.value}}, phase .. ".id") end)
        end
    end
    for _, field in ipairs({"id", "continuation_id"}) do
        for _, value in ipairs({false, 0, ""}) do
            test.it("invalid discovery identity/" .. field .. "/" .. tostring(value), function()
                local row: any = {acknowledged = false}; row[field] = value
                proof("fanout", "discovery", {row}, "discovery." .. field)
            end)
        end
    end
    for index, case in ipairs({{}, {value = "false"}, {value = 2}}) do
        test.it("invalid acknowledgment flag/" .. tostring(index), function() proof("fanout", "discovery", {{id = "job", acknowledged = case.value}}, "discovery.acknowledged") end)
    end
    for _, value in ipairs({-1, 0.5, "bad"}) do
        test.it("invalid nudge count/" .. tostring(value), function() proof("nudge", "nudge", value, "nudge") end)
    end
    for _, phase in ipairs({"candidates", "prelock", "addressed"}) do
        test.it("valid empty selection/" .. phase, function()
            fixture.reset(phase == "addressed" and "addressed" or "continue", phase, nil); fixture.missing, fixture.value = true, {}
            local _, err = invoke(phase == "addressed" and "addressed" or "continue"); test.is_nil(err)
        end)
    end
    for _, route in ipairs({"wake", "continue", "fanout"}) do
        test.it("valid zero update/" .. route, function()
            fixture.reset(route, "update", nil); fixture.missing, fixture.value = true, {rows_affected = 0}
            local result, err = invoke(route); test.is_nil(err); test.not_nil(result)
            if route == "wake" then test.is_false(result.woken) end
        end)
    end
    test.it("numeric string generation remains", function()
        fixture.reset("fanout", "demand", nil); fixture.missing, fixture.value = true, {{demand_generation = "1"}}
        local result, err = invoke("fanout"); test.is_nil(err); test.eq(result.demand_generation, 1)
    end)
    for _, value in ipairs({0, "0", "1"}) do
        test.it("valid nudge count/" .. tostring(value), function()
            fixture.reset("nudge", "nudge", nil); fixture.missing, fixture.value = true, value
            local result, err = invoke("nudge"); test.is_nil(err); test.eq(result, tonumber(value))
        end)
    end
    end)
end)}
