# Lead acquisition — component decomposition (decider notes, feeds the acquisition stage design)

Ruling frame: c17 (first-class spine), A12-2 (thin slice P1-P2), W2 triad, A1 substrate.

1. SOURCE = component instance emitting `candidate.sighted` (normalized: raw person/company payload + provenance envelope + compliance fields {jurisdiction, consent_basis, allowed_actions, suppression, retention, no_auto_send}). Kinds: pull (phantombuster actor, apollo search, webscout scan), file import (CSV), event (webhook, visitor ident, inbound form). Per-instance config: query, schedule, caps. New source = declaration only.
2. CANDIDATE QUARANTINE on the substrate: `prospect_candidate` is a config-declared CRM object type; candidates promote to person/company ONLY through the strategy pipeline (ICP filter + suppression + resolve + batch approval). Scraper output never writes the canonical graph directly — protects the hardened identity layer.
3. STRATEGY = workflow definition (playbook), never code: Suppression check (graph-backed: customer/active-deal/declined/do-not-contact) -> Score fit (vertical profile) -> Resolve contact -> optional Research -> batch review card (top-N, 30-sec tier) -> route (promote / feed precall / queue outreach). Strategy archetypes to ship as gtm_pack flow templates: ICP list-build, signal-driven (job change), account gap-fill (buying committee), lookalike-from-closed-won, event/community harvest.
4. MIXING via bindings: source x strategy x vertical freely combined; lane guard prevents cross-lane leakage; swapping vendors = new provider, same bindings.
5. ECONOMICS via quota: per-source pull caps, per-strategy candidate caps, batch caps so N scraped rows -> one ranked review card. Review-minutes budget applies.
6. Promotion rule: a candidate that fails ICP twice or hits suppression is parked with reason (resurfacable on new evidence — same skip semantics as merge review). Everything auditable via provenance.
7. Metrics feed the scorecard: candidates in -> qualified -> promoted -> meetings (the "10 accounts in, 3 prospects out" funnel) + per-source yield/cost so John can kill weak sources from data.
