local test = require("test")
local registry = require("registry")
local time = require("time")
local fixture = require("registry_fixture")

local function define_tests()
    test.describe("Registry fixture transactions", function()
        local original
        test.before_each(function() original = assert(registry.current_version()) end)
        test.after_each(function()
            local restored, err = registry.apply_version(original)
            test.is_nil(err)
            test.is_true(restored)
        end)

        test.it("replans a superseded fixture transaction and preserves the concurrent writer", function()
            local attempts = 0
            local _, err = fixture.apply(function(changes)
                attempts = attempts + 1
                changes:create({ id = "app:fixture_owned_entry", kind = "registry.entry", data = { marker = "owned" } })
                if attempts == 1 then
                    local concurrent = assert(registry.snapshot()):changes()
                    concurrent:create({ id = "app:fixture_concurrent_entry", kind = "registry.entry", data = { marker = "concurrent" } })
                    test.is_nil(select(2, concurrent:apply()))
                end
            end, time.now():add(5 * time.SECOND))
            test.is_nil(err)
            test.eq(attempts, 2)
            test.eq(assert(registry.get("app:fixture_owned_entry")).data.marker, "owned")
            test.eq(assert(registry.get("app:fixture_concurrent_entry")).data.marker, "concurrent")
        end)

        test.it("returns an original planning failure without retrying or committing", function()
            local attempts = 0
            local native = errors.new({ kind = errors.PERMISSION_DENIED, retryable = false,
                message = "fixture plan is refused", details = { stage = "plan" } })
            local value, err = fixture.apply(function(changes)
                attempts = attempts + 1
                changes:create({ id = "app:fixture_refused_entry", kind = "registry.entry" })
                return native
            end, time.now():add(5 * time.SECOND))
            test.is_nil(value)
            test.is_true(err == native)
            test.eq(attempts, 1)
            test.is_nil((registry.get("app:fixture_refused_entry")))
        end)

        test.it("returns the native conflict when its existing commit deadline expires", function()
            local attempts = 0
            local value, err = fixture.apply(function(changes)
                attempts = attempts + 1
                changes:create({ id = "app:fixture_expired_entry", kind = "registry.entry" })
                local concurrent = assert(registry.snapshot()):changes()
                concurrent:create({ id = "app:fixture_deadline_entry", kind = "registry.entry" })
                test.is_nil(select(2, concurrent:apply()))
            end, time.now())
            test.is_nil(value)
            test.is_true(errors.is(err, errors.CONFLICT))
            test.eq(attempts, 1)
            test.is_nil((registry.get("app:fixture_expired_entry")))
            test.not_nil((registry.get("app:fixture_deadline_entry")))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
