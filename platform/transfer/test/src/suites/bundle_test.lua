local test = require("test")
local bundle = require("bundle")

-- In-memory storage implementing exactly the handle surface the streaming codec uses:
-- open(path, "w"|"r") -> { write, read(n), seek("set", off), close }, and stat(path).
-- Lets the file-streaming path (write_bundle/read_header/extract_part) round-trip in a
-- pure test, no fs harness, with the same seek/range semantics a real backend has.
local function mem_storage()
    local files = {}
    local S = {}
    function S:open(path, mode)
        if mode == "w" then
            local buf = {}
            return {
                write = function(_, s) buf[#buf + 1] = s end,
                read = function() return nil end,
                seek = function() end,
                close = function() files[path] = table.concat(buf) end,
            }
        end
        local data = files[path]
        if not data then return nil, "not found: " .. tostring(path) end
        local pos = 1
        return {
                read = function(_, n: integer)
                if pos > #data then return "" end
                local chunk = string.sub(data, pos, pos + n - 1)
                pos = pos + #chunk
                return chunk
            end,
            write = function() end,
            seek = function(_, whence, off) if whence == "set" then pos = (off or 0) + 1 end end,
            close = function() end,
        }
    end
    function S:stat(path)
        local d = files[path]
        if not d then return nil end
        return { size = #d }
    end
    function S:remove(path) files[path] = nil end
    return S, files
end

local function define_tests()
    test.describe("KXB1 bundle codec", function()
        test.it("round-trips multiple components with raw parts byte-for-byte", function()
            local nodes = '{"id":"a"}\n{"id":"b"}'
            local edges = '{"from":"a","to":"b"}'
            local input = {
                {
                    component_id = "src-1",
                    impl_id = "kickside.kb10:embeddable",
                    shell = '{"schema_version":1,"impl_id":"kickside.kb10:embeddable"}',
                    has_portable = true,
                    parts = { { name = "data/nodes.jsonl", bytes = nodes }, { name = "data/edges.jsonl", bytes = edges } },
                },
                {
                    component_id = "src-2",
                    impl_id = "kickside.agents:user_agent",
                    shell = '{"schema_version":1,"impl_id":"kickside.agents:user_agent"}',
                    has_portable = false,
                    parts = {},
                },
            }

            local bytes = bundle.build(input)
            test.eq(string.sub(bytes, 1, 4), "KXB1")

            local parsed, err = bundle.parse(bytes)
            test.is_nil(err)
            assert(parsed, "parse returned no bundle")
            test.eq(#parsed.components, 2)

            local c1 = parsed.components[1]
            test.eq(c1.component_id, "src-1")
            test.eq(c1.impl_id, "kickside.kb10:embeddable")
            test.eq(c1.has_portable, true)
            test.eq(#c1.parts, 2)
            local p1, p2 = c1.parts[1], c1.parts[2]
            assert(p1 and p2, "expected two parts")
            test.eq(p1.name, "data/nodes.jsonl")
            test.eq(p1.bytes, nodes)
            test.eq(p2.bytes, edges)
            -- shell carried verbatim
            test.eq(c1.shell, input[1].shell)

            local c2 = parsed.components[2]
            test.eq(c2.has_portable, false)
            test.eq(#c2.parts, 0)
        end)

        test.it("preserves parts containing newlines and the magic string", function()
            local tricky = "KXB1\n42\nnot a header\n{still data}"
            local bytes = bundle.build({
                { component_id = "x", impl_id = "i", shell = "{}", has_portable = true,
                  parts = { { name = "data/x.jsonl", bytes = tricky } } },
            })
            local parsed, err = bundle.parse(bytes)
            test.is_nil(err)
            assert(parsed, "parse returned no bundle")
            local part = parsed.components[1].parts[1]
            assert(part, "expected one part")
            test.eq(part.bytes, tricky)
        end)

        test.it("rejects a non-bundle and a truncated bundle", function()
            local _, e1 = bundle.parse("not a bundle at all")
            test.not_nil(e1)

            local good = bundle.build({
                { component_id = "x", impl_id = "i", shell = "{}", has_portable = true,
                  parts = { { name = "data/x.jsonl", bytes = "0123456789" } } },
            })
            local _, e2 = bundle.parse(string.sub(good, 1, #good - 3))
            test.not_nil(e2)
        end)

        test.it("handles an empty component list", function()
            local bytes = bundle.build({})
            local parsed, err = bundle.parse(bytes)
            test.is_nil(err)
            test.eq(#parsed.components, 0)
        end)

        -- The streaming path (production export/import) never buffers a whole part: it
        -- assembles from part FILES and reads back by byte range. Its layout must be
        -- byte-identical to build(), and every part must extract back verbatim.
        test.it("streams write_bundle/read_header/extract_part byte-for-byte", function()
            local storage = mem_storage()
            -- A part with newlines + the magic string, and one large enough to span
            -- several 256KB copy windows, so the chunked copy/range reads are exercised.
            local nodes = "KXB1\n9\n{\"id\":\"a\"}\n{\"id\":\"b\"}"
            local big = string.rep("x", 600000)
            for _, p in ipairs({
                { path = "stage/c1/nodes.jsonl", bytes = nodes },
                { path = "stage/c1/big.jsonl", bytes = big },
            }) do
                local f = storage:open(p.path, "w"); f:write(p.bytes); f:close()
            end

            local components = {
                {
                    component_id = "c1", impl_id = "kickside.kb10:embeddable",
                    shell = '{"schema_version":1}', has_portable = true,
                    parts = {
                        { name = "data/nodes.jsonl", path = "stage/c1/nodes.jsonl", len = #nodes },
                        { name = "data/big.jsonl", path = "stage/c1/big.jsonl", len = #big },
                    },
                },
                {
                    component_id = "c2", impl_id = "kickside.agents:user_agent",
                    shell = '{"schema_version":1}', has_portable = false, parts = {},
                },
            }

            local ok, werr = bundle.write_bundle(storage, "out.kxb", components)
            test.is_true(ok == true, "write_bundle failed: " .. tostring(werr))

            -- The streamed file must decode through the same parser as the in-memory
            -- path (parse keys the manifest by name, so JSON key order is irrelevant):
            -- same shells, same part bytes verbatim, magic + newlines preserved.
            local file, open_err = storage:open("out.kxb", "r")
            if open_err or not file then error(tostring(open_err)) end
            local whole, read_err = file:read(#nodes + #big + 4096)
            file:close()
            if read_err or not whole then error(tostring(read_err)) end
            local parsed, perr = bundle.parse(whole)
            test.is_nil(perr)
            if not parsed then error("streamed bundle did not parse") end
            test.eq(#parsed.components, 2)
            test.eq(parsed.components[1].shell, '{"schema_version":1}')
            local first = parsed.components[1]
            if not first.parts then error("first streamed component has no parts") end
            local first_parts = first.parts
            local nodes_part = first_parts[1]
            local big_part = first_parts[2]
            if not nodes_part or not big_part then error("first streamed component is missing parts") end
            test.eq(nodes_part.bytes, nodes)
            test.eq(big_part.bytes, big)
            test.eq(#parsed.components[2].parts, 0)

            -- read_header pulls only manifest + offset; extract_part pulls each part by
            -- range and must reproduce the original bytes exactly.
            local hdr, herr = bundle.read_header(storage, "out.kxb")
            test.is_nil(herr)
            assert(hdr, "no header")
            test.eq(hdr.version, 1)
            test.eq(#hdr.components, 2)

            local offset = hdr.data_offset
            local c1 = hdr.components[1]
            local expected = { nodes, big }
            for i, mp in ipairs(c1.parts) do
                local out_path = "extracted/" .. tostring(i)
                local eok, eerr = bundle.extract_part(storage, "out.kxb", offset, mp.len, out_path)
                test.is_true(eok == true, "extract_part failed: " .. tostring(eerr))
                local file, open_err = storage:open(out_path, "r")
                if open_err or not file then error(tostring(open_err)) end
                local got, read_err = file:read(mp.len + 1)
                file:close()
                if read_err then error(tostring(read_err)) end
                test.eq(got, expected[i])
                offset = offset + mp.len
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
