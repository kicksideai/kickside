-- Earliest persisted completion, publication, or retention deadline.
local admission = require("admission")
local policy = require("policy")
local run_time = require("run_time")

local M = {}

function M.next_deadline_ms(): (number?, error?)
    local runtime_policy, policy_err = policy.policy()
    if policy_err or not runtime_policy then return nil, policy_err end
    local deadlines, query_err = admission.transaction(function(tx: any): (any?, any?)
        local completion, completion_err = tx:query([[SELECT completion_check_at AS deadline FROM workflow_runs
            WHERE status IN ('pending','running') AND execution_identity_json IS NOT NULL
              AND execution_identity_json <> '' AND completion_check_at IS NOT NULL
            ORDER BY completion_check_at,run_id LIMIT 1]])
        if completion_err then return nil, completion_err end
        if type(completion) ~= "table" then
            return nil, errors.new({ kind = errors.INTERNAL, message = "workflow completion deadline query returned no rows" })
        end
        local publication, publication_err = tx:query([[SELECT terminal_event_check_at AS deadline FROM workflow_runs
            WHERE terminal_event_pending AND terminal_event_check_at IS NOT NULL
            ORDER BY terminal_event_check_at,run_id LIMIT 1]])
        if publication_err then return nil, publication_err end
        if type(publication) ~= "table" then
            return nil, errors.new({ kind = errors.INTERNAL, message = "workflow publication deadline query returned no rows" })
        end
        local retention, retention_err = tx:query([[SELECT finished_at AS deadline FROM workflow_runs
            WHERE status IN ('completed','failed','cancelled','terminated') AND NOT terminal_event_pending
              AND finished_at IS NOT NULL
            ORDER BY finished_at,run_id LIMIT 1]])
        if retention_err then return nil, retention_err end
        if type(retention) ~= "table" then
            return nil, errors.new({ kind = errors.INTERNAL, message = "workflow retention deadline query returned no rows" })
        end
        return {
            completion = completion[1] and completion[1].deadline or nil,
            publication = publication[1] and publication[1].deadline or nil,
            retention = retention[1] and retention[1].deadline or nil,
        }, nil
    end)
    if query_err or not deadlines then return nil, query_err end

    local earliest: string? = nil
    local completion_at = (deadlines :: any).completion
    if completion_at ~= nil then earliest = tostring(completion_at) end
    local publication_at = (deadlines :: any).publication
    if publication_at ~= nil and (earliest == nil or tostring(publication_at) < (earliest :: string)) then
        earliest = tostring(publication_at)
    end
    local finished_at = (deadlines :: any).retention
    if finished_at ~= nil then
        local retention_ms = ((runtime_policy :: any).retention_runs_days :: integer) * 24 * 60 * 60 * 1000
        local retention_at, retention_err = run_time.after_ms(finished_at, retention_ms)
        if retention_err or not retention_at then
            return nil, errors.new({ kind = errors.INVALID,
                message = "workflow run retention deadline is invalid: " .. tostring(retention_err) })
        end
        if earliest == nil or (retention_at :: string) < (earliest :: string) then earliest = retention_at end
    end
    if earliest == nil then return nil, nil end
    local wait_ms, deadline_err = run_time.until_ms(earliest)
    if deadline_err or wait_ms == nil then
        return nil, errors.new({ kind = errors.INVALID,
            message = "workflow maintenance deadline is invalid: " .. tostring(deadline_err) })
    end
    return wait_ms, nil
end

return M
