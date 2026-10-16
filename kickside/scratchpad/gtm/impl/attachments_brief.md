# Pre-call brief attachment intake (coverage req 10)

`kickside/scratchpad/gtm/final_coverage.md` req 10: read and weight PDF/DOCX/XLSX/image/deck attachments in the pre-call flow, flagging unreadable files. Generic Uploads/OCR exists; the pre-call Start schema and brief flow currently have no attachment intake.

## Scope
1. Extend the pre-call intake (webform/webhook payload and the wedge Start schema) to accept attachment references (upload ids or URLs fetched into Uploads). Uploads module owns storage/OCR — compose it, do not duplicate extraction (search platform/uploads for the OCR/extract path first; the engine has universal timeout law — never launch unbounded extraction).
2. Precedence rule: attachment-derived facts weight ABOVE form free-text but BELOW human-set CRM fields (field policy/provenance already models source priority — reuse it).
3. Unreadable/failed files: the brief renders a visible "couldn't read X" flag and a follow-up question is added to the grounded questions list; never a silent drop.
4. Brief composition: attachment insights land in the existing fixed sections (do not add a new section unless the design doc requires it); cite which file a fact came from.
5. Tests: fixture PDF/DOCX through intake → facts in brief with provenance; unreadable fixture → flag + follow-up question. Suites green in wapps/precall (+ uploads if touched).

## Laws
Declarative everywhere; ~300-line files; no parallel implementations; thin providers; present-tense comments, no emoji; TDD; never relax tests; installable mapping `source` literals must exist as declared contacts source patterns; commit scoped per repo, do NOT push, exclude node_modules. App :8085 (admin@wippy.local / Local12345!); restart from kickside/app with `wippy run -c` only if registry entries changed — launch detached (setsid nohup) so it survives your exit.

Report: what shipped, commits, test counts, anything parked with reason.
