<script setup lang="ts">
import type { ClassGroup } from '../types.ts'
import { Avatar, EmptyState, Pill } from './shared'

// Registry-declared model classes (fast / nano / balanced / …), ordered by weight
// (fastest/lightest first). Each class shows its declared icon, title, and
// description; members are ranked by priority and the top one — what the runtime
// resolves for class:<name> — is marked active.
defineProps<{ classes: ClassGroup[] }>()
</script>

<template>
  <div class="km-classes">
    <div v-if="!classes.length" class="km-pool-body">
      <EmptyState
        icon="tabler:category-2"
        title="No model classes"
        hint="Models declare classes via their class field. A class:<name> reference resolves to the highest-priority member."
      />
    </div>

    <div v-else class="km-pool-table km-classes-list">
      <article v-for="c in classes" :key="c.name" class="km-class">
        <div class="km-class-head">
          <Avatar :icon="c.icon || 'tabler:category'" size="sm" />
          <div class="km-class-head-text">
            <div class="km-class-title">
              {{ c.title || c.name }}
              <code class="km-class-ref">class:{{ c.name }}</code>
            </div>
            <div v-if="c.description" class="km-class-desc">{{ c.description }}</div>
          </div>
          <div class="km-class-meta">
            <Pill v-if="!c.declared" severity="warn">undeclared</Pill>
            <Pill severity="secondary">weight {{ c.weight ?? 100 }}</Pill>
            <span class="km-class-count">{{ c.models.length }} model{{ c.models.length === 1 ? '' : 's' }}</span>
          </div>
        </div>
        <div v-if="c.models.length" class="km-class-members">
          <div v-for="(m, i) in c.models" :key="m.name" class="km-class-member" :class="{ top: i === 0 }">
            <Pill v-if="i === 0" severity="success" icon="tabler:check">active</Pill>
            <span v-else class="km-class-rank">{{ i + 1 }}</span>
            <span class="km-class-member-name">{{ m.title || m.name }}</span>
            <span class="km-class-member-id">{{ m.name }}</span>
            <span class="km-class-member-pri">priority {{ m.priority ?? 0 }}</span>
          </div>
        </div>
        <div v-else class="km-class-empty">No models assigned to this class yet.</div>
      </article>
    </div>
  </div>
</template>
