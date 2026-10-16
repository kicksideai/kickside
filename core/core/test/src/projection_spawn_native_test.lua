local test = require("test")
local worker = require("worker")
local envelope = require("envelope")
local json = require("json")
return {run = test.run_cases(function()
    test.describe("native projection spawn failures", function()
        for _, host in ipairs({"app:missing_projection_host", "?"}) do
            test.it("preserves the native spawn refusal/" .. host, function()
                local pid, source = process.with_context({}):spawn_linked_monitored("app:test_proc_worker", host, {})
                test.is_nil(pid)
                test.eq(type(source), "userdata")
                local output, err = worker.run_proc_supervised({worker_ref = "proc://app:test_proc_worker",
                    worker_runtime = "proc", target_id = "app:test_proc_worker"}, {}, {proc_host = host})
                print(json.encode({host = host, before = envelope.encode(source), after = envelope.encode(err)}))
                test.is_nil(output)
                test.eq(type(err), "userdata")
                test.eq(err:kind(), source:kind())
                test.eq(err:retryable(), source:retryable())
                local received, received_err = json.encode(err:details())
                if received_err then error(received_err) end
                local original, original_err = json.encode(source:details())
                if original_err then error(original_err) end
                test.eq(received, original)
            end)
        end
    end)
end)}
