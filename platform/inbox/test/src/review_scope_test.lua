-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local security = require("security")
local funcs = require("funcs")
local identity = require("identity")

local function restore()
    local scope, err = identity.scope_from_groups({}, {"app:review_subject_access"})
    if err then return nil, err end
    return {allowed = scope:contains("app:review_subject_access")}, nil
end

local function run()
    test.describe("Inbox review composed scope", function()
        test.it("restores policy ids with the review callback's declared authority", function()
            local actor = security.new_actor("reviewer", {})
            local scope = security.new_scope({security.policy("app:review_probe_call"),
                security.policy("kickside.inbox.security:review_identity")})
            local restored, err = funcs.new():with_actor(actor):with_scope(scope):call("app:review_scope_restore", {})
            test.is_nil(err, tostring(err))
            test.not_nil(restored)
            test.is_true(restored.allowed)
        end)
    end)
end

return {run = test.run_cases(run), restore = restore}
