local test = require("test")
local dxf2md = require("dxf2md")
local fixtures = require("fixtures")

local function is_png(blob)
    return type(blob) == "string"
        and #blob > 8
        and blob:byte(1) == 0x89
        and blob:byte(2) == 0x50
        and blob:byte(3) == 0x4E
        and blob:byte(4) == 0x47
end

local function open_ok(blob)
    local handle, err = dxf2md.open({ bytes = blob })
    test.is_nil(err)
    if handle == nil then
        error("expected a drawing handle")
    end
    return handle
end

local function expect_error(value: any, err: any?): any
    test.is_nil(value)
    if err == nil then
        error("expected an error")
    end
    return err
end

local function fake(call_impl)
    return dxf2md.new({
        funcs = { call = call_impl },
        http_client = { get = function() return nil, "http_client must not be used in this test" end },
    })
end

local function define()
    test.describe("dxf2md.convert", function()
        test.it("returns a handle exposing to_markdown, metadata and to_image", function()
            local handle = open_ok(fixtures.dxf)
            test.eq(type(handle.to_markdown), "function")
            test.eq(type(handle.metadata), "function")
            test.eq(type(handle.to_image), "function")
        end)

        test.it("converts a DXF drawing to Markdown", function()
            local handle = open_ok(fixtures.dxf)
            local md, err = handle.to_markdown()
            test.is_nil(err)
            if md == nil then
                error("expected markdown")
            end
            test.eq(md:find("# CAD Drawing", 1, true) ~= nil, true)
            test.eq(md:find("DRAWING NO 12345", 1, true) ~= nil, true)
        end)

        test.it("renders a DXF drawing to a PNG", function()
            local handle = open_ok(fixtures.dxf)
            local png, err = handle.to_image()
            test.is_nil(err)
            if png == nil then
                error("expected PNG bytes")
            end
            test.eq(is_png(png), true)
            test.eq(#png > 100, true)
        end)

        test.it("honours an explicit DPI", function()
            local handle = open_ok(fixtures.dxf)
            local low = handle.to_image(48)
            local high = handle.to_image(192)
            if low == nil or high == nil then
                error("expected PNG bytes")
            end
            test.eq(is_png(low), true)
            test.eq(#high > #low, true)
        end)

        test.it("renders at an explicit width and height", function()
            local handle = open_ok(fixtures.dxf)
            local png, err = handle.to_image({ width = 640, height = 480 })
            test.is_nil(err)
            if png == nil then
                error("expected PNG bytes")
            end
            test.eq(is_png(png), true)
        end)

        test.it("renders at a single dimension keeping aspect", function()
            local handle = open_ok(fixtures.dxf)
            local png, err = handle.to_image({ width = 512 })
            test.is_nil(err)
            test.eq(is_png(png), true)
        end)

        test.it("rejects a non-integer width", function()
            local handle = open_ok(fixtures.dxf)
            local err = expect_error(handle.to_image({ width = 12.5 }))
            test.eq(err.kind, "invalid_input")
            test.contains(tostring(err), "width must be a positive integer")
        end)

        test.it("rejects a width above the maximum", function()
            local handle = open_ok(fixtures.dxf)
            local err = expect_error(handle.to_image({ height = 99999 }))
            test.eq(err.kind, "invalid_input")
            test.contains(tostring(err), "height must be a positive integer")
        end)

        test.it("exposes structured metadata", function()
            local handle = open_ok(fixtures.dxf)
            local meta, err = handle.metadata()
            test.is_nil(err)
            if meta == nil then
                error("expected metadata table")
            end
            test.eq(type(meta.version), "string")
            test.eq(type(meta.layers), "table")
            test.eq(type(meta.entities), "table")
        end)

        test.it("reports a decode error from metadata on a non-DXF blob", function()
            local handle = open_ok(fixtures.garbage)
            local err = expect_error(handle.metadata())
            test.eq(err.kind, "decode_failed")
        end)

        test.it("rejects a non-positive dpi", function()
            local handle = open_ok(fixtures.dxf)
            local err = expect_error(handle.to_image(0))
            test.eq(err.kind, "invalid_input")
            test.contains(tostring(err), "dpi must be a positive")
        end)

        test.it("rejects a dpi above the maximum", function()
            local handle = open_ok(fixtures.dxf)
            local err = expect_error(handle.to_image(5000))
            test.eq(err.kind, "invalid_input")
            test.contains(tostring(err), "dpi must be a positive")
        end)

        test.it("rejects a non-number dpi", function()
            local handle = open_ok(fixtures.dxf)
            local err = expect_error(handle.to_image("96"))
            test.eq(err.kind, "invalid_input")
            test.contains(tostring(err), "dpi must be a positive")
        end)

        test.it("rejects a non-DXF blob with a decode error", function()
            local handle = open_ok(fixtures.garbage)
            local err = expect_error(handle.to_markdown())
            test.eq(err.kind, "decode_failed")
        end)

        test.it("rejects empty bytes at open", function()
            local err = expect_error(dxf2md.open({ bytes = "" }))
            test.eq(err.kind, "invalid_input")
            test.contains(tostring(err), "non-empty binary string")
        end)

        test.it("rejects a non-table request", function()
            local err = expect_error(dxf2md.open("not a table"))
            test.eq(err.kind, "invalid_input")
            test.contains(tostring(err), "request must be a table")
        end)

        test.it("rejects a request with neither source", function()
            local err = expect_error(dxf2md.open({}))
            test.eq(err.kind, "invalid_input")
            test.contains(tostring(err), "exactly one source")
        end)

        test.it("rejects a request with both sources", function()
            local err = expect_error(dxf2md.open({ bytes = fixtures.dxf, url = "https://example.com/x.dxf" }))
            test.eq(err.kind, "invalid_input")
            test.contains(tostring(err), "exactly one source")
        end)

        test.it("rejects a non-http url scheme", function()
            local err = expect_error(dxf2md.open({ url = "ftp://example.com/x.dxf" }))
            test.eq(err.kind, "invalid_input")
            test.contains(tostring(err), "http(s) URL")
        end)

        test.it("rejects an oversized bytes source", function()
            local oversized = string.rep("A", (128 * 1024 * 1024) + 1)
            local err = expect_error(dxf2md.open({ bytes = oversized }))
            test.eq(err.kind, "invalid_input")
            test.contains(tostring(err), "exceeds")
        end)

        test.it("surfaces an internal error when the markdown component returns no result", function()
            local handle = fake(function() return nil, nil end).open({ bytes = fixtures.dxf })
            local err = expect_error(handle.to_markdown())
            test.eq(err.kind, "internal")
            test.contains(tostring(err), "no result")
        end)

        test.it("surfaces an internal error when funcs.call fails", function()
            local handle = fake(function() return nil, "host exploded" end).open({ bytes = fixtures.dxf })
            local err = expect_error(handle.to_image())
            test.eq(err.kind, "internal")
            test.contains(tostring(err), "host exploded")
        end)

        test.it("passes through a component decode error", function()
            local handle = fake(function() return { err = { message = "bad dxf" } }, nil end).open({ bytes = fixtures.dxf })
            local err = expect_error(handle.to_markdown())
            test.eq(err.kind, "decode_failed")
            test.contains(tostring(err), "bad dxf")
        end)

        test.it("passes through a component render error", function()
            local handle = fake(function() return { err = { message = "render boom" } }, nil end).open({ bytes = fixtures.dxf })
            local err = expect_error(handle.to_image())
            test.eq(err.kind, "render_failed")
            test.contains(tostring(err), "render boom")
        end)

        test.it("returns the raw render bytes unchanged", function()
            local handle = fake(function() return { ok = "\137PNG raw" }, nil end).open({ bytes = fixtures.dxf })
            local png, err = handle.to_image()
            test.is_nil(err)
            test.eq(png, "\137PNG raw")
        end)

        test.it("exposes a tostring-able structured error", function()
            local err = expect_error(dxf2md.open({}))
            test.eq(type(err), "table")
            test.eq(type(err.message), "string")
            test.eq(type(err.kind), "string")
            test.eq(("got: " .. err):find("kickside.convert.dxf2md:") ~= nil, true)
        end)

        test.it("exposes max_input_bytes through limits", function()
            test.eq(type(dxf2md.limits), "table")
            test.eq(type(dxf2md.limits.max_input_bytes), "number")
            test.eq(dxf2md.limits.max_input_bytes > 0, true)
        end)
    end)
end

local run_cases = test.run_cases(define)

local function run(options)
    return run_cases(options)
end

return { run = run }
