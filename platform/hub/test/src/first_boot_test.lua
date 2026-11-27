-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local installer = require("installer")
local funcs = require("funcs")
local security = require("security")
local state = require("state")

local function fake(options)
    local calls = { plan = {}, install = {}, setup = {}, writes = {} }
    local setup_ready = false
    local deps = {
        env_modules = function() return options.env end,
        read_state = function() return options.state end,
        write_state = function(value) calls.writes[#calls.writes + 1] = value; options.state = value end,
        installed = function() return options.installed or {} end,
        plan = function(args)
            calls.plan[#calls.plan + 1] = args.component
            return (options.plans or {})[args.component] or { requirements = {} }
        end,
        install = function(args)
            calls.install[#calls.install + 1] = args.component
            if (options.install_errors or {})[args.component] then
                return nil, { message = options.install_errors[args.component] }
            end
            return { success = true }
        end,
        setup = function(descriptor, action)
            calls.setup[#calls.setup + 1] = descriptor .. ":" .. action
            if action == "apply" then setup_ready = not options.setup_pending end
            if not setup_ready then return { success = true, ready = false, status = "pending" } end
            return { success = true, ready = true, status = "ready" }
        end,
    }
    return deps, calls
end

local function define_tests()
    test.describe("first boot module install", function()
        test.it("parses, trims, and removes duplicates", function()
            local modules = installer.parse(" acme/crm , acme/crm,acme/docs-2 ")
            test.eq(#modules, 2)
            test.eq(modules[1], "acme/crm")
            test.eq(modules[2], "acme/docs-2")
        end)

        test.it("refuses an invalid module id", function()
            for _, raw in ipairs({ "Acme/crm", "acme", "acme/crm/x", "-acme/crm", "acme/" .. string.rep("a", 64) }) do
                local modules, err = installer.parse(raw)
                test.is_nil(modules)
                test.not_nil(err)
            end
        end)

        test.it("does nothing without a module list", function()
            local deps, calls = fake({ env = "" })
            local result = installer.run(deps)
            test.eq(result.status, "none")
            test.eq(#calls.writes, 0)
        end)

        test.it("installs each module once and records completion", function()
            local deps, calls = fake({ env = "acme/crm,acme/docs", installed = { ["acme/docs"] = true } })
            local result = installer.run(deps)
            test.eq(result.status, "completed")
            test.eq(#calls.install, 1)
            test.eq(calls.install[1], "acme/crm")
            test.eq(result.modules[1].status, "installed")
            test.eq(result.modules[2].status, "installed")

            local again, again_calls = fake({ env = "acme/crm,acme/docs", state = result })
            local repeated = installer.run(again)
            test.eq(repeated.status, "completed")
            test.eq(#again_calls.plan, 0)
            test.eq(#again_calls.writes, 0)
        end)

        test.it("records a failed module and tries it again on the next start", function()
            local deps = fake({ env = "acme/crm,acme/docs", install_errors = { ["acme/crm"] = "hub unavailable" } })
            local result = installer.run(deps)
            test.eq(result.status, "failed")
            test.eq(result.modules[1].status, "failed")
            test.eq(result.modules[1].message, "hub unavailable")
            test.eq(result.modules[2].status, "installed")

            local retry, calls = fake({ env = "acme/crm,acme/docs", state = result, installed = { ["acme/docs"] = true } })
            local retried = installer.run(retry)
            test.eq(retried.status, "completed")
            test.eq(#calls.install, 1)
            test.eq(calls.install[1], "acme/crm")
        end)

        test.it("does not install a module with missing settings", function()
            local deps, calls = fake({ env = "acme/crm", plans = {
                ["acme/crm"] = { missing_requirements = { "acme.crm:target_db" }, requirements = {} },
            } })
            local result = installer.run(deps)
            test.eq(result.status, "failed")
            test.eq(#calls.install, 0)
            test.contains(result.modules[1].message, "acme.crm:target_db")
        end)

        test.it("retries pending setup after installation without reinstalling the module", function()
            local deps = fake({ env = "acme/crm", setup_pending = true, plans = {
                ["acme/crm"] = { requirements = { { name = "required_setup", value = "registry:v1:acme.crm:setup" } } },
            } })
            local failed = installer.run(deps)
            test.eq(failed.status, "failed")
            test.eq(installer.readiness("acme/crm", failed), "setup_failed")

            local retry, calls = fake({ env = "acme/crm", state = failed, installed = { ["acme/crm"] = true } })
            local result = installer.run(retry)
            test.eq(#calls.install, 0)
            test.eq(#calls.plan, 0)
            test.eq(calls.setup[2], "acme.crm:setup:apply")
            test.eq(calls.setup[3], "acme.crm:setup:status")
            test.eq(result.status, "completed")
        end)

        test.it("runs the required setup the plan declares", function()
            local deps, calls = fake({ env = "acme/crm", plans = {
                ["acme/crm"] = { requirements = { { name = "required_setup", value = "registry:v1:acme.crm:setup" } } },
            } })
            local result = installer.run(deps)
            test.eq(result.status, "completed")
            test.eq(calls.setup[1], "acme.crm:setup:status")
            test.eq(calls.setup[2], "acme.crm:setup:apply")
            test.eq(calls.setup[3], "acme.crm:setup:status")
        end)
    end)
end

local function define_readiness_tests()
    test.describe("first boot readiness", function()
        test.it("is ready when no module list is set", function()
            test.is_nil(installer.readiness(nil, nil))
            test.is_nil(installer.readiness("", {}))
        end)

        test.it("is ready only after the configured run completed", function()
            test.is_nil(installer.readiness("acme/crm", {source = "acme/crm", status = "completed"}))
            test.eq(installer.readiness("acme/crm", {source = "acme/crm", status = "running"}), "installing_modules")
            test.eq(installer.readiness("acme/crm", {}), "installing_modules")
            test.eq(installer.readiness("acme/crm,acme/docs", {source = "acme/crm", status = "completed"}),
                "installing_modules")
        end)

        test.it("reports a failed setup", function()
            test.eq(installer.readiness("acme/crm", {source = "acme/crm", status = "failed"}), "setup_failed")
            test.eq(installer.readiness("Not Valid", nil), "setup_failed")
        end)

        test.it("reports ready through the readiness function when nothing is configured", function()
            local result = assert(funcs.call("kickside.hub.first_boot:readiness"))
            test.is_true(result.ready)
            test.is_nil(result.reason)
        end)

        test.it("reads the stored state with only the readiness policy", function()
            local value = {source = "acme/crm", status = "completed", modules = {}}
            assert(state.write(value))
            local function anonymous(id)
                return funcs.new():with_actor(security.new_actor("first-boot-anonymous"))
                    :with_scope(security.new_scope({})):call(id)
            end
            local stored = assert(anonymous("app:first_boot_state_probe"))
            local denied, denied_err = anonymous("app:first_boot_state_denied_probe")
            assert(state.write({}))
            test.is_nil(denied)
            test.not_nil(denied_err)
            test.eq(stored.source, "acme/crm")
            test.eq(stored.status, "completed")
        end)
    end)
end

local run_cases = test.run_cases(function()
    define_tests()
    define_readiness_tests()
end)
return { run = function(options) return run_cases(options) end }
