-- Round-trip tests for the zip reader: build small archives in memory (stored and
-- deflated, using the same native codec the reader inflates with) and assert that
-- list + extract recover the original entries and bytes.

local test = require("test")
local compress = require("compress")

local function p16(n: number): string
    return string.char(math.floor(n % 256), math.floor(n / 256) % 256)
end

local function p32(n: number): string
    return string.char(math.floor(n % 256), math.floor(n / 256) % 256, math.floor(n / 65536) % 256, math.floor(n / 16777216) % 256)
end

-- Build a minimal zip from { {name, data, method} } where method is 0 (store) or 8
-- (deflate). CRC fields are left zero -- the reader does not verify CRC.
local function build_zip(files: any): string
    local locals = {}
    local centrals = {}
    local offset = 0
    for _, f in ipairs(files) do
        local raw = f.data
        local method = f.method or 0
        local payload = raw
        if method == 8 then
            local enc, err = compress.deflate.encode(raw :: string)
            if err then error("deflate encode failed: " .. tostring(err)) end
            payload = enc
        end
        local fn = f.name
        local lfh = p32(0x04034b50) .. p16(20) .. p16(0) .. p16(method) .. p16(0) .. p16(0)
            .. p32(0) .. p32(#payload) .. p32(#raw) .. p16(#fn) .. p16(0) .. fn .. payload
        local cdh = p32(0x02014b50) .. p16(20) .. p16(20) .. p16(0) .. p16(method) .. p16(0) .. p16(0)
            .. p32(0) .. p32(#payload) .. p32(#raw) .. p16(#fn) .. p16(0) .. p16(0) .. p16(0) .. p16(0)
            .. p32(0) .. p32(offset) .. fn
        locals[#locals + 1] = lfh
        centrals[#centrals + 1] = cdh
        offset = offset + #lfh
    end
    local local_blob = table.concat(locals)
    local central_blob = table.concat(centrals)
    local eocd = p32(0x06054b50) .. p16(0) .. p16(0) .. p16(#files) .. p16(#files)
        .. p32(#central_blob) .. p32(#local_blob) .. p16(0)
    return local_blob .. central_blob .. eocd
end

local function define_tests()
    test.describe("zip_reader", function()
        local zip_reader = require("zip_reader")

        test.it("lists and extracts a stored entry", function()
            local body = "Hello, transparent zip support!"
            local zip = build_zip({ { name = "hello.txt", data = body, method = 0 } })
            local entries, err = zip_reader.list(zip)
            test.eq(err, nil)
            test.eq(#entries, 1)
            test.eq(entries[1].name, "hello.txt")
            test.eq(entries[1].method, 0)
            test.eq(entries[1].is_dir, false)
            local out, ex_err = zip_reader.extract(zip, entries[1])
            test.eq(ex_err, nil)
            test.eq(out, body)
        end)

        test.it("inflates a deflated entry", function()
            local body = string.rep("survey row,value\n", 500)
            local zip = build_zip({ { name = "data.csv", data = body, method = 8 } })
            local entries = zip_reader.list(zip)
            test.eq(#entries, 1)
            test.eq(entries[1].method, 8)
            local out, ex_err = zip_reader.extract(zip, entries[1])
            test.eq(ex_err, nil)
            test.eq(out, body)
        end)

        test.it("handles multiple entries with nested paths", function()
            local zip = build_zip({
                { name = "a.txt", data = "alpha", method = 0 },
                { name = "sub/b.txt", data = "bravo", method = 8 },
            })
            local entries = zip_reader.list(zip)
            test.eq(#entries, 2)
            test.eq(zip_reader.extract(zip, entries[1]), "alpha")
            test.eq(entries[2].name, "sub/b.txt")
            test.eq(zip_reader.extract(zip, entries[2]), "bravo")
        end)

        test.it("flags directory entries", function()
            local zip = build_zip({ { name = "folder/", data = "", method = 0 } })
            local entries = zip_reader.list(zip)
            test.eq(entries[1].is_dir, true)
        end)

        test.it("rejects non-zip input", function()
            local entries, err = zip_reader.list("not a zip at all")
            test.eq(entries, nil)
            test.eq(type(err), "string")
        end)

        test.it("rejects empty input", function()
            local entries, err = zip_reader.list("")
            test.eq(entries, nil)
            test.eq(type(err), "string")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
