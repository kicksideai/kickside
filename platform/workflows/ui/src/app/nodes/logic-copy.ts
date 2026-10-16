
export const LOOP_CONDITION_HINT =
  'Checked after every pass. Reference result (the last pass’s output), state or iteration — a bare name reads from state.'

// Reaching the cap while the condition still holds fails the step with
// MAX_ITERATIONS_EXCEEDED. That failure is routable: wire the Failed port to recover
// instead of ending the whole run, so the copy offers that path rather than only declaring
// failure.
export const LOOP_MAX_ITER_HINT =
  'Safety cap. If the condition still holds after this many passes, the step fails with MAX_ITERATIONS_EXCEEDED — wire its Failed port to recover instead of ending the run. 0 uses the default (8).'

// For-each: batch_size defaults to 8, running items in parallel. The copy names the port
// the per-item body wires from and the port the collected results continue on.
export const FOR_EACH_USE_HINT =
  'Runs the same steps once per item of a list. Wire those steps from the “each item” port; the collected results continue from “all results”. How many run at the same time is the batch size below.'
export const FOR_EACH_BATCH_HINT = 'How many items run at the same time. Default 8.'
// The two honest outcomes of the continue-on-error toggle, matching the engine lowering.
export const FOR_EACH_CONTINUE_ON_HINT =
  'Attempts every item and keeps going when one fails. The output is one entry per item, each carrying its result or its error { code, message }.'
export const FOR_EACH_CONTINUE_OFF_HINT =
  'Stops at the first item that fails — that failure becomes this step’s failure (route it with the Failed port). The output is the results array in source order.'

// Flow composition waits for its nested DAG to finish, then routes on the outcome. The
// Failed port carries the standard structured envelope, named so the author knows the
// shape they are wiring downstream.
export const FLOW_HINT =
  'Runs the selected Workflow and waits for it to finish. Its result continues from the Finished port; if it fails, the Failed port carries { code, message }.'
