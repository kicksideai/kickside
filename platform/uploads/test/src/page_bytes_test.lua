-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local page_bytes = require("page_bytes")
local fixture = require("fixture")

return {run = test.run_cases(function()
    test.describe("Page byte storage diagnostics", function()
        for _, stage in ipairs({"acquire", "stat", "open", "read", "close"}) do
            for _, spec in ipairs({{errors.UNAVAILABLE, true, "storage_unavailable"},
                {errors.PERMISSION_DENIED, false, "storage_denied"}}) do
                test.it("redacts " .. spec[1] .. " during " .. stage, function()
                    fixture.stage = stage
                    fixture.closed = false
                    fixture.diagnostic = nil
                    fixture.err = errors.new({kind = spec[1], retryable = spec[2],
                        message = "cannot read /private/source/document.pdf", details = {code = spec[3],
                            path = "/private/source/document.pdf", cause = {message = "/private/source/document.pdf"}}})
                    local bytes, err = page_bytes.read({storage_id = "app:source", storage_path = "document.pdf"},
                        1024, "page_source_limit_exceeded")
                    test.is_nil(bytes); test.not_nil(err)
                    test.eq(err:kind(), spec[1]); test.eq(err:retryable(), spec[2])
                    test.eq(err:details().code, spec[3])
                    test.eq(err:message(), "page source could not be read")
                    test.is_nil(err:details().cause); test.is_nil(err:details().path)
                    test.is_nil(tostring(err):find("/private/source", 1, true))
                    test.eq(fixture.diagnostic, tostring(fixture.err))
                    if stage == "read" or stage == "close" then test.is_true(fixture.closed) end
                end)
            end
        end
    end)
end)}
