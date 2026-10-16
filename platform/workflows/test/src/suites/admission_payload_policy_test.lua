local test = require("test")
local uuid = require("uuid")
local json = require("json")
local registry = require("registry")
local admission = require("admission")
local store = require("store")
local policy_config = require("policy_config")
local run_time = require("run_time")
local launch_budget = require("launch_budget")

local function fake_stamp(wall_ns: number, monotonic_ns: number): any
    local stamp: any = { wall_ns = wall_ns, monotonic_ns = monotonic_ns }
    function stamp:add(delta_ns: number): any
        return fake_stamp(self.wall_ns + delta_ns, self.monotonic_ns + delta_ns)
    end
    function stamp:sub(other: any): any
        local elapsed_ns = self.monotonic_ns - other.monotonic_ns
        return { nanoseconds = function(): number return elapsed_ns end }
    end
    return stamp
end

local function define_tests()
    test.describe("workflow run creation payload policy", function()
        test.it("refuses an over-limit payload before inserting a run", function()
            local run_id, dataflow_id = uuid.v4(), uuid.v4()
            local payload, encode_err = json.encode({
                version = 1,
                input = { oversized = string.rep("x", 1048576) },
                commands = {},
                options = { dataflow_id = dataflow_id, metadata = { run_id = run_id } },
                start_options = {},
            })
            test.is_nil(encode_err)
            test.is_true(#payload > 1048576)
            local row, admission_err = admission.reserve({
                run_id = run_id, dataflow_id = dataflow_id, workflow_id = uuid.v4(),
                version = 1, trigger_kind = "manual", origin = "published",
                execution_identity_json = "fixture-identity",
                creation_payload_json = payload,
            })
            test.is_nil(row)
            test.is_true(errors.is(admission_err, errors.INVALID), tostring(admission_err))
            test.contains(tostring(admission_err), "creation payload")
            local db, open_err = store.open_db()
            test.is_nil(open_err)
            local rows, query_err = db:query("SELECT run_id FROM workflow_runs WHERE run_id=$1", { run_id })
            db:release()
            test.is_nil(query_err)
            test.eq(#rows, 0)
            local policy, policy_err = registry.get("kickside.workflows:policy")
            test.is_nil(policy_err)
            test.eq(policy.meta.limits.creation_payload_bytes, 1048576)
            test.eq(policy.meta.limits.max_inflight_runs, 25)
            test.eq(policy.meta.limits.document_bytes, 262144)
            test.eq(policy.meta.limits.command_bytes, 65536)
            test.eq(policy.meta.launch.admission_timeout, "5m")
            test.eq(policy.meta.launch.completion_check.initial, "30s")
            test.eq(policy.meta.launch.completion_check.max, "5m")
            test.eq(policy.meta.launch.completion_check.batch, 100)
            test.eq(policy.meta.retention.runs, "30d")
            local duplicate_policy = registry.get("kickside.workflows.runs:retention_policy")
            test.is_nil(duplicate_policy)

            local settings, settings_err = policy_config.policy()
            test.is_nil(settings_err)
            test.eq(settings.creation_payload_bytes, 1048576)
            test.eq(settings.max_inflight_runs, 25)
            test.eq(settings.document_bytes, 262144)
            test.eq(settings.command_bytes, 65536)
            test.eq(settings.admission_timeout_ms, 300000)
            local wall_now, monotonic_now = 7000000000, 1000000
            local fake_clock = { now = function(): any return fake_stamp(wall_now, monotonic_now) end }
            local deadline = launch_budget.deadline(fake_clock.now(), settings.admission_timeout_ms)
            test.eq(deadline.monotonic_ns, 300001000000)
            test.is_false(launch_budget.expired(fake_stamp(wall_now, 300000999999), deadline))
            test.is_true(launch_budget.expired(fake_stamp(wall_now, 300001000000), deadline))
            local calls = 0
            local admitted, _, expired = launch_budget.invoke(fake_clock, deadline, function(): (any, nil)
                calls = calls + 1
                monotonic_now = deadline.monotonic_ns
                return { state = "activated" }, nil
            end)
            test.is_true(expired)
            test.is_nil(admitted)
            test.eq(calls, 1)
            local _, _, already_expired = launch_budget.invoke(fake_clock, deadline, function(): (any, nil)
                calls = calls + 1
                return { state = "activated" }, nil
            end)
            test.is_true(already_expired)
            test.eq(calls, 1)

            monotonic_now = 5000000000
            wall_now = 1000000
            local adjusted_deadline = launch_budget.deadline(fake_clock.now(), 1000)
            wall_now = wall_now + 1000000000000
            monotonic_now = monotonic_now + 999000000
            test.is_false(launch_budget.expired(fake_clock.now(), adjusted_deadline),
                "a forward wall-clock adjustment expired the admission budget")
            wall_now = wall_now - 2000000000000
            monotonic_now = monotonic_now + 1000000
            test.is_true(launch_budget.expired(fake_clock.now(), adjusted_deadline),
                "a backward wall-clock adjustment extended the admission budget")
            test.eq(settings.completion_batch, 100)
            test.eq(settings.retention_runs_days, 30)

            local admission_entry = registry.get("kickside.workflows.runs:admission")
            local has_time_module = false
            for _, name in ipairs(admission_entry.modules or {}) do
                if name == "time" then has_time_module = true end
            end
            test.is_false(has_time_module, "production admission must not depend on the test race delay clock")
            test.eq(policy_config.next_completion_delay(settings, 0), 30000)
            test.eq(policy_config.next_completion_delay(settings, 30000), 60000)
            test.eq(policy_config.next_completion_delay(settings, 90000), 120000)
            test.eq(policy_config.next_completion_delay(settings, 450000), 300000)
            test.eq(run_time.duration_ms("2026-01-01T00:00:00.000Z", "2026-01-01T00:00:01.250Z"), 1250)
            test.is_nil(run_time.duration_ms("invalid", "2026-01-01T00:00:01.250Z"))
            test.is_nil(run_time.duration_ms(nil, "2026-01-01T00:00:01.250Z"))
            test.is_nil(run_time.duration_ms("2026-01-01T00:00:01.250Z", nil))
            test.eq(run_time.duration_ms("2026-01-01T00:00:02.000Z", "2026-01-01T00:00:01.250Z"), 0)
        end)
    end)
end

return test.run_cases(define_tests)
