<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import { automationTypeDescription } from './type-copy'
import { customCreateTag } from './custom-view'
import { enumOptions, inputControlType, isRequired } from './install-form'
import type { InstallFlow } from './useInstallFlow'

// The popup shell for every way an automation is created: the registry-owned
// catalog on the left, whatever the selection mounts on the right. Every state
// transition belongs to the flow this shell is handed.
const props = defineProps<{
  flow: InstallFlow
  componentMode: boolean
  dialogPt: Record<string, unknown>
}>()

const {
  showTypeCatalog, installFields, showInstall, installType, installForm,
  installing, customSaving, installError, customInstallHost, installSearchInput,
  typeSearch, filteredTypes, chooseType, closeInstall,
  focusInstallDialog, onCreate,
} = props.flow
</script>

<template>
  <!-- PrimeVue owns the modal shell; the registry-owned catalog lists every
       installable automation type. -->
  <Dialog
    :visible="showInstall"
    :modal="true"
    :block-scroll="true"
    :dismissable-mask="true"
    :pt="dialogPt"
    class="kx-modal kx-modal-2p"
    :class="{ 'kx-modal-solo': !showTypeCatalog }"
    aria-label="Add an automation"
    @update:visible="(v) => { if (!v) closeInstall() }"
    @show="focusInstallDialog"
  >
    <template #header>
      <span class="kx-modal-head-icon"><Icon :icon="(installType && installType.icon) || 'tabler:bolt'" aria-hidden="true" /></span>
      <span class="kx-modal-head-text">
        <span class="kx-modal-head-title">{{ installType ? (installType.title || installType.name) : 'Add an automation' }}</span>
        <span class="kx-modal-head-sub">Configure an automation.</span>
      </span>
    </template>

    <div class="kx-2p" :class="{ 'kx-2p-solo': !showTypeCatalog }">
        <div v-if="showTypeCatalog" class="kx-2p-l">
          <div class="kx-cat-search">
            <Icon icon="tabler:search" aria-hidden="true" />
            <input ref="installSearchInput" v-model="typeSearch" data-modal-initial type="text" placeholder="Search types…" aria-label="Search automation types" />
          </div>
          <div v-if="!filteredTypes.length" class="kx-cat-empty">No setups match “{{ typeSearch }}”.</div>
          <div v-else class="kx-cat">
            <button
              v-for="t in filteredTypes"
              :key="t.id"
              class="kx-cat-card"
              :class="installType?.id === t.id && 'sel'"
              @click="chooseType(t)"
            >
              <span class="kx-cat-ico"><Icon :icon="t.icon || 'tabler:sparkles'" aria-hidden="true" /></span>
              <span class="kx-cat-text">
                <span class="kx-cat-name">{{ t.title || t.name }}</span>
                <span v-if="automationTypeDescription(t)" class="kx-cat-desc">{{ automationTypeDescription(t) }}</span>
              </span>
              <Icon icon="tabler:check" class="kx-cat-check" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div class="kx-2p-r">
          <div v-if="showTypeCatalog" class="kx-2p-r-head">Setup</div>
          <div class="kx-2p-r-body">
            <p v-if="!installType" class="kx-2p-r-note">Select an automation type to configure it.</p>
            <template v-else>
              <div v-if="customCreateTag(installType)" ref="customInstallHost" class="kx-custom-host"></div>
              <div v-else-if="!installFields.length" class="kx-2p-r-note">This automation needs no configuration.</div>
              <div v-else class="kx-form">
                <label v-for="[key, field] in installFields" :key="key" class="kx-field">
                  <span class="kx-field-lbl">
                    {{ field.title || key }}
                    <span v-if="isRequired(installType, key)" class="kx-req" aria-hidden="true">*</span>
                  </span>
                  <Select
                    v-if="field.enum"
                    class="kx-select"
                    :model-value="installForm[key]"
                    :options="enumOptions(installType, key, field)"
                    option-label="label"
                    option-value="value"
                    placeholder="—"
                    :aria-label="field.title || key"
                    @update:model-value="installForm[key] = $event"
                  />
                  <input v-else-if="field.type === 'boolean'" v-model="installForm[key]" class="kx-check" type="checkbox" />
                  <input v-else-if="field.type === 'number' || field.type === 'integer'" v-model.number="installForm[key]" class="kx-input" type="number" />
                  <input v-else v-model="installForm[key]" class="kx-input" :type="inputControlType(field)" :placeholder="field.description || ''" />
                  <span v-if="field.description && !(field.type !== 'boolean' && !field.enum)" class="kx-field-hint">{{ field.description }}</span>
                  <span v-else-if="field.description && field.enum" class="kx-field-hint">{{ field.description }}</span>
                </label>
              </div>
            </template>
          </div>
        </div>
      </div>

    <template #footer>
      <div v-if="installError" class="kx-err inline kx-foot-err">{{ installError }}</div>
      <Button type="button" label="Cancel" severity="secondary" outlined :disabled="installing || customSaving" @click="closeInstall" />
      <Button
        v-if="installType"
        type="button"
        data-testid="automations-install-create"
        :label="(installing || customSaving) ? 'Creating…' : 'Create'"
        :loading="installing || customSaving"
        :disabled="installing || customSaving"
        @click="onCreate"
      >
        <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
      </Button>
    </template>
  </Dialog>
</template>
