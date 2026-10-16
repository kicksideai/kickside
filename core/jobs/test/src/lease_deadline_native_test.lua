local test = require("test")
local lease = require("lease")
local fixture = require("fixture")
local function job(): table return {id = "job", lease_token = "token", execution_seq = 1} end
return {run = test.run_cases(function()
    test.describe("authoritative dispatch lease deadline", function()
        for _, renewal in ipairs({0, 1}) do
            test.it("carries the validated deadline/" .. tostring(renewal), function()
                fixture.reset("dispatch", "", nil); fixture.renewal = renewal
                local input = job(); local live, err, deadline = lease.validate_for_dispatch(fixture.database(), "sqlite", input)
                test.is_nil(err); test.is_true(live); test.eq(deadline, fixture.deadline); test.is_nil(input.lease_until)
                local pid, start_err = lease.start(input, deadline)
                test.is_nil(start_err); test.eq(pid, "lease-process"); test.not_nil(fixture.spawn_args)
                test.eq(fixture.spawn_args.lease_until, deadline); test.eq(fixture.updates, renewal)
            end)
        end
        for _, reply in ipairs({{}, {value = false}, {value = 0}, {value = ""}}) do
            test.it("missing durable lease deadline/" .. tostring(reply.value), function()
                fixture.reset("dispatch", "", nil); fixture.deadline = reply.value
                local live, err, deadline = lease.validate_for_dispatch(fixture.database(), "sqlite", job())
                test.is_false(live); test.is_nil(deadline); test.not_nil(err)
                if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "lease deadline guard requires refusal"})) end
                test.eq(err:kind(), errors.INTERNAL); test.eq(err:retryable(), false)
                test.eq((err:details() or {}).code, "job_lease_response"); test.eq((err:details() or {}).field, "read.lease_until")
                test.eq(fixture.updates, 0); test.is_nil(fixture.spawn_args)
            end)
        end
        test.it("existing supplied deadline stays available", function()
            fixture.reset("start", "", nil); local input = job(); input.lease_until = fixture.deadline
            local pid, err = lease.start(input); test.is_nil(err); test.eq(pid, "lease-process")
            test.eq(fixture.spawn_args.lease_until, input.lease_until)
        end)
    end)
end)}
