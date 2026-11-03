-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local ctx = require("ctx")
local function run(args)
    local input = args.input or {}
    local attempt = ctx.get("attempt") or 1
    if attempt <= (input.fail_attempts or 0) then
        return nil, errors.new({kind = input.error_kind or errors.UNAVAILABLE,
            message = "Attempt failed", retryable = input.retryable})
    end
    return {attempt = attempt, value = input.value}
end
return {run = run}
