# Buying-signal monitor — job postings / funding / tech-stack changes → classified intent (coverage req 25)

`kickside/scratchpad/gtm/final_coverage.md` req 25: monitor job postings, funding, and tech-stack changes for watched companies and classify intent strength. WebScout can query; there is no signal event model or classifier composition.

## Compose over market_watch — do not build a second watcher
gtm_core market_watch (commits c65722e/27e0c0b) already declares `signal.observed` events with novelty+expiry, a seen-registry, live projections, and catalog cadences. This task EXTENDS that component:
1. Signal sweep workflow (declared, template-backed): for companies in the market_watch funnel (and optionally CRM companies via the reader surface), run bounded WebScout queries per signal class (hiring, funding, tech-stack), normalize hits into `signal.observed` events with class, evidence URL, novelty key (dedup via the seen-registry — same reservation discipline), and expiry.
2. Intent classifier: pure deterministic shaping around one LLM call mapping accumulated signals for a company → intent {strength: hot|warm|watch, rationale, contributing signals}; LLM-absent degradation = signals recorded, classification deferred (never a silent drop). Classified intent lands on the market_company record via the reconcile path (proposed update, same provenance discipline).
3. Surface: intent and recent signals appear on the market watch surface (extend the wave-3 view — timeline + a signals strip on company rows; keep it calm).
4. Escalation: a company crossing to `hot` emits an event a catalog installable can route to the inbox as a "worth a look" card (approve → source to acquisition via the existing sourcing flow point; reuse market_watch source_v1 — do NOT invent a new promotion path).
5. Catalog: one installable "Watch buying signals" under Market intelligence, scheduled cadence, config = signal classes on/off, query budget per run, intent thresholds. binding_spec goes UNDER meta (catalog validates meta.binding_spec — precall f1bb3f1 is the fix reference).
6. Tests: fixture sweep → events with dedup across runs; classifier shaping + deferred path; escalation event on threshold; suites green (gtm_core 5 entries + your additions).

## Laws
Declarative; ~300-line files; no parallel implementations (extend market_watch, never fork it); thin providers (WebScout stays raw query); TDD; never relax tests; present-tense comments, no emoji; commit scoped per repo, do NOT push, exclude node_modules. App :8085 (admin@wippy.local / Local12345!); restart detached (setsid nohup) only if registry changed; verify the installable APPEARS in GET /api/v1/automation-catalog before reporting done.

Report: what shipped, commits, test counts, catalog verification result.
