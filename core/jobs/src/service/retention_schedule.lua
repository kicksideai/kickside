-- Jobs-owned retention cadence and retry state for the worker pool.
local logger = require("logger")
local time = require("time")

local schedule = {}

function schedule.new(dependencies: any): any
    local read_policy = dependencies.policy
    local sweep = dependencies.sweep
    local now = dependencies.now or time.now
    local log = dependencies.logger or logger
    local fallback_retry_ms = dependencies.fallback_retry_ms
    local deadline_ns: number? = now():unix_nano()
    local retry_count = 0
    local active_policy: any = nil
    local driver = {}

    local function retry_delay_ms(policy: any): number
        retry_count = retry_count + 1
        if policy then
            return math.min(policy.slot_retry_after_ms * (2 ^ math.min(retry_count - 1, 20)),
                policy.slot_retry_max_delay_ms)
        end
        local fallback = fallback_retry_ms and fallback_retry_ms() or nil
        return tonumber(fallback) or 0
    end

    function driver.deadline(): number?
        return deadline_ns
    end

    function driver.run(now_ns: number): ()
        local policy, policy_err = read_policy()
        if policy_err or not policy then
            log:error("job_worker retention policy unavailable: " .. tostring(policy_err))
            deadline_ns = now_ns + retry_delay_ms(active_policy) * 1000000
            return
        end
        active_policy = policy

        local _, sweep_err = sweep()
        if sweep_err then
            log:error("job_worker retention sweep failed: " .. tostring(sweep_err))
            deadline_ns = now_ns + retry_delay_ms(policy) * 1000000
            return
        end
        retry_count = 0
        deadline_ns = now_ns + policy.retention_interval_ms * 1000000
    end

    return driver
end

return schedule
