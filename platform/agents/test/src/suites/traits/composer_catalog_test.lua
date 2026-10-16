local test = require("test")
local composer_catalog = require("composer_catalog")

local function define_tests()
    test.describe("agents composer catalog", function()
        test.it("projects public traits into composer grounding rows", function()
            local rows, err = composer_catalog.traits({}, {
                find = function(_query: any): (any, any?)
                    return {
                        {
                            id = "test:private",
                            meta = { type = "agent.trait", title = "Private", public = true, private = true },
                        },
                        {
                            id = "test:writer",
                            meta = {
                                type = "agent.trait",
                                title = "Writer",
                                comment = "Writes to the selected place.",
                                public = true,
                                context_schema = {
                                    kb_id = {
                                        type = "string",
                                        required = true,
                                        role = "picker",
                                        title = "Knowledge base",
                                        web_component = "wc-kb-picker",
                                    },
                                },
                            },
                        },
                    }, nil
                end,
            })

            test.is_nil(err)
            test.eq(#rows, 1)
            test.eq(rows[1].id, "test:writer")
            test.eq(rows[1].title, "Writer")
            test.eq(rows[1].description, "Writes to the selected place.")
            test.eq(rows[1].context_schema.kb_id.required, true)
            test.eq(rows[1].context_schema.kb_id.web_component, "wc-kb-picker")
        end)

        test.it("falls back to name when no description field is present", function()
            local rows, err = composer_catalog.traits({}, {
                find = function(_query: any): (any, any?)
                    return {
                        {
                            id = "test:named",
                            meta = { type = "agent.trait", public = true, title = "Named", name = "Named capability" },
                        },
                    }, nil
                end,
            })
            test.is_nil(err)
            test.eq(rows[1].description, "Named capability")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
