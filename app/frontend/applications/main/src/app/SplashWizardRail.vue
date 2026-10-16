<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { SplashOutcome, SplashStepList } from './splashTypes'

const props = defineProps<{
  brand: string
  steps: SplashStepList
  index: number
  outcomes: Record<string, SplashOutcome>
}>()
const emit = defineEmits<{ (event: 'go-to', index: number): void }>()

function stepState(index: number): string {
  if (index < props.index) return props.outcomes[props.steps[index]?.id]?.status || 'completed'
  if (index === props.index) return 'now'
  return 'wait'
}
</script>

<template>
  <aside class="sp-aside">
    <div class="sp-bg"><span class="sp-orb sp-o1" /><span class="sp-orb sp-o2" /></div>
    <div class="sp-brand">
      <span class="sp-mark">{{ brand.slice(0, 1) }}</span>
      <span class="sp-word">{{ brand }}</span>
    </div>

    <nav v-if="steps.length > 1" class="sp-steps" aria-label="Setup steps">
      <button
        v-for="(step, index) in steps"
        :key="step.id"
        type="button"
        class="sp-step-item"
        :class="stepState(index)"
        :disabled="index >= props.index"
        @click="emit('go-to', index)"
      >
        <span class="sp-step-num">
          <Icon v-if="index < props.index" :icon="outcomes[step.id]?.status === 'skipped' ? 'tabler:minus' : 'tabler:check'" :width="13" :height="13" aria-hidden="true" />
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="sp-step-label">{{ step.title }}</span>
      </button>
    </nav>

    <div class="sp-aside-foot">Setup · {{ props.index + 1 }} of {{ steps.length }}</div>
  </aside>
</template>

<style scoped>
/* ── Left rail ─────────────────────────────────────────────────────────── */
.sp-aside {
  position: relative; flex: none; width: 320px; overflow: hidden;
  display: flex; flex-direction: column; gap: 40px;
  padding: 40px 28px; border-right: 1px solid var(--p-content-border-color); background: var(--kx-surface-1);
}
.sp-bg { position: absolute; inset: 0; pointer-events: none; }
.sp-orb { position: absolute; border-radius: 50%; filter: blur(90px); }
.sp-o1 { width: 360px; height: 360px; background: radial-gradient(circle, color-mix(in srgb, var(--p-primary-color) 22%, transparent), transparent 60%); top: -120px; left: -80px; }
.sp-o2 { width: 280px; height: 280px; background: radial-gradient(circle, color-mix(in srgb, var(--p-primary-color) 12%, transparent), transparent 60%); bottom: -80px; right: -60px; }
.sp-brand { position: relative; display: flex; align-items: center; gap: 11px; }
.sp-mark {
  width: 34px; height: 34px; border-radius: var(--kx-radius-10); flex: none;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--kx-font-heading); font-weight: 800; font-size: 17px; text-transform: uppercase;
  color: var(--p-primary-contrast-color); background: var(--p-primary-color);
  box-shadow: 0 4px 18px color-mix(in srgb, var(--p-primary-color) 35%, transparent);
}
.sp-word { font-family: var(--kx-font-heading); font-size: 18px; font-weight: 700; letter-spacing: -.3px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sp-steps { position: relative; display: flex; flex-direction: column; gap: 2px; }
.sp-step-item {
  display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
  padding: 9px 10px; border: 0; border-radius: var(--kx-radius-10); background: transparent;
  font: inherit; cursor: default; transition: background .15s;
}
.sp-step-item.completed { cursor: pointer; }
.sp-step-item.skipped { cursor: pointer; }
.sp-step-item.completed:hover, .sp-step-item.skipped:hover { background: var(--kx-surface-2); }
.sp-step-item.now { background: var(--kx-wash-primary); }
.sp-step-num {
  width: 24px; height: 24px; flex: none; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--kx-font-heading); font-size: 11.5px; font-weight: 700; transition: all .2s;
}
.sp-step-item.completed .sp-step-num { background: var(--p-primary-color); color: var(--p-primary-contrast-color); }
.sp-step-item.skipped .sp-step-num { background: var(--kx-surface-3); color: var(--kx-text-faint); }
.sp-step-item.now .sp-step-num { background: var(--p-primary-color); color: var(--p-primary-contrast-color); box-shadow: 0 0 0 4px color-mix(in srgb, var(--p-primary-color) 16%, transparent); }
.sp-step-item.wait .sp-step-num { background: var(--kx-surface-3); color: var(--kx-text-fainter); border: 1.5px solid var(--p-content-border-color); }
.sp-step-label { font-size: 13px; color: var(--kx-text-faint); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sp-step-item.completed .sp-step-label { color: var(--p-text-muted-color); }
.sp-step-item.skipped .sp-step-label { color: var(--kx-text-faint); }
.sp-step-item.now .sp-step-label { color: var(--p-text-color); font-weight: 700; }
.sp-aside-foot { position: relative; margin-top: auto; font-size: 11px; color: var(--kx-text-fainter); font-weight: 600; letter-spacing: .03em; text-transform: uppercase; }

@media (max-width: 760px) {
  .sp-aside { width: auto; flex-direction: row; align-items: center; gap: 20px; padding: 16px 20px; border-right: 0; border-bottom: 1px solid var(--p-content-border-color); }
  .sp-steps { flex-direction: row; overflow-x: auto; gap: 2px; }
  .sp-step-label { display: none; }
  .sp-step-item.now .sp-step-label { display: inline; }
  .sp-aside-foot { display: none; }
}
</style>
