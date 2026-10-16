import { computed, ref, type Ref } from 'vue'
import type { Category, Item, Override } from './appearance.types.ts'

interface AppearanceNavigationOptions {
  items: Ref<Item[]>
  categories: Ref<Category[]>
  overrides: Ref<Record<string, Override>>
  home: Ref<string>
}

export function useAppearanceNavigation({ items, categories, overrides, home }: AppearanceNavigationOptions) {
  const itemKey = (item: Item) => item.route_name || item.id
  function patchOverride(item: Item, patch: Override) {
    const key = itemKey(item)
    const next: Override = { ...(overrides.value[key] || {}) }
    for (const [field, value] of Object.entries(patch)) {
      if (value === undefined || value === '') delete (next as any)[field]
      else (next as any)[field] = value
    }
    overrides.value = { ...overrides.value, [key]: next }
  }
  function setHidden(item: Item, hidden: boolean) { patchOverride(item, { hidden: hidden || undefined }); item.hidden = hidden }
  function setCategory(item: Item, key: string) { patchOverride(item, { category: key }); item.category = key }
  function setOrder(item: Item, value: number) { patchOverride(item, { order: value }); item.order = value }
  function setLabel(item: Item, value: string) { const next = value.replace(/^\s+/, ''); item.label = next; patchOverride(item, { label: next || undefined }) }
  function setIcon(item: Item, value: string) { const next = (value || '').trim(); item.icon = next; patchOverride(item, { icon: next || undefined }) }
  function hasOverride(item: Item): boolean {
    const override = overrides.value[itemKey(item)]
    return !!override && (override.label !== undefined || override.icon !== undefined)
  }

  const orderedCats = computed(() => [...categories.value].sort((a, b) => a.order - b.order))
  function itemsOf(categoryKey: string): Item[] {
    return items.value
      .filter(item => !item.hidden && (item.category || '') === categoryKey)
      .sort((a, b) => (a.order - b.order) || a.label.localeCompare(b.label))
  }
  const editorGroups = computed(() => {
    const out: { key: string; label: string; real: boolean }[] = []
    out.push({ key: '', label: 'Ungrouped', real: false })
    for (const category of orderedCats.value) out.push({ key: category.key, label: category.label || category.key, real: true })
    const known = new Set(['', ...categories.value.map(category => category.key)])
    for (const item of items.value) {
      if (item.category && !known.has(item.category)) {
        known.add(item.category)
        out.push({ key: item.category, label: item.category, real: false })
      }
    }
    return out
  })
  const hiddenItems = computed(() => items.value.filter(item => item.hidden))
  const catByKey = (key: string) => categories.value.find(category => category.key === key)

  const dragItemId = ref<string | null>(null)
  const dragCatKey = ref<string | null>(null)
  const overGroup = ref<string | null>(null)
  const itemById = (id: string) => items.value.find(item => item.id === id)
  function onItemDragStart(item: Item, event: DragEvent) {
    dragItemId.value = item.id
    if (event.dataTransfer) { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', item.id) }
  }
  function endDrag() { dragItemId.value = null; dragCatKey.value = null; overGroup.value = null }
  function onItemDrop(target: Item) {
    const dragged = dragItemId.value ? itemById(dragItemId.value) : null
    if (!dragged || dragged.id === target.id) return endDrag()
    const categoryKey = target.category || ''
    const rows = itemsOf(categoryKey).filter(item => item.id !== dragged.id)
    const index = rows.indexOf(target)
    rows.splice(index < 0 ? rows.length : index, 0, dragged)
    setCategory(dragged, categoryKey)
    rows.forEach((item, order) => setOrder(item, order * 10))
    endDrag()
  }
  function onGroupDrop(categoryKey: string) {
    const dragged = dragItemId.value ? itemById(dragItemId.value) : null
    if (!dragged) return endDrag()
    const rows = itemsOf(categoryKey).filter(item => item.id !== dragged.id)
    rows.push(dragged)
    setCategory(dragged, categoryKey)
    rows.forEach((item, order) => setOrder(item, order * 10))
    endDrag()
  }
  function onCatDragStart(key: string, event: DragEvent) {
    dragCatKey.value = key
    if (event.dataTransfer) { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', 'cat:' + key) }
  }
  function onCatDrop(targetKey: string) {
    const sourceKey = dragCatKey.value
    if (!sourceKey || sourceKey === targetKey) return endDrag()
    const rows = [...orderedCats.value]
    const sourceIndex = rows.findIndex(category => category.key === sourceKey)
    const targetIndex = rows.findIndex(category => category.key === targetKey)
    if (sourceIndex < 0 || targetIndex < 0) return endDrag()
    const [moved] = rows.splice(sourceIndex, 1)
    rows.splice(targetIndex, 0, moved)
    rows.forEach((category, order) => {
      const real = categories.value.find(item => item.key === category.key)
      if (real) real.order = order * 10
    })
    endDrag()
  }

  let catSeq = 0
  function addCategory() {
    catSeq += 1
    const last = orderedCats.value[orderedCats.value.length - 1]
    categories.value.push({ key: 'cat_' + Date.now().toString(36) + '_' + catSeq, label: 'New category', icon: 'tabler:folder', order: (last?.order ?? 0) + 10 })
  }
  function removeCategory(key: string) {
    for (const item of items.value) if (item.category === key) setCategory(item, '')
    categories.value = categories.value.filter(category => category.key !== key)
  }
  function renameCategory(key: string, label: string) { const category = catByKey(key); if (category) category.label = label }
  function setCatIcon(key: string, icon: string) { const category = catByKey(key); if (category) category.icon = (icon || '').trim() || undefined }
  function isHome(item: Item): boolean { return !!home.value && home.value === item.path }
  function setHome(item: Item) { home.value = isHome(item) ? '' : item.path }

  return {
    itemKey, patchOverride, setHidden, setCategory, setOrder, setLabel, setIcon, hasOverride,
    orderedCats, itemsOf, editorGroups, hiddenItems, catByKey,
    dragItemId, dragCatKey, overGroup, onItemDragStart, endDrag, onItemDrop, onGroupDrop,
    onCatDragStart, onCatDrop, addCategory, removeCategory, renameCategory, setCatIcon,
    isHome, setHome,
  }
}
