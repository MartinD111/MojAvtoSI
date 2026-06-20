import js from '@eslint/js';
import globals from 'globals';

export default [
    { ignores: ['dist-avto/**', 'dist-navtika/**', 'public/**', 'node_modules/**', 'scripts/**'] },
    {
        files: ['src/**/*.js', 'main.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2022,
                // CDN-loaded libs (not in package.json)
                Stripe: 'readonly',
                lucide: 'readonly',
                Chart: 'readonly',
                XLSX: 'readonly',
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
            'no-undef': 'error',
            'no-console': 'off',
            'no-empty': ['error', { allowEmptyCatch: true }],
        },
    },
];
