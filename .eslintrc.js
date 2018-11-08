module.exports = {
    root: true,

    env: {
        node: true
    },

    rules: {
        'arrow-parens': 0,
        'generator-star-spacing': 0,
        'no-debugger': 0,
        'semi-spacing': [
            'error',
            {
                before: false,
                after: false
            }
        ],
        semi: [
            'error',
            'always'
        ],
        indent: 'off',
        'no-empty': 'off',
        'no-use-before-define': 'off',
        'no-irregular-whitespace': 'off',
        'space-before-function-paren': 'off',
        'prefer-promise-reject-errors': 'off',
        'prettier/prettier': 'off',
        'no-console': 'off',
        'no-control-regex': 'off',
        'no-unused-vars': 'off',
        'one-var': [
            'off',
            {
                'var': 'always',
                'let': 'always',
                'const': 'always'
            }
        ],
        'no-useless-escape': [
            'off'
        ],
        'no-multi-spaces': [
            'error',
            {
                ignoreEOLComments: true
            }
        ],
        'no-mixed-operators': 0,
        'no-multiple-empty-lines': 'off',
        'no-useless-return': 0,
        'vue/html-indent': 'off',
        'vue/no-multi-spaces': 'off',
        'vue/require-default-prop': 'off',
        'vue/v-bind-style': 'off',
        'vue/v-on-style': 'off',
        'vue/max-attributes-per-line': 'off',
        'vue/require-valid-default-prop': 'off',
        'vue/require-v-for-key': 'off',
        'vue/require-prop-types': 'off',
        'vue/no-unused-vars': 'off',
        'vue/valid-v-bind': 'off',
        'vue/no-reserved-keys': 'off',
        'vue/valid-v-for': 'off',
        'vue/no-side-effects-in-computed-properties': 'off',
        'vue/no-parsing-error': 'off',
        'vue/valid-v-model': 'off',
        'vue/valid-v-on': 'off',
        'vue/html-self-closing': 'off',
        'vue/name-property-casing': 'off',
        'vue/mustache-interpolation-spacing': 'off',
        'vue/attribute-hyphenation': 'off',
        'vue/html-end-tags': 'off',
        'vue/html-closing-bracket-newline': 'off',
        'vue/html-closing-bracket-spacing': 'off'
    },

    parserOptions: {
        parser: 'babel-eslint'
    },

    'extends': [
        'plugin:vue/strongly-recommended',
        '@vue/prettier'
    ]
};