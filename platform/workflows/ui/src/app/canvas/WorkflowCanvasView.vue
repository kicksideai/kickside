<script setup lang="ts">
import { proxyRefs, toRef } from 'vue'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import Drawer from 'primevue/drawer'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { Icon } from '@iconify/vue'
import Palette from '../catalog/Palette.vue'
import RunNodeOutput from '../runs/RunNodeOutput.vue'
import RunsPanel from '../runs/RunsPanel.vue'
import VersionHistoryPanel from '../runs/VersionHistoryPanel.vue'
import PublishedRunPanel from '../panels/PublishedRunPanel.vue'
import AddTriggerPanel from '../panels/AddTriggerPanel.vue'
import NodeConfigPanel from '../panels/NodeConfigPanel.vue'
import RunWithInputDialog from './RunWithInputDialog.vue'
import EdgeIntentPopover from './EdgeIntentPopover.vue'
import AutoMapReveal from './AutoMapReveal.vue'
import CanvasToolbar from './CanvasToolbar.vue'
import ConnectionEditorDialog from './ConnectionEditorDialog.vue'
import ConnectDropPicker from './ConnectDropPicker.vue'
import { relativeTime, runStatus, runStatusLabel, runVersionBadge, shortRunId } from '../runs/run-history'

const props = defineProps<{ workflowId: string; model: Record<string, any> }>()
const workflowId = props.workflowId
const model = proxyRefs(props.model)
const rootEl = toRef(model, 'rootEl')
const canvasEl = toRef(model, 'canvasEl')
const shareHost = toRef(model, 'shareHost')
const emit = defineEmits<{ (event: 'back'): void; (event: 'open-workflow', id: string): void }>()
</script>

<template>
  <div ref="rootEl" class="wf-canvas-root" :class="{ 'wf--run': model.runState.active || !!model.viewingRun }" tabindex="0" @keydown="model.onKeyDown">
    <ConfirmDialog group="node-delete" />
    <CanvasToolbar
      :palette-open="model.paletteOpen"
      :count-label="model.countLabel"
      :can-undo="model.canUndo"
      :can-redo="model.canRedo"
      :viewing-run="!!model.viewingRun"
      :layout-dir="model.layoutDir"
      :runs-open="model.runsOpen"
      :run-active="model.runState.active"
      :sim-busy="model.simBusy"
      :published-version="model.publishedVersion"
      :export-busy="model.exportBusy"
      :history-open="model.historyOpen"
      :publish-busy="model.publishBusy"
      @back="emit('back')"
      @toggle-palette="model.togglePalette"
      @undo="model.runHistory('undo')"
      @redo="model.runHistory('redo')"
      @fit="model.fit"
      @auto-layout="model.runAutoLayout()"
      @toggle-direction="model.toggleDir"
      @edit-connections="model.openConnections"
      @toggle-runs="model.toggleRuns"
      @add-trigger="model.openAddTrigger"
      @share="model.openShare"
      @run="model.openSim"
      @run-published="model.openPublishedRun"
      @export="model.exportDefinition"
      @toggle-history="model.toggleHistory"
      @publish="model.doPublish"
    />
    <PublishedRunPanel v-if="model.publishedRunOpen" :workflow-id="workflowId" :published-version="model.publishedVersion" @close="model.closePublishedRun" />
    <ConnectionEditorDialog
      v-if="model.connectionsOpen"
      :sources="model.connectionSources"
      :targets="model.connectionTargets"
      :edges="model.connectionEdges"
      :target-handle="model.connectionTargetHandle"
      :disabled="!!model.viewingRun"
      @close="model.closeConnections"
      @create="model.createConnection"
      @remove="model.removeEdge"
    />

    <RunsPanel v-if="model.runsOpen" :rows="model.runRows" :loading="model.runsLoading" :error="model.runsError" @select="model.viewRun" @close="model.closeRuns" />
    <RunWithInputDialog
      v-if="model.simOpen"
      :schema="model.startInputSchema"
      :model-value="model.simInput"
      :reset-key="model.simInputKey"
      :has-fields="model.startHasFields"
      :valid="model.simInputValid"
      :error-message="model.simError"
      :can-run="model.canRunSimulate"
      @close="model.closeRunDialog"
      @run="model.runSimulate"
      @update:model-value="model.onSimInput"
      @valid="model.onSimValid"
    />
    <VersionHistoryPanel v-if="model.historyOpen" :workflow-id="workflowId" :definition-edit-seq="model.definitionEditSeq" @close="model.closeHistory" @restore="(id) => emit('open-workflow', id)" />

    <AddTriggerPanel v-if="model.addTriggerOpen" :workflow-id="workflowId" :published-version="model.publishedVersion" @close="model.closeAddTrigger" />
    <div v-if="model.shareOpen" ref="shareHost"></div>

    <ConnectDropPicker
      v-if="model.dropPicker"
      :items="model.catalog"
      :x="model.dropPicker.x"
      :y="model.dropPicker.y"
      @pick="model.dropPickerPick"
      @close="model.closeDropPicker"
    />

    <template v-if="model.paneMenu">
      <div class="wf-ctx-backdrop" @click="model.closePaneMenu" @contextmenu.prevent="model.closePaneMenu" />
      <div class="wf-ctx" role="menu" :style="{ left: model.paneMenu.x + 'px', top: model.paneMenu.y + 'px' }">
        <button class="wf-ctx-item" role="menuitem" @click="model.menuAddStep"><Icon icon="tabler:search" aria-hidden="true" /> Add step…</button>
        <button class="wf-ctx-item" role="menuitem" @click="model.menuAddNote"><Icon icon="tabler:note" aria-hidden="true" /> Add note</button>
        <button class="wf-ctx-item" role="menuitem" @click="model.menuAddFrame"><Icon icon="tabler:frame" aria-hidden="true" /> Add frame</button>
      </div>
    </template>

    <Toast position="top-center" />

    <Message v-if="model.viewingRun" class="wf-banner wf-banner--run" :pt="{ content: { class: 'wf-run-notice-content' }, text: { class: 'wf-run-notice-body' } }" severity="info" :closable="false">
      <Tag class="wf-run-version-tag" :severity="runVersionBadge(model.viewingRun.flow_ref?.version ?? 0).kind === 'published' ? 'secondary' : 'warn'" :value="runVersionBadge(model.viewingRun.flow_ref?.version ?? 0).label" :title="runVersionBadge(model.viewingRun.flow_ref?.version ?? 0).title" />
      <span class="wf-run-notice-text">Viewing run {{ shortRunId(model.viewingRun.run_id) }} · {{ runStatusLabel(runStatus(model.viewingRun)) }} · started {{ relativeTime(model.viewingRun.started_at) }} — read-only.</span>
      <Button class="wf-run-notice-action" @click="model.stopRun">Back to editing</Button>
    </Message>

    <Message v-if="model.error" class="wf-banner wf-banner--error" severity="error" @close="model.error = ''">
      <span>{{ model.errorView.message }}</span>
      <span v-if="model.errorView.code" class="wf-err-code">{{ model.errorView.code }}</span>
    </Message>

    <div class="wf-body">
      <Palette
        v-if="model.paletteOpen && !model.viewingRun"
        :items="model.catalog"
        :loading="model.catalogLoading"
        :errors="model.catalogErrors"
        @place="model.placeItem"
        @place-note="() => model.placeNote()"
        @place-frame="() => model.placeFrame()"
      />

      <main ref="canvasEl" class="wf-canvas" @drop="model.onDrop" @dragover="model.onDragOver" @mousemove="model.onCanvasMouseMove">
        <VueFlow
          :id="model.flowId"
          v-model:nodes="model.flowNodes"
          v-model:edges="model.flowEdges"
          :node-types="model.nodeTypes"
          :edge-types="model.edgeTypes"
          :connection-line-style="model.connectLineStyle()"
          :is-valid-connection="model.isValidConnection"
          :selection-key-code="'Shift'"
          :multi-selection-key-code="'Shift'"
          :delete-key-code="null"
          :nodes-focusable="true"
          :edges-focusable="true"
          aria-label="Workflow graph"
          :zoom-on-double-click="false"
          :snap-to-grid="true"
          :snap-grid="[10, 10]"
          :min-zoom="0.1"
          :max-zoom="3"
          :connection-radius="40"
          class="wf-flow"
          @node-click="model.onNodeClick"
          @edge-click="model.onEdgeClick"
          @pane-click="model.onPaneClick"
          @pane-context-menu="model.onPaneContextMenu"
          @node-context-menu="model.onNodeContextMenu"
          @connect-start="model.onConnectStart"
          @connect="model.onConnect"
          @connect-end="model.onConnectEnd"
          @node-drag-stop="model.onNodeDragStop"
          @move="model.onViewportMove"
        >
          <Background pattern-color="var(--wf-dot)" :gap="20" :size="1.2" />
          <Controls position="bottom-left" :show-interactive="false" />
          <MiniMap position="bottom-right" :pannable="true" :zoomable="true" :width="150" :height="96" node-color="var(--wf-minimap-node)" />
        </VueFlow>

        <div v-if="model.isEmpty" class="wf-empty-canvas">
          <div class="wf-empty-flow" aria-hidden="true">
            <span class="wf-gnode wf-gnode--start"></span>
            <span class="wf-gwire"></span>
            <span class="wf-gnode wf-gnode--block"></span>
            <span class="wf-gwire"></span>
            <span class="wf-gnode wf-gnode--block"></span>
          </div>
          <p class="wf-empty-title">Add your first step</p>
          <p class="wf-empty-sub">Drag a Start or Block from the left — or press ⌘K to search.</p>
        </div>

        <div v-if="model.viewingRun && model.failedNode" class="wf-run-fail-strip" role="status">
          <Icon icon="tabler:alert-triangle" aria-hidden="true" />
          <span class="wf-run-fail-strip-txt"><strong>{{ model.failedNodeTitle }}</strong> failed<span v-if="model.failedReason">: {{ model.failedReason }}</span>.</span>
          <Button severity="secondary" outlined @click="model.openFailedDetails"><Icon icon="tabler:list-search" aria-hidden="true" /><span>View details</span></Button>
        </div>

        <div v-if="model.connectStatus && model.connectStatus !== 'neutral' && model.connectHintPosition" class="wf-connect-hint" :class="`is-${model.connectStatus}`" :style="{ left: model.connectHintPosition.left + 'px', top: model.connectHintPosition.top + 'px' }">
          <Icon :icon="model.connectStatus === 'ok' ? 'tabler:plug-connected' : model.connectStatus === 'warn' ? 'tabler:wand' : 'tabler:plug-connected-x'" aria-hidden="true" />
          <span>{{ model.connectStatus === 'ok' ? 'Compatible' : model.connectStatus === 'warn' ? (model.connectMessage || 'Needs a mapping') : (model.connectMessage || 'Incompatible') }}</span>
        </div>

        <!-- Intent-edge overlays (W11.1): the auto-map reveal for an obvious mapping, the
             intent popover for an ambiguous one — both anchored at the edge midpoint. -->
        <AutoMapReveal
          v-for="a in model.autoMapAnchored"
          :key="a.id"
          :entry="a.entry"
          :style="{ left: a.left + 'px', top: a.top + 'px', visibility: a.placed ? 'visible' : 'hidden', '--wf-overlay-max-height': a.maxHeight + 'px' }"
          @measure="model.measureAuto(a.id, $event)"
          @open="model.openAutoMapped"
          @dismiss="model.dismissAutoMapped"
        />
        <EdgeIntentPopover
          v-if="model.pendingEdge && model.pendingAnchor"
          :key="model.pendingEdge.id"
          :workflow-id="workflowId"
          :edge="model.pendingEdge"
          :available-steps="model.availableSteps"
          :style="{ left: model.pendingAnchor.left + 'px', top: model.pendingAnchor.top + 'px', visibility: model.pendingOverlaySize ? 'visible' : 'hidden', '--wf-overlay-max-height': model.pendingAnchor.maxHeight + 'px' }"
          @measure="model.measurePending"
          @accept="model.acceptPending"
          @suggest-node="model.showSuggestedNode"
          @open-mapper="model.openPendingMapper"
          @dismiss="model.dismissPending"
        />

        <div v-if="model.loading" class="wf-canvas-loading"><ProgressSpinner class="wf-status-spinner" stroke-width="4" aria-label="Loading workflow canvas" /></div>
      </main>

      <Button v-if="!model.panelOpen && (model.hasSelection || model.viewingRun)" class="wf-panel-rail" text rounded severity="secondary" title="Show inspector" aria-label="Show inspector" @click="model.openInspector"><Icon icon="tabler:chevron-left" aria-hidden="true" /></Button>
      <Drawer
        v-if="model.narrowEditor"
        class="wf-inspector-drawer"
        :visible="model.panelOpen"
        position="right"
        :modal="true"
        :dismissable="true"
        :close-on-escape="true"
        :show-close-icon="false"
        :style="{ width: 'min(312px, calc(100vw - 44px))' }"
        aria-label="Workflow inspector"
        @update:visible="(visible) => { if (!visible) model.closeInspector() }"
      >
        <RunNodeOutput
          v-if="model.viewingRun"
          :workflow-id="workflowId"
          :run="model.viewingRun"
          :node="model.selectedNode"
          :node-status="model.selectedRunStatus"
          :node-header="model.selectedRunHeader"
          :execution="model.viewingExecution"
          @close="model.clearSelection"
          @exit-run="model.stopRun"
          @rerun="model.rerunSameInput(model.viewingRun)"
        />
        <NodeConfigPanel
          v-else-if="model.hasSelection"
          :workflow-id="workflowId"
          :node="model.selectedNode"
          :edge="model.selectedEdge"
          :note="model.selectedNote"
          :catalog="model.catalog"
          :edge-upstream-schema="model.selectedEdgeUpstream"
          :edge-downstream-schema="model.selectedEdgeDownstream"
          :edge-source-title="model.selectedEdgeSourceTitle"
          :edge-target-title="model.selectedEdgeTargetTitle"
          :node-upstream-schema="model.selectedNodeUpstream"
          :combine-branch-conflict="model.selectedCombineConflict"
          @update-node="model.updateNode"
          @remove-node="model.removeSelectedNode"
          @update-edge="model.updateEdge"
          @remove-edge="model.removeSelectedEdge"
          @update-note="model.updateNote"
          @remove-note="model.removeSelectedNote"
          @close="model.clearSelection"
        />
      </Drawer>
      <template v-else>
        <RunNodeOutput
          v-if="model.panelOpen && model.viewingRun"
          :workflow-id="workflowId"
          :run="model.viewingRun"
          :node="model.selectedNode"
          :node-status="model.selectedRunStatus"
          :node-header="model.selectedRunHeader"
          :execution="model.viewingExecution"
          @close="model.clearSelection"
          @exit-run="model.stopRun"
          @rerun="model.rerunSameInput(model.viewingRun)"
        />
        <NodeConfigPanel
          v-else-if="model.panelOpen && model.hasSelection"
          :workflow-id="workflowId"
          :node="model.selectedNode"
          :edge="model.selectedEdge"
          :note="model.selectedNote"
          :catalog="model.catalog"
          :edge-upstream-schema="model.selectedEdgeUpstream"
          :edge-downstream-schema="model.selectedEdgeDownstream"
          :edge-source-title="model.selectedEdgeSourceTitle"
          :edge-target-title="model.selectedEdgeTargetTitle"
          :node-upstream-schema="model.selectedNodeUpstream"
          :combine-branch-conflict="model.selectedCombineConflict"
          @update-node="model.updateNode"
          @remove-node="model.removeSelectedNode"
          @update-edge="model.updateEdge"
          @remove-edge="model.removeSelectedEdge"
          @update-note="model.updateNote"
          @remove-note="model.removeSelectedNote"
          @close="model.clearSelection"
        />
      </template>
    </div>
  </div>
</template>
