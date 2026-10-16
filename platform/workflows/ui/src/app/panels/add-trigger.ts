// The Flow builder owns no trigger concept. It embeds Automation's own
// component-scoped manager, so the triggers bound to this Workflow are listed,
// paused, resumed, edited, and created by the surface that owns them.

export const AUTOMATION_MANAGER_TAG = 'kickside-automation-manager'
export const ADD_TRIGGER_TITLE = 'Triggers'
export const ADD_TRIGGER_BODY = 'Automations that run this Workflow. Add one, or pause and edit the ones already here.'
export const ADD_TRIGGER_PUBLISH_FIRST = 'Publish this Workflow before adding a trigger'

// Automations bind to an immutable published revision. A Workflow may have newer draft
// edits and still be a valid destination; only the absence of any published revision
// makes Add Trigger unavailable.
export function canAddTrigger(publishedVersion: number): boolean {
  return Number.isFinite(publishedVersion) && publishedVersion > 0
}

export function automationManagerMount(workflowId: string, publishedVersion: number): {
  tag: typeof AUTOMATION_MANAGER_TAG
  attrs: { 'component-id': string; mode: string; input: string }
} {
  // These must remain host attributes, rather than Vue-style camelCase props. The
  // manager reads its Wippy props as `componentId` after the custom-element boundary
  // has camel-cased `component-id`; passing a camelCase Vue prop here leaves an
  // un-upgraded foreign element with no preset in some host bundles.
  //
  // The component id scopes and parents rows; the declared install input pins
  // the destination to the published revision selected by this builder.
  return {
    tag: AUTOMATION_MANAGER_TAG,
    attrs: {
      'component-id': workflowId,
      mode: 'component',
      input: JSON.stringify({ sink_port: 'kickside.workflows:run_sink', sink_config: { flow_ref: { kind: 'flow', id: workflowId, version: publishedVersion } } }),
    },
  }
}
