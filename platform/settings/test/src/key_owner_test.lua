-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local env = require("env")
local contract = require("contract")
local store = require("store")

local function probe(): any
    local before, before_err = env.get("ENCRYPTION_KEY")
    local definition = assert(contract.get("kickside.settings:settings"))
    local settings = assert(definition:open())
    local write = settings:set({namespace="kickside.settings.test", key="api_token", value="owner-boundary-value"})
    local cache = assert(store.get("kickside.settings:cache"))
    cache:delete("snapshot")
    cache:release()
    local loaded = settings:get({namespace="kickside.settings.test", key="api_token"})
    local clear = settings:unset({namespace="kickside.settings.test", key="api_token"})
    local after, after_err = env.get("ENCRYPTION_KEY")
    return { before_denied = before == nil and before_err ~= nil,
        after_denied = after == nil and after_err ~= nil,
        written = write.success, write_error = write.error,
        value = loaded.value, load_error = loaded.error,
        cleared = clear.success, clear_error = clear.error }
end

local function define_tests()
    test.describe("Settings key ownership", function()
        test.it("stores and reloads secrets without granting the caller the key", function()
            local scope = security.new_scope({assert(security.policy("app:key_owner_caller"))})
            local result, err = funcs.new():with_actor(security.new_actor("member", {}))
                :with_scope(scope):call("app:key_owner_probe")
            test.is_nil(err, tostring(err))
            test.is_true(result.before_denied)
            test.is_true(result.after_denied)
            test.is_true(result.written, tostring(result.write_error))
            test.is_nil(result.load_error)
            test.eq(result.value, "owner-boundary-value")
            test.is_true(result.cleared, tostring(result.clear_error))
        end)
    end)
end
return { run = test.run_cases(define_tests), probe = probe }
