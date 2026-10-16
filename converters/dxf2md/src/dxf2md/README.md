# DXF to Markdown and Image

Convert a DXF CAD drawing into structured Markdown (metadata, layers, text, entity
summary) and a PNG render of its line work. The source is supplied as raw bytes or
an `http(s)` URL.

## API

```lua
local dxf2md = require("dxf2md")

local drawing, err = dxf2md.open({ bytes = dxf_bytes })
if err ~= nil then
    return nil, err            -- err.kind / err.message / tostring(err)
end
```

### `dxf2md.open(request) -> handle, err`

- **`request`** — a table with **exactly one** source:
  - `{ bytes = <binary string> }` — the raw bytes of a DXF drawing, or
  - `{ url = "https://…" }` — an `http(s)` URL, downloaded automatically.
- **`handle`** — on success, the table below; `nil` on failure.
- **`err`** — `nil` on success, otherwise a structured [error](#errors).

### `handle.to_markdown() -> markdown, err`

Returns structured Markdown describing the drawing (version, layers, text, entity
summary), or `nil` and an error.

### `handle.metadata() -> metadata, err`

Returns structured drawing metadata, or `nil` and an error.

### `handle.to_image([opts]) -> png, err`

Renders the line work to a PNG.

- **`opts`** — a DPI number or a table with `dpi`, `width`, and `height`. DPI
  defaults to `96` and must be positive and no greater than `600`. Width and
  height are optional pixel dimensions, each a positive integer up to `4000`.
  Dimensions override DPI; a single dimension preserves the aspect ratio.
- **`png`** — the render as PNG bytes (a binary Lua string), or `nil` on failure.

### `dxf2md.new(runtime) -> module`

Advanced: build an instance with injected runtime dependencies
(`{ funcs?, http_client? }`). See
[RFC 0001](../../docs/rfc/0001-wasm-seam-sdk.md).

## Errors

Every failure returns a structured error table with `message`, `kind`, and
`retryable`. `kind` is one of `invalid_input`, `download_failed`, `decode_failed`,
`render_failed`, `internal`. `tostring(err)` and string concatenation yield the
message.

```lua
local md, err = drawing.to_markdown()
if err ~= nil and err.kind == "decode_failed" then ... end
```

## Limits and safety

- Inputs (bytes or downloaded body) are capped at 128 MiB.
- URL fetches use an http(s)-only scheme allow-list, a 30s timeout, and a download
  size cap; private-IP targets are blocked by the runtime.

## Build

`make build-component` builds the component and stages it; `make test` runs the suite.
