-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Store lifecycle of an engine whose config validation rejects every create.

local REFUSAL = "extraction model output limit cannot hold one statement"

local function refuse_config(_args: any): (any, error?)
    return nil, errors.new({ kind = errors.INVALID, message = REFUSAL })
end

return {
    REFUSAL = REFUSAL,
    refuse_config = refuse_config,
}
