import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', '_desenvolvimento', 'website/dist', 'performance-reports', '.dev'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn'
    },
  },

  // ==================================================================
  // Scripts de operação (scripts/)
  //
  // Este bloco não existia. Sem ele, os .cjs e .mjs casavam com NENHUM bloco
  // do flat config e o ESLint os ignorava em silêncio: `npx eslint scripts`
  // saía com exit 0 sem ter lido um único arquivo. Foi assim que um
  // require() com caminho inexistente ficou meses no ar.
  //
  // O sourceType é por extensão porque o package.json declara
  // "type": "module": só o .cjs é CommonJS. Um sourceType único para os
  // três produz erros de parse que não são do projeto.
  // ==================================================================
  {
    files: ['**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      // ...as regras recommended, MAIS as deste bloco. Espalhar
      // js.configs.recommended e depois escrever `rules` aqui SUBSTITUIRIA o
      // objeto inteiro e descartaria as recommended silenciosamente -- foi
      // o que aconteceu na primeira versão deste bloco.
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      // `catch {}` vazio é aceite: cleanup best-effort (matar Chrome no meio de
      // um tratamento de erro) não deve mascarar o erro que importa. Ver
      // run-audit.cjs:154.
      'no-empty': ['error', { allowEmptyCatch: true }],
      // \x1b é o escape de cor do console, que estes scripts usam de
      // propósito para colorir a saída do audit e do health.
      'no-control-regex': 'off',
    },
  },
  {
    files: ['**/*.mjs', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
    },
  },
);
