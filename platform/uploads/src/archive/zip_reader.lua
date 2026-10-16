-- Minimal ZIP container reader over the native compress.deflate codec. Lists
-- central-directory entries and extracts a single member's bytes; the runtime has
-- no native zip container parser, only the DEFLATE algorithm, so the container
-- framing is parsed here and the payload handed to compress.deflate.decode.
--
-- Supports stored (method 0) and deflated (method 8) entries. Encrypted entries
-- and ZIP64 archives are reported as errors rather than mis-read.

local compress = require("compress")

local zip_reader = {}

local SIG_EOCD = 0x06054b50   -- end of central directory record
local SIG_CDH = 0x02014b50    -- central directory file header
local SIG_LFH = 0x04034b50    -- local file header
local U16_MAX = 0xFFFF
local U32_MAX = 0xFFFFFFFF
local MAX_EOCD_COMMENT = 65535
local DEFAULT_MAX_ENTRY_SIZE = 256 * 1024 * 1024

-- Little-endian readers. p is a 1-based byte offset into s.
local function u16(s: string, p: integer): integer
    local a = string.byte(s, p)
    local b = string.byte(s, p + 1)
    if not a or not b then return -1 end
    return a + b * 256
end

local function u32(s: string, p: integer): integer
    local a = string.byte(s, p)
    local b = string.byte(s, p + 1)
    local c = string.byte(s, p + 2)
    local d = string.byte(s, p + 3)
    if not a or not b or not c or not d then return -1 end
    return a + b * 256 + c * 65536 + d * 16777216
end

-- Locate the End Of Central Directory record by scanning backward from the end;
-- the record is last but may be followed by a comment up to 65535 bytes.
local function find_eocd(bytes: string): integer?
    local n = #bytes
    if n < 22 then return nil end
    local lowest = n - 22 - MAX_EOCD_COMMENT + 1
    if lowest < 1 then lowest = 1 end
    for p = n - 22 + 1, lowest, -1 do
        if u32(bytes, p) == SIG_EOCD then return p end
    end
    return nil
end

-- list returns the archive's member entries (raw, unsanitized names) or nil + err.
-- Each entry: { name, method, comp_size, uncomp_size, local_offset, encrypted, is_dir }.
function zip_reader.list(bytes: any): (any, string?)
    if type(bytes) ~= "string" or bytes == "" then
        return nil, "empty input"
    end

    local eocd = find_eocd(bytes)
    if not eocd then return nil, "not a zip archive (no end-of-central-directory record)" end

    local count = u16(bytes, eocd + 10)
    local cd_offset = u32(bytes, eocd + 16)
    if count == U16_MAX or cd_offset == U32_MAX then
        return nil, "zip64 archives are not supported"
    end

    local entries = {}
    local p = cd_offset + 1
    for _ = 1, count do
        if u32(bytes, p) ~= SIG_CDH then
            return nil, "corrupt central directory header"
        end
        local flag = u16(bytes, p + 8)
        local method = u16(bytes, p + 10)
        local comp_size = u32(bytes, p + 20)
        local uncomp_size = u32(bytes, p + 24)
        local fn_len = u16(bytes, p + 28)
        local extra_len = u16(bytes, p + 30)
        local cmt_len = u16(bytes, p + 32)
        local local_offset = u32(bytes, p + 42)
        local name = string.sub(bytes, p + 46, p + 46 + fn_len - 1)

        if comp_size == U32_MAX or uncomp_size == U32_MAX or local_offset == U32_MAX then
            return nil, "zip64 archives are not supported"
        end

        entries[#entries + 1] = {
            name = name,
            method = method,
            comp_size = comp_size,
            uncomp_size = uncomp_size,
            local_offset = local_offset,
            encrypted = (flag % 2) == 1,
            is_dir = name:sub(-1) == "/",
        }
        p = p + 46 + fn_len + extra_len + cmt_len
    end

    return entries
end

-- extract returns the decompressed bytes of one entry from list(). max_size caps
-- the decompressed output (default 256MB) to bound decompression bombs.
function zip_reader.extract(bytes: any, entry: any, max_size: number?): (string?, string?)
    if type(bytes) ~= "string" or type(entry) ~= "table" then
        return nil, "invalid arguments"
    end
    if entry.is_dir then return "", nil end
    if entry.encrypted then return nil, "encrypted entries are not supported" end

    local lo = (entry.local_offset :: integer) + 1
    if u32(bytes, lo) ~= SIG_LFH then
        return nil, "corrupt local file header for " .. tostring(entry.name)
    end
    -- The local header repeats name/extra with its own (sometimes zeroed) lengths;
    -- the central directory sizes are authoritative, so only the variable-length
    -- fields here are used to locate the payload start.
    local fn_len = u16(bytes, lo + 26)
    local extra_len = u16(bytes, lo + 28)
    local comp_size = entry.comp_size :: integer
    local data_start = lo + 30 + fn_len + extra_len
    local data = string.sub(bytes, data_start, data_start + comp_size - 1)
    if #data ~= comp_size then
        return nil, "truncated entry data for " .. tostring(entry.name)
    end

    if entry.method == 0 then
        return data
    end
    if entry.method == 8 then
        local out, err = compress.deflate.decode(data, { max_size = max_size or DEFAULT_MAX_ENTRY_SIZE })
        if err then
            return nil, "inflate failed for " .. tostring(entry.name) .. ": " .. tostring(err)
        end
        return out
    end
    return nil, "unsupported compression method " .. tostring(entry.method) .. " for " .. tostring(entry.name)
end

return zip_reader
