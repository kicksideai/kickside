-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local function unconfigured(...)
    return nil, errors.new({kind = errors.INTERNAL, retryable = false,
        message = "security dependency fixture is not configured"})
end

return {
    find = unconfigured,
    get = unconfigured,
    snapshot = unconfigured,
    current_version = unconfigured,
    call = unconfigured,
}
