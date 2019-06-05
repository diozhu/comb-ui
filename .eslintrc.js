module.exports = {
    root: true,

    env: {
        node: true
    },

    parserOptions: {
        parser: 'babel-eslint'
    },

    'extends': ['plugin:vue/strongly-recommended', '@vue/prettier'],
    plugins: ['vue'],

    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'prettier/prettier': 'off'
        // 'prettier/prettier': [
        //     'error', {
        //         'tableWidth': 4,
        //         'printWidth': 120,
        //         'singleQuote': true,
        //         'semi': true,
        //         'trailingComma': 'none',
        //         'jsxBracketSameLine': true,
        //         'parser': "vue",
        //         'bracketSpacing': true,
        //         'arrowParens': 'avoid',
        //         'requirePragma': false,
        //         'proseWrap': 'never'
        //     // }, {
        //     //     "usePrettierrc": false
        //     }
        // ]
    }
};
