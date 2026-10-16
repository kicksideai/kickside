local test = require("test")
local registry = require("registry")

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if entry[key] ~= nil then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function meta(entry: any): any
    return type(entry) == "table" and (entry.meta or (entry.data and entry.data.meta)) or nil
end

local function get(id: string): any
    local entry, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(entry, id .. " is missing")
    return entry
end

local function define_tests()
    test.describe("kickside.hub packaging", function()
        test.it("publishes the System modules tab and view component", function()
            local view = get("kickside.hub:modules_view")
            test.eq(meta(view).type, "view.component")
            test.eq(meta(view).tag_name, "kickside-hub")

            local tab = get("kickside.hub:tab.modules")
            test.eq(meta(tab).type, "ui.settings_tab")
            test.eq(value(tab, "component_tag"), "kickside-hub")
        end)

        test.it("resolves the Keeper Hub token-provider port", function()
            local provider = get("keeper.hub:token_provider")
            test.eq(value(provider, "kind"), "contract.definition")
            test.not_nil(value(provider, "methods"))
        end)

        test.it("declares Keeper as the registry-backed dependency service", function()
            local dep = get("kickside.hub:dep.keeper")
            test.eq(value(dep, "component"), "keeper/keeper")
        end)

        test.it("discovers consumer-owned onboarding profiles without shipping concrete presets", function()
            local entries, err = registry.find({
                [".kind"] = "registry.entry",
                ["meta.type"] = "kickside.hub:onboarding_profile",
            })
            test.is_nil(err)
            test.eq(#entries, 1)

            local fixture = get("app:onboarding_profile.fixture")
            test.eq(meta(fixture).type, "kickside.hub:onboarding_profile")
            test.eq(value(fixture, "profile"), "fixture")
            test.eq(value(fixture, "packages")[1].component, "example/workspace")
            test.is_nil(value(fixture, "packages")[1].version)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
