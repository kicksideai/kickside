local test = require("test")
local sink_input = require("sink_input")

local function define_tests()
    test.describe("sink input normalization", function()
        test.it("normalizes a value to the sink's declared input shape", function()
            test.eq(sink_input.normalize({ title = "x" }, "record").title, "x")
            test.eq(sink_input.normalize("hello", "content").content, "hello")
            test.eq(sink_input.normalize({ content = "body", title = "t" }, "content").content, "body")
            local _, scalar_err = sink_input.normalize(42, "record")
            test.not_nil(scalar_err)
            test.is_true(errors.is(scalar_err, errors.INVALID))
            local absent, absent_err = sink_input.normalize(nil, "record")
            test.is_nil(absent)
            test.not_nil(absent_err)
        end)

        test.it("supplies configured content without changing the source record", function()
            local source = { upload_id = "upload-1", title = "Uploaded notes" }
            local out, err = sink_input.normalize(source, "content", "Review these notes")
            test.is_nil(err)
            test.eq(out.content, "Review these notes")
            test.eq(out.upload_id, "upload-1")
            test.eq(out.title, source.title)
            test.is_nil(source.content)
            test.eq(sink_input.normalize({ content = "Source body" }, "content", "Configured").content, "Source body")
            test.eq(sink_input.normalize("Transformed body", "content", "Configured").content, "Transformed body")
            test.eq(sink_input.normalize({ content = "" }, "content", "Configured").content, "Configured")
            test.is_nil(sink_input.normalize(source, "record", "Configured").content)
        end)

        test.it("keeps missing values and invalid content as failures even with a configured message", function()
            for _, value in ipairs({ false, 42, { content = false }, { content = 42 } }) do
                local out, err = sink_input.normalize(value, "content", "Configured")
                test.is_nil(out)
                test.is_true(errors.is(err, errors.INVALID))
            end
            local out, err = sink_input.normalize(nil, "content", "Configured")
            test.is_nil(out)
            test.is_true(errors.is(err, errors.INVALID))
            for _, configured in ipairs({ false, 42, "" }) do
                local missing, missing_err = sink_input.normalize({ upload_id = "u1" }, "content", configured)
                test.is_nil(missing)
                test.is_true(errors.is(missing_err, errors.INVALID))
            end
        end)

        test.it("refuses a shape the sink cannot declare", function()
            local out, err = sink_input.normalize({ title = "x" }, "document")
            test.is_nil(out)
            test.is_true(errors.is(err, errors.INVALID))
        end)

    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
