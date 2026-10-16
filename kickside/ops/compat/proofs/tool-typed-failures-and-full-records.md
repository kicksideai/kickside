# Typed tool failures and full provider records

Owner approval: `2026-10-15 owner: tools return full structured results`.

Tools return a result value on success, `(nil, typed error)` for refused
access, missing records, invalid stored state and store or transport failures,
and a `{ success = false, error }` domain error only for a domain outcome.
Provider reads return full records, so flags that selected a reduced record
are removed.

- ReadJournal has one read path that returns full stored records. The `detail`
  input and the compact-lens `facts_detail` output are removed. Proof: chestor
  journal native test `backend_e2e_test` case "returns strict recovery reads as
  full stored records".
- HubSpot ReadTool always returns full property definitions; the
  `include_property_details` input is removed. Proof: hubspot
  `suites/traits_test` case "pages full property definitions".
- PhantomBuster GetTool always reads a container with its result object,
  output, runtime events and neighbours; the four `include_*` inputs are
  removed. Proof: phantombuster `suites/traits_test` case "reads a container
  with its result object, output, runtime events and neighbours".
- KB10 BrowseKB always returns each node's full content; the `include_content`
  input is removed. BrowseKB, GetNode, KBGraph and KBSummaries return markdown
  on success, fail with typed errors for refused access, missing nodes and
  store failures, and return a domain error object for an unresolved kb_id, so
  their output schemas become `oneOf` markdown or domain error. Proof: kb10
  `node_tools_test` cases "browse returns every node's full content without a
  flag", "fails every markdown read tool with the typed access refusal" and
  "fails get_node for a missing node with the typed not-found error".
