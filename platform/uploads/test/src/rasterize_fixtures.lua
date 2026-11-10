local base64 = require("base64")

-- paged_pdf builds a PDF with one page per spec: `text` lines in Helvetica and
-- `images` distinct 80x80 gray image XObjects.
local function paged_pdf(specs: { any }): string
    local objects = { "<< /Type /Catalog /Pages 2 0 R >>", "" }
    local function add(body: string): integer objects[#objects + 1] = body; return #objects end
    local function stream(body: string, attributes: string): integer
        return add("<< /Length " .. #body .. " " .. attributes .. " >>\nstream\n" .. body .. "\nendstream")
    end
    local font = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    local kids = {}
    for page, spec in ipairs(specs) do
        local resources, commands, y = {}, {}, 740
        for _, line in ipairs(spec.text or {}) do
            commands[#commands + 1] = "BT /F1 12 Tf 72 " .. y .. " Td (" .. line .. ") Tj ET"
            y = y - 24
        end
        for index = 1, spec.images or 0 do
            local image = stream(string.rep(string.char((page * 16 + index) % 256), 80 * 80),
                "/Type /XObject /Subtype /Image /Width 80 /Height 80 /ColorSpace /DeviceGray /BitsPerComponent 8")
            resources[#resources + 1] = "/I" .. index .. " " .. image .. " 0 R"
            commands[#commands + 1] = "q 300 0 0 300 72 72 cm /I" .. index .. " Do Q"
        end
        local contents = stream(table.concat(commands, "\n"), "")
        kids[#kids + 1] = add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 " .. font
            .. " 0 R >> /XObject << " .. table.concat(resources, " ") .. " >> >> /Contents " .. contents .. " 0 R >>") .. " 0 R"
    end
    objects[2] = "<< /Type /Pages /Count " .. #specs .. " /Kids [" .. table.concat(kids, " ") .. "] >>"
    local output, offsets, length = { "%PDF-1.4\n" }, {}, 9
    for index, body in ipairs(objects) do
        offsets[index] = length
        local object = index .. " 0 obj\n" .. body .. "\nendobj\n"
        output[#output + 1], length = object, length + #object
    end
    output[#output + 1] = "xref\n0 " .. (#objects + 1) .. "\n0000000000 65535 f \n"
    for _, offset in ipairs(offsets) do output[#output + 1] = string.format("%010d 00000 n \n", offset) end
    output[#output + 1] = "trailer\n<< /Size " .. (#objects + 1) .. " /Root 1 0 R >>\nstartxref\n" .. length .. "\n%%EOF\n"
    return table.concat(output)
end

return {
    paged_pdf = paged_pdf,
    pdf = base64.decode("JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUiA0IDAgUl0gL0NvdW50IDIgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAzMDAgMjAwXSAvQ29udGVudHMgNSAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAzMDAgMjAwXSAvQ29udGVudHMgNiAwIFIgPj4KZW5kb2JqCjUgMCBvYmoKPDwgL0xlbmd0aCAyNyA+PgpzdHJlYW0KMSAwIDAgcmcgNTAgNTAgMjAwIDEwMCByZSBmCmVuZHN0cmVhbQplbmRvYmoKNiAwIG9iago8PCAvTGVuZ3RoIDI3ID4+CnN0cmVhbQowIDAgMSByZyA1MCA1MCAyMDAgMTAwIHJlIGYKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTIxIDAwMDAwIG4gCjAwMDAwMDAyMDggMDAwMDAgbiAKMDAwMDAwMDI5NSAwMDAwMCBuIAowMDAwMDAwMzcyIDAwMDAwIG4gCnRyYWlsZXIKPDwgL1NpemUgNyAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKNDQ5CiUlRU9GCg=="),
}
