# Stalled-deal detection + re-engagement draft (coverage req 20, Spine 4 first slice)

`kickside/scratchpad/gtm/final_coverage.md` req 20: detect stalled deals and draft re-engagement. CRM has pipeline/activity primitives; nothing detects staleness or drafts re-engagement.

## Scope
1. Stall detector: a declared scheduled automation (catalog installable, "Deal intelligence" group, one-click Set up) that scans CRM opportunities for no-activity-past-threshold per stage; thresholds per stage in the installable config form with sane defaults. Use the existing CRM activity projection/timeline reader — do NOT build a second activity model. Detection must be idempotent across runs (a deal already flagged and pending review is not re-flagged; a deal that got activity clears).
2. Stall event: emit a declared component event (canonical event model — events.in/out + via; prefix law) so other compositions can react; the detector itself is provider-free.
3. Re-engagement draft: on stall, a declared template-backed workflow composes an editable, length-capped re-engagement draft grounded in the deal's timeline (last touch, stage, contact) — same house-voice constraints as the follow-up draft in precall (reuse its slot shapes; search precall commit 621d3df for the drafting composition). LLM-absent degradation = needs-attention item, never a silent drop.
4. Inbox card: stalled-deal review item — deal, stage, days quiet, last interaction, then the draft; approve/edit/reject through the existing approval events; approved send stays credentials-gated like everything else.
5. A "stall evaluation" flow point (meta.type: kickside.flow.point, canonical shape as in gtm_core market_watch declarations) with the default detector workflow so users can substitute custom stall logic.
6. Tests: fixture deals across stages/thresholds → correct stall set; idempotency; cleared-on-activity; draft composition; suites green in crm + wapps modules touched.

## Laws
Declarative everywhere; ~300-line files; no parallel implementations (the calendar/fireflies compositions are the pattern — copy their shape); thin providers; present-tense comments, no emoji; TDD; never relax tests; commit scoped per repo, do NOT push, exclude node_modules. App :8085 (admin@wippy.local / Local12345!); restart from kickside/app with `wippy run -c` only if registry entries changed — launch detached (setsid nohup) so it survives your exit.

Report: what shipped, commits, test counts, anything parked with reason.
