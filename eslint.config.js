import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'

export default tseslint.config([
  {
    ignores: ['dist/**', 'node_modules/**', '.next/**', '.next-dev/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: 'src/shared/**/*',
              from: [
                'src/app/**/*',
                'src/pages/**/*',
                'src/widgets/**/*',
                'src/features/**/*',
                'src/entities/**/*',
              ],
              message:
                "FSD: The 'shared' layer cannot import from higher layers.",
            },
            {
              target: 'src/entities/**/*',
              from: [
                'src/app/**/*',
                'src/pages/**/*',
                'src/widgets/**/*',
                'src/features/**/*',
              ],
              message:
                "FSD: The 'entities' layer cannot import from higher layers.",
            },
            {
              target: 'src/features/**/*',
              from: ['src/app/**/*', 'src/pages/**/*', 'src/widgets/**/*'],
              message:
                "FSD: The 'features' layer cannot import from higher layers.",
            },
            {
              target: 'src/widgets/**/*',
              from: ['src/app/**/*', 'src/pages/**/*'],
              message:
                "FSD: The 'widgets' layer cannot import from higher layers.",
            },
            {
              target: 'src/pages/**/*',
              from: 'src/app/**/*',
              message: "FSD: The 'pages' layer cannot import from the 'app' layer.",
            },
          ],
        },
      ],
    },
  },
])
