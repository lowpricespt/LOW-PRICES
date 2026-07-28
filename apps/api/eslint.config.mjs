// @ts-check
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      // Decorators do NestJS (Injectable, Controller, etc.) e DTOs com
      // campos declarados mas nunca lidos diretamente no código (o
      // ValidationPipe lê-os via reflection) geram falsos positivos.
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
