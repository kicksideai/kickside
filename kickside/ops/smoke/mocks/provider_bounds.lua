local policy = require("policy")
local function handler(args)
    local bounds, err = policy.with_bounds_digest(args.bounds)
    if err then return nil, err end
    if not args.policy then return { bounds = bounds }, nil end
    args.policy.control_digest = bounds.digest
    local resolved, policy_err = policy.with_digest(args.policy)
    if policy_err then return nil, policy_err end
    return { bounds = bounds, policy = resolved }, nil
end
return { handler = handler }
