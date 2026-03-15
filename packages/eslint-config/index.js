import tsParser from "@typescript-eslint/parser";
import eslintPluginPrettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import prettier from "eslint-config-prettier";

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
    },
  },
];
