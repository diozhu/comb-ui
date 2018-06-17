module.exports = {
    root: true,
    parserOptions: {
        parser: 'babel-eslint'
    },
    env: {
        browser: true,
    },
    extends: [
        // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
        // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
        'plugin:vue/essential',
        // https://github.com/standard/standard/blob/master/docs/RULES-en.md
        'standard'
    ],
    // required to lint *.vue files
    plugins: [
        'vue'
    ],
    // add your custom rules here
    'rules': {
        // allow paren-less arrow functions
        'arrow-parens': 0,
        // allow async-await
        'generator-star-spacing': 0,
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        'semi-spacing': ["error", {"before": false, "after": true}],
        'semi': ["error", "always"],
        // 'indent': ["error", 4],
        'indent': ["error", 4, { outerIIFEBody: 1, SwitchCase: 1 }],
        'space-before-function-paren': ["error", {
            "anonymous": "always",
            "named": "always",
            "asyncArrow": "ignore"
        }],
        // 'one-var': ["error", { var: "always", let: "always", const: "never" }]
        'one-var': ["off", {var: "always", let: "always", const: "always"}],
        'no-useless-escape': ["off"],
        'no-multi-spaces': ['error', { ignoreEOLComments: true }]
    }
};
