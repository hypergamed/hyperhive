import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/**
 * Creates ESLint configuration for a package.
 * @param {string} tsconfigRootDir - The root directory for tsconfig
 * @returns {import('typescript-eslint').ConfigWithExtends[]}
 */
export function createConfig(tsconfigRootDir) {
  return tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        globals: {
          ...globals.node,
        },
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
    },
    {
      files: ["**/*.js"],
      ...tseslint.configs.disableTypeChecked,
    },
    {
      ignores: ["dist/**", "node_modules/**", "coverage/**", "*.config.js", "*.config.ts"],
    }
  );
}

export default createConfig;
