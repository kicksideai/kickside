# Calendar → brief: migrate hardcoded provider logic to a playbook composition

Owner's thin-provider principle: providers stay thin (auth + raw pull/push); orchestration logic must live in configurable workflows/automations, not hardcoded in a provider. The calendar→pre-call-brief feature currently ships as provider-embedded logic in `providers/google` (calendar source: connection, lookahead_hours 24, lead_time_minutes 30, internal_domains; plus the precall calendar→brief installable declaration — commits 9e682c3, 0bd84f9).

## Task
Refactor so the google provider keeps ONLY the thin pull (fetch upcoming events for a connection window) and the decision logic (external-attendee detection via internal_domains, lead-time gating, dedup against already-briefed meetings, brief kickoff) moves into a declared, user-visible composition:
- Either a workflow definition (template-backed declarative nodes) wired through the existing installable, or an automation script under the catalog — pick the shape that keeps the one-click `Set up` experience in System > Automations working exactly as it does now.
- Config (lookahead, lead time, internal domains) must surface in the installable's config form, not provider constants.
- The provider's pull must be reusable by OTHER compositions (it is a capability, not a feature).

## Constraints
- No parallel paths: retire the embedded logic in the SAME change; the installable keeps working end to end (calendar event → brief awaiting review).
- Tests: providers repo + wapps suites green; add coverage for the moved decision logic (pure function preferred).
- Flow points canon = `kickside.workflows:flow_points` in platform/workflows; declare `meta.type: kickside.flow.point` registry entries if you add an injection point (a "should this meeting get a brief?" point is a natural fit — add it ONLY if it does not complicate the one-click experience).
- Declarative everywhere; files ~300 lines; present-tense comments; no emoji.
- Commit scoped per repo, do NOT push, exclude node_modules.

Report: what moved where, commits, test counts, verification of the end-to-end installable.
