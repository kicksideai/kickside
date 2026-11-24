<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { ref, useId, useSlots, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{ title: string; description?: string; expandLabel?: string; keepMounted?: boolean }>()
const open = defineModel<boolean>('open', { default: false })
const slots = useSlots()
const bodyId = useId()
// The body mounts on first open and stays mounted so drafts inside it survive collapsing.
const rendered = ref(open.value)
watch(open, value => { if (value) rendered.value = true })
</script>

<template>
  <article class="kx-settings-item" :class="{ 'kx-settings-item-open': open && slots.default }">
    <div class="kx-settings-item-head">
      <div class="kx-settings-item-main">
        <div class="kx-settings-item-line">
          <h3 class="kx-settings-item-title">{{ title }}</h3>
          <slot name="status" />
        </div>
        <p v-if="description" class="kx-settings-item-desc">{{ description }}</p>
        <p v-if="slots.meta" class="kx-settings-item-meta"><slot name="meta" /></p>
      </div>
      <div class="kx-settings-item-actions">
        <button v-if="slots.default" type="button" class="kx-settings-item-expand" :aria-expanded="open" :aria-controls="bodyId"
          :aria-label="(expandLabel || 'Details') + ' ' + title" @click="open = !open">
          <span>{{ expandLabel || 'Details' }}</span>
          <Icon icon="tabler:chevron-down" aria-hidden="true" />
        </button>
        <slot name="actions" />
      </div>
    </div>
    <Transition v-if="slots.default" name="kx-settings-item-motion">
      <div v-if="rendered || props.keepMounted" v-show="open" :id="bodyId" :inert="!open" class="kx-settings-item-panel">
        <div class="kx-settings-item-clip"><div class="kx-settings-item-body"><slot /></div></div>
      </div>
    </Transition>
  </article>
</template>
