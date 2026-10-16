<script setup lang="ts">
const message = defineModel<string>({ required: true })
</script>

<template>
  <div class="kx-chat-empty">
    <h2 class="kx-chat-empty__title">What can I help you with?</h2>
    <textarea
      v-model="message"
      class="kx-chat-empty__input"
      placeholder="How can I help you today?"
      aria-label="Message"
      rows="3"
    />
  </div>
</template>

<style scoped>
.kx-chat-empty { width: min(760px, 100%); }
.kx-chat-empty__title { margin: 0 0 24px; color: var(--p-text-color); font-size: clamp(1.9rem, 4vw, 2.8rem); font-weight: 500; line-height: 1.08; text-align: center; }
.kx-chat-empty__input { display: block; width: 100%; padding: 16px; border: 1px solid var(--p-content-border-color); border-radius: 14px; background: var(--p-content-background); color: var(--p-text-color); font: inherit; font-size: 1.08rem; line-height: 1.45; resize: vertical; }
.kx-chat-empty__input::placeholder { color: var(--p-text-muted-color); }
</style>
