import { expect, test } from 'bun:test'
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import Bun from 'bun'
import { options } from '../options'

function countOptions(): number {
  let count = 0
  for (const [, values] of options) {
    count += values.length
  }
  return count
}

test('Checks all properties in a simple project.', async () => {
  const fixturePath = './test/fixture/simple'
  const initialConfiguration = await Bun.file(join(fixturePath, 'tsconfig.json')).json()

  const output = execSync('bun ./../../../index.ts', {
    cwd: fixturePath,
    stdio: 'pipe',
  }).toString()

  // Shows where it's going to check.
  expect(output).toContain('/any-tsconfig/test/fixture/simple')
  // tsconfig remains untouched after run.
  expect(initialConfiguration).toEqual(await Bun.file(join(fixturePath, 'tsconfig.json')).json())
}, 60000)

test('Lists checked properties.', () => {
  const fixturePath = './test/fixture/simple'

  const output = execSync('bun ./../../../index.ts --list', {
    cwd: fixturePath,
    stdio: 'pipe',
  }).toString()

  expect(output).toContain('noImplicitAny')
}, 60000)

test('Fails for some options.', () => {
  const fixturePath = './test/fixture/fail'

  const output = execSync('bun ./../../../index.ts', {
    cwd: fixturePath,
    stdio: 'pipe',
  }).toString()

  expect(output).toContain(`failed for ${countOptions()} options`)
}, 60000)

test('Failing options are listed.', () => {
  const fixturePath = './test/fixture/fail'

  const output = execSync('bun ./../../../index.ts --list', {
    cwd: fixturePath,
    stdio: 'pipe',
  }).toString()

  expect(output).toContain('Fails with noImplicitAny set to true')
}, 60000)

test('Does not check already existing properties.', () => {
  const fixturePath = './test/fixture/existing'

  const output = execSync('bun ./../../../index.ts --list', {
    cwd: fixturePath,
    stdio: 'pipe',
  }).toString()

  expect(output).toContain(`successful for ${countOptions() - 6} options`)
  expect(output).toContain('failed for 1 options')
}, 60000)

test('Exits when base project fails.', () => {
  const fixturePath = './test/fixture/fail-initial'

  const output = execSync('bun ./../../../index.ts', {
    cwd: fixturePath,
    stdio: 'pipe',
  }).toString()

  expect(output).toContain('fails with initial project configuration')
}, 60000)
