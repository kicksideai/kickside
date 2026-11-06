-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local context = require("context")
local subject = require("subject")
local files = require("files")
return { run = test.run_cases(function()
    test.describe("Inbox resolution response", function()
        test.it("returns the committed outcome without reading file providers or exposing references", function()
            subject._modules = { http = context, security = context, resolve = context }
            local original = files.open
            files.open = context.list
            subject.handler()
            files.open = original
            subject._modules = {}
            test.is_true(context.committed)
            test.eq(context.status, 200)
            test.is_true(context.output.success)
            test.eq(context.output.item.status, "approved")
            test.eq(context.output.item.action, "approve")
            test.is_nil(context.output.item.files)
            test.eq(context.file_reads, 0)
        end)
    end)
end) }
