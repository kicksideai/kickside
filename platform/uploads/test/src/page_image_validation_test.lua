-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local image = require("image")
local base64 = require("base64")
local hash = require("hash")
local registry = require("registry")
local PNG = assert(base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jv1kAAAAASUVORK5CYII="))
local function check(bytes, mime, limits, checksum)
    return image.validate(bytes, mime, limits or assert(image.limits()), 1, "revision", checksum)
end
local function code(err, expected)
    test.not_nil(err); test.eq(err:details().code, expected)
end
return {run = test.run_cases(function()
    test.describe("Page image validation", function()
        test.it("lists page capability resources by exact identity", function()
            local policy = assert(registry.get("kickside.uploads.security:module_runtime"))
            local expected = {
                ["kickside.uploads.pages:get_info"] = true,
                ["kickside.uploads.pages:read_image"] = true,
                ["kickside.uploads.pages:source"] = true,
                ["kickside.uploads.pages:image"] = true,
                ["kickside.uploads.pages:bytes"] = true,
            }
            local count = 0
            for _, resource in ipairs(policy.data.policy.resources) do
                if resource:sub(1, #"kickside.uploads.pages:") == "kickside.uploads.pages:" then
                    test.is_true(expected[resource] == true, resource)
                    expected[resource] = nil
                    count = count + 1
                end
            end
            test.eq(count, 5)
            test.is_nil(next(expected))
        end)
        test.it("validates headers and encoded bytes at exact byte limits", function()
            local limits = assert(image.limits({max_bytes = #PNG}))
            local result = assert(check(PNG, "image/png", limits, assert(hash.sha256(PNG))))
            test.eq(result.size, #PNG); test.eq(result.width, 1); test.eq(result.height, 1)
            local rejected, err = check(PNG, "image/png", assert(image.limits({max_bytes = #PNG - 1})))
            test.is_nil(rejected); code(err, "page_image_limit_exceeded")
        end)
        test.it("rejects unsupported, mislabeled and truncated images", function()
            for _, bytes in ipairs({"RIFF0123WEBP", PNG:sub(1, #PNG - 1), "invalid"}) do
                local result, err = check(bytes, "image/png")
                test.is_nil(result); code(err, "page_image_format_unsupported")
            end
            local result, err = check(PNG, "image/jpeg")
            test.is_nil(result); code(err, "page_image_format_unsupported")
        end)
        test.it("rejects oversized dimensions and zero-area headers", function()
            for _, dimensions in ipairs({"\0\0\16\1\0\0\0\1", "\0\0\0\1\0\0\16\1", "\0\0\0\0\0\0\0\1"}) do
                local result, err = check(PNG:sub(1, 16) .. dimensions .. PNG:sub(25), "image/png")
                test.is_nil(result); code(err, "page_image_limit_exceeded")
            end
        end)
        test.it("rejects corruption and invalid limit values", function()
            local result, err = check(PNG, "image/png", nil, string.rep("0", 64))
            test.is_nil(result); code(err, "revision_mismatch")
            for _, value in ipairs({0, -1, 1.5, math.huge, 4194305}) do
                local limits, limit_err = image.limits({max_bytes = value})
                test.is_nil(limits); code(limit_err, "invalid_page_request")
            end
        end)
    end)
end)}
