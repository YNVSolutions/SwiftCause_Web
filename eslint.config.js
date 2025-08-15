import js from '@eslint/js'
import globals from 'globals'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.next/**',
      'build/**',
      '*.config.js',
      '*.config.ts',
      '**/*.ts',
      '**/*.tsx'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    }
  },
]
