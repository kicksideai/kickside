-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local plugin_schema = require("plugin_schema")
local canonical_json = require("canonical_json")

return test.run_cases(function()
    test.describe("plugin schema source", function()
        test.it("accepts an absent source, a template or one provider binding", function()
            local absent, absent_err = plugin_schema.parse("app:plugin", nil)
            test.is_nil(absent)
            test.is_nil(absent_err)
            local fragment = { fields = { "name" } }
            local template = assert(plugin_schema.parse("app:plugin", { template = fragment }))
            local provider = assert(plugin_schema.parse("app:plugin", { provider = "app:provider" }))
            test.eq(template.template, fragment)
            test.eq(provider.provider, "app:provider")
        end)

        test.it("reports invalid manifest sources with the plugin error code", function()
            local cases: { unknown } = {
                "schema", {}, { template = {}, provider = "app:provider" }, { template = "schema" }, { provider = "" },
            }
            for _, raw in ipairs(cases) do
                local source, err = plugin_schema.parse("app:plugin", raw)
                test.is_nil(source)
                local invalid = assert(err)
                test.eq(invalid:kind(), errors.INVALID)
                test.eq(invalid:details().code, "plugin_invalid")
            end
        end)

        test.it("resolves a template and hashes the supplied canonical bytes without opening a provider", function()
            local absent, absent_err = plugin_schema.resolve("app:plugin", nil, "app:missing", {}, function() return "" end)
            test.is_nil(absent)
            test.is_nil(absent_err)
            local fragment = { fields = { "name" } }
            local source = assert(plugin_schema.parse("app:plugin", { template = fragment }))
            local resolved = assert(plugin_schema.resolve("app:plugin", source, "app:missing", {}, function(value)
                test.eq(value, fragment)
                return assert(canonical_json.encode(value))
            end))
            test.eq(resolved.fragment, fragment)
            test.is_nil(resolved.version)
            local digest = assert(canonical_json.hash(fragment))
            test.eq(resolved.digest, digest)
        end)
    end)
end)
