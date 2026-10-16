local test = require("test")
local base64 = require("base64")
local handler = require("handler")

local function fake_actor(id)
    local actor = {}
    function actor:id() return id end
    return actor
end

-- Fresh dependency set per case: the upload library and read model are stubbed so
-- the cases observe exactly what the tool hands to the shared upload pipeline.
type UploadArgs = {
    actor_id: string, data: string, filename: string, size: integer, mime_type: string,
    storage_id: string?, metadata: { filename: string, source: string, title: string? },
}

local function base_deps(overrides)
    local calls: { upload_file: integer, args: UploadArgs? } = { upload_file = 0, args = nil }
    local deps = {
        actor = function() return fake_actor("inline-user") end,
        uploads = {
            upload_file = function(actor_id, data, filename, size, mime_type, storage_id, metadata)
                calls.upload_file = calls.upload_file + 1
                calls.args = {
                    actor_id = actor_id,
                    data = data,
                    filename = filename,
                    size = size,
                    mime_type = mime_type,
                    storage_id = storage_id,
                    metadata = metadata,
                }
                return { uuid = "upload-inline-1" }
            end,
        },
        read_model = {
            get_for_actor = function() return { status = "processing" } end,
        },
    }
    if type(overrides) == "function" then overrides(deps, calls) end
    handler.deps = deps
    return calls
end

local function define_tests()
    test.describe("uploads upload_file tool", function()
        test.it("decodes the content and hands it to the shared upload pipeline as the acting user", function()
            local calls = base_deps()
            local bytes = "RIFF\0\0\0\0WEBPVP8 inline"

            local result = handler.handle({
                filename = "hero.webp",
                content_type = "image/webp",
                content_base64 = base64.encode(bytes),
                title = "Hero image",
            })

            test.is_nil(result.error)
            test.eq(result.upload_id, "upload-inline-1")
            test.eq(result.status, "processing")
            test.is_false(result.processed)
            test.eq(result.size, #bytes)
            test.eq(calls.upload_file, 1)
            local args = assert(calls.args, "upload fixture was not called")
            test.eq(args.actor_id, "inline-user")
            test.eq(args.data, bytes)
            test.eq(args.filename, "hero.webp")
            test.eq(args.size, #bytes)
            test.eq(args.mime_type, "image/webp")
            test.is_nil(args.storage_id)
            test.eq(args.metadata.filename, "hero.webp")
            test.eq(args.metadata.title, "Hero image")
            test.eq(args.metadata.source, "agent.upload_file")
        end)

        test.it("accepts line-wrapped base64", function()
            local calls = base_deps()
            local bytes = string.rep("wrapped-bytes-", 20)
            local encoded = base64.encode(bytes)
            local wrapped = encoded:sub(1, 76) .. "\r\n" .. encoded:sub(77, 152) .. "\n" .. encoded:sub(153)

            local result = handler.handle({ filename = "notes.txt", content_type = "text/plain", content_base64 = wrapped })

            test.is_nil(result.error)
            test.eq(assert(calls.args, "upload fixture was not called").data, bytes)
        end)

        test.it("reports a deduplicated upload as the existing record", function()
            base_deps(function(deps)
                deps.uploads.upload_file = function()
                    return { uuid = "upload-existing", deduped = true }
                end
                deps.read_model.get_for_actor = function() return { status = "completed" } end
            end)

            local result = handler.handle({ filename = "a.txt", content_type = "text/plain", content_base64 = base64.encode("same bytes") })

            test.eq(result.upload_id, "upload-existing")
            test.eq(result.status, "completed")
            test.is_true(result.processed)
            test.is_true(result.deduped)
        end)

        test.it("rejects content that is not base64", function()
            local cases = {
                "not base64 at all!",
                "abc",
                "ab=c",
                "data:image/png;base64,iVBORw0KGgo=",
                "iVBORw0KGgo-_w==",
            }
            for _, encoded in ipairs(cases) do
                local calls = base_deps()
                local result, err = handler.handle({ filename = "x.png", content_type = "image/png", content_base64 = encoded })
                test.is_nil(result)
                test.not_nil(err, "must reject " .. encoded)
                test.contains(tostring(err), "base64")
                test.eq(calls.upload_file, 0)
            end
        end)

        test.it("rejects content over the documented size limit before uploading", function()
            local max = handler.MAX_CONTENT_BYTES
            test.eq(max, 10 * 1024 * 1024)

            local calls = base_deps()
            local over = base64.encode(string.rep("x", max + 1))
            local result, err = handler.handle({ filename = "big.bin", content_type = "application/octet-stream", content_base64 = over })
            test.is_nil(result)
            test.not_nil(err)
            test.contains(tostring(err), "limit")
            test.eq(calls.upload_file, 0)

            local at_limit = base64.encode(string.rep("x", max))
            local accepted = handler.handle({ filename = "edge.bin", content_type = "application/octet-stream", content_base64 = at_limit })
            test.is_nil(accepted.error)
            test.eq(calls.upload_file, 1)
            test.eq(assert(calls.args, "upload fixture was not called").size, max)
        end)

        test.it("rejects empty content", function()
            local calls = base_deps()
            local result, err = handler.handle({ filename = "empty.txt", content_type = "text/plain", content_base64 = "" })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(calls.upload_file, 0)
        end)

        test.it("requires a filename", function()
            local calls = base_deps()
            local result, err = handler.handle({ content_type = "text/plain", content_base64 = base64.encode("x") })
            test.is_nil(result)
            test.contains(tostring(err), "filename is required")
            test.eq(calls.upload_file, 0)
        end)

        test.it("requires an authenticated actor", function()
            local calls = base_deps(function(deps)
                deps.actor = function() return nil end
            end)
            local result, err = handler.handle({ filename = "a.txt", content_type = "text/plain", content_base64 = base64.encode("x") })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(calls.upload_file, 0)
        end)

        test.it("surfaces an upload pipeline error", function()
            base_deps(function(deps)
                deps.uploads.upload_file = function() return nil, "Unsupported file type: none" end
            end)
            local result, err = handler.handle({ filename = "a.txt", content_type = "text/plain", content_base64 = base64.encode("x") })
            test.contains(tostring(err), "Unsupported file type")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
