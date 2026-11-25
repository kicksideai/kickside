// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { createServer } from 'vite'

const names = [
  'Alexandria Catherine Montgomery-Wellington, III',
  'Beatriz Valentina Hernández de la Cruz',
  'Chandrasekhar Ramanathan Subramaniam',
  'Dominique Isabelle Fontaine-Lefebvre',
  'Elizabeth Margaret Abernathy-Sutherland',
  'Federico Antonio García de los Monteros',
  'Genevieve Josephine Boudreaux-Chastain',
  'Harriet Alexandra Fitzwilliam-Somerset',
  'International Catalog Administration and Quality Assurance',
  'Jeremiah Nathaniel Livingston-Wentworth',
  'Katerina Anastasia Papadopoulou-Papageorgiou',
  'LogisticsOperationsAndProductCatalogGovernanceTeam',
]
const access = names.map((full_name, index) => ({
  subject_id: `grantee-${index}`,
  subject_type: [8, 11].includes(index) ? 'group' : 'user',
  full_name,
  email: `grantee-${index}@example.test`,
  access_mask: index === 0 ? 15 : (index % 7) + 1,
  owner: index === 0,
}))
const capabilities = [
  ['Read', 'View this item'],
  ['Write', 'Edit this item'],
  ['Delete', 'Delete this item'],
  ['Admin', 'Manage access and sharing'],
].map(([label, description], index) => ({
  label, description, key: label.toLowerCase(), bit: 1 << index,
}))
const newPrincipal = {
  id: 'new-person',
  type: 'user',
  label: 'Margareta Wilhelmina von Hohenberg-Kaltenbrunner',
}
const facadeCss = await readFile(new URL('../../../../app/static/custom-css.facade.generated.css', import.meta.url), 'utf8')

let server
let browser
let base

before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    resolve: { dedupe: ['@iconify/vue', 'vue'] },
    optimizeDeps: {
      entries: ['test/share-layout.html'],
      include: [
        'vue', '@iconify/vue', '@wippy-fe/proxy', '@wippy-fe/webcomponent-vue',
        '@wippy-fe/theme/primevue-plugin', 'primevue/config', 'primevue/dialog',
        'primevue/confirmdialog', 'primevue/confirmationservice',
      ],
    },
    server: { host: '127.0.0.1' },
  })
  await server.listen()
  base = server.resolvedUrls.local[0]
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH })
})

after(async () => {
  await browser?.close()
  await server?.close()
})

for (const width of [390, 1440]) {
  test(`Share keeps long grantee names and controls within the dialog at ${width} px`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 844 } })
    try {
      await page.route('**/api/test/access', route => route.fulfill({ json: { success: true, access } }))
      await page.route('**/api/v1/components/access-model', route => route.fulfill({ json: { success: true, capabilities } }))
      await page.route('**/api/v1/principals/search', route =>
        route.fulfill({ json: { success: true, principals: [newPrincipal] } }))
      // Use the same PrimeVue dialog styles the Wippy shadow root loads from its host.
      await page.route('**/assets/tailwind.css', async route => {
        const response = await page.request.get(new URL('test/share-host.css?direct', base).href)
        await route.fulfill({ response })
      })
      await page.route('**/assets/theme-config.css', route => route.fulfill({ body: '', contentType: 'text/css' }))
      await page.route('**/test/facade.css*', route => route.fulfill({ body: facadeCss, contentType: 'text/css' }))
      await page.goto(new URL('test/share-layout.html', base).href)

      const dialog = page.getByRole('dialog', { name: 'Share', exact: true })
      await dialog.locator('.kxs-row').nth(11).waitFor()
      await dialog.locator('.kxs-row .kxs-cap').last().waitFor({ state: 'attached' })
      await page.waitForFunction(() => document.querySelector('kickside-share').shadowRoot
        .querySelectorAll('style[role="@wippy-fe/host-css"]').length === 1)

      const metrics = await dialog.evaluate(modal => {
        const body = modal.querySelector('.p-dialog-content')
        const bounds = modal.querySelector('.kxs').getBoundingClientRect()
        const rect = element => element.getBoundingClientRect()
        const picker = rect(modal.querySelector('.kpp-control'))
        const share = rect(modal.querySelector('.kxs-add .kxs-btn'))
        const rows = Array.from(modal.querySelectorAll('.kxs-row'), row => {
          const name = row.querySelector('.kxs-row-label')
          const chips = rect(row.querySelector('.kxs-caps'))
          return {
            width: rect(name).width,
            tooltip: name.title,
            ellipsis: getComputedStyle(name).textOverflow,
            truncated: name.scrollWidth > name.clientWidth,
            chipsBelowName: chips.top >= rect(name).bottom,
          }
        })
        return {
          rows,
          pickerAboveShare: picker.bottom <= share.top,
          addOverflow: share.right - bounds.right,
          bodyOverflow: body.scrollWidth - body.clientWidth,
          overflowingControls: Array.from(modal.querySelectorAll('.kxs button, .kxs-row-label'), control => rect(control))
            .filter(control => control.left < bounds.left - 1 || control.right > bounds.right + 1).length,
        }
      })

      assert.equal(metrics.rows.length, names.length)
      assert.deepEqual({
        collapsedNames: metrics.rows.filter(row => row.width <= 0).length,
        addOverflows: metrics.addOverflow > 1,
        bodyOverflows: metrics.bodyOverflow > 1,
        overflowingControls: metrics.overflowingControls,
      }, {
        collapsedNames: 0,
        addOverflows: false,
        bodyOverflows: false,
        overflowingControls: 0,
      }, JSON.stringify(metrics))
      assert(metrics.rows.every(row => row.width >= 120), 'Each name has room for a readable prefix')
      assert(metrics.rows.some(row => row.truncated), 'The fixture exercises ellipsis')
      assert(metrics.rows.every(row => row.ellipsis === 'ellipsis'))
      assert.deepEqual(metrics.rows.map(row => row.tooltip).sort(), names.toSorted())
      assert.equal(metrics.pickerAboveShare, width === 390)
      assert(metrics.rows.every(row => row.chipsBelowName === (width === 390)))

      const permissions = dialog.getByRole('group', { name: 'Permissions' })
      const buttonBoxes = []
      for (const { label, description } of capabilities) {
        const button = permissions.getByRole('button', { name: label, exact: true })
        const effect = permissions.getByText(description, { exact: true })
        const buttonBox = await button.boundingBox()
        const effectBox = await effect.boundingBox()
        assert(buttonBox && effectBox, `${label} and its description are visible`)
        assert.equal(await button.getAttribute('aria-describedby'), await effect.getAttribute('id'))
        assert(effectBox.y >= buttonBox.y + buttonBox.height, `${label} has its description below it`)
        const labelLines = await button.locator('span').evaluate(element => {
          const range = document.createRange()
          range.selectNodeContents(element)
          return range.getClientRects().length
        })
        assert.equal(labelLines, 1, `${label} fits on one line`)
        buttonBoxes.push(buttonBox)
      }
      assert(buttonBoxes.every(box => Math.abs(box.y - buttonBoxes[0].y) < 1),
        'Permission buttons share one row')
      assert(buttonBoxes.slice(1).every((box, index) => box.x >= buttonBoxes[index].x + buttonBoxes[index].width),
        'Permission buttons are ordered left to right without overlapping')

      await dialog.getByRole('button', { name: 'Select a person or group…' }).click()
      await dialog.getByRole('combobox', { name: 'Search people or groups' }).fill('Margareta')
      const option = dialog.getByRole('option', { name: newPrincipal.label })
      await option.waitFor()
      const list = await dialog.getByRole('listbox', { name: 'People and groups' }).boundingBox()
      assert(list.x >= 0 && list.x + list.width <= width, 'The open picker fits the viewport')
      await option.click()
      assert.equal(await dialog.getByRole('button', { name: 'Share', exact: true }).isEnabled(), true)

      const group = names.at(-1)
      await dialog.getByRole('button', { name: `Remove ${group}`, exact: true }).click()
      const confirmation = page.getByRole('alertdialog')
      await confirmation.getByText(`Remove ${group}’s access to “Release board”?`).waitFor()
      await confirmation.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)))
      const box = await confirmation.boundingBox()
      assert(box.x >= 0 && box.x + box.width <= width, 'The confirmation fits with an unbroken name')
      await confirmation.getByRole('button', { name: 'Cancel', exact: true }).click()
      assert.equal(await dialog.getByRole('button', { name: `Remove ${group}`, exact: true }).count(), 1)
    } finally {
      await page.close()
    }
  })
}
