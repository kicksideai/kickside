<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import AnchoredPanel from '@widgets/app/AnchoredPanel.vue'
import { actionAriaLabel, groupActionItems, type ActionItem } from './action-model'

const props = defineProps<{
  items: ActionItem[]
  name: string
  busy?: boolean
  size?: 'small' | 'normal'
  triggerLabel?: string
}>()
const emit = defineEmits<{ (e: 'select', method: string): void }>()

const open = ref(false)
const trigger = ref<HTMLElement | null>(null)
const groups = computed(() => groupActionItems(props.items))

function toggle() { open.value = !open.value }
function close() { open.value = false }
function choose(item: ActionItem) {
  close()
  emit('select', item.method)
}
</script>

<template>
  <span ref="trigger" class="kx-menu">
    <Button
      type="button"
      severity="secondary"
      outlined
      :size="size === 'normal' ? undefined : 'small'"
      class="kx-menu-trigger"
      :class="open && 'is-active'"
      :aria-haspopup="true"
      :aria-expanded="open"
      :aria-label="triggerLabel || `More actions for ${name}`"
      :title="'More actions'"
      @click="toggle"
    >
      <template #icon="{ class: iconClass }"><Icon icon="tabler:dots" aria-hidden="true" :class="iconClass" /></template>
    </Button>

    <AnchoredPanel v-model:open="open" :anchor="trigger" align="right" :width="264" :max-height="460" :gap="6">
      <div class="kx-menu-panel" role="menu" :aria-label="`Actions for ${name}`">
        <template v-for="(g, gi) in groups" :key="g.group">
          <div v-if="g.label" class="kx-menu-group" :class="gi === 0 && 'is-first'">{{ g.label }}</div>
          <div v-else-if="gi > 0" class="kx-menu-sep" role="separator"></div>
          <button
            v-for="item in g.items"
            :key="item.method"
            type="button"
            role="menuitem"
            class="kx-menu-item"
            :class="[item.danger && 'is-danger', item.warn && 'is-warn']"
            :data-testid="`action-${item.method}`"
            :aria-label="actionAriaLabel(item, name)"
            :disabled="item.disabled || (busy && item.kind === 'call')"
            @click="choose(item)"
          >
            <Icon :icon="item.icon" class="kx-menu-item-ico" aria-hidden="true" />
            <span class="kx-menu-item-body">
              <span class="kx-menu-item-label">
                {{ item.label }}
                <Icon v-if="item.warn" icon="tabler:alert-triangle" class="kx-menu-item-warn" aria-hidden="true" />
              </span>
              <span class="kx-menu-item-desc">{{ item.description }}</span>
            </span>
          </button>
        </template>
      </div>
    </AnchoredPanel>
  </span>
</template>
