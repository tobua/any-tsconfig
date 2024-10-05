import { expect, test } from 'bun:test'
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import Bun from 'bun'

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
})

test('Lists checked properties.', () => {
  const fixturePath = './test/fixture/simple'

  const output = execSync('bun ./../../../index.ts --list', {
    cwd: fixturePath,
    stdio: 'pipe',
  }).toString()

  expect(output).toContain('noImplicitAny')
})

test('Fails for some options.', () => {
  const fixturePath = './test/fixture/fail'

  const output = execSync('bun ./../../../index.ts', {
    cwd: fixturePath,
    stdio: 'pipe',
  }).toString()

  expect(output).toContain('failed for 1 options')
})

test('Failing options are listed.', () => {
  const fixturePath = './test/fixture/fail'

  const output = execSync('bun ./../../../index.ts --list', {
    cwd: fixturePath,
    stdio: 'pipe',
  }).toString()

  expect(output).toContain('Fails with noImplicitAny set to true')
})

test('Does not check already existing properties.', () => {
  const fixturePath = './test/fixture/existing'

  const output = execSync('bun ./../../../index.ts', {
    cwd: fixturePath,
    stdio: 'pipe',
  }).toString()

  expect(output).toContain('failed for 0 options')
})

test('Exits when base project fails.', () => {
  const fixturePath = './test/fixture/fail-initial'

  const output = execSync('bun ./../../../index.ts', {
    cwd: fixturePath,
    stdio: 'pipe',
  }).toString()

  expect(output).toContain('fails with initial project configuration')
})
