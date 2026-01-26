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
      // Command rules
      'obsidianmd/commands/no-command-in-command-id': 'error',
      'obsidianmd/commands/no-command-in-command-name': 'error',
      'obsidianmd/commands/no-default-hotkeys': 'error',
      'obsidianmd/commands/no-plugin-id-in-command-id': 'error',
      'obsidianmd/commands/no-plugin-name-in-command-name': 'error',
      // Settings tab rules
      'obsidianmd/settings-tab/no-manual-html-headings': 'error',
      'obsidianmd/settings-tab/no-problematic-settings-headings': 'error',
      // Vault rules
      'obsidianmd/vault/iterate': 'error',
      // General rules
      'obsidianmd/detach-leaves': 'error',
      'obsidianmd/hardcoded-config-path': 'error',
      'obsidianmd/no-forbidden-elements': 'error',
      'obsidianmd/no-plugin-as-component': 'error',
      'obsidianmd/no-sample-code': 'error',
      'obsidianmd/no-static-styles-assignment': 'error',
      'obsidianmd/no-tfile-tfolder-cast': 'error',
      'obsidianmd/no-view-references-in-plugin': 'error',
      'obsidianmd/object-assign': 'error',
      'obsidianmd/platform': 'error',
      'obsidianmd/prefer-abstract-input-suggest': 'error',
      'obsidianmd/prefer-file-manager-trash-file': 'warn',
      'obsidianmd/regex-lookbehind': 'error',
      'obsidianmd/sample-names': 'error',
      'obsidianmd/validate-license': 'error',
      'obsidianmd/validate-manifest': 'error',
      // UI rules
      'obsidianmd/ui/sentence-case': [
        'error',
        { enforceCamelCaseLower: true, brands: ['Google Maps', 'Takeout'] },
      ],
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
