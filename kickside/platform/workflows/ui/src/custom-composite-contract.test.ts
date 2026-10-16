import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

interface Evidence {
  path: string
  assertion?: string
  kind?: string
  scenario?: string
}

interface CustomComposite {
  id: string
  source: {
    path: string
    sha256: string
  }
  semanticRole: string
  affordance: string
  rejectedPrimeVueCompositions: Array<{
    composition: string
    reason: string
  }>
  primeVueVisualSibling: {
    component: string
    usage: string
  }
  inheritedRuntimeProperties: string[]
  invariantProperties: string[]
  novelGeometry: string
  accessibilityEvidence: Evidence[]
  visualEvidence: Evidence[]
}

interface CustomCompositeContract {
  schemaVersion: number
  module: string
  sharedUiPackage: string | null
  customComposites: CustomComposite[]
}

const contractPath = fileURLToPath(
  new URL('../../wippy-fe.contract.json', import.meta.url),
)
const moduleRoot = dirname(contractPath)
const contract = JSON.parse(
  readFileSync(contractPath, 'utf8'),
) as CustomCompositeContract

function expectNonEmpty(value: string): void {
  expect(value.trim().length).toBeGreaterThan(0)
}

describe('retained custom-composite contract', () => {
  it('is module-local and declares only the two reviewed graph composites', () => {
    expect(contract.schemaVersion).toBe(1)
    expect(contract.module).toBe('kickside/workflows')
    expect(contract.sharedUiPackage).toBeNull()
    expect(contract.customComposites.map(({ id }) => id).sort()).toEqual([
      'workflows.canvas.auto-map-reveal',
      'workflows.canvas.edge-intent-popover',
    ])
  })

  it('contains every required review field with source-backed evidence', () => {
    for (const composite of contract.customComposites) {
      expectNonEmpty(composite.id)
      expectNonEmpty(composite.source.path)
      expect(composite.source.sha256).toMatch(/^[A-F0-9]{64}$/)
      expectNonEmpty(composite.semanticRole)
      expectNonEmpty(composite.affordance)
      expectNonEmpty(composite.primeVueVisualSibling.component)
      expectNonEmpty(composite.primeVueVisualSibling.usage)
      expectNonEmpty(composite.novelGeometry)
      expect(composite.rejectedPrimeVueCompositions.length).toBeGreaterThan(0)
      expect(composite.inheritedRuntimeProperties.length).toBeGreaterThan(0)
      expect(composite.invariantProperties.length).toBeGreaterThan(0)
      expect(composite.accessibilityEvidence.length).toBeGreaterThan(0)
      expect(composite.visualEvidence.length).toBeGreaterThan(0)

      for (const rejection of composite.rejectedPrimeVueCompositions) {
        expectNonEmpty(rejection.composition)
        expectNonEmpty(rejection.reason)
      }
      for (const property of [
        ...composite.inheritedRuntimeProperties,
        ...composite.invariantProperties,
      ]) {
        expectNonEmpty(property)
      }
      for (const evidence of [
        ...composite.accessibilityEvidence,
      ]) {
        expectNonEmpty(evidence.path)
        expect(existsSync(resolve(moduleRoot, evidence.path)), evidence.path).toBe(
          true,
        )
      }
      for (const evidence of composite.visualEvidence) {
        expect(evidence.kind).toBe('rendered-dom-snapshot')
        expectNonEmpty(evidence.scenario || '')
        expect(evidence.path.endsWith('.snap')).toBe(true)
        const artifactPath = resolve(moduleRoot, evidence.path)
        expect(existsSync(artifactPath), evidence.path).toBe(true)
        const artifact = readFileSync(artifactPath, 'utf8')
        expect(artifact).toContain('exports[')
        expect(artifact).toMatch(/<(button|div|section)\b/)
      }
    }
  })

  it('invalidates an exception whenever its reviewed source changes', () => {
    for (const composite of contract.customComposites) {
      const source = readFileSync(resolve(moduleRoot, composite.source.path))
      const actualHash = createHash('sha256')
        .update(source)
        .digest('hex')
        .toUpperCase()
      expect(actualHash, composite.id).toBe(composite.source.sha256)
    }
  })
})
