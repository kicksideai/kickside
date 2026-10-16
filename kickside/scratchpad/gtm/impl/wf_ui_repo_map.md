# Repo map: .

_57 files, leaf model `gemma-4-26b`, reduce model `gemma-4-26b`._

> This directory initializes the KickSide workflow builder ecosystem by registering core custom elements via Vue. It also provides the centralized CSS design system and visual variables used across the component suite.

## Architecture

- **./** — This directory serves as the entry point and styling foundation for the KickSide workflow builder web components.
  - `index.ts` — Entry point that defines and registers the KicksideWorkflowBuilder custom element using Vue.
  - `styles.css` — Defines the visual design system, CSS variables, and component styles for the workflow builder interface.
  - `workflow_setup.ts` — Defines and registers the KicksideWorkflowSetupElement web component using a Vue-based wrapper.
  - **app/** — This directory provides the core application logic and UI components for building, simulating, and managing visual, node-based automation workflows.
    - `NodeConfigPanel.vue` — A Vue component that provides a right-side inspector panel for configuring workflow nodes, edges, and notes.
    - `Palette.vue` — Provides a searchable, categorized sidebar component for dragging and placing catalog items, notes, and frames onto a canvas.
    - `RunNodeOutput.vue` — A read-only side panel component that displays the input and output data for a specific node within a historical workflow run.
    - `RunsPanel.vue` — A Vue component that displays a list of past workflow runs in a popover and emits a selection event.
    - `SchemaEditor.vue` — A universal editor component for managing JSON schemas or data values via code (JSON) or form views, including an AI-assisted schema drafting feature.
    - `WorkflowBuilder.vue` — Acts as a router and container component that switches between a workflow creation form, a workflow list, or a specific workflow canvas based on props.
    - `WorkflowCallPicker.vue` — A Vue component that provides a searchable selection interface for choosing published partial workflows.
    - `WorkflowCanvas.vue` — The primary canvas component for building, simulating, and inspecting visual workflows using a node-based graph editor.
    - `WorkflowList.vue` — Provides a user interface for listing, searching, creating, and installing workflow templates.
    - `WorkflowSetup.vue` — Provides a form interface for configuring and installing new automation workflows.
    - `api.test.ts` — Unit tests for the workflow and template API client functions.
    - `api.ts` — Provides a typed client for interacting with the workflow definition, execution, and template APIs via an authenticated proxy.
    - `assist-schema.test.ts` — Unit tests for the assist-schema utility functions using Vitest.
    - `assist-schema.ts` — Provides a client-side interface for interacting with the AI schema assistance API.
    - `assist.test.ts` — Unit tests for the assistEdgeMapping function and isAssistTransform type guard.
    - `assist.ts` — Manages API requests to the workflow edge-assist endpoint to generate field mappings using AI.
    - `catalog.test.ts` — This file contains unit tests for the catalog loading, extension kind registration, and catalog grouping logic.
    - `catalog.ts` — Aggregates and transforms various platform registries (sinks, tools, agents, and extension kinds) into a unified catalog of nodes for the UI palette.
    - `commands.ts` — Provides builder functions to create command envelope objects for workflow modifications.
    - `connect-validation.test.ts` — Unit tests for connection schema validation and structural integrity logic.
    - `connect-validation.ts` — Validates schema compatibility and structural legality of connections between nodes.
    - `ext-config.test.ts` — Unit tests for the extension configuration schema adapter.
    - `ext-config.ts` — Provides utility functions to transform raw JSON schemas into structured configuration field maps.
    - `form-builder.test.ts` — Unit tests for the form builder utility functions.
    - `form-builder.ts` — Provides core logic for managing form field definitions, key normalization, and JSON schema synthesis.
    - `frame.ts` — Defines shared constants and types for managing the geometry and persistence of resizable notes and frames.
    - `graph-sync.test.ts` — Unit tests for the graph synchronization logic, covering node data transformation, edge handle binding, container derivation, and geometry clamping.
    - `graph-sync.ts` — Transforms a workflow document into VueFlow-compatible nodes, edges, and container layouts with automatic DAG positioning.
    - `http-error.test.ts` — Provides unit tests for the httpStatus utility function.
    - `http-error.ts` — Extracts an HTTP status code from an unknown error object, supporting both Axios-style and flat structures.
    - `human-node.ts` — Defines the configuration schema and output port labeling logic for human-decision nodes.
    - `json-field.test.ts` — Unit tests for the parseJsonObject function.
    - `json-field.ts` — Provides utility for parsing free-text strings into plain JSON objects with error handling.
    - `keymap.ts` — Provides pure logic for mapping keyboard events to application actions while filtering for editable input targets.
    - `kinds.ts` — Defines the semantic identity, visual metadata, and port configurations for all node kinds, including core engine nodes and runtime extensions.
    - `labels.test.ts` — Unit tests for label formatting and identification utility functions.
    - `labels.ts` — Provides utility functions to transform machine-readable identifiers and namespaced strings into human-readable display titles.
    - `placement.test.ts` — Provides unit tests for the cascade placement logic.
    - `placement.ts` — Calculates coordinate offsets for a cascading click-to-place placement pattern.
    - `run-history.test.ts` — Unit tests for run history utility functions.
    - `run-history.ts` — Provides pure utility functions for formatting, sorting, and labeling run history data for display.
    - `run-overlay.test.ts` — Unit tests for the run overlay logic, including node status normalization and state derivation from headers.
    - `run-overlay.ts` — Manages the state machine and status normalization for rendering a live workflow run overlay.
    - `run-samples.test.ts` — Unit tests for the extractOutputSample function to ensure correct data extraction from node data rows.
    - `run-samples.ts` — Extracts input and output data samples from run dataflow rows for edge assist mapping.
    - `sync.test.ts` — Unit tests for the synchronization engine, event application logic, and document state normalization.
    - `sync.ts` — Manages real-time document synchronization by applying event patches, handling optimistic updates, and suppressing local layout echoes.
    - `types.ts` — Defines the core type system and command constants for the workflow builder's DAG structure, canvas state, and event synchronization.
    - `workflow-call.test.ts` — Unit tests for workflow candidate analysis and schema summary logic.
    - `workflow-call.ts` — Defines types and utility functions for analyzing and summarizing workflow execution candidates and their schemas.
    - **app/nodes/** — This directory provides the visual Vue components used to represent various node types within a workflow graph.
      - `ContainerNode.vue` — Renders a visual wrapper component for workflow container nodes like loops or parallel execution blocks.
      - `FrameNode.vue` — A Vue component representing a visual grouping frame node with resizing capabilities.
      - `NoteNode.vue` — A Vue component representing a resizable, color-coded sticky note node that renders markdown content.
      - `WorkflowNode.vue` — Renders a visual representation of a single workflow step node within a Vue Flow graph.

## Anomalies

- **[hub:fan-out]** app/NodeConfigPanel.vue  (14) — imports many modules
- **[hub:fan-out]** app/WorkflowCanvas.vue  (12) — imports many modules
- **[hub:fan-in]** app/types.ts  (15) — imported by many
- **[hub:fan-in]** app/api.ts  (13) — imported by many
- **[dir]** app/nodes: NoteNode.vue contains risky error handling where markdown loading errors are swallowed.
- **[dir]** app: api.ts contains architectural smells including manual type casting, hardcoded translations, and risky error handling in its simulation logic.
- `app/api.ts`: Manual type casting and complex object mapping for API responses; hardcoded error message translations; risky error handling in `simulateWorkflow` that relies on detecting SPA fallback behavior.
- `app/nodes/NoteNode.vue`: Risky error handling (swallowed error in onMounted markdown loader).

## Coupling

Resolved 100 file→file edges across 1 directory→directory edges.

- Top external deps: vitest (17), vue (13), @iconify/vue (12), @wippy-fe/proxy (12), @vue-flow/core (4), @widgets/app/WcMount.vue (4), @widgets/app/ports (4), @wippy-fe/webcomponent-vue (4), ./SchemaEditor.vue (2), ./styles.css?inline (2), @vue-flow/node-resizer (2), @widgets/app/useParentId (2)
