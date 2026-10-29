<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'
import { badgeStyle, badgeVisible, canRender, type NavBadge, type NavCategory, type NavItem } from '../composables/useSurfaces'
import { normalizePath } from '../router/path'
import type { AccountItem } from './useShellAccount'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  layout: 'vertical' | 'horizontal'
  appTitle: string
  markUrl: string
  isNewChatRoute: boolean
  renderableCategories: NavCategory[]
  navItems: NavItem[]
  loaded: boolean
  navError: unknown
  railCollapsed: boolean
  collapsedCats: Set<string>
  currentUser: { email: string; full_name: string } | null
  accountItems: AccountItem[]
}>()
const {
  layout, appTitle, markUrl, isNewChatRoute, renderableCategories, navItems,
  loaded, navError, railCollapsed, collapsedCats,
  currentUser, accountItems,
} = toRefs(props)
const emit = defineEmits<{
  (event: 'new-chat'): void
  (event: 'navigate', path: string): void
  (event: 'toggle-collapsed'): void
  (event: 'expand'): void
  (event: 'toggle-cat', key: string): void
  (event: 'open-profile'): void
  (event: 'account-open', tag: string): void
  (event: 'logout'): void
}>()
const route = useRoute()
const categoryMenu = ref<InstanceType<typeof Menu> | null>(null)
const profileMenu = ref<InstanceType<typeof Menu> | null>(null)
const activeCategoryKey = ref<string | null>(null)
const activeCategory = computed(() => renderableCategories.value.find(category => category.key === activeCategoryKey.value))
const profileOpen = ref(false)
const categoryItems = computed<MenuItem[]>(() => (activeCategory.value?.items || []).map(item => ({
  label: item.label,
  icon: item.icon,
  disabled: !canRender(item),
  active: isActive(item),
  badge: item.badge,
  command: () => emit('navigate', item.path),
})))
const profileItems = computed<MenuItem[]>(() => [
  { label: 'Profile', icon: 'tabler:user', command: () => emit('open-profile') },
  ...accountItems.value.map(item => ({
    label: item.label, icon: item.icon, command: () => emit('account-open', item.component_tag),
  })),
  { separator: true },
  { label: 'Sign out', icon: 'tabler:logout', command: () => emit('logout') },
])

function toggleCategory(event: MouseEvent, category: NavCategory) {
  profileMenu.value?.hide()
  if (activeCategory.value?.key === category.key) {
    categoryMenu.value?.hide()
  } else {
    activeCategoryKey.value = category.key
    categoryMenu.value?.show(event)
  }
}

function toggleProfile(event: MouseEvent) {
  categoryMenu.value?.hide()
  profileMenu.value?.toggle(event)
}

watch(layout, () => {
  categoryMenu.value?.hide()
  profileMenu.value?.hide()
})
watch(activeCategory, category => {
  if (!category) categoryMenu.value?.hide()
})

function isActive(item: NavItem): boolean {
  const path = normalizePath(item.path || '/')
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}
function showBadge(badge?: NavBadge | null): badge is NavBadge {
  return !!badge && badgeVisible(badge)
}
function showRollup(category: NavCategory, hidden: boolean): boolean {
  return hidden && showBadge(category.rollup)
}
function userInitials(user: { email: string; full_name: string }): string {
  if (user.full_name) return user.full_name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  return user.email.charAt(0).toUpperCase()
}
</script>

<template>
  <!-- Horizontal layout: a top bar of flattened surfaces. -->
  <header
    v-if="layout === 'horizontal'"
    aria-label="App navigation"
    class="shrink-0 w-full border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 flex items-center gap-2 px-3 min-h-14 grow"
  >
    <span class="flex items-center gap-2.5 mr-2 shrink-0 min-w-0 max-w-[30%]">
      <img :src="markUrl" :alt="appTitle" class="h-7 w-7 rounded-lg shrink-0" />
      <span class="text-base font-bold tracking-tight text-surface-900 dark:text-surface-0 truncate" :title="appTitle">{{ appTitle }}</span>
    </span>
    <nav aria-label="Main navigation" class="flex-1 flex items-center gap-1 min-w-0 overflow-x-auto">
      <button
        class="app-nav-item flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors"
        :class="isNewChatRoute && 'is-active'"
        :aria-current="isNewChatRoute ? 'page' : undefined"
        @click="emit('new-chat')"
      >
        <Icon icon="tabler:plus" class="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
        <span class="nav-label">New chat</span>
      </button>
      <template v-for="category in renderableCategories" :key="category.key || '_root'">
        <!-- Ungrouped surfaces: direct buttons. -->
        <template v-if="!category.key">
          <button
            v-for="item in category.items"
            :key="item.id"
            class="app-nav-item flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors"
            :class="isActive(item) && 'is-active'"
            :aria-current="isActive(item) ? 'page' : undefined"
            :disabled="!canRender(item)"
            @click="emit('navigate', item.path)"
          >
            <Icon :icon="item.icon" class="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
            <span class="nav-label">{{ item.label }}</span>
            <template v-if="showBadge(item.badge)">
              <span v-if="item.badge!.style === 'dot'" class="nav-dot" :style="{ background: badgeStyle(item.badge!).color }" aria-hidden="true" />
              <span v-else class="nav-badge" :style="badgeStyle(item.badge!)">{{ item.badge!.value }}</span>
            </template>
          </button>
        </template>

        <!-- Category: a dropdown menu that packs its surfaces. -->
        <div v-else class="shrink-0">
          <button
            class="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors"
            :class="activeCategory?.key === category.key
              ? 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'"
            aria-haspopup="menu"
            aria-controls="app-category-menu"
            :aria-expanded="activeCategory?.key === category.key"
            @click.stop="toggleCategory($event, category)"
          >
            <Icon :icon="category.icon || 'tabler:folder'" class="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
            <span class="nav-label">{{ category.label }}</span>
            <template v-if="showRollup(category, activeCategory?.key !== category.key)">
              <span v-if="category.rollup!.style === 'dot'" class="nav-dot" :style="{ background: badgeStyle(category.rollup!).color }" aria-hidden="true" />
              <span v-else class="nav-badge" :style="badgeStyle(category.rollup!)">{{ category.rollup!.value }}</span>
            </template>
            <Icon icon="tabler:chevron-down" class="h-cat-caret shrink-0" :class="activeCategory?.key === category.key && 'h-cat-caret-open'" aria-hidden="true" />
          </button>
        </div>
      </template>
    </nav>
    <div v-if="currentUser" class="relative shrink-0 pl-2">
      <button
        class="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
        aria-haspopup="menu"
        :aria-expanded="profileOpen"
        title="Account"
        aria-label="Account"
        aria-controls="app-account-menu"
        @click.stop="toggleProfile"
      >
        <Avatar :label="userInitials(currentUser)" shape="circle" class="profile-avatar text-xs font-semibold" :title="currentUser.full_name || currentUser.email" />
        <Icon icon="tabler:chevron-down" class="w-4 h-4 text-surface-400" aria-hidden="true" />
      </button>
    </div>
  </header>

  <!-- Vertical layout: the collapsible sidebar rail. -->
  <aside
    v-if="layout !== 'horizontal'"
    aria-label="App sidebar"
    class="shrink-0 h-full border-r border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 flex flex-col sidebar"
    v-bind="$attrs"
  >
    <div
      class="px-3 py-4 flex items-center"
      :class="railCollapsed ? 'justify-center' : 'justify-between'"
    >
      <!-- Expanded: brand mark + title (static). Collapsed: the mark becomes
           the only re-open affordance — click toggles, hover expands. There
           is no separate fold button in the collapsed rail. -->
      <button
        v-if="railCollapsed"
        type="button"
        class="brand-mark-btn"
        aria-label="Expand sidebar"
        title="Expand sidebar"
        @click="emit('expand')"
        @mouseenter="emit('expand')"
      >
        <img :src="markUrl" :alt="appTitle" class="h-7 w-7 rounded-lg shrink-0" />
      </button>
      <span v-else class="flex items-center gap-2.5 min-w-0">
        <img :src="markUrl" :alt="appTitle" class="h-7 w-7 rounded-lg shrink-0" />
        <span
          class="text-base font-bold tracking-tight text-surface-900 dark:text-surface-0 truncate"
        >{{ appTitle }}</span>
      </span>
      <button
        v-if="!railCollapsed"
        class="icon-btn sm shrink-0"
        aria-label="Collapse sidebar"
        title="Collapse sidebar"
        @click="emit('toggle-collapsed')"
      ><Icon icon="tabler:layout-sidebar-left-collapse" aria-hidden="true" /></button>
    </div>

    <nav
      aria-label="Main navigation"
      class="flex-1 px-2 py-1 overflow-y-auto overflow-x-hidden"
    >
      <button
        class="app-nav-item app-nav-new w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
        :class="[railCollapsed ? 'justify-center' : '', isNewChatRoute && 'is-active']"
        :aria-current="isNewChatRoute ? 'page' : undefined"
        aria-label="New chat"
        :title="railCollapsed ? 'New chat' : undefined"
        @click="emit('new-chat')"
      >
        <Icon icon="tabler:plus" class="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
        <span v-if="!railCollapsed" class="flex-1 text-left truncate nav-label">New chat</span>
      </button>
      <template v-for="category in renderableCategories" :key="category.key || '_root'">
        <!-- Category header (real categories only) — collapsible dropdown when
             the rail is expanded. -->
        <button
          v-if="category.key && category.label && !railCollapsed"
          class="nav-cat-head w-full flex items-center gap-1.5 px-3 pt-4 pb-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          :aria-expanded="!collapsedCats.has(category.key)"
          @click="emit('toggle-cat', category.key)"
        >
          <Icon :icon="collapsedCats.has(category.key) ? 'tabler:chevron-right' : 'tabler:chevron-down'" class="w-3 h-3 shrink-0" aria-hidden="true" />
          <span class="truncate">{{ category.label }}</span>
          <template v-if="showRollup(category, collapsedCats.has(category.key))">
            <span v-if="category.rollup!.style === 'dot'" class="nav-dot ml-auto" :style="{ background: badgeStyle(category.rollup!).color }" aria-hidden="true" />
            <span v-else class="nav-badge ml-auto" :style="badgeStyle(category.rollup!)">{{ category.rollup!.value }}</span>
          </template>
        </button>
        <div v-show="!(category.key && collapsedCats.has(category.key)) || railCollapsed" class="space-y-0.5">
          <button
            v-for="item in category.items"
            :key="item.id"
            class="app-nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
            :class="[
              railCollapsed ? 'justify-center' : '',
              isActive(item) && 'is-active',
            ]"
            :aria-current="isActive(item) ? 'page' : undefined"
            :aria-label="item.label"
            :disabled="!canRender(item)"
            :title="!canRender(item)
              ? item.label + ' — no renderer installed'
              : (railCollapsed ? item.label : undefined)"
            @click="emit('navigate', item.path)"
          >
            <span class="relative shrink-0 inline-flex">
              <Icon :icon="item.icon" class="w-[18px] h-[18px]" aria-hidden="true" />
              <span
                v-if="railCollapsed && showBadge(item.badge)"
                class="nav-dot nav-dot-rail"
                :style="{ background: badgeStyle(item.badge!).color }"
                aria-hidden="true"
              />
            </span>
            <span v-if="!railCollapsed" class="flex-1 text-left truncate nav-label">{{ item.label }}</span>
            <template v-if="!railCollapsed && showBadge(item.badge)">
              <span v-if="item.badge!.style === 'dot'" class="nav-dot" :style="{ background: badgeStyle(item.badge!).color }" aria-hidden="true" />
              <span v-else class="nav-badge" :style="badgeStyle(item.badge!)">{{ item.badge!.value }}</span>
            </template>
            <Icon
              v-if="!canRender(item) && !railCollapsed"
              icon="tabler:plug-off"
              class="w-3.5 h-3.5 text-surface-400 shrink-0"
              aria-hidden="true"
            />
          </button>
        </div>
      </template>

      <div v-if="loaded && navError && !railCollapsed" class="px-3 py-4 text-xs" style="color: var(--p-danger-500)">
        Navigation unavailable.
      </div>
      <div v-else-if="loaded && navItems.length === 0 && !railCollapsed" class="px-3 py-4 text-xs text-surface-400">
        No surfaces registered.
      </div>
    </nav>

    <div class="px-3 py-3 border-t border-surface-200 dark:border-surface-700 relative">
      <template v-if="currentUser">
        <button
          class="w-full flex items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
          :class="railCollapsed ? 'justify-center' : ''"
          aria-haspopup="menu"
          :aria-expanded="profileOpen"
          :title="railCollapsed ? (currentUser.full_name || currentUser.email) : 'Account'"
          aria-label="Account"
          aria-controls="app-account-menu"
          @click.stop="toggleProfile"
        >
          <Avatar :label="userInitials(currentUser)" shape="circle" class="profile-avatar text-xs font-semibold shrink-0" />
          <template v-if="!railCollapsed">
            <div class="min-w-0 flex-1 text-left">
              <div class="text-sm font-medium text-surface-900 dark:text-surface-0 truncate">{{ currentUser.full_name || currentUser.email }}</div>
              <div v-if="currentUser.full_name" class="text-[11px] text-surface-600 dark:text-surface-300 truncate">{{ currentUser.email }}</div>
            </div>
            <Icon icon="tabler:selector" class="w-4 h-4 text-surface-400 shrink-0" aria-hidden="true" />
          </template>
        </button>
      </template>
      <div v-else class="flex items-center gap-2 text-[11px] text-surface-400" :class="railCollapsed ? 'justify-center' : ''">
        <Icon icon="tabler:circle-filled" class="w-2 h-2 text-primary" aria-hidden="true" />
        <span v-if="!railCollapsed">Connected</span>
      </div>
    </div>
  </aside>
  <Menu id="app-category-menu" ref="categoryMenu" :model="categoryItems" popup
    :aria-label="activeCategory?.label" @hide="activeCategoryKey = null">
    <template #item="{ item, props: itemProps }">
      <a v-bind="itemProps.action" class="app-nav-menu-item" :class="{ 'is-active': item.active }">
        <Icon v-if="item.icon" :icon="item.icon" class="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
        <span class="flex-1 nav-label">{{ item.label }}</span>
        <template v-if="showBadge(item.badge)">
          <span v-if="item.badge.style === 'dot'" class="nav-dot" :style="{ background: badgeStyle(item.badge).color }" aria-hidden="true" />
          <span v-else class="nav-badge" :style="badgeStyle(item.badge)">{{ item.badge.value }}</span>
        </template>
      </a>
    </template>
  </Menu>
  <Menu id="app-account-menu" ref="profileMenu" :model="profileItems" popup aria-label="Account"
    @show="profileOpen = true" @hide="profileOpen = false">
    <template v-if="currentUser" #start>
      <div class="px-3 py-2.5 border-b border-surface-200 dark:border-surface-700">
        <div class="text-sm font-medium text-surface-900 dark:text-surface-0 truncate">{{ currentUser.full_name || currentUser.email }}</div>
        <div v-if="currentUser.full_name" class="text-[11px] text-surface-600 dark:text-surface-300 truncate">{{ currentUser.email }}</div>
      </div>
    </template>
    <template #item="{ item, props: itemProps }">
      <a v-bind="itemProps.action">
        <Icon v-if="item.icon" :icon="item.icon" class="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </a>
    </template>
  </Menu>
</template>

<style scoped>
.sidebar {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
}
.sidebar--expanded {
  width: 100%;
}
.sidebar--collapsed {
  width: 100%;
}
/* Collapsed-rail brand button: the logo is the re-open affordance. */
.brand-mark-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: 0;
  background: transparent;
  border-radius: var(--kx-radius-8);
  cursor: pointer;
  transition: background .15s, transform .15s;
}
.brand-mark-btn:hover {
  background: var(--kx-overlay-hover);
  transform: translateY(-1px);
}

/* Navigation text is functional copy at 13px, so both inactive and branded
   active states use contrast-safe foregrounds derived from the host theme. */
.app-nav-item {
  color: color-mix(in srgb, var(--p-text-muted-color) 55%, var(--p-text-color));
}
/* Nav rows read as links: no border at rest, only a background on hover and
   while active. Nothing to highlight, so the ring is an offset outline and no
   halo - the borderless half of the focus contract. Owned here rather than in
   the theme because only this component knows it draws no border. Values come
   from --p-focus-ring-*; see the facade README. */
.app-nav-item:focus-visible {
  outline: var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-focus-ring-color);
  outline-offset: var(--p-focus-ring-offset);
  box-shadow: none;
}
.app-nav-item:hover {
  color: var(--p-text-color);
  background: var(--kx-surface-2);
}
.app-nav-item.is-active {
  color: var(--ac-fg);
  background: var(--kx-wash-primary);
  font-weight: 500;
}
.profile-avatar {
  color: var(--ac-fg);
  background: var(--kx-wash-primary);
}

/* Popup placement, focus and dismissal are owned by PrimeVue Menu. */
.h-cat-caret { width: 14px; height: 14px; opacity: .65; transition: transform .15s; }
.h-cat-caret-open { transform: rotate(180deg); }
.app-nav-menu-item.is-active { background: var(--kx-wash-primary); color: var(--ac-fg); font-weight: 600; }

/* Nav typography stays on the body face (Inter); these only unify the scale —
   items at 13px, category section headers as the smaller uppercase group label —
   so nav items and categories read as one set across both layouts. */
.nav-label { font-size: 13px; }
.nav-cat-head {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
}

/* Nav badges: a live count or presence dot bound to component meta. Tone-tinted
   background + readable foreground come from the tone tokens via :style; the shared
   badge radius keeps them consistent with every other pill (no ad-hoc shapes). */
.nav-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: var(--kx-radius-tag);
  font-size: 11px; font-weight: 600; line-height: 1;
}
.nav-dot { width: 8px; height: 8px; border-radius: 999px; }
/* Collapsed-rail dot: overlays the top-right of the surface icon. */
.nav-dot-rail { position: absolute; top: -2px; right: -2px; box-shadow: 0 0 0 2px var(--p-content-background); }
</style>
