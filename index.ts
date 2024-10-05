import { execSync } from 'node:child_process'
import { join } from 'node:path'
import Bun from 'bun'
import { create } from 'logua'

const log = create('my-pkg', 'blue')

const options: [string, (string | boolean)[]][] = [
  ['noImplicitAny', [true, false]],
  ['strictNullChecks', [true, false]],
  ['allowUnreachableCode', [true, false]],
  ['allowSyntheticDefaultImports', [true, false]],
]

log(`Checking project in ${process.cwd()}`)

const listProperties = process.argv.includes('--list')

try {
  execSync('bun tsc --noEmit --skipLibCheck', { stdio: 'inherit' })
} catch (_error) {
  log('"tsc" fails with initial project configuration')
  process.exit(0)
}

const tsconfigPath = join(process.cwd(), 'tsconfig.json')
const tsconfig = await Bun.file(tsconfigPath).json()
const initialConfiguration = { ...tsconfig }
const state: { success: { name: string; value: string }[]; fail: { name: string; value: string }[] } = { success: [], fail: [] }

tsconfig.compilerOptions ??= {}
tsconfig.compilerOptions.skipLibCheck = true // Will check root node_modules.

for (const [option, values] of options) {
  if (typeof initialConfiguration.compilerOptions !== 'undefined' && Object.hasOwn(initialConfiguration.compilerOptions, option)) {
    // Skip options where the user has made a specific choice.
    continue
  }
  for (const value of values) {
    tsconfig.compilerOptions[option] = value
    await Bun.write(tsconfigPath, JSON.stringify(tsconfig, null, 2))
    try {
      execSync('bun tsc --noEmit', { stdio: 'inherit' })
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

// Restore initial user configuration.
await Bun.write(tsconfigPath, JSON.stringify(initialConfiguration, null, 2))
