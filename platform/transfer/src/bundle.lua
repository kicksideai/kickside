-- KXB1 — the transfer bundle container. A purpose-built pack (NOT a generic zip):
-- a text header, a JSON manifest carrying every component's shell envelope verbatim
-- plus its data-part lengths, then the raw concatenated data parts. The shell is
-- embedded in the manifest so inspect and import share one decoder; parts stay raw
-- (jsonl) and length-delimited so large KBs stream byte-for-byte without base64 bloat.
--
--   "KXB1 1"\n              magic + version
--   <manifest_byte_len>\n   decimal length of the manifest that follows
--   <manifest json>         exactly manifest_byte_len bytes
--   <part bytes...>         concatenated in manifest order, each len from the manifest
--
-- Pure string/JSON: no I/O. The orchestrator owns storage and component lifecycle.

local json = require("json")

local M = {}
M.MAGIC = "KXB1"
M.VERSION = 1

-- build(components) -> bytes
-- components: array of { component_id, impl_id, shell (json string), has_portable, parts }
--   parts: array of { name (string), bytes (string) }
function M.build(components)
    local manifest_components = {}
    local blobs = {}
    for _, c in ipairs(components or {}) do
        local mparts = {}
        for _, p in ipairs(c.parts or {}) do
            mparts[#mparts + 1] = { name = p.name, len = #p.bytes }
            blobs[#blobs + 1] = p.bytes
        end
        manifest_components[#manifest_components + 1] = {
            component_id = c.component_id,
            impl_id = c.impl_id,
            shell = c.shell,
            has_portable = c.has_portable == true,
            parts = mparts,
        }
    end
    local manifest = json.encode({ version = M.VERSION, components = manifest_components })
    local header = M.MAGIC .. " " .. tostring(M.VERSION) .. "\n" .. tostring(#manifest) .. "\n"
    return header .. manifest .. table.concat(blobs)
end

local COPY_CHUNK = 262144 -- 256KB stream-copy window: bounded memory at any KB size.

-- write_bundle(storage, bundle_path, components) -> (true, nil) | (nil, err)
-- Streaming assembler: the same KXB1 layout as build(), but parts are FILE PATHS on
-- `storage` (with a precomputed byte len), copied chunk-by-chunk into the bundle file.
-- Nothing larger than COPY_CHUNK is ever held in memory, so a multi-GB KB packs fine.
-- components: array of { component_id, impl_id, shell, has_portable, parts }
--   parts: array of { name, path (on storage), len (bytes) }
function M.write_bundle(storage, bundle_path, components)
    local manifest_components = {}
    for _, c in ipairs(components or {}) do
        local mparts = {}
        for _, p in ipairs(c.parts or {}) do
            mparts[#mparts + 1] = { name = p.name, len = p.len }
        end
        manifest_components[#manifest_components + 1] = {
            component_id = c.component_id,
            impl_id = c.impl_id,
            shell = c.shell,
            has_portable = c.has_portable == true,
            parts = mparts,
        }
    end
    local manifest = json.encode({ version = M.VERSION, components = manifest_components })
    local header = M.MAGIC .. " " .. tostring(M.VERSION) .. "\n" .. tostring(#manifest) .. "\n"

    local bf, oerr = storage:open(bundle_path, "w")
    if not bf then return nil, "open bundle: " .. tostring(oerr) end
    bf:write(header)
    bf:write(manifest)
    for _, c in ipairs(components or {}) do
        for _, p in ipairs(c.parts or {}) do
            local pf, perr = storage:open((p.path :: string), "r")
            if not pf then bf:close(); return nil, "open part " .. tostring(p.name) .. ": " .. tostring(perr) end
            while true do
                local chunk = pf:read(COPY_CHUNK)
                if not chunk or chunk == "" then break end
                bf:write(chunk)
            end
            pf:close()
        end
    end
    bf:close()
    return true
end

-- read_header(storage, bundle_path) -> ({ version, components, data_offset }, nil) | (nil, err)
-- Reads only the magic + length line + manifest (always small, even for a GB bundle);
-- returns the byte offset where the concatenated parts begin. extract_part then pulls
-- each part by range without ever loading the whole bundle.
function M.read_header(storage, bundle_path)
    local f, oerr = storage:open(bundle_path, "r")
    if not f then return nil, "open bundle: " .. tostring(oerr) end
    local function read_line(): string?
        local buf = {}
        while true do
            local ch = f:read(1)
            if not ch or ch == "" then return nil end
            if ch == "\n" then break end
            buf[#buf + 1] = ch
        end
        return table.concat(buf)
    end
    local magic_line = read_line()
    if not magic_line or string.match(magic_line :: string, "^(%S+)") ~= M.MAGIC then
        f:close(); return nil, "bad magic"
    end
    local len_line = read_line()
    local mlen = tonumber(len_line or "") or -1
    if mlen < 0 then f:close(); return nil, "bad manifest length" end
    local manifest_str = f:read(mlen)
    f:close()
    if type(manifest_str) ~= "string" or #(manifest_str :: string) < mlen then
        return nil, "truncated manifest"
    end
    local manifest, derr = json.decode(manifest_str :: string)
    if derr then return nil, "manifest decode: " .. tostring(derr) end
    -- offset = magic line + "\n" + length line + "\n" + manifest bytes
    local data_offset = #(magic_line :: string) + 1 + #(len_line :: string) + 1 + mlen
    return { version = (manifest :: any).version, components = (manifest :: any).components or {}, data_offset = data_offset }
end

-- extract_part(storage, bundle_path, offset, len, out_path) -> (true, nil) | (nil, err)
-- Streams `len` bytes at `offset` of the bundle into out_path, chunk by chunk.
function M.extract_part(storage, bundle_path, offset, len, out_path)
    local src, oerr = storage:open(bundle_path, "r")
    if not src then return nil, "open bundle: " .. tostring(oerr) end
    src:seek("set", offset)
    local dst, derr = storage:open(out_path, "w")
    if not dst then src:close(); return nil, "open out: " .. tostring(derr) end
    local remaining = len
    while remaining > 0 do
        local want = remaining < COPY_CHUNK and remaining or COPY_CHUNK
        local chunk = src:read(want)
        if not chunk or chunk == "" then break end
        dst:write(chunk)
        remaining = remaining - #(chunk :: string)
    end
    dst:close(); src:close()
    if remaining > 0 then return nil, "short read on part (" .. tostring(remaining) .. " left)" end
    return true
end

-- parse(bytes) -> (parsed, err)
-- parsed: { version, components = [ { component_id, impl_id, shell, has_portable, parts = [ {name, bytes} ] } ] }
function M.parse(bytes)
    if type(bytes) ~= "string" or #bytes < 7 then
        return nil, "not a KXB1 bundle (too short)"
    end

    local nl1 = string.find(bytes, "\n", 1, true)
    if not nl1 then return nil, "malformed header (no magic line)" end
    local magic = string.match(string.sub(bytes, 1, nl1 - 1), "^(%S+)")
    if magic ~= M.MAGIC then return nil, "bad magic" end

    local nl2 = string.find(bytes, "\n", nl1 + 1, true)
    if not nl2 then return nil, "malformed header (no length line)" end
    local mlen = tonumber(string.sub(bytes, nl1 + 1, nl2 - 1)) or -1
    if mlen < 0 then return nil, "bad manifest length" end

    local mstart = nl2 + 1
    if mstart + mlen - 1 > #bytes then return nil, "truncated manifest" end
    local manifest, derr = json.decode(string.sub(bytes, mstart, mstart + mlen - 1))
    if derr then return nil, "manifest decode: " .. tostring(derr) end

    local offset = mstart + mlen
    local out = {}
    for _, mc in ipairs((manifest.components) or {}) do
        local parts = {}
        for _, mp in ipairs(mc.parts or {}) do
            local plen = mp.len or 0
            if offset + plen - 1 > #bytes then return nil, "truncated part `" .. tostring(mp.name) .. "`" end
            parts[#parts + 1] = { name = mp.name, bytes = string.sub(bytes, offset, offset + plen - 1) }
            offset = offset + plen
        end
        out[#out + 1] = {
            component_id = mc.component_id,
            impl_id = mc.impl_id,
            shell = mc.shell,
            has_portable = mc.has_portable == true,
            parts = parts,
        }
    end

    return { version = manifest.version, components = out }, nil
end

return M
