local test = require("test")
local time = require("time")
local readiness = require("readiness")
local names = require("names")

local function define()
    test.describe("OAuth negotiator readiness", function()
        test.it("waits for the spawned negotiator to register before reporting success", function()
            local now, polls, pauses = time.now(), 0, 0
            local result, err = readiness.await({state_token="state",pid="expected"}, {
                now=function() return now end,
                pause=function() pauses=pauses+1; now=now:add(time.MILLISECOND) end,
                lookup=function(name)
                    test.eq(name,names.NEGOTIATOR_PREFIX .. "state")
                    polls=polls+1
                    if polls==3 then return "expected",nil end
                    return nil,errors.new({kind=errors.NOT_FOUND,message="not registered yet"})
                end,
            })
            test.is_nil(err,tostring(err)); test.is_true(result.success)
            test.eq(polls,3); test.eq(pauses,2)
        end)
        test.it("times out rather than waiting forever for a failed startup", function()
            local now, polls = time.now(), 0
            local result, err = readiness.await({state_token="state",pid="expected"}, {
                now=function() return now end,
                pause=function() now=now:add(time.SECOND) end,
                lookup=function() polls=polls+1; return nil,nil end,
            })
            test.is_nil(result); test.is_true(errors.is(err,errors.TIMEOUT),tostring(err)); test.eq(polls,5)
        end)
        test.it("preserves a registry outage instead of calling it a missing session", function()
            local failure=errors.new({kind=errors.UNAVAILABLE,message="registry unavailable",retryable=true})
            local result, err = readiness.await({state_token="state",pid="expected"}, {
                now=time.now, pause=function() error("must not retry outages") end,
                lookup=function() return nil,failure end,
            })
            test.is_nil(result); test.eq(err,failure)
        end)
        test.it("does not accept another process registered for the same state", function()
            local result, err = readiness.await({state_token="state",pid="expected"}, {
                now=time.now, pause=function() error("must not retry collisions") end,
                lookup=function() return "another",nil end,
            })
            test.is_nil(result); test.is_true(errors.is(err,errors.CONFLICT),tostring(err))
        end)
    end)
end
return {run=test.run_cases(define)}
