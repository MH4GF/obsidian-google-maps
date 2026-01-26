import { Plugin } from 'obsidian'
import { importGoogleMapsSaved } from './commands/importGoogleMapsSaved'
import { DEFAULT_SETTINGS } from './settings/constants'
import { GoogleMapsImportSettingTab } from './settings/GoogleMapsImportSettingTab'
import type { GoogleMapsImportSettings } from './settings/types'

export default class GoogleMapsImportPlugin extends Plugin {
  settings: GoogleMapsImportSettings = DEFAULT_SETTINGS

  override async onload(): Promise<void> {
    await this.loadSettings()

    this.addCommand({
      id: 'import-google-maps-saved',
      name: 'Import from Takeout',
      callback: () => importGoogleMapsSaved(this.app, this.settings),
    })

    this.addSettingTab(new GoogleMapsImportSettingTab(this.app, this))
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<GoogleMapsImportSettings>,
    )
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }
}
