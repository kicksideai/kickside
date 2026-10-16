local test = require("test")
local composer_catalog = require("composer_catalog")

local function define_tests()
    test.describe("knowledge composer catalog", function()
        test.it("projects knowledge bases into composer grounding rows", function()
            local rows, err = composer_catalog.knowledge_bases({}, {
                list = function(_args: any): (any, any?)
                    return {
                        {
                            component_id = "kb-2",
                            meta = { title = "Research", comment = "Research memory" },
                        },
                        {
                            component_id = "kb-1",
                            meta = { title = "Calls", comment = "Call transcripts" },
                        },
                    }, nil
                end,
            })

            test.is_nil(err)
            test.eq(#rows, 2)
            test.eq(rows[1].id, "kb-1")
            test.eq(rows[1].title, "Calls")
            test.eq(rows[1].description, "Call transcripts")
            test.eq(rows[2].id, "kb-2")
        end)

        test.it("uses the component id when the title is absent", function()
            local rows, err = composer_catalog.knowledge_bases({}, {
                list = function(_args: any): (any, any?)
                    return {
                        { component_id = "kb-1", meta = {} },
                    }, nil
                end,
            })
            test.is_nil(err)
            test.eq(rows[1].title, "kb-1")
            test.eq(rows[1].description, "")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
