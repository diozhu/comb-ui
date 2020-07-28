module.exports = {
    root: true,
    env: {
        node: true
    },
    // extends: ["plugin:vue/essential", "@vue/prettier", "prettier"],
    extends: ["plugin:vue/essential", "@vue/prettier"],
    parserOptions: {
        parser: "babel-eslint"
    },
    plugins: ['vue'],
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "off" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        'prettier/prettier': 'error',
        semi: ['error', 'always']
    }
};
