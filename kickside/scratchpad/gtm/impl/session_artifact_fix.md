# Session workflow artifact fix

## Outcome

Agent-invoked workflow runs now preserve `session_id` from the agent tool context
through the workflow runner and launch path. A session-bound launch starts the
dataflow with `init_func_id = "userspace.dataflow.session:artifact"`, matching
the existing delegation path. Launches without a session id (automation, API, and
embed) retain the prior start options.

After reload, when an agent calls `run_workflow` from chat, the session will show
an inline interactive **Workflow Execution** dataflow artifact as soon as the run
starts; it renders the live workflow state while nodes move and retains the run
view after completion.

## Trait guidance

The `run_workflow` descriptor and workflow awareness text now tell the model to
invoke the tool in the current turn when asked to run a workflow, and to report
only actual tool output rather than narrating an unmade run.

## Tests

The run suite now covers session context to runner options, runner options to
launch, artifact-init wiring for session launches, and unchanged non-session
starts. The conditional-route fixture was aligned with the completion detector's
required `config.func_id` marker.

Chunked workflow suite results:

- definitions: 45 passed
- lifecycle: 46 passed
- validation: 80 passed
- library: 87 passed
- live: 33 passed

Total: 291 passed.

## FE queue

Generic agent tool-call events are not published to the session thread by the
dataflow agent runtime. `show_tool_calls` creates/updates internal dataflow tool
visualization nodes only; the session renderer therefore has no generic tool-call
event to display. This fix supplies the live session artifact for workflow calls;
generic tool-call chat rendering remains a frontend/runtime follow-up.
