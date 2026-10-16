# Business-lens kill round: ADR

Scope: attack `ADR.md` on business value only. `decisions.md` A11 is treated as resolving the ADR's two escalations: merge review has four actions; org identity and repo placement are not a conflict.

## Findings

1. **[reorder] The serial P0/P1 gate chain is not the shortest path to first business value.** Rationale: G1 -> G2 -> WIRE -> S0bench -> S8a -> S1a -> S2 -> S5p -> G4 -> S4 means weeks of substrate work before John sees a working brief, while the first value moment is score + brief + draft in his inbox. Recommendation: split P1 into P1a "brief in inbox, no external writes" and P1b "Gmail draft + HubSpot writeback"; let P1a run on bounded fixtures/read-only HubSpot and exact-email resolve, with S4/outbox/storage gates blocking only P1b production side effects.

2. **[defer] CRM-S0bench, S8a storage extraction, and G4 replay runbook should not gate the demo wedge.** Rationale: They reduce production risk but do not widen the funnel, speed a buyer stage, lift conversion, or help John sell before a lead artifact exists. Recommendation: make them production-readiness gates for HubSpot backfill/writeback scale, not first-brief gates; dependency fallout is that the first demo cannot claim high-volume CRM durability yet.

3. **[defer] Canon migrations across existing offenders are over-scoped before the first sold demo.** Rationale: C-1/C-2 are commercially relevant only where the wedge uses provenance/checkpoints; migrating unrelated consumers is invisible to John and buyers. Recommendation: implement the canonical envelope/checkpoint only on the CRM -> precall -> approval path first, then finish platform-wide migration after the constructor demo is sellable.

4. **[defer] WA-M4 through WA-M7 legacy-trigger/sync migration is platform hygiene, not GTM value.** Rationale: Hiding old labels and achieving vocabulary purity does not widen the funnel or sell the platform until there is a working workflow to show. Recommendation: keep only the minimal trigger/binding/mapping slice needed for live demo rewiring; move broad migration and label cleanup after the first sold demo.

5. **[reorder] The first working brief should precede HubSpot writeback.** Rationale: John's time-to-value is achieved when he can read/edit a high-quality score, brief, and reply draft; CRM writeback is a second-order operational win. Recommendation: accept a P1a gate of "webhook/manual lead -> resolve -> owned-data read -> score/brief/draft -> brief_review item"; require zero external writes until P1b.

6. **[reorder] The first sold demo should be the constructor scenario, not full GTM spine coverage.** Rationale: c16 says John sells the platform by changing an ICP/workflow live; buyers do not need full identity tiers or outbound infrastructure to believe the constructor story. Recommendation: define an early acceptance demo: load sample lead, generate brief, edit ICP lane/voice KB/binding in front of prospect, rerun, show changed score/draft, then install the pack into a clean workspace with missing-slot diagnostics.

7. **[gap] The ADR states c16 but lacks demo acceptance gates.** Rationale: "Demoable" is a commercial requirement, not a narrative header. Recommendation: add demo checkpoints to the stage table: D0 static brief render, D1 webhook to inbox brief, D2 live ICP/profile rewire affects output, D3 approved Gmail draft/HubSpot writeback, D4 call transcript to follow-up, D5 acquisition source to researched prospects, D6 pack install into empty workspace.

8. **[reorder] Lead acquisition is first-class in constraints but commercially late in P3.** Rationale: Starting at inbound-lead prep narrows the story to servicing leads, while c17 says replacing PhantomBuster/n8n/ad-hoc scanners and generating pipeline is core value. Recommendation: pull a thin P1 acquisition slice: source declaration + CSV/PhantomBuster/webscout import + ICP filter + top-N prospect list + route selected prospects into precall/research; full signals queue and enrichment can stay P3.

9. **[gap] The ADR has no shortest path to "pipeline generated."** Rationale: The system must generate pipeline and sell the platform; a brief for leads John already has only speeds a stage, it does not widen the funnel. Recommendation: first demoable acquisition moment should be "10 target accounts in, 3 qualified prospects out, 1 routed to a reviewed draft" with suppression and no live send.

10. **[reorder] `gtm_pack` and promotion are too late for the productization story.** Rationale: If the pack cannot be installed until P2 and full promote matures in P5, John is selling custom implementation during the most important early demos. Recommendation: create a P1a `gtm_pack_demo` with seeded profiles, workflow templates, dashboard config, demo data, and slots; formal diff/plan/apply can remain P2/P5. Dependency fallout: early pack is demo/install-only, not a protected-environment promotion system.

11. **[gap] First-run onboarding is missing.** Rationale: A sellable pack fails commercially if JD must hand-wire HubSpot, Gmail, Calendar, KBs, vertical profiles, and demo data for every prospect/customer. Recommendation: add a first-run wizard: choose vertical, bind slots, upload/choose voice KB, run provider checks, import demo leads, create the first approval item.

12. **[gap] The ADR lacks a sales enablement artifact inside the pack.** Rationale: c16 requires the system to sell Wippy, not only run workflows; configs alone do not give John a repeatable pitch. Recommendation: ship a demo script, fixture narratives, before/after metric cards, and "what changed live" checklist as part of `gtm_pack`.

13. **[gap] CEO/investor reporting is absent or buried under generic dashboard.** Rationale: John needs proof that the platform creates pipeline, saves founder time, and improves conversion. Recommendation: add a P1 scorecard over the generic dashboard: leads researched, minutes saved, fit distribution, approval edit rate, drafts approved/sent, meetings booked, pipeline influenced, agent cost, and stage movement.

14. **[gap] Closed-loop conversion analytics are missing.** Rationale: Market state of the art includes outcome feedback into scoring and signal weighting; without it, the system is a task runner, not a learning GTM engine. Recommendation: from P1, log score/lane/recommendation against later stages and closed-won/lost outcomes; add P2 reporting for score accuracy and channel ROI.

15. **[gap] Mobile and notification surfaces for the approval queue are missing.** Rationale: The 15 min/day operating model fails if John must clear urgent briefs, replies, and provider failures from a desktop-only queue. Recommendation: P1 should include mobile-responsive cards plus email/Slack/push deep links for imminent-meeting briefs, high-intent replies, failed provider actions, and stale approvals.

16. **[gap] Approval volume is not budgeted against the 15 min/day promise.** Rationale: CRM merge reviews, value reviews, brief reviews, call follow-ups, signal route decisions, LinkedIn comments, posts, replies, handoffs, provider failures, quota overrides, and promotion reviews can easily exceed 50 items/day. Recommendation: add a review-budget model by item kind with max/day, SLA, batchability, and default destination; track "review minutes/day" as a first-class metric.

17. **[gap] The queue lacks variable-weight review tiers from the digest.** Rationale: Treating every output as a bespoke card encourages review fatigue and slows the funnel. Recommendation: define tiers: audit-only/no inbox, 30-second approve, edit-required before send/write, and high-risk full review; assign every module item kind to a tier before implementation.

18. **[gap] Batch review is missing for engagement and signal items.** Rationale: One-card-per-LinkedIn-comment or one-card-per-signal will consume the whole daily budget before briefs and replies. Recommendation: engagement drafts and low-risk signals should land in batch cards with approve selected, reject selected, regenerate selected, and top-N caps.

19. **[defer] Full identity tiers and merge review should not block the wedge.** Rationale: Exact email plus manual link/create is enough for inbound lead prep; ambiguous Fireflies speakers and LinkedIn-only identities become valuable when call intel/acquisition volume starts. Recommendation: keep P1 identity to exact email, HubSpot id, and safe manual correction; P2 full merge review remains gated by real ambiguous volume. Dependency fallout: call_intel cannot fully auto-link name-only speakers until P2.

20. **[gap] Per-contact memory is not turned into an early value surface.** Rationale: Memory lifts conversion by making briefs and follow-ups specific; if it stays a substrate detail, John cannot show why KickSide beats generic AI research. Recommendation: P1 brief view should include a "known context" panel from HubSpot activity, prior approved briefs, and voice KB excerpts; P1b writes approved summary back into contact memory.

21. **[reorder] Call intelligence may deserve earlier demo priority than promotion formalism.** Rationale: Digest names post-call processing as the highest personal time-save at 30-60 minutes per call. Recommendation: after P1a, ship a Fireflies fixture/manual-link call_intel demo that produces extraction + follow-up review before waiting on full identity/promotion, then harden it in P2.

22. **[reorder] Engagement drafts should be decoupled from outbound infrastructure.** Rationale: LinkedIn comments/posts are highly showable, low deliverability risk, and help sell the platform; live sequencing and sending are riskier. Recommendation: pull "draft-only engagement" to P2 as a demo checkpoint, while leaving posting, sequences, quota, and Instantly send mechanics in P4.

23. **[defer] Live outbound sending should not be in the first sold demo.** Rationale: Deliverability is a hard bought capability and a reputation risk; showing reviewed drafts and enrollment intent sells safer than sending live. Recommendation: demo "approved enrollment request" and suppression logic first; require live Instantly send only when a pilot explicitly needs it.

24. **[reorder] Delivery handoff is commercially too late if all of `deal_intel` waits for P5.** Rationale: The digest calls Deal -> PM handoff the most fragile workflow, and it is a strong agency-buyer proof point. Recommendation: add a P2/P3 showable handoff from a closed-won fixture or call summary to PM-ready brief; keep full reply classification, SOW, and stage gates in P5.

25. **[gap] Buying-committee/persona completeness is absent until buried in P5 deal_intel.** Rationale: Market buyers expect account mapping and missing-role detection as part of GTM intelligence. Recommendation: add a lightweight "committee map / missing roles" panel after call_intel starts producing participants and CRM roles; mark it advisory until full deal_intel.

26. **[gap] The ADR does not define a customer-safe compliance story for acquisition.** Rationale: LinkedIn scraping, website deanonymization, third-party intent, and outbound activation trigger buyer concern before technical architecture does. Recommendation: source declarations need jurisdiction, consent basis, allowed actions, unsubscribe/suppression, retention, and "no auto-send" policy fields; demo first with safe first-party/CSV sources.

27. **[gap] Agent configuration for live selling is too implicit.** Rationale: John needs to show "change the business logic without code," not just say the platform can. Recommendation: P1/P2 needs a constrained profile/template editor with version history for ICP lanes, scoring rubric, voice KB refs, and draft rules; full agent config can mature later.

28. **[gap] The KB/voice content dependency has no fallback.** Rationale: If the 20-file voice corpus is not ready or upload is clumsy, the first drafts will sound generic and damage the demo. Recommendation: ship a minimal seeded voice pack with the hard outbound rules, ICP lanes, objection handling, and 2-3 case studies; require evidence display to show which KB facts shaped the draft.

29. **[defer] `platform/enrichment` cost-ledger sophistication is not needed for the first value path.** Rationale: Waterfall/cost control matters once acquisition volume begins, but P1 owned-data-first briefs can succeed without Clay parity. Recommendation: prohibit ad-hoc enrichment inside `precall`; use WebScout/OCR/KB for P1 and build enrichment only when P3 acquisition volume creates provider spend.

30. **[gap] No explicit "do not claim market parity" boundary exists.** Rationale: The ADR references market state of the art, but P1 lacks many buyer-expected features: A/B testing, reply sentiment routing, buying-group modeling, field-level permissions, real-time collaboration, and revenue forecasting. Recommendation: attach a capability maturity label to each demo and pack: wedge, pilot, production, market-parity; prevent sales narrative from over-claiming.

31. **[gap] The generic dashboard primitive is underspecified for commercial proof.** Rationale: "Dashboard v1" appears in P1, while `platform/dashboard` lands "when consumed"; without concrete metrics it becomes an engineering placeholder. Recommendation: define P1 dashboard as a named business surface with exact cards and queries, even if implemented as a simple GTM view first and later moved to generic dashboard.

32. **[gap] Connection health is operationally useful but not demo-shaped.** Rationale: A grid of broken integrations does not sell unless it shows blast radius and recovery. Recommendation: first demo should show "HubSpot disconnected blocks writeback but brief still works, queue item explains fix, dependent workflows listed"; that makes resilience visible.

33. **[gap] The ADR lacks business kill gates for generic primitives.** Rationale: Generic primitives can consume months while John's funnel remains unchanged. Recommendation: every primitive stage must answer one of four tests before scheduling: widens funnel, speeds a stage, lifts conversion, or helps John sell Wippy; otherwise it moves behind the first sold demo unless it blocks a consequential side effect.

34. **[kill] Any module surface that only exists for architectural completeness should be cut from the first commercial scope.** Rationale: A buyer cannot value invisible constructor surfaces until they power a demoable workflow. Recommendation: remove from first-scope promises any UI, node, projection, or portable artifact not used by P1a/P1b demo, acquisition slice, or pack install; keep the contract seam documented for later.

## Module and Stage Cuts

- `gtm_core`: keep vertical profile, Score fit, voice/KB refs, and connection-health affordance; defer broad traits/tools until an agent or demo uses them.
- `gtm_pack`: move demo pack to P1a; defer protected-environment promotion rigor to P2/P5.
- `contacts`: keep exact email/HubSpot id/manual correction in P1; defer full ambiguous identity, job-change, and merge-review volume handling to P2.
- `precall`: keep as first wedge, but split no-write brief review from writeback.
- `call_intel`: pull a fixture/manual-link demo earlier than full P2 if John needs immediate time-save proof.
- `signals_gtm`: pull thin acquisition source/list/filter/routing to P1/P2; leave durable anti-fatigue queue and waterfall enrichment for P3.
- `engagement`: pull draft-only LinkedIn/post review earlier; leave live posting and outbound coupling for P4.
- `deal_intel`: pull delivery-handoff demo earlier; leave full deal intelligence and SOW production for P5.
- `platform/outbound` and `quota`: defer live send mechanics; demo enrollment intent and suppression first.
- `platform/enrichment`: defer until acquisition volume creates provider spend; do not let `precall` grow an internal waterfall.
- `platform/dashboard`: either build the P1 CEO scorecard now or stop naming dashboard v1 as value.
- W-A/canon/CRM stages: keep the minimum needed for demo rewiring, exact resolve, inbox review, and approved side effects; defer broad migrations and purity gates.

## Shortest Credible Paths

**First demoable moment, 1-2 weeks if scoped hard:** fixture/manual lead -> exact email resolve or create -> read HubSpot if configured -> voice KB + OCR/WebScout -> Score fit first -> brief + draft reply -> `brief_review` inbox item -> edit/regenerate/approve disabled. No HubSpot writeback, no Gmail draft, no full promotion, no full identity.

**First useful dogfood moment, 2-3 weeks:** real inbound webhook -> same P1a flow -> John uses the brief for a call -> dashboard records minutes saved and approval edits -> no external side effects until P1b.

**First sold constructor demo, 3-4 weeks:** install demo pack -> run sample lead -> live edit ICP lane/voice rule/source binding -> rerun and show changed output -> show approval queue on mobile -> show provider slot diagnostics -> show no-send policy -> show CEO scorecard. This sells the platform without pretending outbound, enrichment, or full CRM parity are done.

**First pipeline-generation demo, 4-5 weeks:** import a small LinkedIn/CSV/webscout source -> ICP filter -> suppress low-fit rows -> route top prospects to research/draft -> batch review. No live send.

## Five Changes That Most Improve Time-to-Business-Value

1. Split P1 into no-write P1a and side-effect P1b so the first brief reaches John's inbox before CRM/outbox/storage gates.
2. Pull a thin lead-acquisition slice forward: source declaration, ICP-filtered list, top-N routing, no-send draft review.
3. Ship a P1a demo pack with fixtures, seeded verticals, voice KB, workflows, dashboard cards, and slot diagnostics before full promotion.
4. Add demo acceptance gates for the constructor scenario: live ICP/profile/binding change, rerun, visible changed output, install into clean workspace.
5. Add queue economics now: review tiers, batch cards, top-N caps, mobile notifications, and a review-minutes/day dashboard.
