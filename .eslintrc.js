module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "airbnb-base"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "no-unused-vars": "off",
        "no-console": "off",
        "no-mixed-operators": "off",
        "max-len": [1, 120, 2, { "ignoreComments": true } ]
    },
    settings: {
        "import/resolver": {
            node: {
                paths: ["src"],
                extensions: [".ts"]
            }
        }
    }
};