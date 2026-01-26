import { Plugin } from 'obsidian'
import { syncGoogleMapsSaved } from './commands/syncGoogleMapsSaved'
import { DEFAULT_SETTINGS } from './settings/constants'
import { GoogleMapsSyncSettingTab } from './settings/GoogleMapsSyncSettingTab'
import type { GoogleMapsSyncSettings } from './settings/types'

export default class GoogleMapsSyncPlugin extends Plugin {
  settings: GoogleMapsSyncSettings = DEFAULT_SETTINGS

  override async onload(): Promise<void> {
    await this.loadSettings()

    this.addCommand({
      id: 'sync-google-maps-saved',
      name: 'Sync Google Maps Saved',
      callback: () => syncGoogleMapsSaved(this.app, this.settings),
    })

    this.addSettingTab(new GoogleMapsSyncSettingTab(this.app, this))
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<GoogleMapsSyncSettings>,
    )
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }
}
