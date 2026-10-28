-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local nav = require("nav")
local response = require("response")
local list_api = require("list_api")
local get_api = require("get_api")
local http = require("http")
return { run = test.run_cases(function()
    http.upload_id = "first"
    test.describe("upload navigation responses", function()
        test.it("returns a typed error when the navigation entry is absent", function()
            nav.entry = nil
            nav.err = nil
            local result, err = response.view_base()
            test.is_nil(result)
            test.not_nil(err)
            test.eq(errors.INTERNAL, err:kind())
        end)
        test.it("preserves typed registry read failures", function()
            nav.entry = nil
            nav.err = errors.new({kind = errors.UNAVAILABLE, message = "registry read failed"})
            local result, err = response.view_base()
            test.is_nil(result)
            test.eq(nav.err, err)
        end)
        test.it("rejects a navigation entry without a usable path", function()
            nav.err = nil
            for _, entry in ipairs({{}, {meta = {}}, {meta = {path = ""}}, {meta = {path = 5}}}) do
                nav.entry = entry
                local result, err = response.view_base()
                test.is_nil(result)
                test.eq(errors.INTERNAL, err:kind())
            end
        end)
        for name, handler in pairs({list = list_api.list_handler, get = get_api.get_handler}) do
            test.it(name .. " preserves authorized file reads when optional navigation is unavailable", function()
                for _, failure in ipairs({
                    errors.new({kind = errors.UNAVAILABLE, message = "registry read failed"}),
                    errors.new({kind = errors.PERMISSION_DENIED, message = "navigation not visible"}),
                }) do
                    nav.entry = nil
                    nav.err = failure
                    http.reset()
                    handler()
                    test.eq(200, http.status)
                    test.eq(true, http.body.success)
                    if name == "list" then
                        test.eq(2, #http.body.uploads)
                        for _, upload in ipairs(http.body.uploads) do
                            test.is_nil(upload.view_url)
                            test.not_nil(upload.raw_url)
                        end
                    else
                        test.not_nil(http.body.upload)
                        test.is_nil(http.body.upload.view_url)
                        test.not_nil(http.body.upload.raw_url)
                    end
                end
                nav.err = nil
                http.reset()
                handler()
                test.eq(200, http.status)
                test.eq(true, http.body.success)
            end)
        end
        test.it("resolves the navigation base once for every list response", function()
            nav.entry = {meta = {path = "/files"}}
            nav.err = nil
            nav.calls = 0
            http.reset()
            list_api.list_handler()
            test.eq(200, http.status)
            test.eq(2, #http.body.uploads)
            test.eq("/files/first", http.body.uploads[1].view_url)
            test.eq("/files/second", http.body.uploads[2].view_url)
            test.eq(1, nav.calls)
        end)
    end)
end) }
