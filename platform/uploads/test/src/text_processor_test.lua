local test = require("test")
local uuid_v4 = require("uuid").v4
local fs = require("fs")
local processor = require("processor")
local upload_record_repo = require("upload_record_repo")
local process_job = require("process_job")

local STORAGE_ID = "app:uploads"

local function write_file(path: string, bytes: string): ()
    local storage = fs.get(STORAGE_ID)
    if not storage then error("fixture storage unavailable") end
    local ok, err = storage:writefile(path, bytes)
    if ok == false or err then error("writefile failed: " .. tostring(err)) end
end

-- Seed an upload row + its stored bytes, then run the text processor over it.
local function process_upload(mime_type: string, filename: string, bytes: string, size_override: any?): any
    local upload_id = uuid_v4()
    local path = upload_id .. "-" .. filename
    write_file(path, bytes)
    local size = size_override ~= nil and size_override or #bytes
    local _, upload_err = upload_record_repo.create(
        upload_id, "user-text", size, mime_type,
        STORAGE_ID, path, "text", { filename = filename }, "processing"
    )
    test.is_nil(upload_err)
    return processor.process({
        upload_id = upload_id,
        mime_type = mime_type,
        storage_id = STORAGE_ID,
        storage_path = path,
        size = size,
        metadata = { filename = filename },
    })
end

local function big_csv(rows: integer): string
    local parts: { string } = { "id,name,score\n" }
    for i = 1, rows do
        parts[#parts + 1] = tostring(i) .. ",row-" .. tostring(i) .. "-name-padding-value," .. tostring(i * 3) .. "\n"
    end
    return table.concat(parts)
end

local function run(options: any): any
    return test.run_cases(function()
        test.describe("text processor tabular detection", function()
            test.it("recognizes csv/tsv by mime and by extension", function()
                test.is_true(processor.is_tabular("text/csv", "a.txt", "p"))
                test.is_true(processor.is_tabular("text/plain", "data.csv", "p"))
                test.is_true(processor.is_tabular("text/plain", nil, "export.tsv"))
                test.is_false(processor.is_tabular("text/plain", "notes.txt", "notes.txt"))
                test.is_false(processor.is_tabular("application/json", "a.json", "a.json"))
            end)
        end)

        test.describe("text processor size handling", function()
            test.it("fails an oversized non-tabular file permanently (non-retriable), not as a retry loop", function()
                -- The stored bytes are tiny; size claims 12 MB so the cap trips before any
                -- in-memory read. The failure must be classified non-retriable.
                local result = process_upload("text/plain", "huge.txt", "x", 12 * 1024 * 1024)
                test.not_nil(result)
                test.is_false(result.success)
                test.eq(false, result.retriable)
                test.is_true(string.find(tostring(result.error), "too large", 1, true) ~= nil,
                    "error names the size: " .. tostring(result.error))
            end)

            test.it("does not cap a large tabular file: bounded preview + streamed shape, success", function()
                -- ~150 KB CSV, well past the 64 KB preview window, so the preview is
                -- truncated while the streamed row count stays exact and no cap fires.
                local csv = big_csv(5000)
                test.is_true(#csv > 64 * 1024, "fixture exceeds the preview window")
                local result = process_upload("text/csv", "big.csv", csv)
                test.not_nil(result)
                test.is_true(result.success, "large csv processes: " .. tostring(result.error))
                test.eq(true, result.metadata.tabular)
                test.eq("comma", result.metadata.delimiter)
                test.eq(3, result.metadata.column_count)
                test.eq(5000, result.metadata.row_count)
                test.eq(true, result.metadata.row_count_exact)
                test.eq(true, result.metadata.preview_truncated)
            end)
        end)

        test.describe("text processor shape metadata", function()
            test.it("extracts delimiter, columns, and exact row count from a small csv", function()
                local result = process_upload("text/csv", "small.csv", "a,b,c\n1,2,3\n4,5,6\n7,8,9\n")
                test.is_true(result.success, tostring(result.error))
                test.eq("comma", result.metadata.delimiter)
                test.eq(3, result.metadata.column_count)
                test.eq(3, result.metadata.row_count)
                test.eq(false, result.metadata.preview_truncated)
            end)

            test.it("detects tab as the delimiter for a tsv", function()
                local result = process_upload("text/plain", "grid.tsv", "x\ty\n1\t2\n3\t4\n")
                test.is_true(result.success, tostring(result.error))
                test.eq("tab", result.metadata.delimiter)
                test.eq(2, result.metadata.column_count)
                test.eq(2, result.metadata.row_count)
            end)

            test.it("counts a final row that has no trailing newline", function()
                local result = process_upload("text/csv", "notrail.csv", "a,b\n1,2\n3,4")
                test.is_true(result.success, tostring(result.error))
                test.eq(2, result.metadata.row_count)
            end)
        end)

        test.describe("upload job failure classification", function()
            test.it("process entry transports a native error for a rejected job input", function()
                local output = process_job.main({payload = {}})
                test.is_false(output.ok)
                test.eq(output.error_native.kind, errors.INTERNAL)
                test.eq(output.error_native.message, "missing upload_id")
            end)

            -- A non-retriable failure finalizes on the first attempt; a retriable one waits
            -- for the retry budget. This is the seam that stops the permanent-failure loop.
            test.it("terminalizes a non-retriable failure immediately", function()
                local first = { id = "j1", attempt_no = 1, max_attempts = 5 }
                test.is_true(process_job.terminal_failure(first, false))
            end)

            test.it("retries a retriable failure until the budget is exhausted", function()
                local first = { id = "j2", attempt_no = 1, max_attempts = 5 }
                test.is_false(process_job.terminal_failure(first, true))
                test.is_false(process_job.terminal_failure(first, nil))
                local last = { id = "j2", attempt_no = 5, max_attempts = 5 }
                test.is_true(process_job.terminal_failure(last, true))
            end)
        end)
    end)(options)
end

return { run = run }
