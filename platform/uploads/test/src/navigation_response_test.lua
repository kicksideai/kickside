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
            test.it(name .. " classifies navigation failures in the HTTP response", function()
                for _, row in ipairs({{errors.UNAVAILABLE, 503}, {errors.PERMISSION_DENIED, 403}}) do
                    nav.entry = nil
                    nav.err = errors.new({kind = row[1], message = "registry read failed"})
                    http.reset()
                    handler()
                    test.eq(row[2], http.status)
                    test.eq(false, http.body.success)
                    test.is_nil(http.body.uploads)
                    test.is_nil(http.body.upload)
                end
                nav.err = nil
                http.reset()
                handler()
                test.eq(500, http.status)
                test.eq(false, http.body.success)
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
