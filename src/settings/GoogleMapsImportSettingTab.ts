import { type App, PluginSettingTab, Setting } from 'obsidian'
import type GoogleMapsImportPlugin from '../main'
import { FolderSuggest } from './FolderSuggest'

export class GoogleMapsImportSettingTab extends PluginSettingTab {
  plugin: GoogleMapsImportPlugin

  constructor(app: App, plugin: GoogleMapsImportPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    new Setting(containerEl)
      .setName('Output folder')
      .setDesc('Folder where place notes will be created')
      .addSearch((search) => {
        new FolderSuggest(this.app, search.inputEl)
        search
          .setPlaceholder('Google Maps/places')
          .setValue(this.plugin.settings.outputFolder)
          .onChange(async (value) => {
            this.plugin.settings.outputFolder = value
            await this.plugin.saveSettings()
          })
      })
  }
}
