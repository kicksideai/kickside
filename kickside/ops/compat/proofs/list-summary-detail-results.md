# List summaries and complete detail

Owner approval: 2026-10-15 owner: lists are compact summary rows; detail returns the whole object

Workspace kind discovery returns paged value/label/icon/creatable/container rows. The provider's UI discovery retains its complete creation and management configuration. ListWorkspaceEntries returns entry identity, name, type, status, owner, dates and navigation fields; GetWorkspaceEntry returns all stored metadata.

JournalQuery and QueryJournalGraph return summary rows for catalog, search, semantic, hybrid, timeline, evidence and changes. The fields input selects extra content. Their node, context, window, subtree and bundle detail reads retain complete objects. ReadJournal's event view returns a complete stored event. The removed JournalQuery output detail marker does not select or remove record content; fields and the requested read mode determine the response.

CRMListRecords returns identity, dates and name/title/status/owner values. The fields input selects other values. CRMGetRecord returns all values and associations. CRMGetTimeline pages activity summaries; fields=["payload"] reads complete activity content. QueryRoadmap pages derived summary arrays, while GetRoadmap retains complete descriptions and properties.

Native regression evidence covers default summaries, explicit fields, complete detail and continuation in crm_tool_shapes_test, journal_backend_e2e_test, journal_graph_projection_test, workspace_trait_bounds_test, entry_types_dynamic_test and roadmap_backend_e2e_test. Smoke guards carry the LISTS-* issue ids for both engines. No registry identity, stored row, migration, endpoint, requirement or event type changes.
