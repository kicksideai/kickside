<script setup lang="ts">
// Borderless two-zone shell: a navigation rail flush against the open content
// area. The rail holds the provider list; the default slot is the model pool.
// The rail collapses above the content on narrow widths.
</script>

<template>
  <div class="kx-shell">
    <aside class="kx-rail"><slot name="rail" /></aside>
    <main class="kx-main kx-system-pane"><slot /></main>
  </div>
</template>
