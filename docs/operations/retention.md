# Retention

Retention removes durable data through the owning module’s policy and lifecycle. Core thread events, write receipts, projections, uploads, and CRM receipts have different responsibilities.

| Owner | Source default | Purpose |
| --- | --- | --- |
| Core policy | Events: 90 days; orphan receipts: 30 days | Bounded cleanup of thread events and write receipts |
| CRM | Aggregate events: 365 days | CRM thread history policy |
| CRM | Write origins and sink receipts: 30 days | Idempotency and delivery receipt lifecycle |

Core applies retention safety rules and pins around consumers that still need history. Upload read-model cleanup asks Core for the safe prune boundary. CRM’s receipt cleanup runs through a registered retention owner.

Inspect installed policy definitions before changing a retention window. Registry configuration and module settings can alter the source defaults. Shorter windows affect available history and receipt-based retry behavior; backups retain only the state captured at backup time.

Use module lifecycle and retention APIs for cleanup. Direct SQL deletion bypasses ownership, projection cursors, and access lifecycle. File bytes and derived metadata can require separate owner cleanup.

See the [thread and projection handbook](../kickside-development/03-threads-events-projections.md), [CRM reference](https://github.com/kicksideai/crm/blob/main/docs/module.md), and [backups](backups.md).
