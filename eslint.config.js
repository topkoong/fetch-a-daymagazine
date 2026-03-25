import eslintConfigPrettier from 'eslint-config-prettier';
import preact from 'eslint-config-preact';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

const jsOnly = ['**/*.{js,cjs,mjs,jsx}'];
const tsOnly = ['**/*.{ts,tsx}'];

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/assets/**',
      '**/cached/**',
      'assets',
      '**/*.d.ts',
    ],
  },
  ...preact.map((config, index) =>
    index === 0 ? config : { ...config, files: jsOnly },
  ),
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: tsOnly,
  })),
  {
    files: tsOnly,
    plugins: {
      import: importPlugin,
      react,
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      'import/parsers': {
        '@typescript-eslint/parser': tsOnly,
      },
      'import/resolver': {
        typescript: true,
        node: {
          paths: ['src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      react: { pragma: 'h', version: '16.0' },
    },
    rules: {
      'react/no-deprecated': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': ['warn', { ignoreTranspilerName: false }],
      'react/jsx-no-bind': [
        'warn',
        {
          ignoreRefs: true,
          allowFunctions: true,
          allowArrowFunctions: true,
        },
      ],
      'react/jsx-no-comment-textnodes': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': ['error', { checkFragmentShorthand: true }],
      'react/self-closing-comp': 'error',
      'react/prefer-es6-class': 'error',
      'react/prefer-stateless-function': 'warn',
      'react/require-render-return': 'error',
      'react/no-danger': 'warn',
      'react/no-did-mount-set-state': 'error',
      'react/no-did-update-set-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-string-refs': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
      'no-use-before-define': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: ['function-declaration', 'arrow-function'],
          unnamedComponents: 'arrow-function',
        },
      ],
      'no-shadow': 'off',
    },
  },
  eslintConfigPrettier,
);
