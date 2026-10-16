local security = require("security")
local function check()
    local actor = security.actor()
    if not actor then error("eligibility fixture requires an authenticated actor") end
    local id = actor:id()
    if id == "app:ui_test_eligibility_error" then error("eligibility read fails") end
    if id == "app:ui_test_eligibility_invalid" then return {} end
    return false
end
return { check = check }
