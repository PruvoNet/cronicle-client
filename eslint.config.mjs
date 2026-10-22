import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

// Ported from the former tslint.json (tslint:recommended plus its overrides).
export default tseslint.config(
    {ignores: ['dist/**', 'coverage/**', 'node_modules/**']},
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.mjs'],
        plugins: {'@stylistic': stylistic},
        rules: {
            '@stylistic/quotes': ['error', 'single', {avoidEscape: true}],
            '@stylistic/max-len': ['error', {
                code: 120,
                ignorePattern: '^import |^export \\{(.*?)\\}|class [a-zA-Z]+ implements |//',
            }],
            '@stylistic/comma-dangle': ['error', {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'only-multiline',
                exports: 'only-multiline',
                enums: 'only-multiline',
                generics: 'ignore',
                tuples: 'only-multiline',
                functions: 'never',
            }],
            '@stylistic/semi': ['error', 'always'],
            // tslint:recommended enforced spaces, not a width.
            '@stylistic/no-tabs': 'error',
            '@stylistic/arrow-parens': ['error', 'always'],
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/eol-last': 'error',
            'eqeqeq': ['error', 'always'],
            'curly': 'error',
            'prefer-const': 'error',
            'no-var': 'error',
            // tslint:recommended allowed any; existing public types use it.
            '@typescript-eslint/no-explicit-any': 'off',
            // `import x = require()` is how the CommonJS build imports moment's types.
            '@typescript-eslint/no-require-imports': ['error', {allowAsImport: true}],
            '@typescript-eslint/naming-convention': ['error', {
                selector: 'variable',
                format: ['camelCase', 'UPPER_CASE'],
                leadingUnderscore: 'allow',
            }],
        },
    }
);
