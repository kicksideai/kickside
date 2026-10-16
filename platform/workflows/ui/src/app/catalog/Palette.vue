<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { groupCatalog, subgroupByModule, PALETTE_SUBGROUP_MIN, type CatalogGroup, type CatalogItem } from './catalog'
import { CATEGORY_ORDER } from '../domain/node-policy'

// The left rail: every catalog item swept from the platform's registries, grouped by
// category, with instant search. Categories render dynamically from the items — the
// known order leads, then any module-declared category the sweep surfaced follows in a
// generic section, so a new node kind is never silently unreachable. Notes are a single
// deterministic entry. Empty known categories and load errors are shown truthfully.
const props = defineProps<{ items: CatalogItem[]; loading: boolean; errors: string[] }>()
const emit = defineEmits<{ (e: 'place', item: CatalogItem): void; (e: 'place-note'): void; (e: 'place-frame'): void }>()

const q = ref('')
// Categories start collapsed so the rail is short and scannable; a search opens
// everything so matches are never hidden behind a closed group. Structure leads open —
// it is what makes a published Flow composable from another Flow.
const collapsed = ref<Set<string>>(new Set(['Tools', 'Destinations', 'Notes']))
const searching = computed(() => q.value.trim().length > 0)
function isOpen(cat: string): boolean {
  return searching.value || !collapsed.value.has(cat)
}

const grouped = computed(() => groupCatalog(props.items, q.value, CATEGORY_ORDER))

function toggle(cat: string) {
  const next = new Set(collapsed.value)
  if (next.has(cat)) next.delete(cat)
  else next.add(cat)
  collapsed.value = next
}
function groupId(cat: string): string {
  return `palette-group-${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

// A dense swept category (Tools) folds its items under module sub-headings so the rail
// stays short. Sub-headings start collapsed; a search opens everything so no match hides.
const subOpen = ref<Set<string>>(new Set())
function subKey(cat: string, module: string): string {
  return `${cat}::${module}`
}
function isSubOpen(cat: string, module: string): boolean {
  return searching.value || subOpen.value.has(subKey(cat, module))
}
function toggleSub(cat: string, module: string) {
  const key = subKey(cat, module)
  const next = new Set(subOpen.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  subOpen.value = next
}

// The flattened render sequence for one category: a plain item list when small, or module
// sub-headers interleaved with their items (only when the sub-group is open) when dense.
type PaletteRow =
  | { kind: 'sub'; key: string; module: string; count: number; open: boolean }
  | { kind: 'item'; key: string; item: CatalogItem }
function rowsForGroup(group: CatalogGroup): PaletteRow[] {
  if (group.items.length < PALETTE_SUBGROUP_MIN) {
    return group.items.map((item) => ({ kind: 'item', key: item.paletteId, item }))
  }
  const rows: PaletteRow[] = []
  for (const sub of subgroupByModule(group.items)) {
    const open = isSubOpen(group.cat, sub.module)
    rows.push({ kind: 'sub', key: `s:${sub.module}`, module: sub.module, count: sub.items.length, open })
    if (open) for (const item of sub.items) rows.push({ kind: 'item', key: `${sub.module}:${item.paletteId}`, item })
  }
  return rows
}

function onDragStart(e: DragEvent, item: CatalogItem) {
  if (!e.dataTransfer) return
  e.dataTransfer.setData('application/wf-item', item.paletteId)
  e.dataTransfer.effectAllowed = 'copy'
}
function onNoteDragStart(e: DragEvent) {
  if (!e.dataTransfer) return
  e.dataTransfer.setData('application/wf-item', 'note:new')
  e.dataTransfer.effectAllowed = 'copy'
}
function onFrameDragStart(e: DragEvent) {
  if (!e.dataTransfer) return
  e.dataTransfer.setData('application/wf-item', 'frame:new')
  e.dataTransfer.effectAllowed = 'copy'
}
</script>

<template>
  <div id="workflow-step-palette" class="wf-palette">
    <IconField class="wf-palette-search">
      <InputIcon><Icon icon="tabler:search" aria-hidden="true" /></InputIcon>
      <InputText v-model="q" type="text" placeholder="Search steps  (⌘K)" aria-label="Search steps" />
    </IconField>

    <div class="wf-palette-scroll">
      <div v-if="loading" class="wf-palette-loading">
        <ProgressSpinner class="wf-status-spinner" stroke-width="4" aria-label="Loading catalog" />
        <span>Loading the catalog…</span>
      </div>

      <div v-for="group in grouped" :key="group.cat" class="wf-palette-group">
        <template v-if="group.cat === 'Notes'">
          <Button class="wf-palette-cat" severity="secondary" text :aria-expanded="isOpen(group.cat)" :aria-controls="groupId(group.cat)" @click="toggle(group.cat)">
            <Icon :icon="isOpen(group.cat) ? 'tabler:chevron-down' : 'tabler:chevron-right'" aria-hidden="true" />
            <span>Notes</span>
          </Button>
          <div v-if="isOpen(group.cat)" :id="groupId(group.cat)">
          <Button
            class="wf-palette-item"
            severity="secondary"
            text
            draggable="true"
            @click="emit('place-note')"
            @dragstart="onNoteDragStart"
          >
            <span class="wf-palette-ico wf-palette-ico--note"><Icon icon="tabler:note" aria-hidden="true" /></span>
            <span class="wf-palette-item-body">
              <span class="wf-palette-item-t">Sticky Note</span>
              <span class="wf-palette-item-s">Annotate the canvas</span>
            </span>
          </Button>
          <Button
            v-if="isOpen(group.cat)"
            class="wf-palette-item"
            severity="secondary"
            text
            draggable="true"
            @click="emit('place-frame')"
            @dragstart="onFrameDragStart"
          >
            <span class="wf-palette-ico wf-palette-ico--note"><Icon icon="tabler:box" aria-hidden="true" /></span>
            <span class="wf-palette-item-body">
              <span class="wf-palette-item-t">Frame</span>
              <span class="wf-palette-item-s">Group nodes in a colored region</span>
            </span>
          </Button>
          </div>
        </template>
        <template v-else>
          <Button class="wf-palette-cat" severity="secondary" text :aria-expanded="isOpen(group.cat)" :aria-controls="groupId(group.cat)" @click="toggle(group.cat)">
            <Icon :icon="isOpen(group.cat) ? 'tabler:chevron-down' : 'tabler:chevron-right'" aria-hidden="true" />
            <span>{{ group.cat }}</span>
            <span class="wf-palette-count">{{ group.items.length }}</span>
          </Button>
          <div v-if="isOpen(group.cat)" :id="groupId(group.cat)">
            <template v-for="row in rowsForGroup(group)" :key="row.key">
              <Button
                v-if="row.kind === 'sub'"
                class="wf-palette-subcat"
                severity="secondary"
                text
                :aria-expanded="row.open"
                @click="toggleSub(group.cat, row.module)"
              >
                <Icon :icon="row.open ? 'tabler:chevron-down' : 'tabler:chevron-right'" aria-hidden="true" />
                <span>{{ row.module }}</span>
                <span class="wf-palette-count">{{ row.count }}</span>
              </Button>
              <Button
                v-else
                class="wf-palette-item"
                severity="secondary"
                text
                draggable="true"
                @click="emit('place', row.item)"
                @dragstart="(e) => onDragStart(e, row.item)"
              >
                <span class="wf-palette-ico" :class="`wf-palette-ico--${row.item.kind}`"><Icon :icon="row.item.icon" aria-hidden="true" /></span>
                <span class="wf-palette-item-body">
                  <span class="wf-palette-item-t">{{ row.item.title }}</span>
                  <span v-if="row.item.subtitle" class="wf-palette-item-s">{{ row.item.subtitle }}</span>
                </span>
              </Button>
            </template>
          </div>
        </template>
      </div>

      <Message v-if="errors.length" class="wf-palette-errors" severity="warn" :closable="false">
        Some catalogs couldn’t load. {{ errors[0] }}
      </Message>
    </div>
  </div>
</template>
