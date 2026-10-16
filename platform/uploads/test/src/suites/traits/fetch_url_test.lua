local test = require("test")
local handler = require("handler")

local function fake_actor(id)
    local actor = {}
    function actor:id() return id end
    return actor
end

-- Fresh dependency set per case: real net_safety, everything else stubbed so no
-- network, storage, or clock is touched.
local function base_deps(overrides)
    local calls = {
        upload_file = 0,
        head = 0,
        get = 0,
        status_reads = 0,
        sleeps = 0,
    }
    local deps = {
        actor = function() return fake_actor("fetch-user") end,
        net_safety = {
            is_safe_public_url = function(url)
                if type(url) == "string" and url:find("://", 1, true) and not url:find("localhost", 1, true) then
                    return true, nil
                end
                return false, "url host not allowed"
            end,
        },
        upload_type = {
            find_by_mime_or_ext = function(_mime, _ext) return { id = "documents" } end,
        },
        http = {
            head = function() calls.head = calls.head + 1; return nil, "not implemented" end,
            get = function() calls.get = calls.get + 1; return nil, "not implemented" end,
        },
        uploads = {
            upload_file = function()
                calls.upload_file = calls.upload_file + 1
                return { uuid = "upload-1" }
            end,
        },
        read_model = {
            get_for_actor = function()
                calls.status_reads = calls.status_reads + 1
                return { status = "processing" }
            end,
        },
        artifacts = {
            read_primary_content = function()
                return nil, errors.new({ kind = errors.NOT_FOUND, message = "primary content artifact not found" })
            end,
            list_artifacts = function() return {} end,
        },
        now = function() return 0 end,
        sleep = function() calls.sleeps = calls.sleeps + 1 end,
    }
    if type(overrides) == "function" then overrides(deps, calls) end
    handler.deps = deps
    return calls
end

local function define_tests()
    test.describe("uploads fetch_url tool", function()
        test.it("check_only returns the detected format without creating an upload", function()
            local calls = base_deps(function(deps)
                deps.http.head = function(_url, _opts)
                    return { status_code = 200, headers = { ["Content-Type"] = "application/pdf", ["Content-Length"] = "2048" } }, nil
                end
            end)

            local result = handler.handle({ url = "https://example.com/doc.pdf", check_only = true })
            test.eq(result.url, "https://example.com/doc.pdf")
            test.eq(result.content_type, "application/pdf")
            test.eq(result.size, 2048)
            test.eq(result.filename, "doc.pdf")
            test.is_true(result.supported)
            test.eq(calls.upload_file, 0)
            test.is_nil(result.upload_id)
        end)

        test.it("probes with a ranged GET when HEAD is rejected", function()
            local calls = base_deps(function(deps)
                deps.http.head = function() return { status_code = 405, headers = {} }, nil end
                deps.http.get = function(_url, opts)
                    test.eq(opts.headers.Range, "bytes=0-0")
                    return { status_code = 206, headers = { ["content-type"] = "image/png", ["content-range"] = "bytes 0-0/512" } }, nil
                end
            end)

            local result = handler.handle({ url = "https://example.com/pic.png", check_only = true })
            test.eq(result.content_type, "image/png")
            test.eq(result.size, 512)
            test.eq(calls.upload_file, 0)
        end)

        test.it("downloads and creates an upload, returning upload_id when wait is false", function()
            local calls = base_deps(function(deps)
                deps.http.get = function()
                    return { status_code = 200, headers = { ["content-type"] = "text/plain" }, body = "hello world" }, nil
                end
            end)

            local result = handler.handle({ url = "https://example.com/notes.txt" })
            test.eq(result.upload_id, "upload-1")
            test.eq(result.status, "processing")
            test.is_false(result.processed)
            test.eq(calls.upload_file, 1)
            test.not_nil(result.message)
        end)

        test.it("wait polls durable status to terminal and returns the completed shape", function()
            local calls = base_deps(function(deps, c)
                deps.http.get = function()
                    return { status_code = 200, headers = { ["content-type"] = "application/pdf" }, body = "%PDF-1.4" }, nil
                end
                deps.read_model.get_for_actor = function()
                    c.status_reads = c.status_reads + 1
                    if c.status_reads == 1 then
                        return { status = "processing" }
                    end
                    return { status = "completed", mime_type = "text/markdown" }
                end
                deps.artifacts.read_primary_content = function()
                    return { content = "# Extracted", mime_type = "text/markdown" }, nil
                end
                deps.artifacts.list_artifacts = function()
                    return {
                        { artifact_id = "a1", label = "primary.md", kind = "text", mime_type = "text/markdown", role = "primary" },
                    }
                end
            end)

            local result = handler.handle({ url = "https://example.com/doc.pdf", wait = true, timeout_seconds = 30 })
            test.eq(result.upload_id, "upload-1")
            test.eq(result.status, "completed")
            test.eq(result.content_type, "text/markdown")
            test.eq(result.markdown, "# Extracted")
            test.eq(result.artifact_count, 1)
            test.eq(#result.artifacts, 1)
            test.eq(result.artifacts[1].artifact_id, "a1")
            -- The loop iterated at least once (processing -> completed).
            test.is_true(calls.sleeps >= 1)
            test.is_true(calls.status_reads >= 2)
        end)

        test.it("wait returns the complete extracted markdown and every derived artifact", function()
            local long_markdown = string.rep("Extracted paragraph line.\n", 1000)
            local artifact_rows = {}
            for i = 1, 45 do
                artifact_rows[i] = { artifact_id = "a" .. i, label = "page" .. i .. "_img.png", kind = "image",
                    mime_type = "image/png", role = "part" }
            end
            base_deps(function(deps)
                deps.http.get = function()
                    return { status_code = 200, headers = { ["content-type"] = "application/pdf" }, body = "%PDF-1.4" }, nil
                end
                deps.read_model.get_for_actor = function()
                    return { status = "completed", mime_type = "text/markdown" }
                end
                deps.artifacts.read_primary_content = function()
                    return { content = long_markdown, mime_type = "text/markdown" }, nil
                end
                deps.artifacts.list_artifacts = function() return artifact_rows end
            end)

            local result = handler.handle({ url = "https://example.com/big.pdf", wait = true })
            test.eq(result.status, "completed")
            test.eq(#result.markdown, #long_markdown)
            test.eq(result.markdown, long_markdown)
            test.eq(result.artifact_count, 45)
            test.eq(#result.artifacts, 45)
            test.eq(result.artifacts[45].artifact_id, "a45")
        end)

        test.it("wait timeout reports stored-but-not-processed truthfully", function()
            local tick = 0
            local calls = base_deps(function(deps)
                deps.http.get = function()
                    return { status_code = 200, headers = { ["content-type"] = "application/pdf" }, body = "%PDF-1.4" }, nil
                end
                deps.now = function()
                    tick = tick + 1
                    return tick
                end
            end)

            local result = handler.handle({ url = "https://example.com/slow.pdf", wait = true, timeout_seconds = 2 })
            test.eq(result.upload_id, "upload-1")
            test.eq(result.status, "processing")
            test.is_false(result.processed)
            test.is_true(result.processing_timed_out)
            test.contains(result.message, "processing did not finish")
            test.is_true(calls.status_reads >= 1)
        end)

        test.it("wait returns a completed upload without markdown when it has no primary text", function()
            base_deps(function(deps)
                deps.http.get = function()
                    return { status_code = 200, headers = { ["content-type"] = "image/png" }, body = "png" }, nil
                end
                deps.read_model.get_for_actor = function() return { status = "completed", mime_type = "image/png" } end
                deps.artifacts.list_artifacts = function()
                    return { { artifact_id = "a1", label = "source.png", kind = "image", mime_type = "image/png", role = "source" } }
                end
            end)

            local result, err = handler.handle({ url = "https://example.com/pic.png", wait = true })
            test.is_nil(err)
            test.eq(result.status, "completed")
            test.is_nil(result.markdown)
            test.eq(result.artifact_count, 1)
        end)

        test.it("wait returns a tool error when the extracted text cannot be read", function()
            base_deps(function(deps)
                deps.http.get = function()
                    return { status_code = 200, headers = { ["content-type"] = "application/pdf" }, body = "%PDF" }, nil
                end
                deps.read_model.get_for_actor = function() return { status = "completed", mime_type = "text/markdown" } end
                deps.artifacts.read_primary_content = function()
                    return nil, errors.new({ kind = errors.INTERNAL, message = "artifact blob is unavailable" })
                end
            end)

            local result, err = handler.handle({ url = "https://example.com/doc.pdf", wait = true })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL))
            test.contains(tostring(err), "artifact blob is unavailable")
        end)

        test.it("wait returns a tool error when the derived artifacts cannot be listed", function()
            base_deps(function(deps)
                deps.http.get = function()
                    return { status_code = 200, headers = { ["content-type"] = "application/pdf" }, body = "%PDF" }, nil
                end
                deps.read_model.get_for_actor = function() return { status = "completed", mime_type = "text/markdown" } end
                deps.artifacts.list_artifacts = function() return nil, "failed to list artifacts: database is unavailable" end
            end)

            local result, err = handler.handle({ url = "https://example.com/doc.pdf", wait = true })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL))
            test.contains(tostring(err), "database is unavailable")
        end)

        test.it("wait returns a tool error when processing fails", function()
            base_deps(function(deps)
                deps.http.get = function()
                    return { status_code = 200, headers = { ["content-type"] = "application/pdf" }, body = "%PDF" }, nil
                end
                deps.read_model.get_for_actor = function()
                    return { status = "error", mime_type = "application/pdf", error = "conversion failed" }
                end
            end)

            local result, err = handler.handle({ url = "https://example.com/bad.pdf", wait = true })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INTERNAL))
            test.contains(tostring(err), "conversion failed")
        end)

        test.it("surfaces a fetch error cleanly", function()
            base_deps(function(deps)
                deps.http.get = function() return nil, "connection refused" end
            end)

            local result, err = handler.handle({ url = "https://example.com/x.bin" })
            test.is_nil(result)
            test.not_nil(err)
            test.contains(tostring(err), "fetch failed")
        end)

        test.it("rejects an unsafe URL before any network call", function()
            local calls = base_deps()
            local result, err = handler.handle({ url = "http://localhost/secret" })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(calls.get, 0)
            test.eq(calls.head, 0)
        end)

        test.it("requires a url", function()
            base_deps()
            local result, err = handler.handle({})
            test.is_nil(result)
            test.contains(tostring(err), "url is required")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
