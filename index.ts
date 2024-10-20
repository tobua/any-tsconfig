#!/usr/bin/env bun
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import Bun from 'bun'
import { create } from 'logua'
import { options } from './options'

const log = create('my-pkg', 'blue')

log(`Checking project in ${process.cwd()}`)

const listProperties = process.argv.includes('--list')

try {
  execSync('bun tsc --noEmit --skipLibCheck', { stdio: 'pipe' })
} catch (_error) {
  log('"tsc" fails with initial project configuration')
  process.exit(0)
}

const tsconfigPath = join(process.cwd(), 'tsconfig.json')
const tsconfig = await Bun.file(tsconfigPath).json()
const initialConfiguration = structuredClone(tsconfig)
const state: { success: { name: string; value: string }[]; fail: { name: string; value: string }[] } = { success: [], fail: [] }

tsconfig.compilerOptions ??= {}
tsconfig.compilerOptions.skipLibCheck = true // Will check root node_modules.

for (const [option, values] of options) {
  for (const value of values) {
    if (
      typeof initialConfiguration.compilerOptions !== 'undefined' &&
      Object.hasOwn(initialConfiguration.compilerOptions, option) &&
      initialConfiguration.compilerOptions[option] === value
    ) {
      // Skip options where the user has made a specific choice.
      continue
    }

    tsconfig.compilerOptions[option] = value
    await Bun.write(tsconfigPath, JSON.stringify(tsconfig, null, 2))
    try {
      execSync('bun tsc --noEmit', { stdio: 'pipe' })
      if (listProperties) {
        log(`Works with ${option} set to ${value}`)
      }
      state.success.push({ name: option, value: JSON.stringify(value) })
    } catch (_error) {
      if (listProperties) {
        log(`Fails with ${option} set to ${value}`)
      }
      state.fail.push({ name: option, value: JSON.stringify(value) })
    }
  }
}

log(`Checking successful for ${state.success.length} options and failed for ${state.fail.length} options.`)

if (state.fail.length > 0) {
  log(`The following options are failing: ${state.fail.map((item) => `"${item.name}": ${item.value}`).join(', ')}`)
}

// Restore initial user configuration.
await Bun.write(tsconfigPath, JSON.stringify(initialConfiguration, null, 2))
