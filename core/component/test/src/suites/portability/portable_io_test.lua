local test = require("test")
local pio = require("portable_io")
local fs = require("fs")
local uuid = require("uuid")
local function define_tests()
    test.describe("portable I/O errors", function()
        test.it("refuses malformed or scalar streamed rows instead of completing a partial import", function()
            local storage, storage_err = fs.get("app.component_suites.portability:parts")
            test.is_nil(storage_err)
            for _, bytes in ipairs({ '{"version":1}\ninvalid\n', '{"version":1}\n42', 'null\n' }) do
                local path = uuid.v7() .. ".jsonl"
                local _, write_err = storage:writefile(path, bytes)
                test.is_nil(write_err)
                local imported = {}
                local ok, scan_err = pio.scan_jsonl(storage, path, function(row)
                    imported[#imported + 1] = row.version
                    return true, nil
                end)
                local _, remove_err = storage:remove(path)
                test.is_nil(remove_err)
                test.is_nil(ok)
                test.not_nil(scan_err)
                test.contains(tostring(scan_err), path)
                test.eq(#imported, bytes == 'null\n' and 0 or 1)
            end
        end)
        test.it("streams long rows and blank lines and accepts an absent optional part", function()
            local storage, storage_err = fs.get("app.component_suites.portability:parts")
            test.is_nil(storage_err)
            local path = uuid.v7() .. ".jsonl"
            local payload = string.rep("x", 524288)
            local _, write_err = storage:writefile(path, '\n{"payload":"' .. payload .. '"}\n \n{"payload":"tail"}')
            test.is_nil(write_err)
            local imported = {}
            local ok, scan_err = pio.scan_jsonl(storage, path, function(row)
                imported[#imported + 1] = row.payload
            end)
            local _, remove_err = storage:remove(path)
            test.is_nil(remove_err)
            test.is_nil(scan_err)
            test.is_true(ok)
            test.eq(#imported, 2)
            test.eq(imported[1], payload)
            test.eq(imported[2], "tail")
            local absent, absent_err = pio.scan_jsonl(storage, path, function() error("absent part invokes importer") end)
            test.is_true(absent)
            test.is_nil(absent_err)
        end)
        test.it("returns open, read, callback and close failures and closes an opened part", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "part unavailable" })
            local ok, open_err = pio.scan_jsonl({ open = function() return nil, failure end }, "part", function() end)
            test.is_nil(ok)
            test.eq(open_err, failure)
            for _, failing_step in ipairs({ "read", "callback", "close" }) do
                local closed, reads = 0, 0
                local handle = {
                    read = function()
                        reads = reads + 1
                        if failing_step == "read" then return nil, failure end
                        return reads == 1 and '{"version":1}\n' or nil, nil
                    end,
                    close = function()
                        closed = closed + 1
                        return nil, failing_step == "close" and failure or nil
                    end,
                }
                local completed, scan_err = pio.scan_jsonl({ open = function() return handle, nil end }, "part", function()
                    return nil, failing_step == "callback" and failure or nil
                end)
                test.is_nil(completed)
                test.eq(scan_err, failure)
                test.eq(closed, 1)
            end
        end)
        test.it("returns a directory error before writing", function()
            local writes = 0
            local storage = {
                exists = function() return false end,
                mkdir = function() return nil, "permission denied" end,
                writefile = function() writes = writes + 1; return true end,
            }
            local ok, err = pio.write_jsonl(storage, "envelope/data/versions.jsonl", {{version = 1}})
            test.is_nil(ok)
            test.not_nil(err)
            test.eq(writes, 0)
        end)
        test.it("returns the read error for an unavailable part", function()
            local rows, err = pio.read_jsonl({readfile = function() return nil, "read denied" end}, "versions.jsonl")
            test.is_nil(rows)
            test.not_nil(err)
        end)
        test.it("rejects malformed JSON rather than importing partial history", function()
            local rows, err = pio.read_jsonl({readfile = function() return '{"version":1}\ninvalid\n' end}, "versions.jsonl")
            test.is_nil(rows)
            test.not_nil(err)
        end)
        test.it("rejects scalar rows and accepts blank lines", function()
            local rows, err = pio.read_jsonl({readfile = function() return '42\n' end}, "versions.jsonl")
            test.is_nil(rows)
            test.not_nil(err)
            local valid, valid_err = pio.read_jsonl({readfile = function() return '\n{"version":1}\n\n' end}, "versions.jsonl")
            test.is_nil(valid_err)
            test.eq(#valid, 1)
            test.eq(valid[1].version, 1)
        end)
    end)
end
return {run = test.run_cases(define_tests)}
