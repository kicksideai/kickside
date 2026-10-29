import { computed, ref, type Ref } from 'vue'
import type { SyncEngine } from '../mapping/sync'
import { downloadJson, flowFilename } from '../mapping/portable'
import {
  exportWorkflow,
  humanError,
  listWorkflowVersions,
  publishWorkflow,
  PublishError,
} from '../api/api'
import { firstIssueNodeId, issuesByNode, nodeIssueMessage } from '../runs/publish-issues'

interface CanvasPublishingOptions {
  engine: SyncEngine
  workflowId: string
  revision: Ref<number>
  error: Ref<string>
  notice: Ref<string>
  historyOpen: Ref<boolean>
  publishIssues: Ref<Map<string, string>>
  rebuild: () => void
  select: (kind: 'node', id: string) => void
  published?: (version: number) => void
}

export function useCanvasPublishing(options: CanvasPublishingOptions) {
  const { engine, workflowId, revision, error, notice, historyOpen, publishIssues, rebuild, select } = options
  const publishBusy = ref(false)
  const publishedVersion = ref(0)
  const exportBusy = ref(false)

  async function loadPublishedState() {
    try {
      const versions = await listWorkflowVersions(workflowId)
      publishedVersion.value = versions.reduce((max, version) => Math.max(max, version.version), 0)
    } catch { /* leave 0 — Export stays gated until a publish succeeds this session */ }
  }

  async function exportDefinition() {
    if (!publishedVersion.value || exportBusy.value) return
    exportBusy.value = true
    error.value = ''
    try {
      const flow = await exportWorkflow(workflowId)
      downloadJson(flowFilename(flow.title), flow)
    } catch (cause) {
      error.value = humanError(cause, 'Couldn’t export this Workflow.')
    } finally {
      exportBusy.value = false
    }
  }

  // The marker-excluded edit head is the history panel's draft-vs-latest-version read.
  const definitionEditSeq = computed(() => {
    void revision.value
    return engine.doc.definitionEditSeq
  })

  async function doPublish() {
    historyOpen.value = false
    publishBusy.value = true
    error.value = ''
    notice.value = ''
    try {
      const result = await publishWorkflow(workflowId)
      if (publishIssues.value.size) { publishIssues.value = new Map(); rebuild() }
      if (result.version) publishedVersion.value = Math.max(publishedVersion.value, result.version)
      notice.value = result.version
        ? `Published version ${result.version}. You can now use it in an Automation, another Workflow, or an agent.`
        : 'Published. You can now use it in an Automation, another Workflow, or an agent.'
      if (result.version) options.published?.(result.version)
    } catch (cause) {
      error.value = humanError(cause, 'Couldn’t publish this Workflow.')
      // A refusal carries per-node reasons; keep the reason beside the node that needs fixing.
      const marks = new Map<string, string>()
      if (cause instanceof PublishError) {
        for (const [nodeId, issues] of issuesByNode(cause.issues)) marks.set(nodeId, nodeIssueMessage(issues[0]))
        const target = firstIssueNodeId(cause.issues)
        if (target && engine.doc.nodes[target]) select('node', target)
      }
      publishIssues.value = marks
      rebuild()
    } finally {
      publishBusy.value = false
    }
  }

  return {
    publishBusy, publishedVersion, exportBusy,
    loadPublishedState, exportDefinition, definitionEditSeq, doPublish,
  }
}
