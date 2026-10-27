-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local files = require("inbox_files")

local function run()
    test.describe("Inbox file references", function()
        test.it("rejects malformed lists at the write boundary", function()
            for _, value in ipairs({ "file", { title = "file" }, { { upload_id = "file" } }, { { component_id = "provider", context = { "file" } } } }) do
                local result, err = files.normalize(value)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
            end
        end)
        test.it("keeps provider context generic and preserves omission", function()
            local value, err = files.normalize({ { component_id = "example:provider", context = { document_id = "doc" }, title = "Read this" } })
            test.is_nil(err)
            test.eq(value[1].context.document_id, "doc")
            test.eq(value[1].title, "Read this")
            local absent, absent_err = files.normalize(nil)
            test.is_nil(absent)
            test.is_nil(absent_err)
        end)
        test.it("exposes names and deep links only after provider authorization", function()
            local original = files.open
            files.open = function(ref: any): (any?, any?)
                return { get_info = function(): (any?, any?)
                    if ref.context.denied then
                        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "private filename" })
                    end
                    return { filename = "report.pdf", content_type = "application/pdf", size = 1024, view_url = "/viewer?document=doc" }, nil
                end }, nil
            end
            local rows, err = files.list({
                { context = {}, title = "Review report" },
                { context = { denied = true }, title = "private title" },
            })
            files.open = original
            test.is_nil(err)
            test.eq(rows[1].filename, "Review report")
            test.eq(rows[1].view_url, "/viewer?document=doc")
            test.is_true(rows[2].locked)
            test.eq(next(rows[2]), "locked")
            test.is_nil(rows[2].filename)
            test.is_nil(rows[2].title)
            test.is_nil(rows[2].context)
        end)
        test.it("propagates provider failures instead of disguising them as denied access", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "provider unavailable" })
            local original = files.open
            files.open = function(): (any?, any?) return nil, failure end
            local rows, err = files.list({ { component_id = "example:provider" } })
            files.open = original
            test.is_nil(rows)
            test.is_true(err == failure)
        end)
    end)
end
return { run = test.run_cases(run) }
