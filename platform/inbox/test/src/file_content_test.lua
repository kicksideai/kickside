-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local context = require("context")
local handler = require("handler")
local reader = require("reader")
local provider = require("provider")
local files = require("files")
local original_open = files.open
return { run = test.run_cases(function()
    test.describe("Inbox file content", function()
        test.before_each(function()
            files.open = provider.open
            reader.item, reader.err = nil, nil
            provider.denied, provider.calls = false, 0
            provider.info_calls, provider.content_calls = 0, 0
            provider.size, provider.info_err, provider.info_format = nil, nil, nil
            provider.open_err, provider.content_err = nil, nil
        end)
        test.after_each(function()
            files.open = original_open
            reader.item, reader.err = nil, nil
        end)
        test.it("refuses previews above 25 MiB before reading content", function()
            reader.item = { files = { { component_id = "example:content", context = {} } } }
            provider.size = 25 * 1024 * 1024 + 1
            handler.handler()
            test.eq(context.status, 400)
            test.eq(context.output.kind, errors.INVALID)
            test.eq(context.output.error, "file exceeds the 25 MiB preview limit")
            test.is_nil(context.body)
            test.eq(provider.info_calls, 1)
            test.eq(provider.info_format, "raw")
            test.eq(provider.content_calls, 0)
        end)
        test.it("reads previews at the 25 MiB boundary after metadata", function()
            reader.item = { files = { { component_id = "example:content", context = {} } } }
            provider.size = 25 * 1024 * 1024
            handler.handler()
            test.eq(context.status, 200)
            test.eq(context.body, "file bytes")
            test.eq(provider.info_calls, 1)
            test.eq(provider.content_calls, 1)
            test.eq(provider.calls, 1)
        end)
        test.it("keeps previews when the provider omits size", function()
            reader.item = { files = { { component_id = "example:content", context = {} } } }
            handler.handler()
            test.eq(context.status, 200)
            test.eq(context.body, "file bytes")
            test.eq(provider.info_calls, 1)
            test.eq(provider.content_calls, 1)
        end)
        test.it("does not read bytes when metadata authorization fails", function()
            reader.item = { files = { { component_id = "example:content", context = {} } } }
            provider.info_err = errors.new({ kind = errors.PERMISSION_DENIED, message = "private filename" })
            handler.handler()
            test.eq(context.status, 403)
            test.is_nil(context.body)
            test.eq(context.output.error, "file access denied")
            test.eq(provider.info_calls, 1)
            test.eq(provider.content_calls, 0)
        end)
        test.it("returns a typed client error without bytes for invalid references", function()
            reader.item = { files = { { component_id = "example:content", context = {} } } }
            for _, stage in ipairs({ "open_err", "info_err", "content_err" }) do
                provider[stage] = errors.new({ kind = errors.INVALID, message = "file_id required" })
                handler.handler()
                provider[stage] = nil
                test.eq(context.status, 400)
                test.eq(context.output.kind, errors.INVALID)
                test.eq(context.output.error, "file_id required")
                test.is_nil(context.body)
            end
        end)
        test.it("checks access again after a preview and never returns bytes after revocation", function()
            reader.item = { files = { { component_id = "example:content", context = {} } } }
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
            reader.item = { files = { { component_id = "example:content", context = {} } } }
            reader.err = errors.new({ kind = errors.PERMISSION_DENIED, message = "private inbox item" })
            handler.handler()
            test.eq(context.status, 403)
            test.eq(provider.calls, 0)
            test.is_nil(context.body)
            test.eq(context.output.error, "file access denied")
        end)
        test.it("does not open a provider or disclose whether a missing item exists", function()
            handler.handler()
            test.eq(context.status, 403)
            test.eq(provider.calls, 0)
            test.is_nil(context.body)
            test.eq(context.output.error, "file access denied")
        end)
    end)
end) }
