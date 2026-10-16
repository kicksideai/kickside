local test = require("test")
local about = require("about")
local system = require("system")

return { run = test.run_cases(function()
    test.describe("application About", function()
        test.it("reports the active app package version rather than a stale deployment lock", function()
            local value, err = about.describe({
                entries = { { id = "example:definition", registry = { owner = "example/workspace" } } },
                resolution = { modules = {
                    { name = "another/module", version = "9.0.0" },
                    { name = "example/workspace", version = "1.2.3" },
                },
                lock = { root_module = "example/workspace", modules = {
                    { name = "example/workspace", version = "1.0.0" },
                } },
            } }, "Exact shipped notices", system.version(), "example:definition")
            test.is_nil(err)
            test.eq(value.version, "1.2.3")
            test.eq(value.notices, "Exact shipped notices")
            test.eq(value.runtime_version, system.version())
            test.is_true(#value.runtime_version > 0)
        end)

        test.it("leaves the version absent for an unpackaged source application", function()
            local value, err = about.describe({ entries = {}, resolution = { modules = {} } }, "Notices", system.version())
            test.is_nil(err)
            test.is_nil(value.version)
        end)

        test.it("resolves the application owner when deployment lock metadata is absent", function()
            local value, err = about.describe({
                entries = { { id = "example:definition", registry = { owner = "example/application" },
                    meta = { owner = "example/plugin" } } },
                resolution = { modules = {
                { name = "example/application", version = "2.3.4" },
                { name = "example/plugin", version = "9.9.9" },
            } } }, "Notices", system.version(), "example:definition")
            test.is_nil(err)
            test.eq(value.version, "2.3.4")
        end)

        test.it("refuses missing graph metadata instead of inventing a version", function()
            local value, err = about.describe(nil, "Notices", system.version())
            test.is_nil(value)
            test.is_true(err ~= nil)
        end)

        test.it("refuses missing notices instead of returning an incomplete About response", function()
            local value, err = about.describe({ entries = {}, resolution = { modules = {} } }, "", system.version())
            test.is_nil(value)
            test.is_true(err ~= nil)
        end)
    end)
end) }
