import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PrimeDrawer from 'primevue/drawer'
import Drawer from './Drawer.vue'

const directory = dirname(fileURLToPath(import.meta.url))

describe('Models editor delivery and scrolling', () => {
  it('assigns the scrolling body to the provider editor without scrolling its footer', () => {
    const wrapper = mount(Drawer, {
      props: { open: true, title: 'Fixture provider' },
      slots: { default: '<form>Provider fields</form>', footer: '<button>Save provider</button>' },
    })
    const drawer = wrapper.getComponent(PrimeDrawer)
    expect(drawer.props('pt')).toEqual({ content: { class: 'km-drawer-content' } })
    const css = readFileSync(resolve(directory, '../../styles.css'), 'utf8')
    const rule = css.match(/\.km-drawer-content\s*\{([^}]+)\}/)?.[1]
    expect(rule).toBeDefined()
    expect(rule).toMatch(/min-height:\s*0;/)
    expect(rule).toMatch(/overflow-y:\s*auto;/)
    expect(rule).toMatch(/overscroll-behavior:\s*contain;/)
    wrapper.unmount()
  })

  it('revalidates stable editor bundle names at the module static mount', () => {
    const index = readFileSync(resolve(directory, '../../../../src/_index.yaml'), 'utf8')
    const mount = index.split('name: ui_static')[1]?.split(/\n  - name:/)[0]
    expect(mount).toContain('path: /kickside-models')
    expect(mount).toContain('cache: "no-cache"')
  })
})
