<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { stableStringify, type TriggerSchedule } from '../spec'
import {
  CRON_PRESETS, PERIODIC_UNITS, WEEKDAY_OPTIONS,
  formFromSchedule, scheduleFromForm, type CronPreset,
} from '../schedule'

// The "How often" face. The stored schedule flows in as the model value and only
// a user edit flows back out, so an expression this form cannot express stays
// exactly as it was stored until someone changes the cadence.
const props = defineProps<{ modelValue: TriggerSchedule | null; disabled?: boolean; defaultPreset?: CronPreset }>()
const emit = defineEmits<{ 'update:modelValue': [TriggerSchedule | null] }>()

const form = reactive(formFromSchedule(props.modelValue, props.defaultPreset))
let lastEmitted = stableStringify(props.modelValue)

watch(() => props.modelValue, (next) => {
  // Skip the echo of this form's own emit; anything else is a reseed.
  if (stableStringify(next) === lastEmitted) return
  lastEmitted = stableStringify(next)
  Object.assign(form, formFromSchedule(next, props.defaultPreset))
})

function onEdit() {
  const next = scheduleFromForm(form)
  lastEmitted = stableStringify(next)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="kx-tc-field" data-test="tc-schedule">
    <span class="kx-tc-lbl"><Icon icon="tabler:repeat" aria-hidden="true" /> How often</span>
    <label class="kx-tc-row">
      <span>Runs every</span>
      <input
        v-model.number="form.periodicEvery"
        class="kx-tc-input kx-tc-num"
        data-test="tc-periodic-n"
        aria-label="Interval count"
        min="1"
        step="1"
        type="number"
        :disabled="disabled || form.specificTimes"
        @input="onEdit"
      />
      <select v-model="form.periodicUnit"
        class="kx-tc-select kx-tc-unit"
        data-test="tc-periodic-unit"
        aria-label="Interval unit"
        :disabled="disabled || form.specificTimes"
        @change="onEdit">
        <option v-for="option in PERIODIC_UNITS" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
    </label>
    <label class="kx-tc-check">
      <input v-model="form.specificTimes" data-test="tc-specific-toggle" type="checkbox" :disabled="disabled" @change="onEdit" />
      <span>At specific times</span>
    </label>
    <div v-if="form.specificTimes" class="kx-tc-specific">
      <select v-model="form.cronPreset"
        class="kx-tc-select"
        data-test="tc-cron-preset"
        aria-label="Cadence"
        :disabled="disabled"
        @change="onEdit">
        <option v-for="option in CRON_PRESETS" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
      <template v-if="form.cronPreset !== 'custom'">
        <select v-if="form.cronPreset === 'weekly'"
          v-model="form.cronWeekday"
          class="kx-tc-select"
          data-test="tc-cron-weekday"
          aria-label="Day of week"
          :disabled="disabled"
          @change="onEdit">
        <option v-for="option in WEEKDAY_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
        <input
          v-if="form.cronPreset === 'monthly'"
          v-model.number="form.cronMonthday"
          class="kx-tc-input"
          data-test="tc-cron-monthday"
          type="number"
          :disabled="disabled"
          @input="onEdit"
        />
        <input v-model="form.cronTime" class="kx-tc-input" data-test="tc-cron-time" aria-label="Time (UTC)" type="time" :disabled="disabled" @input="onEdit" />
      </template>
      <label v-else class="kx-tc-sub">
        <span class="kx-tc-lbl">Custom cron expression</span>
        <input
          v-model="form.customCron"
          class="kx-tc-input kx-tc-code"
          data-test="tc-custom-cron"
          aria-label="Custom cron expression"
          spellcheck="false"
          :disabled="disabled"
          @input="onEdit"
        />
      </label>
    </div>
  </div>
</template>
