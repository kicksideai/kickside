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

## Upload lifecycle and completion callbacks

An upload moves through storage, processing, and completion:

1. The client or module submits bytes: `POST /uploads` (multipart), the presigned
   flow (`POST /uploads/presigned`, then `POST /uploads/complete`), or
   `kickside.uploads:uploads.upload_file(actor_id, data, filename, size, mime_type, storage_id, metadata, parent_upload_id)`.
2. Uploads stores the original and queues the processing pipeline that the
   matching `upload.type` declares (text extraction, Markdown conversion, OCR,
   archive expansion). Each stage writes artifacts; the primary artifact holds
   the readable text an agent or Knowledge base consumes.
3. When processing settles as `completed` or `error`, Uploads runs every
   completion callback attached to the upload.

Work that depends on a processed file attaches a completion callback instead of
polling upload status. A callback is an upload token minted by the module that
owns the follow-up work:

```lua
local execution_identity = require("execution_identity") -- kickside.execution:execution_identity
local upload_tokens = require("upload_tokens")           -- kickside.uploads.persist:upload_tokens

local identity = assert(execution_identity.capture())
local row = assert(execution_identity.to_row(identity))
local upload_id = uuid.v4()
local token = assert(upload_tokens.pack({
    upload_id = upload_id,                    -- the record Uploads creates for these bytes
    function_id = "my.module:on_file_ready",  -- runs when processing completes
    on_error_id = "my.module:on_file_failed", -- optional; runs when processing fails
    actor_id = row.actor_id,
    actor_context = row.actor_context,
    params = { record_id = record_id },       -- returned to the callback unchanged
}))
```

Attach the token as the `upload_token` multipart field of `POST /uploads`, as
`upload_token` in the presigned or complete request body, or as
`metadata.__upload_token` for `upload_file`. Several tokens may be attached as
`metadata.__upload_tokens`.

Uploads runs each callback as a durable Jobs job under the identity frozen in
the token, with up to eight attempts, once per upload, token and outcome. The
function receives:

| Field | Value |
| --- | --- |
| `upload_id` | The processed upload |
| `status` | `completed` or `error` |
| `error` | The failure message when `status` is `error` |
| `mime_type`, `size`, `type_id` | The upload's detected type and size |
| `storage_id`, `storage_path` | Where the original is stored |
| `metadata` | Upload metadata without `_`-prefixed internal keys |
| `params` | The token's `params` |
| `trace_context` | The trace the token started |

Read derived content from the upload's artifacts (the primary artifact for
text) with the same authority. A failed upload without `on_error_id` runs no
callback.

Identical bytes from the same owner reuse an existing upload. A callback
attached to such an upload runs at once with that upload's settled outcome, or
waits until it settles. An archive runs no callback itself: each extracted
member carries the archive's tokens, rebound to that member, and runs them when
it settles.

Knowledge ingestion uses this flow: `kickside.knowledge.api:upload_token` mints
a token for `kickside.knowledge.injection:on_upload_complete`, and the
Knowledge URL fetch tool attaches one before it stores fetched content.

## Packed storage and delivery

Available starting with Uploads 0.3.2. The default storage adapter accepts
relative filesystem paths, `fs://<resource-id>/<path>` and
`s3://<resource-id>/<key>`. Relative paths use the record's `storage_id`; packed
paths name their native resource directly. Bind
`kickside.uploads:storage_runtime_policy` to the exact resources the host permits.
Packed locations are trusted storage metadata, not arbitrary client input.

Successful processing stages may return `relocation = { storage_path = ..., blobs =
{ { blob_id = ..., storage_path = ... } } }`. Uploads rejects directories and
size mismatches, checks blob ownership, and commits new locations and private
cleanup intent in one database transaction. Cleanup rechecks live references
before deleting old bytes. A failed removal does not roll back the new locations;
its intent remains for processing retries or deletion. Cleanup preserves
concurrent metadata edits and does not advance public recency.

`kickside.uploads:uploads.delivery_url(upload_id, options)` returns a URL or an
error. Options include `audience` and `expires_in` (seconds). S3 uses a signed
object URL; filesystem content uses a tokened raw URL. The caller must authorize
read access to the upload or validate a trusted source relationship before
calling this internal helper: it does not perform that authorization itself.

Authorized original/artifact API responses expose `raw_url`. The default S3
expiry is 15 minutes; consumers obtain a fresh authorized response after expiry.
The raw endpoints also support S3 content. Cross-origin browser delivery needs
GET/HEAD access allowed by the object host. Opening a signed URL directly does
not guarantee the record's filename; the UI download action supplies its name.

Consumers using these capabilities must require Uploads >=0.3.2. An older
installed package satisfying a wildcard dependency does not provide them.

## Trusted reader and provider attachments

`kickside.uploads:trusted_reader` is a read-only library over any upload,
regardless of its owner: `info`, `provenance` (`metadata.source` and
`metadata.crm_files`), `primary_text` (converted text, cut UTF-8 safely at
`max_chars` bytes), `source_image` (the original artifact of an image upload,
`nil` for documents) and `image_bytes` (one image artifact of that upload). Like
`delivery_url`, it does not authorize the caller: the importing module must
check its own access rule and the upload's provenance before calling it.

`kickside.uploads:attachment_ingest.ingest(att)` accepts optional
`att.metadata`; it is stored on the upload, for example `__upload_token` (which
binds the upload UUID and its completion callback) and provenance keys. The
module's own `source`, `thread_id` and `external_message_id` always win. The
filename and content type come from `att`, else from the provider fetcher's
answer.

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
