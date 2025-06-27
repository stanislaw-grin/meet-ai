import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { FlatCompat } from '@eslint/eslintrc'
import importPlugin from 'eslint-plugin-import'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    {
      // This block mimics .eslintrc-style config for import resolver
      settings: {
        'import/resolver': {
          typescript: {
            project: './tsconfig.json',
          },
        },
      },
    }
  ),
  {
    plugins: {
      import: importPlugin,
    },
    rules  : {
      'import/order': [
        'error',
        {
          groups                       : ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups                   : [
            {
              pattern : '@/**',
              group   : 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between'           : 'always',
          alphabetize                  : {
            order          : 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]

export default eslintConfig
