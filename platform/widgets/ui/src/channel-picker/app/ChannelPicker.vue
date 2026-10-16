<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { useComponentProps, useComponentEvents } from '../constants.ts'
import AnchoredPanel from '../../app/AnchoredPanel.vue'

// Lazy channel tree across every connection. Roots are connections (GET
// connectionsSource); expanding a connection or a container (a Discord guild)
// calls the connection discover_resources contract (POST discoverPath) for its
// children, so nothing loads until a branch is opened -- it scales to many
// connections. A leaf channel is selectable; picking one emits the
// {connection_id, channel_id} a channel responder installs against.
const props = useComponentProps()
const emit = useComponentEvents()

type Kind = 'connection' | 'container' | 'channel'
interface Node {
  key: string
  kind: Kind
  label: string
  connection_id: string
  channel_id: string
  resource_id: string
  expandable: boolean
  loaded: boolean
  loading: boolean
  expanded: boolean
  children: Node[]
}
interface Row { [k: string]: unknown }

const connectionsSource = computed(() => props.value?.connectionsSource || '/api/v1/connections')
const discoverPath = computed(() => props.value?.discoverPath || '/api/v1/connections/{id}/discover_resources')
const providers = computed(() => (props.value?.providers || '').split(',').map(s => s.trim()).filter(Boolean))
const childArg = computed(() => props.value?.childArg || 'parent_id')
const placeholder = computed(() => props.value?.placeholder || 'Select a channel…')

const roots = ref<Node[]>([])
const rootsLoaded = ref(false)
const rootsLoading = ref(false)
const open = ref(false)
const selected = ref<{ connection_id: string; channel_id: string } | null>(null)
// The tree node behind the current selection, once resolved. Null while
// unresolved — hydrating (still drilling) or genuinely absent — never the raw id.
const resolvedNode = ref<Node | null>(null)
const resolving = ref(false)

const ctrl = ref<HTMLElement | null>(null)

function str(v: unknown): string { return typeof v === 'string' ? v : (v == null ? '' : String(v)) }

// Both endpoints return the canonical picker envelope: data.items, each a flat
// row. The connections endpoint flags reply_provider; discover_resources flags
// selectable + drillable on each resource. The picker reads these directly.
function itemsOf(data: any): Row[] {
  return Array.isArray(data?.items) ? (data.items as Row[]) : []
}

async function loadRoots() {
  if (rootsLoading.value) return
  rootsLoading.value = true
  try {
    const lists = providers.value.length ? providers.value : ['']
    const seen = new Set<string>()
    const out: Node[] = []
    for (const p of lists) {
      const url = p ? `${connectionsSource.value}?provider=${encodeURIComponent(p)}&limit=100` : `${connectionsSource.value}?limit=100`
      const { data } = await api.get(url)
      for (const r of itemsOf(data)) {
        // Only connections that expose channels (bind reply_provider) can host a
        // responder; skip dataflow connections so their resource trees never load.
        if ((r as { reply_provider?: unknown }).reply_provider !== true) continue
        const id = str(r.id)
        if (!id || seen.has(id)) continue
        seen.add(id)
        out.push({
          key: `c:${id}`, kind: 'connection', label: str(r.label) || id,
          connection_id: id, channel_id: '', resource_id: '',
          expandable: true, loaded: false, loading: false, expanded: false, children: [],
        })
      }
    }
    roots.value = out
    rootsLoaded.value = true
    emit('load', undefined)
  } catch (e) {
    emit('error', { message: 'failed to list connections', error: e })
  } finally {
    rootsLoading.value = false
  }
}

function discoverUrl(connectionId: string): string {
  return discoverPath.value.replace('{id}', encodeURIComponent(connectionId))
}

// Build a child forest from one discover response. Resources nest by parent_id
// (a channel under its category) to arbitrary depth: a resource whose parent_id
// points at a sibling becomes that sibling's child; the rest are direct children
// of the expanded node. A selectable leaf is a channel; anything else is a
// container -- pre-loaded if it nested children here, else lazy (drilled on expand).
function buildNodes(connectionId: string, parentKey: string, resources: Row[]): Node[] {
  const byId = new Map<string, Row>()
  for (const r of resources) { const id = str(r.id); if (id) byId.set(id, r) }
  const kids = new Map<string, Row[]>()
  const roots: Row[] = []
  for (const r of resources) {
    const id = str(r.id); if (!id) continue
    const pid = str(r.parent_id)
    if (pid && byId.has(pid) && pid !== id) {
      const arr = kids.get(pid); if (arr) arr.push(r); else kids.set(pid, [r])
    } else {
      roots.push(r)
    }
  }
  const make = (r: Row, pk: string): Node => {
    const id = str(r.id)
    const childRows = kids.get(id) || []
    const childNodes = childRows.map(cr => make(cr, `${pk}/${id}`))
    const hasKids = childNodes.length > 0
    const selectable = (r as { selectable?: unknown }).selectable === true && !hasKids
    const drillable = (r as { drillable?: unknown }).drillable === true
    const isContainer = !selectable
    return {
      key: `${pk}/${id}`,
      kind: selectable ? 'channel' : 'container',
      label: str(r.label) || id,
      connection_id: connectionId,
      channel_id: selectable ? id : '',
      resource_id: id,
      // A drillable container (a guild) loads its children on expand; a
      // non-drillable one (a category) already has them nested here, so an empty
      // category just shows empty rather than drilling and 404-ing.
      expandable: isContainer && (drillable || hasKids),
      loaded: hasKids || (isContainer && !drillable),
      loading: false,
      expanded: false,
      children: childNodes,
    }
  }
  return roots.map(r => make(r, parentKey))
}

async function loadChildren(node: Node) {
  if (node.loaded || node.loading) return
  node.loading = true
  try {
    const body: Record<string, string> = {}
    if (node.kind !== 'connection' && node.resource_id) body[childArg.value] = node.resource_id
    const { data } = await api.post(discoverUrl(node.connection_id), body)
    node.children = buildNodes(node.connection_id, node.key, itemsOf(data))
    node.loaded = true
  } catch (e) {
    emit('error', { message: 'failed to load channels', error: e })
  } finally {
    node.loading = false
  }
}

function toggle(node: Node) {
  if (!node.expandable) return
  node.expanded = !node.expanded
  if (node.expanded && !node.loaded) loadChildren(node)
}

// Flatten the tree to the rows currently visible (a branch contributes children
// only while expanded), each with its depth for indentation.
interface VisRow { node: Node; depth: number }
const visible = computed<VisRow[]>(() => {
  const out: VisRow[] = []
  const walk = (list: Node[], depth: number) => {
    for (const n of list) {
      out.push({ node: n, depth })
      if (n.expanded && n.children.length) walk(n.children, depth + 1)
    }
  }
  walk(roots.value, 0)
  return out
})

function iconFor(kind: Kind): string {
  if (kind === 'connection') return 'tabler:plug-connected'
  if (kind === 'container') return 'tabler:server'
  return 'tabler:hash'
}

function isSelected(node: Node): boolean {
  return node.kind === 'channel' && !!selected.value &&
    selected.value.connection_id === node.connection_id &&
    selected.value.channel_id === node.channel_id
}

function rowClick(node: Node) {
  if (node.kind === 'channel') {
    selected.value = { connection_id: node.connection_id, channel_id: node.channel_id }
    resolvedNode.value = node
    emit('change', { connection_id: node.connection_id, channel_id: node.channel_id, channel_name: node.label })
    open.value = false
  } else {
    toggle(node)
  }
}

function parseValue(v: unknown): { connection_id: string; channel_id: string } | null {
  if (typeof v !== 'string' || !v.trim()) return null
  try {
    const o = JSON.parse(v)
    if (o && o.channel_id) return { connection_id: str(o.connection_id), channel_id: str(o.channel_id) }
  } catch { /* not JSON */ }
  return null
}

// Depth-first walk down one branch through the same discover_resources calls
// the interactive tree makes on expand, stopping at the first channel whose id
// matches. Each container drills only once (loadChildren is itself guarded).
async function findChannel(node: Node, channelId: string): Promise<Node | null> {
  if (!node.loaded) await loadChildren(node)
  for (const child of node.children) {
    if (child.kind === 'channel' && child.channel_id === channelId) return child
    if (child.kind === 'container') {
      const found = await findChannel(child, channelId)
      if (found) return found
    }
  }
  return null
}

// A seeded {connection_id, channel_id} has no open panel to trigger a fetch on,
// so it resolves through the same catalog the interactive tree uses: load the
// roots, find the connection, then drill its containers until the channel turns
// up or the reachable branch is exhausted.
async function hydrateSelectedLabel() {
  const target = selected.value
  if (!target) { resolvedNode.value = null; return }
  if (resolvedNode.value && resolvedNode.value.connection_id === target.connection_id && resolvedNode.value.channel_id === target.channel_id) return
  if (resolving.value) return
  resolvedNode.value = null
  resolving.value = true
  try {
    if (!rootsLoaded.value) await loadRoots()
    const conn = roots.value.find(n => n.kind === 'connection' && n.connection_id === target.connection_id)
    resolvedNode.value = conn ? await findChannel(conn, target.channel_id) : null
  } finally {
    resolving.value = false
  }
}

watch(() => props.value?.value, v => {
  selected.value = parseValue(v)
  hydrateSelectedLabel()
}, { immediate: true })

// Placement, outside-click and Escape are owned by AnchoredPanel; the tree just
// toggles open and lazy-loads roots on the first open.
function toggleOpen() {
  open.value = !open.value
  if (open.value && !rootsLoaded.value) loadRoots()
}
</script>

<template>
  <div ref="ctrl" class="cp" :class="open && 'cp-open'" role="button" tabindex="0" :aria-expanded="open" @click="toggleOpen" @keydown.enter="toggleOpen" @keydown.space.prevent="toggleOpen">
    <Icon icon="tabler:hash" class="cp-lead" aria-hidden="true" />
    <span class="cp-value" :class="!selected && 'cp-ph'">
      <template v-if="!selected">{{ placeholder }}</template>
      <template v-else-if="resolvedNode">{{ resolvedNode.label }}</template>
      <template v-else-if="resolving">Resolving…</template>
      <template v-else>Unknown channel<span class="cp-value-id"> {{ selected.channel_id }}</span></template>
    </span>
    <Icon :icon="open ? 'tabler:chevron-up' : 'tabler:chevron-down'" class="cp-caret" aria-hidden="true" />
  </div>

  <AnchoredPanel v-model:open="open" :anchor="ctrl" :min-width="280" :max-height="360">
    <div class="cp-pop">
    <div v-if="rootsLoading" class="cp-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading connections…</div>
    <div v-else-if="!roots.length" class="cp-state">No connections.</div>
    <div v-else class="cp-tree">
      <button
        v-for="row in visible"
        :key="row.node.key"
        type="button"
        class="cp-row"
        :class="[`cp-${row.node.kind}`, isSelected(row.node) && 'cp-row-on']"
        :style="{ '--cp-depth': `${row.depth * 16}px` }"
        @click="rowClick(row.node)"
      >
        <Icon
          v-if="row.node.expandable"
          :icon="row.node.loading ? 'tabler:loader-2' : (row.node.expanded ? 'tabler:chevron-down' : 'tabler:chevron-right')"
          class="cp-twist"
          :class="row.node.loading && 'spin'"
          aria-hidden="true"
        />
        <span v-else class="cp-twist cp-twist-empty" aria-hidden="true" />
        <Icon :icon="iconFor(row.node.kind)" class="cp-ico" aria-hidden="true" />
        <span class="cp-label">{{ row.node.label }}</span>
        <Icon v-if="isSelected(row.node)" icon="tabler:check" class="cp-check" aria-hidden="true" />
      </button>
    </div>
    </div>
  </AnchoredPanel>
</template>
