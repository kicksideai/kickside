# Consolidation sources

The maintained source is this directory. The historical lane scripts provide the
product contracts below; their machine-specific launchers, fixture injection,
mock models, and release publishing tools do not form part of published smoke.
No runtime imports depend on scratch lanes.

| Historical source under `scratchpad/sol-lanes/` | Maintained implementation |
| --- | --- |
| `e2e-onboarding/run.py` (combined 11-scenario runner) | `runtime.Instance`, registry selection, product Hub installation, CRM schema/records, Data Sync and native schedule checks |
| `e2e-onboarding/onboarding.py`, `full_flow.py` | `platform_onboarding`, `member_access`, shared `Browser` and restart lifecycle |
| `e2e-onboarding/inbox_restart.py` | `workflow_inbox_restart`: durable review identity, approval/rejection, duplicate response conflict, second-restart completion uniqueness; uses shipped blocks |
| `release-0144/published_proof.py`, `verify_published.py`, `published-install-validation.py` | Published deployment root/manifest validation, real PDF marker, streaming, same-session continuation, explicit cleanup/result aggregation |
| `release-0145/published_proof.py` | Current live capability catalog and default agent traits; optional modules install through product Hub |
| `onboarding-final/moved-from-module/e2e/new_user_path.py`, `stream_evidence.py` | Assistant-only DOM sampling, at least three incremental updates, websocket chunk/content evidence, member personal prompt |
| `qa-platform/kb_lifecycle.py`, `deep_knowledge.py`, `deep_workflows.py`, `mcp_webhooks.py`, `upload_lifecycle.py` | KB ingest/ask/citations, workflow review, scoped MCP, webhook schema/revocation and converter terminal states |
| `qa-apps/qa.py`, `knowledge_api.py`, `remaining_api.py`, `install_modules.py`, browser surface proofs | CRM events/projections, root/folder entry creation, breadcrumbs, dashboard, research and member boundaries |
| `qa-flows/steps/`, combined `qa.py` | Product workflow commands, research, sync destinations and boundary requests; one maintained implementation per feature |
| `qa-providers/provider-api.py`, `mcp-connection.py`, provider browser proofs | Provider discovery and credential form inspection, scoped credential revocation |
| `fix-upload-notify/browser_proof.py`, `fix-attachments/` | Browser upload completion notification, no remaining Processing state, attachment UUID persistence, assistant reads PDF marker |
| `fix-session-compat/browser_gate.py` | One initial session/message, streamed content, durable same-session restart continuation |

The combined runner's fixture-heavy `basic`, `ui`, `workflow_a47`, `identity`,
`a48_delete`, and `crash` checks remain lower-level product/runtime regression
coverage. Smoke consolidates their product API, failure, browser and cleanup
mechanisms and uses shipped product blocks/ports. `product`, `crm_sync`,
`inbox_restart`, `full_flow`, and `first_agent` map to the maintained scenarios
above. Runtime framework testing remains with its existing owner.
