import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// Local ESLint config for Cloud Functions (Flat config)
export default tseslint.config([
  {
    ignores: ['node_modules/**', 'lib/**', 'dist/**', '.next/**'],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    rules: {
      // Disable problematic rule variant to unblock deploy; revisit after tooling upgrade
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
]);
