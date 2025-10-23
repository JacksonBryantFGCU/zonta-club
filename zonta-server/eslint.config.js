// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: [
      "dist/",
      "node_modules/",
      "receipts/",
      "assets/",
    ],
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {}, // ✅ resolves @aliases from tsconfig.json
      },
    },
    rules: {
      // --- TypeScript rules ---
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",

      // --- Import rules ---
      "import/order": [
        "warn",
        {
          "groups": ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          "pathGroups": [
            { pattern: "@/**", group: "internal", position: "after" },
          ],
          "pathGroupsExcludedImportTypes": ["builtin"],
          "newlines-between": "always",
          "alphabetize": { order: "asc", caseInsensitive: true },
        },
      ],

      // --- General rules ---
      "no-console": "off",
      "prefer-const": "warn",
    },
  }
);