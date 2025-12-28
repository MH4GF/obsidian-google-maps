import mh4gf from '@mh4gf/eslint-config'
import { globalIgnores } from 'eslint/config'
import obsidianmd from 'eslint-plugin-obsidianmd'
import globals from 'globals'

export default [
  ...mh4gf.configs.recommended,
  ...mh4gf.configs.typescript,
  {
    plugins: {
      obsidianmd,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs', 'manifest.json'],
        },
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.json'],
      },
    },
    rules: {
      'obsidianmd/detach-leaves': 'error',
      'obsidianmd/hardcoded-config-path': 'error',
      'obsidianmd/no-forbidden-elements': 'error',
      'obsidianmd/no-sample-code': 'error',
      'obsidianmd/object-assign': 'error',
      'obsidianmd/platform': 'error',
      'obsidianmd/sample-names': 'error',
      'obsidianmd/validate-manifest': 'error',
    },
  },
  globalIgnores([
    'node_modules',
    'dist',
    'coverage',
    'esbuild.config.mjs',
    'eslint.config.mjs',
    'vitest.config.ts',
    'version-bump.mjs',
    'versions.json',
    'main.js',
  ]),
]
