local test = require("test")
local registry = require("registry")

local function define_tests()
    test.describe("settings cache bootloader consolidation", function()
        test.it("the referenced root-namespace bootloader entry exists", function()
            local entry = registry.get("kickside.settings:cache_bootloader")
            test.not_nil(entry, "kickside.settings:cache_bootloader must be registered")
            local meta = (entry :: any).meta or {}
            test.eq(tostring(meta.type), "bootloader")
        end)

        test.it("the published service entry stays callable without duplicate discovery", function()
            local entry = registry.get("kickside.settings.service:cache_bootloader")
            test.not_nil(entry, "published service bootloader identity stays registered")
            test.eq(entry.kind, "function.lua")
            test.eq(entry.data.method, "run")
            test.is_nil(entry.meta.type)
        end)
        test.it("registers exactly one settings cache warmer", function()
            local entries, err = registry.find({ ["meta.type"] = "bootloader" })
            test.is_nil(err)
            local count = 0
            for _, entry in ipairs(entries) do
                if entry.id:match("^kickside%.settings[.:]") and entry.id:match("cache_bootloader$") then
                    count = count + 1
                end
            end
            test.eq(count, 1)
        end)
    end)
end

return test.run_cases(define_tests)
