local test = require("test")
local import_stage = require("upload_import_stage")

local function define_tests()
    test.describe("transfer upload import stage", function()
        test.it("ignores ordinary uploads", function()
            local calls = 0
            local stage = import_stage.new(function() return nil, "unused" end, function()
                calls = calls + 1
                return { success = true, created = {} }
            end)

            local result = stage.process({
                mime_type = "text/plain",
                storage_id = "app:uploads",
                storage_path = "u/notes.txt",
                metadata = { filename = "notes.txt" },
            })

            test.is_true(result.success)
            test.eq(0, calls)
        end)

        test.it("imports transfer bundles under an explicit workspace parent", function()
            local seen_storage, seen_path, seen_parent, seen_storage_id
            local storage_provider = function(storage_id)
                test.eq("app:uploads", storage_id)
                return { id = storage_id }, nil
            end
            local importer = function(storage, path, opts)
                seen_storage = storage
                seen_path = path
                seen_parent = opts.parent_id
                seen_storage_id = opts.storage_id
                return { success = true, created = { "component-1" }, warnings = {} }, nil
            end
            local stage = import_stage.new(storage_provider, importer)

            local result = stage.process({
                mime_type = "application/octet-stream",
                storage_id = "app:uploads",
                storage_path = "u/export.kxb",
                metadata = { filename = "export.kxb", target_parent_id = "folder-1" },
            })

            test.is_true(result.success)
            test.eq("transfer_imported", result.skipped)
            test.eq("u/export.kxb", seen_path)
            test.eq("folder-1", seen_parent)
            test.eq("app:uploads", seen_storage_id)
            test.eq("app:uploads", seen_storage.id)
            test.is_true(result.metadata.transfer_imported)
            test.eq("component-1", result.metadata.transfer_created[1])
        end)

        test.it("skips bundles already marked as imported", function()
            local calls = 0
            local stage = import_stage.new(function() return nil, "unused" end, function()
                calls = calls + 1
                return { success = true, created = {} }
            end)

            local result = stage.process({
                mime_type = "application/octet-stream",
                storage_id = "app:uploads",
                storage_path = "retry.kxb",
                metadata = { filename = "retry.kxb", transfer_imported = true },
            })

            test.is_true(result.success)
            test.eq("transfer_imported", result.skipped)
            test.eq(0, calls)
        end)

        test.it("imports workspace-root and uploads-page bundles globally", function()
            local parents = {}
            local storage_provider = function(storage_id) return { id = storage_id }, nil end
            local importer = function(_, _, opts)
                parents[#parents + 1] = opts.parent_id
                return { success = true, created = {}, warnings = {} }, nil
            end
            local stage = import_stage.new(storage_provider, importer)

            local root = stage.process({
                mime_type = "application/octet-stream",
                storage_id = "app:uploads",
                storage_path = "root.kxb",
                metadata = { filename = "root.kxb", target_parent_id = "" },
            })
            local global = stage.process({
                mime_type = "application/vnd.kickside.bundle",
                storage_id = "app:uploads",
                storage_path = "global",
                metadata = { filename = "global" },
            })

            test.is_true(root.success)
            test.is_true(global.success)
            test.is_nil(parents[1])
            test.is_nil(parents[2])
        end)

        test.it("fails invalid bundle uploads without retrying the upload job", function()
            local storage_provider = function(storage_id) return { id = storage_id }, nil end
            local importer = function()
                return nil, "bad magic"
            end
            local stage = import_stage.new(storage_provider, importer)

            local result = stage.process({
                mime_type = "application/octet-stream",
                storage_id = "app:uploads",
                storage_path = "bad.kxb",
                metadata = { filename = "bad.kxb" },
            })

            test.is_false(result.success)
            test.is_false(result.retriable)
            test.contains(result.error, "bad magic")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
