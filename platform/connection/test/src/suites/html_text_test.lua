local test = require("test")
local html_text = require("html_text")

local function define_tests()
    test.describe("html_text", function()
        test.it("decodes named and numeric entities to strings", function()
            test.eq(html_text.decode_entities("Tom &amp; Jerry"), "Tom & Jerry")
            test.eq(html_text.decode_entities("caf&#233;"), "caf" .. string.char(0xC3, 0xA9))
            test.eq(html_text.decode_entities("caf&#xE9;"), "caf" .. string.char(0xC3, 0xA9))
        end)

        test.it("drops invalid numeric references", function()
            test.eq(html_text.decode_entities("bad &#0; ref"), "bad  ref")
            test.eq(html_text.decode_entities("bad &#xD800; ref"), "bad  ref")
        end)

        test.it("returns an empty string for non-string input", function()
            test.eq(html_text.decode_entities(nil), "")
            test.eq(html_text.decode_entities(123), "")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
