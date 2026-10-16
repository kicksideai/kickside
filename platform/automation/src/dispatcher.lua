-- The command dispatcher's supervised maintenance slot worker (design v5
-- §4.7; CONTRACTS §19 dispatcher protocol; A52 no polling). Each run is one
-- dispatch pass: due pending commands run their step, drive slots with
-- unacknowledged control demand are woken and acknowledged, drives without a
-- slot get one. The slot then rearms to the exact next known deadline the
-- pass read from durable state (the earliest remaining pending command's
-- next_attempt_at), or not at all when none is pending: a producer wakes the
-- slot again once new dispatcher work exists. A pass that fails as a whole is
-- a job failure and retries under the jobs backoff.

local automations_lib = require("automations_lib")

local M = {}

function M.run(_input: any): (any?, error?)
    local pass, pass_err = automations_lib.dispatch({})
    if pass_err then return nil, pass_err end
    return { pass = pass, rearm = (pass :: any).next_deadline }, nil
end

return M
