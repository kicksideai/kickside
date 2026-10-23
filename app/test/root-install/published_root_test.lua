-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local http_client = require("http_client")
local base64 = require("base64")
local branding = require("branding")

local function define_tests()
    test.describe("published root dependency install", function()
        test.it("resolves every deployment default into its declared target", function()
            local entries, err = registry.find({ [".kind"] = "ns.requirement" })
            test.is_nil(err)
            local count = 0
            for _, entry in ipairs(entries or {}) do
                if tostring(entry.id):match("^app%.deployment:") then
                    count = count + 1
                    test.not_nil(entry.data.default)
                    test.eq(#entry.data.targets, 1)
                    local target, target_err = registry.get(entry.data.targets[1].entry)
                    test.is_nil(target_err)
                    test.eq(target.kind, "registry.entry")
                    test.not_nil(target.data.value)
                end
            end
            test.eq(count, 15)
        end)
        test.it("retains the published documentation address and uploaded branding bytes", function()
            local catalog, err = registry.get("app:documentation.rfc-document-catalog")
            test.is_nil(err)
            test.eq(catalog.kind, "registry.entry")
            local page = catalog.data.data or catalog.data
            test.eq(page.path, "docs/rfcs/0001-registry-document-catalog.md")
            local legacy, legacy_err = registry.get("kickside.ui:legacy_branding_config")
            test.is_nil(legacy_err)
            test.eq(legacy.data.fs, "app:branding_fs")
            local gateway, gateway_err = registry.get("app:gateway")
            test.is_nil(gateway_err)
            local port = tostring(gateway.data.addr):match(":(%d+)$")
            test.not_nil(port)
            local bytes = assert(base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/RZkAAAAASUVORK5CYII="))
            local previous = branding.read()
            local ok, failure = pcall(function()
                branding.save(bytes, "image/png")
                local response, response_err = http_client.get("http://127.0.0.1:" .. port .. branding.url(), { timeout = 10 })
                test.is_nil(response_err)
                test.eq(response.status_code, 200)
                test.eq(tostring(response.body), bytes)
            end)
            local restored, restore_err = pcall(branding.save, previous and previous.bytes, previous and previous.content_type)
            if not ok then error(failure) end
            if not restored then error(restore_err) end
        end)
    end)
end
return { run = test.run_cases(define_tests) }
