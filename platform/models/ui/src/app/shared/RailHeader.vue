<script setup lang="ts">
// Rail header: a section title with an optional count, plus a slot for icon
// actions on the right.
defineProps<{ title: string; count?: number }>()
</script>

<template>
  <div class="km-railhead">
    <span class="km-railhead-title">{{ title }}<b v-if="count !== undefined">{{ count }}</b></span>
    <div class="km-railhead-acts"><slot name="actions" /></div>
  </div>
</template>
