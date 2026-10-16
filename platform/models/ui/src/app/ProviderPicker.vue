<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Preset } from '../types.ts'
import { isCompatiblePreset, presetIcon } from './presenters.ts'

// First step of the add-provider flow: choose a provider preset. Native providers
// (their own adapters) are separated from OpenAI-compatible endpoints. Selecting a
// preset advances the drawer to the spec-driven editor.
const props = defineProps<{ presets: Preset[] }>()
const emit = defineEmits<{ (e: 'pick', preset: Preset): void }>()

const native = computed(() => props.presets.filter(p => !isCompatiblePreset(p)))
const compatible = computed(() => props.presets.filter(isCompatiblePreset))
</script>

<template>
  <div class="km-picker">
    <section v-if="native.length" class="km-picker-sec">
      <div class="km-picker-sec-title">Native providers</div>
      <div class="km-picker-list">
        <button v-for="preset in native" :key="preset.id" class="km-picker-item" @click="emit('pick', preset)">
          <span class="km-picker-ico"><Icon :icon="presetIcon(preset)" aria-hidden="true" /></span>
          <span class="km-picker-body">
            <span class="km-picker-name">{{ preset.title }}</span>
            <span class="km-picker-desc">{{ preset.description }}</span>
          </span>
          <Icon icon="tabler:chevron-right" class="km-picker-go" aria-hidden="true" />
        </button>
      </div>
    </section>

    <section v-if="compatible.length" class="km-picker-sec">
      <div class="km-picker-sec-title">OpenAI-compatible</div>
      <div class="km-picker-list">
        <button v-for="preset in compatible" :key="preset.id" class="km-picker-item" @click="emit('pick', preset)">
          <span class="km-picker-ico"><Icon :icon="presetIcon(preset)" aria-hidden="true" /></span>
          <span class="km-picker-body">
            <span class="km-picker-name">{{ preset.title }}</span>
            <span class="km-picker-desc">{{ preset.config?.base_url || preset.description }}</span>
          </span>
          <Icon icon="tabler:chevron-right" class="km-picker-go" aria-hidden="true" />
        </button>
      </div>
    </section>
  </div>
</template>
