-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local objects = {
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 7 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 7 0 R >> >> /Contents 6 0 R >>",
}
for page = 1, 2 do
    local stream = "BT /F1 10 Tf 20 170 Td (Text layer page " .. tostring(page) .. ") Tj ET\n"
    for line = 1, 12 do
        stream = stream .. "BT /F1 8 Tf 20 " .. tostring(160 - line * 10)
            .. " Td (Synthetic document text remains readable.) Tj ET\n"
    end
    objects[#objects + 1] = "<< /Length " .. tostring(#stream) .. " >>\nstream\n" .. stream .. "endstream"
end
objects[7] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
local pdf = "%PDF-1.4\n"
local offsets = {"0000000000 65535 f \n"}
for index, object in ipairs(objects) do
    offsets[#offsets + 1] = string.format("%010d 00000 n \n", #pdf)
    pdf = pdf .. tostring(index) .. " 0 obj\n" .. object .. "\nendobj\n"
end
local start = #pdf
pdf = pdf .. "xref\n0 8\n" .. table.concat(offsets) .. "trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n" .. tostring(start) .. "\n%%EOF\n"
return {pdf = pdf}
