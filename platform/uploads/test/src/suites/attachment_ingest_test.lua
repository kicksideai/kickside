-- Tests for the pure should_ingest guard. The download+upload orchestration is
-- side-effectful (http + upload pipeline) and covered by integration, not here.

local test = require("test")

local function define_tests()
    test.describe("attachment_ingest.should_ingest", function()
        local ai = require("attachment_ingest")

        local function att(over)
            local a = { url = "https://cdn/x.pdf", actor_id = "u1", size = 100 }
            for k, v in pairs(over or {}) do a[k] = v end
            return a
        end

        test.it("accepts a well-formed attachment", function()
            local ok = ai.should_ingest(att(), ai.MAX_BYTES)
            test.eq(ok, true)
        end)

        test.it("accepts normalized provider refs", function()
            local ok = ai.should_ingest({
                ref = "https://cdn/x.png",
                actor_id = "u1",
                size = 100,
                mime = "image/png",
            }, ai.MAX_BYTES)
            test.eq(ok, true)
        end)

        test.it("rejects a missing url", function()
            local ok, reason = ai.should_ingest(att({ url = "" }), ai.MAX_BYTES)
            test.eq(ok, false)
            test.eq(reason, "no url")
        end)

        test.it("rejects a missing actor (would orphan the upload)", function()
            local ok, reason = ai.should_ingest(att({ actor_id = "" }), ai.MAX_BYTES)
            test.eq(ok, false)
            test.eq(reason, "no actor")
        end)

        test.it("rejects an oversize attachment", function()
            local ok, reason = ai.should_ingest(att({ size = ai.MAX_BYTES + 1 }), ai.MAX_BYTES)
            test.eq(ok, false)
            test.eq(reason, "too large")
        end)

        test.it("rejects an invalid content type", function()
            local ok, reason = ai.should_ingest(att({ content_type = 42 }), ai.MAX_BYTES)
            test.eq(ok, false)
            test.eq(reason, "invalid content type")
        end)

        test.it("rejects an invalid normalized mime", function()
            local ok, reason = ai.should_ingest(att({ mime = 42 }), ai.MAX_BYTES)
            test.eq(ok, false)
            test.eq(reason, "invalid content type")
        end)

        test.it("rejects a non-table", function()
            local ok = ai.should_ingest(nil, ai.MAX_BYTES)
            test.eq(ok, false)
        end)
    end)

    test.describe("attachment_ingest.ingest through a declared fetcher", function()
        local ai = require("attachment_ingest")
        local original_deps = ai.deps
        test.after_each(function() ai.deps = original_deps end)

        local function deps(overrides)
            local calls = { fetched = {}, http_gets = 0, uploaded = 0 }
            local base = {
                registry = { find = function()
                    return { { data = { provider = "telegram", fetch_func = "provider:fetch" } } }, nil
                end },
                funcs = { call = function(id, payload)
                    calls.fetched[#calls.fetched + 1] = { id = id, payload = payload }
                    return { bytes = "OggS-bytes" }, nil
                end },
                http = { get = function()
                    calls.http_gets = calls.http_gets + 1
                    return { status_code = 200, body = "from-url" }, nil
                end },
                uploads = { upload_file = function(_actor, bytes)
                    calls.uploaded = calls.uploaded + 1
                    return { uuid = "upload-1", size = #bytes }
                end },
            }
            for key, value in pairs(overrides or {}) do base[key] = value end
            return base, calls
        end

        local function with_deps(set, body)
            local saved = ai.deps
            ai.deps = set
            body()
            ai.deps = saved
        end

        local function telegram_attachment(over)
            local a = {
                ref = "AgACAgIAAxkBAAI", actor_id = "u1", source = "telegram",
                component_id = "telegram-conn-1", mime = "audio/ogg",
            }
            for k, v in pairs(over or {}) do a[k] = v end
            return a
        end

        test.it("selects the provider declaration and forwards only the trusted routing fields", function()
            local set, calls = deps()
            with_deps(set, function()
                local upload, err = ai.ingest(telegram_attachment({ fetch = "attacker:anything" }))
                test.is_nil(err)
                test.eq(upload.uuid, "upload-1")
                test.eq(calls.http_gets, 0)
                test.eq(#calls.fetched, 1)
                test.eq(calls.fetched[1].id, "provider:fetch")
                test.eq(calls.fetched[1].payload.ref, "AgACAgIAAxkBAAI")
                test.eq(calls.fetched[1].payload.component_id, "telegram-conn-1")
                test.is_nil(calls.fetched[1].payload.fetch)
            end)
        end)

        test.it("passes dispatch failures through without downloading or storing attachment bytes", function()
            local set, calls = deps({ funcs = { call = function()
                return nil, "provider authority denied"
            end } })
            with_deps(set, function()
                local upload, err = ai.ingest(telegram_attachment({ fetch = "sender:chosen" }))
                test.is_nil(upload)
                test.eq(err, "fetch failed: provider authority denied")
                test.eq(calls.http_gets, 0)
                test.eq(calls.uploaded, 0)
            end)
        end)

        test.it("uses URL download only after a successful lookup finds no provider declaration", function()
            local set, calls = deps({ registry = { find = function() return {}, nil end } })
            with_deps(set, function()
                local upload = ai.ingest(telegram_attachment({ url = "https://cdn/x.oga" }))
                test.eq(upload.uuid, "upload-1")
                test.eq(#calls.fetched, 0)
                test.eq(calls.http_gets, 1)
            end)
        end)

        test.it("fails closed when fetcher discovery fails or is ambiguous", function()
            local set, calls = deps({ registry = { find = function() return nil, "registry denied" end } })
            with_deps(set, function()
                local upload, err = ai.ingest(telegram_attachment({ url = "https://attacker.invalid/x" }))
                test.is_nil(upload)
                test.contains(err, "registry unavailable")
                test.eq(calls.http_gets, 0)
            end)

            set, calls = deps({ registry = { find = function() return {
                { data = { provider = "telegram", fetch_func = "provider:one" } },
                { data = { provider = "telegram", fetch_func = "provider:two" } },
            }, nil end } })
            with_deps(set, function()
                local upload, err = ai.ingest(telegram_attachment())
                test.is_nil(upload)
                test.contains(err, "multiple attachment fetchers")
                test.eq(#calls.fetched, 0)
                test.eq(calls.http_gets, 0)
            end)
        end)

        test.it("reports provider failure and rejects empty or oversized fetched bytes", function()
            local set = deps({ funcs = { call = function() return { error = "file expired" }, nil end } })
            with_deps(set, function()
                local upload, err = ai.ingest(telegram_attachment())
                test.is_nil(upload)
                test.eq(err, "fetch failed: file expired")
            end)

            set = deps({ funcs = { call = function() return { bytes = "" }, nil end } })
            with_deps(set, function()
                local upload, err = ai.ingest(telegram_attachment())
                test.is_nil(upload)
                test.eq(err, "fetch returned no bytes")
            end)

            set = deps({ funcs = { call = function() return { bytes = string.rep("x", ai.MAX_BYTES + 1) }, nil end } })
            with_deps(set, function()
                local upload, err = ai.ingest(telegram_attachment())
                test.is_nil(upload)
                test.eq(err, "too large")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
