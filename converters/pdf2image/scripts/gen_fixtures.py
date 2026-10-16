#!/usr/bin/env python3
"""Generate small, valid sample PDFs used by the render tests.

Emits raw fixture files into an output directory (for native validation) and a
Lua module (`fixtures.lua`) that exposes each fixture as raw bytes, decoded from
an embedded base64 string. Pure standard library only.
"""

import base64
import os
import sys


def _pdf(objects) -> bytes:
    """Assemble a PDF from a 1-indexed list of object bodies with a correct xref."""
    out = bytearray(b"%PDF-1.4\n")
    offsets = []
    for index, body in enumerate(objects, start=1):
        offsets.append(len(out))
        out += str(index).encode() + b" 0 obj\n" + body + b"\nendobj\n"

    xref_pos = len(out)
    count = len(objects) + 1
    out += b"xref\n0 " + str(count).encode() + b"\n"
    out += b"0000000000 65535 f \n"
    for off in offsets:
        out += ("%010d 00000 n \n" % off).encode()
    out += b"trailer\n<< /Size " + str(count).encode() + b" /Root 1 0 R >>\n"
    out += b"startxref\n" + str(xref_pos).encode() + b"\n%%EOF\n"
    return bytes(out)


def _content(stream: bytes) -> bytes:
    return b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream"


def build_pdf() -> bytes:
    """Two-page PDF, each page a filled rectangle (vector graphics that rasterize)."""
    catalog = b"<< /Type /Catalog /Pages 2 0 R >>"
    pages = b"<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>"
    page1 = b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 5 0 R >>"
    page2 = b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 6 0 R >>"
    rect1 = _content(b"1 0 0 rg 50 50 200 100 re f")
    rect2 = _content(b"0 0 1 rg 50 50 200 100 re f")
    return _pdf([catalog, pages, page1, page2, rect1, rect2])


def build_text_pdf() -> bytes:
    """Single-page PDF with Helvetica text and a correct xref."""
    stream = b"BT /F1 24 Tf 72 120 Td (Hello from PDF) Tj ET"
    content = _content(stream)
    catalog = b"<< /Type /Catalog /Pages 2 0 R >>"
    pages = b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>"
    page = (
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R "
        b"/Resources << /Font << /F1 5 0 R >> >> >>"
    )
    font = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
    return _pdf([catalog, pages, page, content, font])


def build_garbage() -> bytes:
    return b"this is not a pdf at all, just plain text bytes\n"


FIXTURES = {
    "pdf": build_pdf,
    "text_pdf": build_text_pdf,
    "garbage": build_garbage,
}

EXTENSIONS = {
    "pdf": "pdf",
    "text_pdf": "pdf",
    "garbage": "bin",
}


def main() -> None:
    raw_dir = sys.argv[1] if len(sys.argv) > 1 else "/tmp/pdf2image_fixtures"
    lua_out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
        os.path.dirname(__file__), "..", "src", "pdf2image", "fixtures.lua"
    )

    os.makedirs(raw_dir, exist_ok=True)
    built = {name: builder() for name, builder in FIXTURES.items()}

    for name, data in built.items():
        path = os.path.join(raw_dir, f"{name}.{EXTENSIONS[name]}")
        with open(path, "wb") as handle:
            handle.write(data)
        print(f"wrote {path} ({len(data)} bytes)")

    lines = ["local base64 = require(\"base64\")", "", "return {"]
    for name, data in built.items():
        encoded = base64.b64encode(data).decode("ascii")
        lines.append(f'    {name} = base64.decode("{encoded}"),')
    lines.append("}")
    lines.append("")

    lua_out = os.path.normpath(lua_out)
    with open(lua_out, "w") as handle:
        handle.write("\n".join(lines))
    print(f"wrote {lua_out}")


if __name__ == "__main__":
    main()
