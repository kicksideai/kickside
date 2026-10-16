# Workflow right-inspector variation sweep — 2026-07-12

Scope: source + component-state audit of every inspector-hosted surface. Live geometry is
deferred until the coordinated integrated restart; the pre-rebuild driver and screenshots
are in `/tmp/right-panel-sweep/` and must not be used as post-fix evidence.

| Surface/state | Composition check | Result |
|---|---|---|
| Start/Finish/Error, editable | schema code, AI idle/loading/review/error, Accept/Undo | shared SchemaEditor; 8px controls, 14px review, narrow stack |
| Start/Finish/Error, behavior-locked | read-only field list, long lock copy | shared field-list path; pending integrated live geometry |
| Agent inline/reuse | instructions, picker, model, output, advanced tools/context | shared controls; no raw/native unstyled control |
| Tool/function | identity, loading/error, fixed overrides, generic config | shared controls/WC; upstream schema now reaches generalized assist |
| Condition | field composer, advanced expr, AI review, True/False cards | duplicate client schema removed; server projection + real upstream schema |
| Loop | visual predicate, cap, failure guidance | removed polling recommendation; bounded-pass copy |
| For each | array picker/manual fallback, batch, failure behavior | controls contained; long options use styled select |
| Combine | mode/output/conflict warning | controls contained; no sibling collision |
| Wait for | signal field | one styled input; no polling UI |
| Human Decision | AI, prompt, outcomes, context, assignee, timeout, form, preview | generalized assist added; Approve/Reject split into labeled cards; narrow form stacks |
| Workflow call | selected/list/loading/error/compatibility | shared picker; concurrent callable-vocabulary edit preserved |
| Extension/config WC incl. Inbox review | AI idle/loading/review/error + schema WC | authoritative declared schema; upstream context passed; picker fields model-protected |
| Edge | mapped/unmapped/pending/assist/error/advanced route | shared FieldMapper/EdgePanel; no new edge-specific controls |
| Note/frame | color/title/body/delete | shared controls; no native/unrounded control |

Defects closed in this lane:

1. Human Decision lacked the generalized configuration assistant.
2. Human context drafting had no predecessor field names.
3. Condition carried a handwritten client copy of its server schema.
4. A proposed Human client schema would have duplicated the server schema; removed before landing.
5. Approve/Reject were visually anonymous rows; now distinct labeled outcome cards.
6. Narrow Human form rows could squeeze label/type/delete controls; container stacking added.
7. Loop copy recommended polling; replaced with bounded repeated-work guidance.

Verification so far:

- Workflows UI: 623/623.
- Focused generalized assist backend: 38/38.
- Production workflow UI build: green (255 modules).
- Integrated live light/dark, 520px drawer, and transient AI screenshots: pending the
  coordinated rebuild/restart; this lane does not restart the shared app.
