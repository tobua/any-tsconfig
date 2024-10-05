import { execSync } from 'node:child_process'
import { join } from 'node:path'
import Bun from 'bun'
import { create } from 'logua'

const log = create('my-pkg', 'blue')

const options: [string, (string | boolean)[]][] = [
  ['noImplicitAny', [true, false]],
  ['strictNullChecks', [true, false]],
]

log(`Checking project in ${process.cwd()}`)

const listProperties = process.argv.includes('--list')

const tsconfigPath = join(process.cwd(), 'tsconfig.json')
const tsconfig = await Bun.file(tsconfigPath).json()
const initialConfiguration = { ...tsconfig }
const state: { success: { name: string; value: string }[]; fail: { name: string; value: string }[] } = { success: [], fail: [] }

tsconfig.compilerOptions ??= {}
tsconfig.compilerOptions.skipLibCheck = true // Will check root node_modules.

for (const [option, values] of options) {
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
