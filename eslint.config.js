import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'
import importPlugin from 'eslint-plugin-import' 

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
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
                "❌ FSD: The 'shared' layer cannot import from higher layers.",
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
                "❌ FSD: The 'entities' layer cannot import from higher layers.",
            },
            {
              target: 'src/features/**/*',
              from: ['src/app/**/*', 'src/pages/**/*', 'src/widgets/**/*'],
              message:
                "❌ FSD: The 'features' layer cannot import from higher layers.",
            },
            {
              target: 'src/widgets/**/*',
              from: ['src/app/**/*', 'src/pages/**/*'],
              message:
                "❌ FSD: The 'widgets' layer cannot import from higher layers.",
            },
            {
              target: 'src/pages/**/*',
              from: 'src/app/**/*',
              message: "❌ FSD: The 'pages' layer cannot import from the 'app' layer.",
            },
          ],
        },
      ],
    },
  },
])