local test = require("test")
local registry = require("registry")
local documentation = require("documentation")

local function contains(values: { string }, expected: string): boolean
    for _, value in ipairs(values) do
        if value == expected then return true end
    end
    return false
end

local function define_tests()
    test.describe("application documentation reader", function()
        test.it("lists registry-owned documentation pages", function()
            local listed, err = documentation.read({})
            test.is_nil(err)
            test.is_true(contains((listed :: any).pages, "README.md"))
            test.is_true(contains((listed :: any).pages, "docs/page.md"))
        end)

        test.it("reads exact registry-owned content", function()
            local readme, readme_err = documentation.read({ page = "README.md" })
            test.is_nil(readme_err)
            if not readme then error("README read failed: " .. tostring(readme_err)) end
            test.contains((readme :: any).content, "Documentation harness README")

            local page, page_err = documentation.read({ page = "docs/page.md" })
            test.is_nil(page_err)
            if not page then error("Wiki page read failed: " .. tostring(page_err)) end
            test.contains((page :: any).content, "Registry wiki payload proof")
        end)

        test.it("pages documentation names in path order with a cursor", function()
            local first, first_err = documentation.read({ limit = 1 })
            test.is_nil(first_err)
            test.eq((first :: any).pages[1], "README.md")
            test.eq((first :: any).next_cursor, "README.md")
            local second, second_err = documentation.read({ limit = 1, cursor = (first :: any).next_cursor })
            test.is_nil(second_err)
            test.eq((second :: any).pages[1], "docs/page.md")
            local third, third_err = documentation.read({ limit = 1, cursor = (second :: any).next_cursor })
            test.is_nil(third_err)
            test.eq((third :: any).pages[1], "docs/unicode.md")
            test.is_nil((third :: any).next_cursor)
        end)

        test.it("returns a whole page", function()
            local page, page_err = documentation.read({ page = "docs/unicode.md" })
            test.is_nil(page_err)
            test.eq((page :: any).page, "docs/unicode.md")
            test.eq((page :: any).content, "éclair")
            test.is_nil((page :: any).next_cursor)
        end)

        test.it("fails a missing page with a typed not-found error", function()
            local value, err = documentation.read({ page = "docs/missing.md" })
            test.is_nil(value)
            test.is_true(errors.is(err, errors.NOT_FOUND))
            test.contains(err:message(), "docs/missing.md")
        end)

        test.it("fails a non-string page with a typed invalid error", function()
            local value, err = documentation.read({ page = 3 })
            test.is_nil(value)
            test.is_true(errors.is(err, errors.INVALID))
        end)

        test.it("rejects invalid list bounds", function()
            for _, args in ipairs({ { limit = 0 }, { limit = 101 }, { cursor = 3 } }) do
                local value, err = documentation.read(args)
                test.is_nil(value)
                test.not_nil(err)
            end
        end)

        test.it("exposes pages to direct registry discovery", function()
            local entries, err = registry.find({
                [".kind"] = "registry.entry",
                ["meta.type"] = "wippy.documentation.page",
            })
            test.is_nil(err)
            test.eq(#entries, 3)
            local paths, contents = {}, {}
            for _, entry in ipairs(entries) do
                local data: any = (entry :: any).data or {}
                if type(data.path) == "string" then paths[#paths + 1] = data.path end
                if type(data.content) == "string" then contents[#contents + 1] = data.content end
            end
            local all_content = table.concat(contents, "\n")
            test.is_true(contains(paths, "README.md"), "paths: " .. table.concat(paths, ","))
            test.is_true(contains(paths, "docs/page.md"), "paths: " .. table.concat(paths, ","))
            test.is_true(contains(paths, "docs/unicode.md"), "paths: " .. table.concat(paths, ","))
            test.contains(all_content, "Documentation harness README")
            test.contains(all_content, "Registry wiki payload proof")
        end)

        test.it("rejects unknown pages instead of reading arbitrary paths", function()
            local page, err = documentation.read({ page = "../../secret" })
            test.is_nil(page)
            if err == nil then error("unknown page unexpectedly returned no error") end
            test.contains(tostring(err), "documentation page not found")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
