import tsParser from "@typescript-eslint/parser";
import eslintPluginPrettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import prettier from "eslint-config-prettier";

// Next.js 16에서 eslint-config-next 제거됨
// eslint-plugin-tailwindcss는 Tailwind v4 비호환
// → prettier + unused-imports 핵심 규칙만 적용

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: [".next/**", "node_modules/**", "dist/**"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
      "unused-imports": unusedImports,
    },
    rules: {
      ...prettier.rules,
      "prettier/prettier": [
        "warn",
        {
          semi: true,
          singleQuote: true,
          trailingComma: "all",
          printWidth: 100,
          tabWidth: 2,
          bracketSameLine: false,
        },
      ],
      "unused-imports/no-unused-imports": "warn",
      "no-unused-vars": "off",
    },
  },
];
