local test = require("test")
local funcs = require("funcs")
local security = require("security")
local registry = require("registry")
local writer = require("settings_writer")
local cache = require("settings_cache")

local function call(id: string, policies: { string }): any
    local resolved = {}
    for _, policy in ipairs(policies) do
        resolved[#resolved + 1] = assert(security.policy(policy))
    end
    local result, err = funcs.new():with_actor(security.new_actor("cache-test", {}))
        :with_scope(security.new_scope(resolved)):call(id)
    test.is_nil(err, tostring(err))
    return result
end

-- A denied store write raises through the function call, so the caller sees the failure.
local function call_denied(id: string, policies: { string }): any
    local resolved = {}
    for _, policy in ipairs(policies) do
        resolved[#resolved + 1] = assert(security.policy(policy))
    end
    local _, err = funcs.new():with_actor(security.new_actor("cache-test", {}))
        :with_scope(security.new_scope(resolved)):call(id)
    return err
end

local function define_tests()
    test.describe("Settings cache replacement failures", function()
        test.it("reports a store acquisition failure", function()
            local result = call("app:cache_replace_probe", { "app:cache_probe_dispatch" })
            test.eq(result.success, false)
            test.not_nil(result.error)
            test.is_true(string.find(result.error, "kickside.settings:cache", 1, true) ~= nil)
        end)

        test.it("reports a snapshot write failure and rejects a failed reload", function()
            local policies = { "app:cache_probe_dispatch", "app:cache_probe_read" }
            local before = cache.revision()
            test.not_nil(call_denied("app:cache_replace_probe", policies))
            test.eq(cache.revision(), before)
            test.not_nil(call_denied("app:cache_reload_probe", policies))
            test.eq(cache.revision(), before)
            test.not_nil(call_denied("kickside.settings:cache_bootloader", policies))
        end)

        test.it("reports a write-through cache failure after the committed revision", function()
            local before = assert(writer.stored_revision())
            local write_err = call_denied("app:cache_write_probe", { "app:cache_probe_dispatch", "app:cache_probe_read" })
            local after = writer.stored_revision()
            local cached = cache.revision()
            local cleared, clear_err = writer.clear("kickside.settings.test", "max_items", "admin")
            test.is_true(cleared, tostring(clear_err))
            test.not_nil(write_err)
            test.eq(after, before + 1)
            test.eq(cached, before)
            test.eq(cache.revision(), before + 2)
        end)

        test.it("the keeper process scope permits a complete reload", function()
            local service = assert(registry.get("kickside.settings.service:keeper.service"))
            local group = assert(security.named_scope(service.data.lifecycle.security.groups[1]))
            local actor = security.new_actor("keeper-test", {})
            for _, grant in ipairs({
                { "db.get", "app:db" }, { "store.get", "kickside.settings:cache" },
                { "store.key.set", "kickside.settings:cache" }, { "env.get", "ENCRYPTION_KEY" },
            }) do
                test.eq(group:evaluate(actor, grant[1], grant[2]), "allow")
            end
            local result, err = funcs.new():with_actor(actor):with_scope(group):call("app:cache_reload_probe")
            test.is_nil(err, tostring(err))
            test.eq(result.success, true, tostring(result.error))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
