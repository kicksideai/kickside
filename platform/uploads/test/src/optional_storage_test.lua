local test = require("test")
local registry = require("registry")
local fs = require("fs")
local uuid = require("uuid")
local resources = require("resources")

return {run = test.run_cases(function()
    test.describe("Uploads without an optional storage extension", function()
        test.it("boots and reads processed local content without an S3 controller or settings block", function()
            for _, id in ipairs({
                "kickside.storage_s3.service:controller", "kickside.storage_s3:settings_block",
                "kickside.storage_s3.api:configure.endpoint", "kickside.uploads.storage.service:controller",
            }) do
                local entry = registry.get(id)
                test.is_nil(entry, id)
            end
            local path = "base-install-" .. uuid.v4()
            local native = assert(fs.get("app:uploads"))
            local value = "Local uploads work without installing an extension"
            local written, write_err = native:writefile(path, value)
            test.is_nil(write_err)
            test.not_nil(written)
            local storage = assert(resources.get_storage("app:uploads"))
            local actual, err = storage:readfile(path)
            native:remove(path)
            test.is_nil(err, tostring(err))
            test.eq(actual, value)
        end)
    end)
end)}
