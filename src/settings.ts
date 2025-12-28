import { App, PluginSettingTab, Setting } from "obsidian";
import GoogleMapsSyncPlugin from "./main";

export interface GoogleMapsSyncSettings {
  outputFolder: string;
}

export const DEFAULT_SETTINGS: GoogleMapsSyncSettings = {
  outputFolder: "Google Maps/Places",
};

export class GoogleMapsSyncSettingTab extends PluginSettingTab {
  plugin: GoogleMapsSyncPlugin;

  constructor(app: App, plugin: GoogleMapsSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Output folder")
      .setDesc("Folder where place notes will be created")
      .addText((text) =>
        text
          .setPlaceholder("Google Maps/Places")
          .setValue(this.plugin.settings.outputFolder)
          .onChange(async (value) => {
            this.plugin.settings.outputFolder = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
