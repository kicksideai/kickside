-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The fixture profile holder: one driver holds pt-held-profile.
local function holders(input: any): any
    if type(input) == "table" and input.profile_id == "pt-held-profile" then
        return { holders = { { kind = "fixture driver", id = "fx-driver" } } }
    end
    return { holders = {} }
end

return { holders = holders }
