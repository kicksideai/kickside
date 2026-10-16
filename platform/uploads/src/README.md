# KickSide Uploads

KickSide-owned upload API, storage pipeline, preview endpoints, file-management
traits, default upload type declarations, and derived artifact storage.

## What it provides

- Upload API, durable core-job submission, upload tokens, and status callbacks.
- Default `upload.type` registry entries for text, images, and documents.
- **Processors**:
  `kickside.uploads.text:processor`,
  `kickside.uploads.images:processor`, and
  `kickside.uploads.documents:processor`. They run after the native upload
  completes and write upload artifacts.
- Repositories for original upload records, deduplicated artifact blobs, and
  artifact aliases.

## Boundary

`kickside/uploads` owns upload persistence, processor routing, and upload
artifact policy. Pure converters, such as `kickside/doc2md`, stay below this
layer and are imported by upload processors.

## File persistence

`kickside.uploads:uploads.store_file` stores an authenticated owner's bytes and upload
record with completed storage and no processing intent. It uses the same identity,
storage and type resolution path as `upload_file`, and creates an independent record
so it cannot suppress ingestion through content deduplication. `upload_file` keeps
content deduplication and queues the declared ingestion pipeline. Result snapshots
use `store_file` so storing a permitted tool result does not require access to
another component or start jobs.

## Upload artifact contract

The `upload.type` entries in [types/_index.yaml](types/_index.yaml),
[documents/_index.yaml](documents/_index.yaml), and
[archive/_index.yaml](archive/_index.yaml) declare supported extensions and pipelines.
The generic MIME catch-all applies after a declared extension match.

| Types | Declared output |
| --- | --- |
| `bat`, `ps1`, `rb`, `sql`, `toml`, `yaml`, `yml` | Primary text artifact containing the uploaded source |
| Word `dot`, SPSS `sav`, and other declared documents | Primary converted Markdown and the original source artifact |
| `svg` | Original SVG image artifact and original download; source-only |
| `zip` | Container with extracted child uploads, each linked to its parent archive; no container primary |

SVG is markup, so the `kickside/llm-ocr` contract deliberately excludes it from
raster-image OCR (see that module's README, Quick start). Its artifact-list `primary`
field contains text content only, and the paginated parts exclude source and primary
artifacts. The upload metadata exposes `primary_artifact_id`; the artifact raw endpoint
serves the original SVG image under that ID.
The `ai_upload_svg` smoke scenario verifies the exact original image bytes and markup.

Upload records deduplicate identical bytes within one owner's standalone uploads or
within one parent archive. Separate archives retain separate child records and parent
provenance. Artifact blobs continue to share identical bytes independently of these records.
