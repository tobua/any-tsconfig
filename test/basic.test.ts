import { expect, test } from 'bun:test'
import { execSync } from 'node:child_process'

test('Checks all properties in a simple project.', () => {
  const fixturePath = './test/fixture/simple'

  const output = execSync('bun ./../../../index.ts', {
    cwd: fixturePath,
    stdio: 'pipe',
  }).toString()

  // Shows where it's going to check.
  expect(output).toContain('/any-tsconfig/test/fixture/simple')
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
