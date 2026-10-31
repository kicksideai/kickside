-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local context = require("context")
local handler = require("handler")
local reader = require("reader")
local provider = require("provider")
return { run = test.run_cases(function()
    test.describe("Inbox file content", function()
        test.it("checks access again after a preview and never returns bytes after revocation", function()
            reader.item = { files = { { component_id = "example:content", context = {} } } }
            provider.denied, provider.calls = false, 0
            handler.handler()
            test.eq(context.body, "file bytes")
            test.eq(context.mime, "text/plain")
            test.eq(context.headers["Cache-Control"], "no-store")
            test.eq(context.headers["Content-Disposition"], "attachment")
            provider.denied = true
            handler.handler()
            test.eq(context.status, 403)
            test.is_nil(context.body)
            test.eq(context.output.error, "file access denied")
            test.eq(provider.calls, 2)
        end)
        test.it("does not open a provider when the item is outside the viewer inbox", function()
            reader.item, provider.calls = nil, 0
            handler.handler()
            test.eq(context.status, 403)
            test.eq(provider.calls, 0)
            test.is_nil(context.body)
        end)
    end)
end) }
