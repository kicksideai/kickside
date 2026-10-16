local test = require("test")
local registry = require("registry")

local PROFILE_TYPE = "kickside.hub:onboarding_profile"

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if entry[key] ~= nil then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function get(id: string): any
    local entry, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(entry, id .. " is missing")
    return entry
end

local function assert_packages(packages: any, expected: {string})
    test.eq(type(packages), "table")
    test.eq(#packages, #expected)
    for index, package in ipairs(packages) do
        test.eq(package.component, expected[index])
        test.is_nil(package.version)
    end
end

local function assert_parameters(package: any, expected: {{string}})
    test.eq(type(package.parameters), "table")
    test.eq(#package.parameters, #expected)
    for index, pair in ipairs(expected) do
        test.eq(package.parameters[index].name, pair[1])
        test.eq(package.parameters[index].value, pair[2])
    end
end

local function assert_package_owns_parameters(package: any)
    local owner = string.gsub(string.gsub(package.component, "/", "."), "%-", "_")
    for _, parameter in ipairs(package.parameters or {}) do
        local name = tostring(parameter.name or "")
        local owned = string.sub(name, 1, #owner + 1) == owner .. ":"
            or string.sub(name, 1, #owner + 1) == owner .. "."
        test.is_true(
            owned,
            string.format("%s cannot supply parameter owned by %s", package.component, name)
        )
    end
end

local function assert_profiles_own_parameters(profiles: {any})
    for _, profile in ipairs(profiles) do
        for _, package in ipairs(value(profile, "packages") or {}) do
            assert_package_owns_parameters(package)
        end
    end
end

local function define_tests()
    test.describe("app composition onboarding profiles", function()
        test.it("owns coherent versionless onboarding bundles", function()
            local knowledge = get("app.composition:onboarding_profile.knowledge")
            local workspace = get("app.composition:onboarding_profile.workspace")
            local automation = get("app.composition:onboarding_profile.automation")
            local workflows = get("app.composition:onboarding_profile.workflows")
            local research = get("app.composition:onboarding_profile.research")
            local gtm = get("app.composition:onboarding_profile.gtm")
            local google_workspace = get("app.composition:onboarding_profile.google_workspace")
            local channels = get("app.composition:onboarding_profile.channels")
            local developer = get("app.composition:onboarding_profile.developer")

            local profiles = { knowledge, workspace, automation, workflows, research, gtm, google_workspace, channels, developer }
            for _, entry in ipairs(profiles) do
                test.eq(entry.kind, "registry.entry")
                test.eq(entry.meta.type, PROFILE_TYPE)
            end

            -- A root may configure only requirements it declares itself. Supplying
            -- a transitive dependency's parameter makes planning look successful,
            -- but leaves the dependency unresolved when the install is linked.
            assert_profiles_own_parameters(profiles)

            test.eq(value(knowledge, "profile"), "knowledge")
            test.eq(value(knowledge, "required"), true)
            assert_packages(value(knowledge, "packages"), {
                "kickside/knowledge",
                "kickside/kb10",
                "kickside/llm-ocr",
            })
            assert_parameters(value(knowledge, "packages")[1], {
                { "kickside.knowledge:api_router", "app:api" },
                { "kickside.knowledge:ui_server", "app:gateway" },

            })
            assert_parameters(value(knowledge, "packages")[2], {
                { "kickside.kb10:api_router", "app:api" },
                { "kickside.kb10:ui_server", "app:gateway" },
                { "kickside.kb10:target_db", "app:db" },
                { "kickside.kb10:process_host", "app:processes" },
            })

            test.eq(value(workspace, "profile"), "workspace")
            test.eq(value(workspace, "title"), "Workspace & Graphs")
            assert_packages(value(workspace, "packages"), {
                "chestor/workspace",
                "chestor/graph",
                "chestor/db-schema",
            })
            assert_parameters(value(workspace, "packages")[1], {
                { "chestor.workspace:api_router", "app:api" },
                { "chestor.workspace:ui_server", "app:gateway" },
            })
            assert_parameters(value(workspace, "packages")[2], {
                { "chestor.graph:target_db", "app:db" },
                { "chestor.graph:api_router", "app:api" },
                { "chestor.graph:ui_server", "app:gateway" },
            })
            assert_parameters(value(workspace, "packages")[3], {
                { "chestor.db_schema:target_db", "app:db" },
                { "chestor.db_schema:api_router", "app:api" },
                { "chestor.db_schema:ui_server", "app:gateway" },
            })
            test.eq(value(automation, "profile"), "automation")
            test.eq(value(automation, "title"), "Automations")
            assert_packages(value(automation, "packages"), {
                "kickside/code-execution",
                "kickside/webhooks",
            })
            assert_parameters(value(automation, "packages")[1], {
                { "kickside.code_execution:api_router", "app:api" },
                { "kickside.code_execution:ui_server", "app:gateway" },
            })

            test.eq(value(workflows, "profile"), "workflows")
            assert_packages(value(workflows, "packages"), {
                "kickside/code-execution",
                "kickside/blocks",
                "kickside/workflows",
            })
            assert_parameters(value(workflows, "packages")[1], {
                { "kickside.code_execution:api_router", "app:api" },
                { "kickside.code_execution:ui_server", "app:gateway" },
            })
            assert_parameters(value(workflows, "packages")[2], {
                { "kickside.blocks:process_host", "app:processes" },
            })
            assert_parameters(value(workflows, "packages")[3], {
                { "kickside.workflows:target_db", "app:db" },
                { "kickside.workflows:api_router", "app:api" },
                { "kickside.workflows:ui_server", "app:gateway" },
                { "kickside.workflows:process_host", "app:processes" },

            })
            local automation_code = value(automation, "packages")[1].parameters
            local workflows_code = value(workflows, "packages")[1].parameters
            test.eq(#workflows_code, #automation_code)
            for index, parameter in ipairs(automation_code) do
                test.eq(workflows_code[index].name, parameter.name)
                test.eq(workflows_code[index].value, parameter.value)
            end

            test.eq(value(research, "profile"), "research")
            test.eq(value(research, "title"), "Web Research")
            assert_packages(value(research, "packages"), {
                "kickside/webscout",
            })

            test.eq(value(gtm, "profile"), "gtm")
            assert_packages(value(gtm, "packages"), {
                "kickside/hubspot",
                "kickside/phantombuster",
                "kickside/webscout",
            })

            test.eq(value(google_workspace, "profile"), "google_workspace")
            test.eq(value(google_workspace, "title"), "Google Workspace")
            assert_packages(value(google_workspace, "packages"), {
                "kickside/google",
            })

            test.eq(value(channels, "profile"), "channels")
            assert_packages(value(channels, "packages"), {
                "kickside/slack",
                "kickside/discord",
                "kickside/telegram",
                "kickside/dm",
            })

            test.eq(value(developer, "profile"), "developer")
            assert_packages(value(developer, "packages"), {
                "kickside/github",
                "kickside/atlassian",
                "kickside/skills",
                "kickside/self-reflection",
                "kickside/transfer",
            })
            assert_parameters(value(developer, "packages")[3], {
                { "kickside.skills:api_router", "app:api" },
                { "kickside.skills:ui_server", "app:gateway" },
                { "kickside.skills:upload_storage", "app:uploads" },
            })
            assert_parameters(value(developer, "packages")[4], {
                { "kickside.self_reflection.security:admin_scope", "app.security:admin" },
                { "kickside.self_reflection.security:forbid_scope", "app.security:user" },
            })
            assert_parameters(value(developer, "packages")[5], {

                { "kickside.transfer:api_router", "app:api" },
                { "kickside.transfer:ui_server", "app:gateway" },
                { "kickside.transfer:scratch_storage", "app:tmp" },
            })

            for _, profile in ipairs(profiles) do
                test.is_nil(value(profile, "capabilities"))
            end
        end)

    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
