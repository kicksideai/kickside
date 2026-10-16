local test = require("test")
local registry = require("registry")
local runtime_config = require("runtime_config")

local function data(entry: any): any
    return type(entry) == "table" and (entry.data or entry) or {}
end

local function meta(entry: any): any
    return type(entry) == "table" and (entry.meta or (entry.data and entry.data.meta)) or {}
end

local function define_tests()
    test.describe("kickside.oauth packaging", function()
        test.it("routes service and negotiator spawns through one process_host requirement", function()
            local requirement = registry.get("kickside.oauth:process_host")
            test.not_nil(requirement)
            local targets: any = {}
            local declared = (data(requirement).targets or {}) :: { any }
            test.eq(#declared, 3)
            for _, target in ipairs(declared) do
                targets[tostring(target.entry)] = tostring(target.path)
            end
            test.eq(targets["kickside.oauth.service:token_refresh"], ".meta.default_host")
            test.eq(targets["kickside.oauth.service:refresh_bootstrap.service"], ".host")
            test.eq(targets["kickside.oauth:process_config"], ".meta.host_id")
            local expected_host = tostring(meta(registry.get("kickside.oauth:process_config")).host_id)
            test.is_true(expected_host ~= "" and expected_host ~= "nil")
            test.eq(tostring(meta(registry.get("kickside.oauth.service:token_refresh")).default_host), expected_host)

            test.eq(runtime_config.process_host(), expected_host)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
