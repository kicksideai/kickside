# Contact Intelligence Graph

## Wippy Identity Resolution Design

**Version:** 1.0  
**Date:** April 2026  
**Owner:** JD (KickSide build), Johnny (requirements)  
**Status:** Design spec for KickSide native implementation

## Overview

The Contact Intelligence Graph is the unified data model and resolution system that turns fragmented contact data from multiple sources (HubSpot, Fireflies, Instantly, Clay, email threads, call attendees) into canonical contact records with rich relationship context.

**Core problem:** The same person appears in our systems multiple ways:

- john.smith@acme.com in HubSpot

- John Smith on a Fireflies call (no email)

- jsmith@acme.com replied to an Instantly campaign

- John S. added to a calendar invite

- Clay enrichment shows John Smith, VP Engineering at Acme Corp

Without identity resolution, agents treat these as 4 different people. With it, they're one contact with a complete history.

## Architecture

┌─────────────────────────────────────────────────────────────────────┐

│ CONTACT INTELLIGENCE GRAPH │

├─────────────────────────────────────────────────────────────────────┤

│ │

│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │

│ │ HubSpot │ │ Fireflies │ │ Instantly │ │

│ │ Contacts │ │ Attendees │ │ Contacts │ │

│ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ │

│ │ │ │ │

│ └───────────────────┼───────────────────┘ │

│ ▼ │

│ ┌─────────────────────┐ │

│ │ IDENTITY RESOLVER │ │

│ │ │ │

│ │ • Email matching │ │

│ │ • Name + Company │ │

│ │ • LinkedIn URL │ │

│ │ • Confidence score │ │

│ └──────────┬──────────┘ │

│ │ │

│ ▼ │

│ ┌─────────────────────┐ │

│ │ CANONICAL CONTACT │ │

│ │ │ │

│ │ • Merged identity │ │

│ │ • All known emails │ │

│ │ • Engagement hist │ │

│ │ • Per-contact KB │ │

│ └──────────┬──────────┘ │

│ │ │

│ ┌───────────────────┼───────────────────┐ │

│ ▼ ▼ ▼ │

│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │

│ │ COMPANY │ │ DEAL │ │ ACTIVITY │ │

│ │ GRAPH │ │ GRAPH │ │ STREAM │ │

│ └─────────────┘ └─────────────┘ └─────────────┘ │

│ │

└─────────────────────────────────────────────────────────────────────┘



## Identity Resolution Logic

### 1. Primary Keys (Strongest Match)

These are definitive identifiers. If they match, it's the same person.

| **Identifier** | **Source** | **Confidence** |
|----|----|----|
| Email address (exact) | HubSpot, Instantly, Fireflies, email threads | 100% |
| LinkedIn URL | Clay enrichment, manual entry | 100% |
| HubSpot Contact ID | HubSpot | 100% (within HubSpot) |

**Rule:** If email matches exactly → merge immediately, no human review.

### 2. Secondary Keys (High Confidence)

These require additional validation but are strong signals.

| **Identifier Combo** | **Source** | **Confidence** | **Action** |
|----|----|----|----|
| Full name + Company domain | Fireflies attendee, calendar | 85-95% | Auto-merge if company matches |
| Full name + Email domain | Any source | 90% | Auto-merge |
| Phone number (normalized) | HubSpot, enrichment | 95% | Auto-merge |

**Rule:** If name + company match AND no conflicting email exists → auto-merge with flag for review.

### 3. Fuzzy Matching (Requires Review)

These need human confirmation before merging.

| **Signal** | **Example** | **Confidence** | **Action** |
|----|----|----|----|
| Name variation + same company | "John Smith" vs "J. Smith" at Acme | 70% | Route to Inbox → Identity tab |
| Same name, different email domain | [<u>john@acme.com</u>](mailto:john@acme.com) vs [<u>john.smith@gmail.com</u>](mailto:john.smith@gmail.com) | 50% | Route to Inbox → Identity tab |
| Email prefix match + same company | jsmith@ vs john.smith@ at same domain | 60% | Route to Inbox → Identity tab |

**Rule:** Confidence \< 85% → create merge candidate, surface in KickSide Inbox Identity tab for human decision.

## Canonical Contact Schema

Every resolved contact has this structure in KickSide:

{

"canonical_id": "contact_abc123",

"confidence_score": 95,

"resolution_method": "email_exact_match",

"last_resolved": "2026-04-07T14:30:00Z",

"identity": {

"primary_email": "john.smith@acme.com",

"all_emails": \[

"john.smith@acme.com",

"jsmith@acme.com"

\],

"full_name": "John Smith",

"name_variations": \["John S.", "J. Smith"\],

"linkedin_url": "https://linkedin.com/in/johnsmith",

"phone": "+1-555-123-4567"

},

"company": {

"name": "Acme Corp",

"domain": "acme.com",

"hubspot_company_id": "12345678"

},

"role": {

"title": "VP Engineering",

"seniority": "VP",

"department": "Engineering",

"role_in_deal": \["Champion", "Decision Maker"\]

},

"source_records": \[

{

"source": "hubspot",

"source_id": "hs_contact_98765",

"first_seen": "2024-06-15",

"last_synced": "2026-04-07T14:30:00Z"

},

{

"source": "fireflies",

"source_id": "ff_attendee_xyz",

"first_seen": "2026-03-20",

"last_synced": "2026-03-20"

},

{

"source": "instantly",

"source_id": "inst_contact_abc",

"first_seen": "2026-01-10",

"last_synced": "2026-04-01"

}

\],

"external_ids": {

"hubspot_contact_id": "98765",

"hubspot_company_id": "12345678",

"instantly_contact_id": "inst_contact_abc",

"clay_person_id": "clay_person_789"

},

"per_contact_memory": {

"kb_id": "kb_contact_abc123",

"last_updated": "2026-04-06",

"entry_count": 23

}

}



## Resolution Workflows

### Workflow 1: New Fireflies Call Attendee

Fireflies webhook → KickSide receives transcript with attendee list

│

├─ For each attendee:

│ │

│ ├─ Has email? ──────────────────────────────────────┐

│ │ │ │

│ │ YES → Search by email │

│ │ │ │

│ │ ├─ Found → Merge activity to existing │

│ │ │ │

│ │ └─ Not found → Create new canonical │

│ │ contact, enrich via Clay │

│ │ │

│ └─ No email ────────────────────────────────────────┤

│ │ │

│ └─ Extract name + company from context │

│ │ │

│ ├─ High confidence match → Auto-merge │

│ │ │

│ ├─ Medium confidence → Inbox Identity │

│ │ │

│ └─ No match → Create unresolved record │

│ Flag for enrichment │

│

└─ Update all matched contacts with call summary

### Workflow 2: Instantly Reply Received

Instantly reply webhook → KickSide

│

├─ Extract reply-from email

│

├─ Search canonical contacts by email

│ │

│ ├─ Found →

│ │ │

│ │ ├─ Update engagement_history

│ │ ├─ Update lead_temperature → "Warm"

│ │ ├─ Update last_meaningful_touch

│ │ ├─ Trigger Reply Classifier agent

│ │ └─ Sync to HubSpot

│ │

│ └─ Not found (shouldn't happen, but handle it) →

│ │

│ ├─ Create canonical contact from Instantly data

│ ├─ Flag: "Reply from unknown contact"

│ └─ Route to Inbox → Identity tab

│

└─ Log activity to contact's per-contact memory

### Workflow 3: HubSpot Contact Created/Updated

HubSpot polling detects new/updated contact → KickSide

│

├─ Search KickSide by email

│ │

│ ├─ Found →

│ │ │

│ │ ├─ Merge HubSpot data into canonical

│ │ ├─ Update external_ids.hubspot_contact_id

│ │ ├─ Update wippy_last_wippy_sync timestamp

│ │ └─ Check for field conflicts (see Conflict Resolution)

│ │

│ └─ Not found →

│ │

│ ├─ Create new canonical contact

│ ├─ Set source_records\[0\] = hubspot

│ └─ Queue for Clay enrichment

│

└─ Update wippy_last_hubspot_sync in HubSpot



## Conflict Resolution

When two sources disagree on a field value:

### Rule 1: Most Recent Wins (Mutable Fields)

For fields that change over time, use the most recently updated value.

| **Field** | **Conflict Example** | **Resolution** |
|----|----|----|
| title | HubSpot: "Director" (2025), Clay: "VP" (2026) | Use Clay ("VP") |
| phone | Fireflies: +1-555-1234, HubSpot: +1-555-9999 | Use most recently verified |
| company | Old: Acme Corp, New: Beta Inc (job change) | Use new, flag job change |

### Rule 2: Enrichment Source Priority (Static Fields)

For fields that don't change, prefer enrichment sources over manual entry.

| **Priority** | **Source** | **Trust Level** |
|----|----|----|
| 1 | Clay/Apollo (enrichment) | Highest — verified from multiple sources |
| 2 | LinkedIn (via enrichment) | High — user-maintained |
| 3 | HubSpot (manual entry) | Medium — may be stale |
| 4 | Fireflies (extracted) | Low — inferred from context |
| 5 | Instantly (uploaded list) | Low — bulk uploaded, may be outdated |

### Rule 3: Never Overwrite Human Decisions

Fields explicitly set by a human in KickSide are protected:

| **Protected Field** | **Why** |
|----|----|
| role_in_deal | Human assigned Champion/Decision Maker/Blocker |
| relationship_warmth (if manually set) | Human judgment overrides signals |
| recommended_next_action (if edited) | Human refined the agent suggestion |

**Implementation:** Each field has a source and locked_by_human flag. If locked_by_human = true, agents can suggest changes but not overwrite.

## Merge Candidates (Identity Tab)

When resolution confidence is between 50-85%, KickSide creates a merge candidate and surfaces it in the Inbox → Identity tab.

### Merge Candidate Schema

{

"merge_candidate_id": "merge_001",

"created_at": "2026-04-07T10:00:00Z",

"status": "pending",

"contact_a": {

"canonical_id": "contact_abc123",

"email": "john.smith@acme.com",

"name": "John Smith",

"company": "Acme Corp",

"source": "hubspot"

},

"contact_b": {

"canonical_id": "contact_xyz789",

"email": null,

"name": "John S.",

"company": "Acme Corp",

"source": "fireflies"

},

"match_signals": \[

{"signal": "name_fuzzy_match", "score": 0.85},

{"signal": "same_company", "score": 1.0},

{"signal": "same_call_attendee", "score": 0.9}

\],

"confidence_score": 78,

"recommendation": "likely_same_person",

"resolution": null,

"resolved_by": null,

"resolved_at": null

}

### UI Actions in Identity Tab

| **Action** | **Result** |
|----|----|
| **Merge** | Combine into single canonical contact, preserve all history |
| **Not Same Person** | Mark as distinct, add to "do not merge" list |
| **Merge & Set Primary** | Merge and designate which email/name is primary |
| **Skip** | Leave unresolved, will resurface if more signals appear |

## Per-Contact Memory

Every canonical contact has their own knowledge base that builds over time. This is what makes the system intelligent — agents don't just have data, they have context.

### What Goes Into Per-Contact Memory

| **Event Type** | **What's Stored** | **Example** |
|----|----|----|
| Call summary | Key topics, pain points, objections, next steps | "Discussed CPQ pain. 6 months with Workato failed. Budget approval needed from CFO Sarah." |
| Email exchange | Sent/received summary, tone, commitments | "Sent pricing on 4/1. No response yet. Mentioned Q2 planning as blocker." |
| Deal stage change | What changed, why | "Moved to Contract Sent. Champion confirmed budget approved." |
| Agent interaction | What agent suggested, what human approved/rejected | "Follow-up email suggested, approved with minor edits." |
| Enrichment update | Job change, company news, funding | "Promoted to VP Engineering (detected 3/15/26 via Clay)." |
| Manual note | Human-added context | "Met at conference. Warm intro from Duke Skarda." |

### Memory Structure

{

"kb_id": "kb_contact_abc123",

"canonical_contact_id": "contact_abc123",

"entries": \[

{

"entry_id": "entry_001",

"timestamp": "2026-04-06T15:30:00Z",

"type": "call_summary",

"source": "fireflies",

"source_id": "ff_call_12345",

"content": "Discovery call. Pain: manual quoting takes 2 hours per deal. Tech stack: SAP, Salesforce. Budget: \$100-150k. Decision timeline: Q2. Champion: John. Blocker: CTO skeptical of AI after failed Workato project.",

"extracted_fields": {

"pain_points": \["manual quoting", "2 hours per deal"\],

"tech_stack": \["SAP", "Salesforce"\],

"budget_range": "100-150k",

"objections": \["CTO skeptical of AI"\],

"decision_timeline": "Q2"

}

},

{

"entry_id": "entry_002",

"timestamp": "2026-04-07T09:00:00Z",

"type": "email_sent",

"source": "hubspot",

"source_id": "hs_email_67890",

"content": "Sent follow-up with CPQ case study and pilot pricing. Mentioned 30-day pilot option.",

"extracted_fields": {

"assets_sent": \["CPQ case study", "pilot pricing"\],

"offers_made": \["30-day pilot"\]

}

}

\],

"summary": {

"last_updated": "2026-04-07T09:00:00Z",

"relationship_stage": "active_opportunity",

"key_pain": "Manual quoting process taking 2 hours per deal",

"primary_objection": "CTO skeptical after failed Workato project",

"next_action": "Follow up in 5 days if no response to case study",

"warm_intro_source": "Duke Skarda"

}

}

### How Agents Use Per-Contact Memory

| **Agent** | **How It Uses Memory** |
|----|----|
| **Pre-Call Research Brief** | Loads full memory, summarizes past interactions, highlights open objections |
| **Post-Call Processing** | Adds new entry, updates summary fields, detects changes in sentiment |
| **Follow-Up Email Generator** | References specific past discussions, maintains consistency in offers |
| **Deal Health Monitor** | Checks days since last touch, identifies stalled patterns |
| **Reply Classifier** | Uses context to classify tone (e.g., "polite decline" vs "buying signal") |

## Sync Protocol

### KickSide → HubSpot (Outbound)

KickSide is the source of truth for intelligence fields. It pushes to HubSpot.

| **Trigger**                    | **What Syncs**                        |
|--------------------------------|---------------------------------------|
| Agent updates a contact        | wippy\_\* fields sync to HubSpot      |
| Human approves action in Inbox | Relevant fields + activity logged     |
| Daily batch (7am)              | All contacts with changes in last 24h |

**Sync fields:** All wippy\_\* prefixed fields defined in HubSpot.

**Does NOT sync:** Per-contact memory content (stays in KickSide only).

### HubSpot → KickSide (Inbound)

HubSpot is the source of truth for CRM data. KickSide polls for changes.

| **Trigger**                    | **What Syncs**                         |
|--------------------------------|----------------------------------------|
| Polling interval (every 5 min) | New/updated contacts, deals, companies |
| Webhook (if configured)        | Real-time contact/deal updates         |

**Sync fields:** All standard HubSpot contact/deal fields + custom properties.

**Conflict handling:** See Conflict Resolution section above.

### Sync Timestamps

Both systems maintain timestamps for debugging:

| **Field** | **Location** | **Updated When** |
|----|----|----|
| wippy_last_hubspot_sync | HubSpot Contact | KickSide writes to HubSpot |
| wippy_last_wippy_sync | HubSpot Contact | KickSide reads from HubSpot |
| last_synced in source_records\[\] | KickSide | Each source syncs |

## Deduplication Rules

### Automatic Dedup (No Review)

| **Condition**                    | **Action**        |
|----------------------------------|-------------------|
| Exact email match                | Merge immediately |
| Same LinkedIn URL                | Merge immediately |
| Same phone (normalized to E.164) | Merge immediately |

### Flagged for Review

| **Condition**                             | **Action**            |
|-------------------------------------------|-----------------------|
| Same name + same company, different email | Route to Identity tab |
| Same email prefix, same domain            | Route to Identity tab |
| Confidence 50-85% on any match            | Route to Identity tab |

### Never Auto-Merge

| **Condition**                    | **Reason**                              |
|----------------------------------|-----------------------------------------|
| Different company domains        | Could be job change or different person |
| Conflicting first names          | "John" vs "Jane" at same company        |
| Already marked "not same person" | Human decided, respect it               |

## Implementation Checklist

### Phase 1: Core Resolution (JD — This Week)

- Email exact match resolution

  Source record tracking (which system each contact came from)

  External IDs mapping (HubSpot, Instantly, Fireflies IDs)

  Basic merge UI in Inbox → Identity tab

### Phase 2: Fuzzy Matching (Next 2 Weeks)

- Name + company matching logic

  Confidence scoring algorithm

  Merge candidate creation and routing

  "Not same person" exclusion list

### Phase 3: Per-Contact Memory (After Connections Live)

- Memory schema and storage

  Call summary → memory entry flow

  Email → memory entry flow

  Memory summarization (rolling summary field)

### Phase 4: Clay Integration

- Job change detection → memory entry + flag

  Enrichment data → canonical contact merge

  Enrichment priority logic

## Open Questions for JD

1.  **Polling vs Webhooks:** Is KickSide using polling for HubSpot, or can we set up webhooks for real-time sync?

2.  **Identity tab status:** Is the Identity tab in Inbox functional? What actions does it support today?

3.  **Memory storage:** Is per-contact memory stored in SQLite, or does it use a different storage layer?

4.  **Clay integration path:** Does Clay data flow through HubSpot first, or can KickSide pull directly from Clay API?

5.  **Confidence threshold:** Is 85% the right auto-merge threshold, or should it be higher/lower based on your testing?

*Contact Intelligence Graph — Wippy Identity Resolution Design v1.0*  
*For KickSide implementation — April 2026*
