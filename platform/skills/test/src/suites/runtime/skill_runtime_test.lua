-- Tests for the kickside.skills:skill_runtime package surface.

local test = require("test")
local registry = require("registry")
local uuid_v4 = require("uuid").v4
local test_identity = require("test_identity")

local NS = "kickside.skills"
local RUNTIME_ACTIVATE = "kickside.skills.runtime:activate_func"

local function define_tests()
    test.describe("kickside.skills:skill_runtime", function()
        test.it("binding exposes only implemented runtime methods", function()
            local entry, err = registry.get("kickside.skills:skill_runtime_binding")
            test.is_nil(err)
            test.not_nil(entry)

            local contracts = entry.data and entry.data.contracts or {}
            local methods = contracts[1] and contracts[1].methods or {}
            test.not_nil(methods.activate)
            test.not_nil(methods.list_files)
            test.not_nil(methods.read_file)
            test.is_nil(methods.run_script)

            local run_script, get_err = registry.get("kickside.skills.runtime:run_script_func")
            test.is_nil(run_script)
            test.not_nil(get_err)
        end)

        test.it("activates the requested historical version consistently", function()
            local exec = test_identity.executor("runtime_version_" .. uuid_v4():sub(1, 8))
            local skill_id, create_err = exec:call(NS .. ":skill_create", {
                name = "runtime-version", description = "Version selection.",
                body = "VERSION-ONE", files = {{ path = "guide.txt", content = "FILE-ONE" }},
            })
            test.is_nil(create_err, tostring(create_err))
            test.not_nil(skill_id)

            local _, refine_err = exec:call(NS .. ":skill_refine", {
                skill_id = skill_id, body = "VERSION-TWO", files = {{ path = "guide.txt", content = "FILE-TWO" }},
            })
            test.is_nil(refine_err, tostring(refine_err))

            local activated, activate_err = exec:call(RUNTIME_ACTIVATE, { skill_id = skill_id, version = 1 })
            test.is_nil(activate_err, tostring(activate_err))
            test.not_nil(activated)
            test.eq(activated.skill.body, "VERSION-ONE")
            test.eq(activated.files[1].path, "guide.txt")

            local removed, delete_err = exec:call(NS .. ":skill_delete", { skill_id = skill_id })
            test.is_nil(delete_err, tostring(delete_err))
            test.eq(removed.skill_id, skill_id)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
