#!/usr/bin/env python3
"""Generate small, valid sample documents used by the conversion tests.

Emits raw fixture files into an output directory (for native validation) and a
test-only Lua module (`doc2md_fixtures.lua`) that exposes each fixture as raw
bytes, decoded from an embedded base64 string. Pure standard library only.
"""

import base64
import binascii
import os
import sys
import zipfile

HERE = os.path.dirname(__file__)
LEGACY_DIR = os.path.join(HERE, "..", "component", "tests", "assets")

# A 1x1 opaque-red PNG, used as the embedded image across the OOXML fixtures.
PNG_1X1 = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)


def build_pdf() -> bytes:
    """A minimal single-page PDF with extractable text and a correct xref."""
    header = b"%PDF-1.4\n"
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    stream = b"BT /F1 24 Tf 72 700 Td (Hello from PDF) Tj ET\n"
    content = b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"endstream"

    ordered = [objects[0], objects[1], objects[2], content, objects[3]]

    out = bytearray(header)
    offsets = []
    for index, body in enumerate(ordered, start=1):
        offsets.append(len(out))
        out += str(index).encode() + b" 0 obj\n" + body + b"\nendobj\n"

    xref_pos = len(out)
    count = len(ordered) + 1
    out += b"xref\n"
    out += b"0 " + str(count).encode() + b"\n"
    out += b"0000000000 65535 f \n"
    for off in offsets:
        out += ("%010d 00000 n \n" % off).encode()
    out += b"trailer\n<< /Size " + str(count).encode() + b" /Root 1 0 R >>\n"
    out += b"startxref\n" + str(xref_pos).encode() + b"\n%%EOF\n"
    return bytes(out)


def _zip(parts: dict) -> bytes:
    import io

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, data in parts.items():
            if isinstance(data, str):
                data = data.encode("utf-8")
            zf.writestr(name, data)
    return buffer.getvalue()


def build_docx() -> bytes:
    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Default Extension="png" ContentType="image/png"/>'
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
        "</Types>"
    )
    root_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
        "</Relationships>"
    )
    document = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        "<w:body>"
        '<w:p><w:r><w:t>Hello from DOCX</w:t></w:r></w:p>'
        '<w:p><w:r><w:t>Second paragraph.</w:t></w:r></w:p>'
        "</w:body></w:document>"
    )
    document_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId10" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>'
        "</Relationships>"
    )
    return _zip(
        {
            "[Content_Types].xml": content_types,
            "_rels/.rels": root_rels,
            "word/document.xml": document,
            "word/_rels/document.xml.rels": document_rels,
            "word/media/image1.png": PNG_1X1,
        }
    )


def build_xlsx() -> bytes:
    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
        "</Types>"
    )
    root_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        "</Relationships>"
    )
    workbook = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        '<sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>'
    )
    workbook_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>'
        "</Relationships>"
    )
    shared_strings = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="2" uniqueCount="2">'
        "<si><t>Name</t></si><si><t>Hello from XLSX</t></si></sst>"
    )
    sheet = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        "<sheetData>"
        '<row r="1"><c r="A1" t="s"><v>0</v></c></row>'
        '<row r="2"><c r="A2" t="s"><v>1</v></c></row>'
        "</sheetData></worksheet>"
    )
    return _zip(
        {
            "[Content_Types].xml": content_types,
            "_rels/.rels": root_rels,
            "xl/workbook.xml": workbook,
            "xl/_rels/workbook.xml.rels": workbook_rels,
            "xl/sharedStrings.xml": shared_strings,
            "xl/worksheets/sheet1.xml": sheet,
        }
    )


def build_pptx() -> bytes:
    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>'
        '<Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        "</Types>"
    )
    root_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>'
        "</Relationships>"
    )
    presentation = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        '<p:sldIdLst><p:sldId id="256" r:id="rId1"/></p:sldIdLst></p:presentation>'
    )
    presentation_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>'
        "</Relationships>"
    )
    slide = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
        'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
        "<p:cSld><p:spTree>"
        "<p:sp><p:txBody>"
        "<a:p><a:r><a:t>Hello from PPTX</a:t></a:r></a:p>"
        "</p:txBody></p:sp>"
        "</p:spTree></p:cSld></p:sld>"
    )
    return _zip(
        {
            "[Content_Types].xml": content_types,
            "_rels/.rels": root_rels,
            "ppt/presentation.xml": presentation,
            "ppt/_rels/presentation.xml.rels": presentation_rels,
            "ppt/slides/slide1.xml": slide,
        }
    )


def build_garbage() -> bytes:
    return b"this is not a document at all, just plain text bytes\n"


def _legacy(name: str):
    """Read a committed legacy binary fixture (regenerated via legacy_fixtures/regen.sh)."""

    def builder() -> bytes:
        with open(os.path.join(LEGACY_DIR, name), "rb") as handle:
            return handle.read()

    return builder


def build_rtf() -> bytes:
    """A minimal RTF with two paragraphs and an embedded PNG picture group."""
    hexed = binascii.hexlify(PNG_1X1).decode("ascii")
    body = (
        r"{\rtf1\ansi\deff0 Hello from RTF legacy\par Second line of rtf\par "
        r"{\pict\pngblip\picw1\pich1 " + hexed + r"}\par }"
    )
    return body.encode("ascii")


FIXTURES = {
    "pdf": build_pdf,
    "docx": build_docx,
    "xlsx": build_xlsx,
    "pptx": build_pptx,
    "doc": _legacy("doc.doc"),
    "xls": _legacy("xls.xls"),
    "ppt": _legacy("ppt.ppt"),
    "rtf": build_rtf,
    "garbage": build_garbage,
}

EXTENSIONS = {
    "pdf": "pdf",
    "docx": "docx",
    "xlsx": "xlsx",
    "pptx": "pptx",
    "doc": "doc",
    "xls": "xls",
    "ppt": "ppt",
    "rtf": "rtf",
    "garbage": "bin",
}


def main() -> None:
    raw_dir = sys.argv[1] if len(sys.argv) > 1 else "/tmp/d2m_fixtures"
    lua_out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
        os.path.dirname(__file__), "..", "src", "app", "env", "doc2md_fixtures.lua"
    )

    os.makedirs(raw_dir, exist_ok=True)
    built = {name: builder() for name, builder in FIXTURES.items()}

    for name, data in built.items():
        path = os.path.join(raw_dir, f"sample.{EXTENSIONS[name]}")
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
