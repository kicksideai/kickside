local test = require("test")
local state = require("state")
local orchestrator = require("orchestrator")

local function define_tests()
    test.describe("Transfer staging directories", function()
        test.before_each(state.reset)

        test.it("preserves the original export error when staging never exists", function()
            local source = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                message = "staging directory unavailable", details = { marker = "mkdir" } })
            state.absent_staging()
            state.reject("mkdir", source)
            local result, err = orchestrator.export({ "original-component" })
            test.is_nil(result)
            test.eq(err:kind(), source:kind())
            test.eq(err:details().marker, "mkdir")
            test.eq(state.counters().removed, 0)
        end)

        test.it("returns the native staging existence error", function()
            local source = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                message = "staging lookup unavailable", details = { marker = "exists" } })
            state.reject("exists", source)
            local result, err = orchestrator.discard({ storage_id = "app:uploads", files = { "bundle" }, dirs = {} })
            test.is_nil(result)
            test.eq(err, source)
            test.eq(state.counters().removed, 0)
        end)

        for _, stage in ipairs({ "storage", "export", "import", "stat" }) do
            test.it("returns the native " .. stage .. " error", function()
                local source = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                    message = "transfer dependency unavailable", details = { marker = stage } })
                state.reject(stage, source)
                state.allow_mkdir()
                local result, err
                if stage == "import" then result, err = orchestrator.import_file(state.storage(), "fixture.kxb", {})
                else result, err = orchestrator.export({ "original-component" }) end
                test.is_nil(result)
                test.eq(err, source)
            end)
        end

        test.it("imports a component without portable data without removing uncreated staging directories", function()
            state.nonportable()
            local result, err = orchestrator.import_file(state.storage(), "fixture.kxb", {})
            test.is_nil(err)
            test.is_true(result.success)
            test.eq(state.counters().removed, 0)
        end)

        test.it("returns a native rollback deletion failure", function()
            local source = errors.new({ kind = errors.PERMISSION_DENIED, retryable = false,
                message = "component deletion refused", details = { marker = "rollback" } })
            state.reject_delete(source)
            local result, err = orchestrator.import_file(state.storage(), "fixture.kxb", {})
            test.is_nil(result)
            test.eq(err, source)
            test.eq(state.counters().deleted, 1)
        end)

        test.it("returns a native staging removal failure", function()
            local source = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                message = "staging removal unavailable", details = { marker = "remove" } })
            state.reject_remove(source)
            local result, err = orchestrator.export({ "original-component" })
            test.is_nil(result)
            test.eq(err, source)
        end)

        test.it("returns a native discard failure", function()
            local source = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                message = "discard unavailable", details = { marker = "discard" } })
            state.reject_remove(source)
            local result, err = orchestrator.discard({ storage_id = "app:uploads", files = {}, dirs = { "stage" } })
            test.is_nil(result)
            test.eq(err, source)
        end)

        test.it("returns the component service open error before staging", function()
            state.reject_open()
            local result, err = orchestrator.export({ "original-component" })
            test.is_nil(result)
            test.contains(tostring(err), "component service unavailable")
            test.eq(state.counters().assembled, 0)
            test.eq(state.counters().created, 0)
        end)

        test.it("returns a bundle parent error before assembly and removes staging", function()
            local result, err = orchestrator.export({ "original-component" })
            test.is_nil(result)
            test.contains(tostring(err), "directory backend unavailable")
            test.eq(state.counters().assembled, 0)
            test.is_true(state.counters().removed > 0)
        end)

        test.it("returns a part parent error before extraction and rolls back created components", function()
            local result, err = orchestrator.import_file(state.storage(), "fixture.kxb", {})
            test.is_nil(result)
            test.contains(tostring(err), "directory backend unavailable")
            test.eq(state.counters().extracted, 0)
            test.eq(state.counters().created, 1)
            test.eq(state.counters().deleted, 1)
            test.is_true(state.counters().removed > 0)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
