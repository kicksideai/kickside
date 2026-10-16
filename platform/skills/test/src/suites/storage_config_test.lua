local test = require("test")
local registry = require("registry")
local storage = require("skill_storage")

type RequirementTarget = { entry: string?, path: string? }
type Requirement = { targets: { RequirementTarget }? }
type RequirementEntry = { data: Requirement? }
type StorageConfig = { storage_id: string? }
type StorageConfigEntry = { data: StorageConfig? }

local function define_tests()
    test.describe("skills storage configuration", function()
        test.it("routes bundle uploads through upload_storage", function()
            local requirement = registry.get("kickside.skills:upload_storage")
            test.not_nil(requirement)
            local requirement_data = (requirement :: RequirementEntry).data or (requirement :: Requirement)
            local targets = requirement_data.targets or {}
            test.eq(#targets, 1)
            local target = targets[1]
            test.not_nil(target)
            if not target then return end
            test.eq(target.entry, storage.CONFIG)
            test.eq(target.path, ".storage_id")

            local config = registry.get(storage.CONFIG)
            test.not_nil(config)
            local config_data = (config :: StorageConfigEntry).data or (config :: StorageConfig)
            local storage_id = config_data.storage_id
            test.is_true(type(storage_id) == "string" and storage_id ~= "")
            test.not_nil((registry.get(storage_id)))

            test.eq(storage.id(), storage_id)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
