export const options: [string, (string | boolean | string[])[]][] = [
  ['noImplicitAny', [true]],
  ['strictNullChecks', [true]],
  ['allowUnreachableCode', [false]],
  ['allowSyntheticDefaultImports', [false]], // Requires one to write import * as React from 'react' (maybe too much).
  ['noUncheckedIndexedAccess', [true]],
  ['noUnusedLocals', [true]],
  ['noUnusedParameters', [true]],
  ['target', ['ES2020']],
  ['lib', [['ES2020', 'DOM']]],
  ['module', ['preserve', 'esnext', 'nodenext']],
]
