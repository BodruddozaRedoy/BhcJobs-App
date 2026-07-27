// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "android/*", ".expo/*"],
  },
  {
    // Build-time configs are loaded by Node as CommonJS, so `require` is the only
    // form that works here — `import` would fail at startup. The rule is aimed at
    // application code, which this is not.
    files: ["*.config.js", "*.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // axios's default export is a callable instance that carries `create`,
    // `isAxiosError` and friends as members — `axios.create(…)` is the documented
    // usage, not a mistaken deep import of a same-named named export. The rule
    // cannot tell the two apart and flags every call.
    files: ["services/api/**"],
    rules: {
      "import/no-named-as-default-member": "off",
    },
  },
]);
