#!/usr/bin/env node
// Facade CSS bundler. Concatenates app/facade-src/{custom,children,host}/*.css (sorted by
// filename) into app/static/*.facade.generated.css. The facade reads the generated
// files (fs:// in app/src/app/deps/_index.yaml) and serves them at
// /app/*.facade.generated.css for non-host pages to <link>. @import cannot be used
// to assemble these — the facade inlines the text and the runtime injects it into WC
// shadows as an adoptedStyleSheet, which strips @import — hence build-time concat.
//
// The generated files are COMMITTED (like the module static/ bundles). CI runs
// `--check` to fail the build if they drift from app/facade-src/.
//
// Repository entry point: make facade-css (Windows: make.bat facade-css).
// This script remains the target implementation and supports --check for CI.

import { readdirSync, readFileSync, watch, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..') // app/
const SRC = join(appDir, 'facade-src')
const OUT = join(appDir, 'static')

// `delivery` and `role` are printed in each generated banner: where the web host
// injects the payload, and what belongs in it.
const BUNDLES = [
  {
    src: 'custom',
    out: 'custom-css.facade.generated.css',
    param: 'custom_css',
    delivery: 'the SPA host document AND every iframe/web-component shadow root',
    role: 'PrimeVue .p-* component chrome',
  },
  {
    src: 'children',
    out: 'children-custom-css.facade.generated.css',
    param: 'children_custom_css',
    delivery: 'iframes and web-component shadow roots only, NOT the SPA host document',
    role: 'web-component base rules (border reset, .p-hidden-accessible, focus baseline)',
  },
  {
    src: 'host',
    out: 'host-custom-css.facade.generated.css',
    param: 'host_custom_css',
    delivery: 'the SPA host document only, NOT iframes or shadow roots',
    role: 'rules for the web host chrome itself, such as the chat drawer',
  },
]

const lf = (s) => s.replace(/\r\n/g, '\n')

function banner(bundle, files) {
  return `/* =====================================================================
   GENERATED — do not edit. Source: app/facade-src/${bundle.src}/*.css
   Rebuild: make facade-css  (Windows: make.bat facade-css)

   Facade parameter: ${bundle.param}
   Delivered to: ${bundle.delivery}.
   Holds: ${bundle.role}.
   Assembled from: ${files.join(', ')}
   ===================================================================== */
`
}

function build(bundle) {
  const dir = join(SRC, bundle.src)
  const files = readdirSync(dir).filter((f) => f.endsWith('.css')).sort()
  const body = files
    .map((f) => `/* --- ${bundle.src}/${f} --- */\n${lf(readFileSync(join(dir, f), 'utf8')).trimEnd()}\n`)
    .join('\n')
  return (banner(bundle, files) + '\n' + body).replace(/\n*$/, '\n')
}

function writeBundles() {
  for (const bundle of BUNDLES) {
    const generated = build(bundle)
    writeFileSync(join(OUT, bundle.out), generated)
    console.log(`wrote static/${bundle.out} (${generated.length} bytes)`)
  }
}

function checkBundles() {
  const stale = []
  for (const bundle of BUNDLES) {
    const generated = build(bundle)
    let current = '<missing>'
    try { current = lf(readFileSync(join(OUT, bundle.out), 'utf8')) } catch {}
    if (current !== generated) stale.push(bundle.out)
  }
  if (stale.length) {
    console.error(`FACADE CSS STALE: ${stale.join(', ')} differ from app/facade-src/. Run: make facade-css (Windows: make.bat facade-css)`)
    process.exit(1)
  }
  console.log('facade CSS up to date')
}

const check = process.argv.includes('--check')
const watchMode = process.argv.includes('--watch')

if (check && watchMode) {
  console.error('--check and --watch cannot be used together')
  process.exit(2)
}

if (check) {
  checkBundles()
} else if (watchMode) {
  writeBundles()

  let rebuildTimer
  const scheduleRebuild = (filename) => {
    if (filename && !String(filename).endsWith('.css')) return
    clearTimeout(rebuildTimer)
    rebuildTimer = setTimeout(() => {
      try {
        writeBundles()
      } catch (error) {
        console.error(`facade CSS rebuild failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }, 100)
  }

  const watchers = BUNDLES.map((bundle) => watch(join(SRC, bundle.src), scheduleRebuild))
  const closeWatchers = () => {
    clearTimeout(rebuildTimer)
    for (const watcher of watchers) watcher.close()
  }
  process.once('SIGINT', closeWatchers)
  process.once('SIGTERM', closeWatchers)
  console.log(`watching ${BUNDLES.map((bundle) => `facade-src/${bundle.src}`).join(', ')}`)
} else {
  writeBundles()
}
