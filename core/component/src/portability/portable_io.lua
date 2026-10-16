-- I/O companion to base_portable (which is pure domain). Shared filesystem plumbing
-- for the data-bearing kickside.contract:portable adapters: JSONL encode/decode over
-- the envelope's data/*.jsonl files, and parent-directory creation (writefile does not
-- create parents). The adapters own WHICH tables and columns move; this owns the
-- generic file plumbing so every adapter does it identically.

local json = require("json")
local errors = require("errors")
local error_envelope = require("error_envelope")

local M = {}

-- mkdir each ancestor segment of a directory path (per-level; some fs backends do not
-- create intermediate dirs). Idempotent — re-creating an existing dir is a no-op.
function M.ensure_dir(storage, dir)
    local acc = ""
    for seg in string.gmatch(dir, "[^/]+") do
        acc = (acc == "") and seg or (acc .. "/" .. seg)
        local ok, err = storage:mkdir(acc)
        if err and errors.is(err, errors.ALREADY_EXISTS) then
            local is_dir, dir_err = storage:isdir(acc)
            if dir_err or not is_dir then return nil, dir_err or errors.new({kind = errors.INVALID, message = "not a directory: " .. acc}) end
        elseif err or not ok then
            return nil, errors.wrap(err or errors.new({kind = errors.INTERNAL, message = "directory creation fails"}), "create " .. acc)
        end
    end
    return true, nil
end

function M.ensure_parent(storage, file_path)
    local dir = string.match(file_path, "^(.*)/[^/]*$")
    if dir and dir ~= "" then return M.ensure_dir(storage, dir) end
    return true, nil
end

function M.write_jsonl(storage, path, rows)
    local ok, parent_err = M.ensure_parent(storage, path)
    if parent_err or not ok then return nil, parent_err end
    local lines = {}
    for _, r in ipairs(rows or {}) do
        local line, encode_err = json.encode(r)
        if encode_err or not line then return nil, encode_err or errors.new({kind = errors.INVALID, message = "JSON encoding fails"}) end
        lines[#lines + 1] = line
    end
    return storage:writefile(path, table.concat(lines, "\n"))
end

local function decode_row(line, path, line_number)
    if not line:match("%S") then return nil, nil end
    local row, decode_err = json.decode(line)
    if decode_err or type(row) ~= "table" then
        return nil, errors.new({kind = errors.INVALID, retryable = false,
            message = path .. ":" .. tostring(line_number) .. ": " .. tostring(decode_err or "expected a JSON object"),
            details = decode_err and {cause = error_envelope.encode(decode_err)} or nil})
    end
    return row, nil
end

function M.read_jsonl(storage, path)
    local content, read_err = storage:readfile(path)
    if read_err or type(content) ~= "string" then
        return nil, read_err or errors.new({kind = errors.INTERNAL, message = "read " .. path .. ": expected bytes"})
    end
    local rows = {}
    local line_number = 0
    for line in (content .. "\n"):gmatch("([^\n]*)\n") do
        line_number = line_number + 1
        local row, decode_err = decode_row(line, path, line_number)
        if decode_err then return nil, decode_err end
        if row then rows[#rows + 1] = row end
    end
    return rows, nil
end

-- Stream JSONL at path line-by-line, decoding each row and handing it to fn(row).
-- Reads in 256KB chunks and splits on newlines manually (the handle's line-scanner
-- caps line length, and a single node row can be multiple MB). Chunks accumulate in a
-- list and are joined only when a newline arrives, so a long line costs one O(n) join,
-- never O(n^2) concatenation; memory is bounded by the largest single line, never the
-- file. A missing/empty part is zero rows; malformed rows and I/O or importer
-- failures return (nil, err). Every opened handle closes before returning.
function M.scan_jsonl(storage, path, fn)
    local f, open_err = storage:open(path, "r")
    if open_err and errors.is(open_err, errors.NOT_FOUND) then return true, nil end
    if open_err or not f then
        return nil, open_err or errors.new({kind = errors.INTERNAL, message = "open " .. path .. ": no handle"})
    end
    local parts, line_number = {}, 0
    local function emit(line)
        line_number = line_number + 1
        local row, decode_err = decode_row(line, path, line_number)
        if decode_err then return decode_err end
        if row then
            local _, import_err = fn(row)
            if import_err then return import_err end
        end
        return nil
    end
    local function emit_complete_lines()
        local s = table.concat(parts)
        parts = {}
        local start = 1
        while true do
            local nl = string.find(s, "\n", start, true)
            if not nl then break end
            local emit_err = emit(string.sub(s, start, nl - 1))
            if emit_err then return emit_err end
            start = nl + 1
        end
        local rem = string.sub(s, start)
        if rem ~= "" then parts[1] = rem end
        return nil
    end
    local scan_err = nil
    while true do
        local chunk, read_err = f:read(262144)
        if read_err and errors.is(read_err, errors.NOT_FOUND) then break end
        if read_err then scan_err = read_err; break end
        if chunk == nil or chunk == "" then break end
        if type(chunk) ~= "string" then
            scan_err = errors.new({kind = errors.INTERNAL, message = "read " .. path .. ": expected bytes"})
            break
        end
        parts[#parts + 1] = chunk
        if string.find(chunk, "\n", 1, true) then
            scan_err = emit_complete_lines()
            if scan_err then break end
        end
    end
    if not scan_err and #parts > 0 then scan_err = emit(table.concat(parts)) end
    local _, close_err = f:close()
    if scan_err and close_err then
        return nil, error_envelope.wrap_secondary(close_err, scan_err, "close " .. path)
    end
    if scan_err or close_err then return nil, scan_err or close_err end
    return true, nil
end

return M
