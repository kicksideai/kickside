# Field-mapper backend handoffs

## 1. Assist latency

Workflow structured assist now uses a **50-second timeout per LLM attempt**. The
existing two-attempt retry, 250ms backoff, and stable
`{ success: false, error: "assist_unavailable", message }` contract are unchanged.

## 2. Binding mapping assist

Use this endpoint when assembling an automation binding to a workflow:

`POST /api/v1/workflows/{target_workflow_id}/assist/binding`

The caller needs **READ** access to `target_workflow_id`; WRITE is intentionally
not required. The endpoint belongs to the existing workflow mapping-assist family
and returns the usual validated expr-lang transform response.

```json
{
  "source_context_schema": { "type": "object", "properties": {} },
  "target_start_schema": { "type": "object", "properties": {} },
  "intent": "Map the trigger payload into this workflow's Start input",
  "source_context_sample": {},
  "target_start_sample": {}
}
```

`source_context_schema`, `target_start_schema`, and `intent` are the FE handoff
fields. The two `*_sample` fields are optional, but improve a draft when runtime
examples are available. Success is `{ "success": true, "transform": "..." }`;
validation and `assist_unavailable` errors match `assist/edge`.

## 3. Create idempotency

`POST /api/v1/workflows` accepts an optional body field:

```json
{ "title": "New workflow", "parent_id": "optional-parent", "idempotency_key": "client-uuid" }
```

Generate one key per intentional create and reuse it for transport retries or a
double-submit. Keys are scoped to the authenticated actor, must be nonblank
strings of at most 255 characters, and return the original draft on replay. The
successful envelope includes `replayed: true` for a replay (also on `workflow`).
Changing title or parent with the same key still replays the original request.

## Verification

- Baseline: 276 workflow test cases across 16 harness test entries.
- After: 278 cases (+2: READ-only binding assist and idempotent create replay),
  all green via `platform/workflows: make test`.
- Scoped commits: `36716a5d`, `a5412cc6`, `f5f33551`.
