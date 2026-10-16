import { computed, type Ref } from 'vue'
import { manageConfigOf, manageLocationOf, manageTagOf } from './custom-view'
import {
  collectMetrics, isTerminalStatus, rowMessage as rowMessageOf, statusPill, subtitleOf,
  type Metric, type RowMessage,
} from './row-status'
import { catalogActionNames, actionContextFor, buildActionItems, recoverMethod, runNowMethod, type ActionItem } from './action-model'
import type { Automation, AutomationStatus, AutomationType } from './automation-types'

interface AutomationPresentationOptions {
  automations: Ref<Automation[]>
  types: Ref<AutomationType[]>
  query: Ref<string>
  drawerId: Ref<string>
}

export function useAutomationPresentation({ automations, types, query, drawerId }: AutomationPresentationOptions) {
  const typeById = computed(() => {
    const map: Record<string, AutomationType> = {}
    for (const type of types.value) map[type.id] = type
    return map
  })
  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return automations.value
    return automations.value.filter(automation =>
      (automation.title || '').toLowerCase().includes(q) ||
      (automation.description || '').toLowerCase().includes(q) ||
      (automation.type || '').toLowerCase().includes(q),
    )
  })

  function pretty(automation: Automation): string { return automation.title || automation.id }
  function typeFor(automation: Automation): AutomationType | undefined {
    return automation.type ? typeById.value[automation.type] : undefined
  }
  function iconFor(automation: Automation): string {
    if (automation.icon) return automation.icon
    return typeFor(automation)?.icon || 'tabler:bolt'
  }

  function declaredActions(automation: Automation): Set<string> {
    return catalogActionNames(typeFor(automation))
  }
  function hasAction(automation: Automation, name: string): boolean { return declaredActions(automation).has(name) }
  function runNowFor(automation: Automation): string { return runNowMethod(declaredActions(automation)) }
  function actionItemsFor(automation: Automation): ActionItem[] {
    return buildActionItems(actionContextFor(typeFor(automation)))
  }
  function recoverFor(automation: Automation): string { return recoverMethod(declaredActions(automation)) }

  function manageTag(automation: Automation): string { return manageTagOf(typeFor(automation)) }
  function manageLocation(automation: Automation): string { return manageLocationOf(typeFor(automation)) }
  function manageConfig(automation: Automation | null): Record<string, unknown> {
    return automation ? manageConfigOf(automation, typeFor(automation)) : {}
  }

  function statusFor(automation: Automation): AutomationStatus | undefined { return automation.public_state }
  function metrics(automation: Automation): Metric[] {
    return collectMetrics(typeFor(automation)?.public_state_schema?.fields, statusFor(automation), false)
  }
  function detailMetrics(automation: Automation): Metric[] {
    return collectMetrics(typeFor(automation)?.public_state_schema?.fields, statusFor(automation), true)
  }
  function isTerminal(automation: Automation): boolean { return isTerminalStatus(statusFor(automation)) }
  function rowMessage(automation: Automation): RowMessage | null { return rowMessageOf(statusFor(automation), automation.availability) }
  function statusOf(automation: Automation) {
    return statusPill(statusFor(automation), hasAction(automation, 'status'), automation.drive_status, automation.availability)
  }
  function isPaused(automation: Automation): boolean { return statusOf(automation).kind === 'off' }
  function subtitleLine(automation: Automation): string {
    return subtitleOf(typeFor(automation)?.public_state_schema?.fields, statusFor(automation))
  }

  const drawerAutomation = computed(() => automations.value.find(automation => automation.id === drawerId.value) || null)
  const drawerType = computed(() => drawerAutomation.value ? typeFor(drawerAutomation.value) : undefined)

  return {
    typeById, filtered, pretty, typeFor, iconFor, declaredActions, hasAction, runNowFor,
    actionItemsFor, recoverFor, manageTag, manageLocation, manageConfig, statusFor,
    metrics, detailMetrics, isTerminal, rowMessage, statusOf, isPaused, subtitleLine,
    drawerAutomation, drawerType,
  }
}
